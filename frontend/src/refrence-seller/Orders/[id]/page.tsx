"use client";

import {
  ArrowLeft,
  MapPin,
  CreditCard,
  Package,
  Truck,
  Calendar,
  Phone,
  Edit,
  Save,
  X,
  Loader2,
  User,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useMemo } from "react";
import toast from "react-hot-toast";
import {
  useGetArtistOrderByIdQuery,
  useUpdateOrderStatusMutation,
  useUpdateOrderPaymentStatusMutation,
} from "@/services/api/artistOrderApi";
import {
  useUpdateStockMutation,
  useGetProductByArtistQuery,
} from "@/services/api/productApi";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/app/(auth)/components/auth-modal-provider";

// Safe data access utilities
const safeArray = <T,>(value: T[] | undefined | null): T[] => {
  return Array.isArray(value) ? value : [];
};

const safeString = (value: any): string => {
  return value ? String(value) : "";
};

const safeNumber = (value: any): number => {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

export interface ProductData {
  id?: string;
  availableStock?: string;
  productName?: string;
  skuCode?: string;
}

// Updated interface to match the actual API response with optional properties
interface OrderProduct {
  id?: string;
  productName?: string;
  category?: string;
  shortDescription?: string;
  productImages?: string[];
  skuCode?: string;
  weight?: string;
  length?: string;
  width?: string;
  height?: string;
  availableStock?: number;
}

interface OrderItem {
  id?: string;
  orderId?: string;
  productId?: string;
  quantity?: number;
  priceAtPurchase?: number;
  artistId?: string;
  product?: OrderProduct;
}

interface OrderBuyer {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string | null;
}

interface OrderShippingAddress {
  id?: number;
  firstName?: string;
  lastName?: string;
  company?: string;
  street?: string;
  apartment?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  userId?: string;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface OrderData {
  id?: string;
  buyerId?: string;
  totalAmount?: number;
  status?: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  shippingAddressId?: number;
  paymentMethod?: string;
  paymentStatus?: "paid" | "unpaid" | "failed";
  placedAt?: string;
  updatedAt?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  buyer?: OrderBuyer;
  orderItems?: OrderItem[];
  shippingAddress?: OrderShippingAddress;
}

interface OrderResponse {
  success?: boolean;
  data?: OrderData;
  source?: string;
}

interface ProductsResponse {
  source?: string;
  data?: ProductData[];
}

interface StockValidationResult {
  isValid: boolean;
  insufficientItems: Array<{
    productId: string;
    productName: string;
    requiredQuantity: number;
    availableStock: number;
    shortfall: number;
  }>;
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = safeString(params.id);

  const { isAuthenticated, isLoading: authLoading } = useAuth("artist");
  const { openArtistLogin } = useAuthModal();

  // State for editing
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [selectedStatus, setSelectedStatus] =
    useState<OrderData["status"]>("pending");
  const [selectedPaymentStatus, setSelectedPaymentStatus] =
    useState<OrderData["paymentStatus"]>("unpaid");

  // Track previous status values for stock management
  const prevStatusRef = useRef<{
    status: OrderData["status"] | null;
    paymentStatus: OrderData["paymentStatus"] | null;
  }>({
    status: null,
    paymentStatus: null,
  });

  // RTK Query hooks
  const {
    data: orderResponse,
    isLoading,
    error,
    refetch,
  } = useGetArtistOrderByIdQuery(orderId, {
    skip: !isAuthenticated || !orderId,
  });
  const [updateOrderStatus, { isLoading: isUpdatingStatus }] =
    useUpdateOrderStatusMutation();
  const [updateOrderPaymentStatus, { isLoading: isUpdatingPayment }] =
    useUpdateOrderPaymentStatusMutation();
  const [updateStock, { isLoading: isUpdatingStock }] =
    useUpdateStockMutation();
  const {
    data: productResponse,
    isLoading: isLoadingProducts,
    refetch: refetchProducts,
  } = useGetProductByArtistQuery(undefined, {
    skip: !isAuthenticated,
    refetchOnMountOrArgChange: true,
  });

  // Extract order data from response using useMemo (handle cache format)
  const order = useMemo(() => {
    if (!orderResponse) return null;

    // Handle cache response format: {source: 'cache', data: {...}}
    if (orderResponse.source && orderResponse.data) {
      return orderResponse.data as OrderData;
    }

    // Handle direct object format as fallback
    if (
      typeof orderResponse === "object" &&
      !Array.isArray(orderResponse) &&
      orderResponse.data
    ) {
      return orderResponse.data as OrderData;
    }

    // Handle direct data format
    if (
      typeof orderResponse === "object" &&
      !Array.isArray(orderResponse) &&
      orderResponse.id
    ) {
      return orderResponse as OrderData;
    }

    return null;
  }, [orderResponse]);

  // Extract products data from response using useMemo (handle cache format)
  const products: ProductData[] = useMemo(() => {
    if (!productResponse) return [];

    // Handle cache response format: {source: 'cache', data: [...]}
    if (productResponse.source && productResponse.data) {
      return safeArray(productResponse.data);
    }

    // Handle direct array format as fallback
    if (Array.isArray(productResponse)) {
      return productResponse;
    }

    // Handle object with data property
    if (
      typeof productResponse === "object" &&
      !Array.isArray(productResponse) &&
      productResponse.data
    ) {
      return safeArray(productResponse.data);
    }

    return [];
  }, [productResponse]);

  // Create a product lookup map for efficient access
  const productMap = useMemo(() => {
    const map = new Map<string, ProductData>();
    products.forEach((product) => {
      if (product.id) {
        map.set(product.id, product);
      }
    });
    return map;
  }, [products]);

  // Function to get current stock for a product
  const getCurrentStock = (productId: string): number => {
    const product = productMap.get(productId);
    return product ? safeNumber(product.availableStock) : 0;
  };

  // Function to validate stock before updating using real product data
  const validateStockAvailability = async (
    orderItems: OrderItem[] | undefined,
    shouldDecrease: boolean
  ): Promise<StockValidationResult> => {
    if (!shouldDecrease) {
      // If we're increasing stock (restoring), no validation needed
      return { isValid: true, insufficientItems: [] };
    }

    const insufficientItems: StockValidationResult["insufficientItems"] = [];
    const safeOrderItems = safeArray(orderItems);

    for (const item of safeOrderItems) {
      const productId = safeString(item.productId);
      if (!productId) continue;

      // Get current stock from products API data
      const currentStock = getCurrentStock(productId);
      const requiredQuantity = safeNumber(item.quantity);

      if (currentStock < requiredQuantity) {
        insufficientItems.push({
          productId,
          productName: safeString(
            item.product?.productName || "Unknown Product"
          ),
          requiredQuantity,
          availableStock: currentStock,
          shortfall: requiredQuantity - currentStock,
        });
      }
    }

    return {
      isValid: insufficientItems.length === 0,
      insufficientItems,
    };
  };

  // Stock management logic
  useEffect(() => {
    if (!order || !products.length) return;

    const currentStatus = order.status;
    const currentPaymentStatus = order.paymentStatus;
    const prevStatus = prevStatusRef.current.status;
    const prevPaymentStatus = prevStatusRef.current.paymentStatus;

    // Skip on initial load
    if (prevStatus === null || prevPaymentStatus === null) {
      prevStatusRef.current = {
        status: currentStatus,
        paymentStatus: currentPaymentStatus,
      };
      return;
    }

    // Define statuses that affect stock
    const stockAffectingStatuses = ["confirmed", "shipped", "delivered"];

    // Handle stock updates for each order item
    const updateStockForItems = async (shouldDecrease: boolean) => {
      try {
        const orderItems = safeArray(order.orderItems);

        // Validate stock availability before decreasing using real product data
        const validation = await validateStockAvailability(
          orderItems,
          shouldDecrease
        );

        if (!validation.isValid) {
          const insufficientProducts = validation.insufficientItems
            .map(
              (item) =>
                `${item.productName} (need ${item.requiredQuantity}, have ${item.availableStock})`
            )
            .join(", ");

          toast.error(`Insufficient stock for: ${insufficientProducts}`);

          // Revert the status change if stock is insufficient
          if (shouldDecrease) {
            refetch(); // Refresh to get the original status
          }
          return;
        }

        // Process each item individually with proper error handling
        const stockUpdatePromises = orderItems.map(async (item) => {
          const productId = safeString(item.productId);
          if (!productId) return;

          // Ensure quantity is a proper number
          const quantity = safeNumber(item.quantity);
          if (quantity <= 0) {
            throw new Error(
              `Invalid quantity for product ${productId}: ${item.quantity}`
            );
          }

          // Get current stock for this product
          const currentStock = getCurrentStock(productId);

          // Calculate new absolute stock value
          const newStock = shouldDecrease
            ? currentStock - quantity
            : currentStock + quantity;

          // Ensure stock doesn't go below 0
          const finalStock = Math.max(0, newStock);

          // Create the payload with absolute stock value as STRING
          const payload = {
            productId: productId,
            availableStock: String(finalStock), // Convert to string since Prisma expects String
          };

          return updateStock(payload).unwrap();
        });

        await Promise.all(stockUpdatePromises);

        // Refetch products to get updated stock data
        refetchProducts();

        toast.success(
          `Stock ${
            shouldDecrease ? "decreased" : "restored"
          } successfully for ${orderItems.length} product(s)`
        );
      } catch (error) {
        console.error("Failed to update stock:", error);

        // Enhanced error logging
        if (error && typeof error === "object") {
          console.error("Full error object:", JSON.stringify(error, null, 2));

          // Check if it's a validation error
          if (
            "data" in error &&
            error.data &&
            typeof error.data === "object" &&
            "error" in error.data
          ) {
            const errorData = error.data.error as any;
            if (errorData.name === "PrismaClientValidationError") {
              toast.error(
                "Data validation error. The API may expect different data types. Check console for details."
              );
              return;
            }
          }
        }

        toast.error(
          "Failed to update stock. Please check the console for details."
        );

        // Refresh order data and products to ensure UI is in sync
        refetch();
        refetchProducts();
      }
    };

    // Determine if stock needs to be updated
    const wasStockDecreasedCheck =
      stockAffectingStatuses.includes(prevStatus || "") &&
      prevPaymentStatus === "paid";
    const shouldStockBeDecreasedCheck =
      stockAffectingStatuses.includes(currentStatus || "") &&
      currentPaymentStatus === "paid";

    if (!wasStockDecreasedCheck && shouldStockBeDecreasedCheck) {
      // Order moved to a stock-affecting status with payment - decrease stock
      updateStockForItems(true);
    } else if (wasStockDecreasedCheck && !shouldStockBeDecreasedCheck) {
      // Order moved away from stock-affecting status or payment changed - restore stock
      updateStockForItems(false);
    }

    // Update previous values
    prevStatusRef.current = {
      status: currentStatus,
      paymentStatus: currentPaymentStatus,
    };
  }, [
    order,
    order?.status,
    order?.paymentStatus,
    products,
    updateStock,
    refetch,
    refetchProducts,
  ]);

  const getOrderProgress = (status: OrderData["status"]) => {
    const steps = ["pending", "confirmed", "shipped", "delivered"];
    const currentIndex = steps.indexOf(status || "pending");
    return status === "cancelled" ? -1 : currentIndex;
  };

  const getStatusIcon = (status: OrderData["status"]) => {
    switch (status) {
      case "pending":
        return <Package className="w-4 h-4" />;
      case "confirmed":
        return <Package className="w-4 h-4" />;
      case "shipped":
        return <Truck className="w-4 h-4" />;
      case "delivered":
        return <Package className="w-4 h-4" />;
      case "cancelled":
        return <X className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: OrderData["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: OrderData["paymentStatus"]) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "unpaid":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Generate order number from ID (first 8 characters)
  const getOrderNumber = (id: string) => {
    return safeString(id).substring(0, 8).toUpperCase();
  };

  // Handle back navigation
  const handleBackClick = () => {
    router.push("/Artist/Orders");
  };

  // Handle status update with stock validation using real product data
  const handleStatusUpdate = async () => {
    if (!order || !orderId) return;

    try {
      // Define statuses that require stock validation
      const stockRequiredStatuses = ["confirmed", "shipped", "delivered"];

      // If changing to a status that requires stock validation
      if (stockRequiredStatuses.includes(selectedStatus || "")) {
        // For delivered status, also check if payment is paid
        const shouldValidateStock =
          selectedStatus === "delivered"
            ? order.paymentStatus === "paid"
            : true;

        if (shouldValidateStock) {
          const validation = await validateStockAvailability(
            order.orderItems,
            true
          );

          if (!validation.isValid) {
            const insufficientProducts = validation.insufficientItems
              .map(
                (item) =>
                  `${item.productName} (need ${item.requiredQuantity}, have ${item.availableStock})`
              )
              .join(", ");

            toast.error(
              `Cannot mark as ${selectedStatus}. Insufficient stock for: ${insufficientProducts}`
            );
            return;
          }
        }
      }

      await updateOrderStatus({
        orderId,
        status: selectedStatus,
      }).unwrap();

      setIsEditingStatus(false);
      refetch();

      toast.success("Order status updated successfully");
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast.error("Failed to update order status. Please try again.");
    }
  };

  // Handle payment status update with stock validation using real product data
  const handlePaymentStatusUpdate = async () => {
    if (!order || !orderId) return;

    try {
      // Define statuses that when combined with "paid" require stock validation
      const stockRequiredStatuses = ["confirmed", "shipped", "delivered"];

      // If changing to paid and order status requires stock validation
      if (
        selectedPaymentStatus === "paid" &&
        order.status &&
        stockRequiredStatuses.includes(order.status)
      ) {
        const validation = await validateStockAvailability(
          order.orderItems,
          true
        );

        if (!validation.isValid) {
          const insufficientProducts = validation.insufficientItems
            .map(
              (item) =>
                `${item.productName} (need ${item.requiredQuantity}, have ${item.availableStock})`
            )
            .join(", ");

          toast.error(
            `Cannot mark as paid. Insufficient stock for: ${insufficientProducts}`
          );
          return;
        }
      }

      await updateOrderPaymentStatus({
        orderId,
        paymentStatus: selectedPaymentStatus,
      }).unwrap();

      setIsEditingPayment(false);
      refetch();

      toast.success("Payment status updated successfully");
    } catch (error) {
      console.error("Failed to update payment status:", error);
      toast.error("Failed to update payment status. Please try again.");
    }
  };

  // Show login prompt if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
        <div className="text-center py-16">
          <User className="w-24 h-24 mx-auto text-stone-300 mb-6" />
          <h1 className="text-3xl font-light text-stone-900 mb-4">
            Login Required
          </h1>
          <p className="text-stone-600 mb-8">
            Please login to view order details.
          </p>
          <button
            onClick={openArtistLogin}
            className="bg-terracotta-600 hover:bg-terracotta-700 text-white px-6 py-3 font-medium transition-colors cursor-pointer"
          >
            Login to Continue
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (authLoading || isLoading || isLoadingProducts) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-terracotta-600" />
          <span className="ml-2 text-terracotta-600">
            Loading order and product data...
          </span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    console.error("Order loading error:", error);
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">Failed to load order details</p>
          <p className="text-stone-500 text-sm mb-4">
            {error && typeof error === "object" && "message" in error
              ? String(error.message)
              : "Unknown error occurred"}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-terracotta-600 text-white rounded-md hover:bg-terracotta-700 cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No data
  if (!order) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">No order data found</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-terracotta-600 text-white rounded-md hover:bg-terracotta-700 cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const progressIndex = getOrderProgress(order.status);
  const orderItems = safeArray(order.orderItems);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
      {/* Stock Update Loading Indicator */}
      {isUpdatingStock && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-100 border border-blue-300 text-blue-800 px-4 py-2 rounded-md shadow-md z-40">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Updating stock...</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={handleBackClick}
          className="flex items-center cursor-pointer text-terracotta-600 hover:text-terracotta-700 transition-colors mr-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Orders
        </button>
      </div>

      <div className="bg-white border border-stone-200 rounded-md shadow-sm">
        {/* Order Header */}
        <div className="border-b border-stone-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-medium text-stone-900 mb-2">
                Order #{getOrderNumber(safeString(order.id))}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-stone-600">
                <span>
                  Placed on{" "}
                  {order.placedAt
                    ? new Date(order.placedAt).toLocaleDateString()
                    : "N/A"}
                </span>
                <span className="hidden sm:inline">•</span>
                <span>Total: ₹{safeNumber(order.totalAmount).toFixed(2)}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {/* Order Status */}
              <div className="flex items-center gap-2">
                {isEditingStatus ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedStatus}
                      onChange={(e) =>
                        setSelectedStatus(e.target.value as OrderData["status"])
                      }
                      className="px-3 py-1 border border-stone-300 rounded text-sm cursor-pointer"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <button
                      onClick={handleStatusUpdate}
                      disabled={isUpdatingStatus}
                      className="p-1 text-green-600 hover:text-green-700"
                    >
                      {isUpdatingStatus ? (
                        <Loader2 className="w-4 h-4 animate-spin cursor-pointer" />
                      ) : (
                        <Save className="w-4 h-4 cursor-pointer" />
                      )}
                    </button>
                    <button
                      onClick={() => setIsEditingStatus(false)}
                      className="p-1 text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4 cursor-pointer" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div
                      className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)}
                      <span className="ml-2 capitalize">
                        {order.status || "pending"}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedStatus(order.status);
                        setIsEditingStatus(true);
                      }}
                      className="p-1 text-stone-600 hover:text-stone-700"
                    >
                      <Edit className="w-4 h-4 cursor-pointer" />
                    </button>
                  </div>
                )}
              </div>

              {/* Payment Status */}
              <div className="flex items-center gap-2">
                {isEditingPayment ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedPaymentStatus}
                      onChange={(e) =>
                        setSelectedPaymentStatus(
                          e.target.value as OrderData["paymentStatus"]
                        )
                      }
                      className="px-3 py-1 border border-stone-300 rounded text-sm cursor-pointer"
                    >
                      <option value="unpaid">Unpaid</option>
                      <option value="paid">Paid</option>
                      <option value="failed">Failed</option>
                    </select>
                    <button
                      onClick={handlePaymentStatusUpdate}
                      disabled={isUpdatingPayment}
                      className="p-1 text-green-600 hover:text-green-700"
                    >
                      {isUpdatingPayment ? (
                        <Loader2 className="w-4 h-4 animate-spin cursor-pointer" />
                      ) : (
                        <Save className="w-4 h-4 cursor-pointer" />
                      )}
                    </button>
                    <button
                      onClick={() => setIsEditingPayment(false)}
                      className="p-1 text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4 cursor-pointer" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                        order.paymentStatus
                      )}`}
                    >
                      <CreditCard className="w-3 h-3 mr-1" />
                      <span className="capitalize">
                        {order.paymentStatus || "unpaid"}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedPaymentStatus(order.paymentStatus);
                        setIsEditingPayment(true);
                      }}
                      className="p-1 text-stone-600 hover:text-stone-700"
                    >
                      <Edit className="w-4 h-4 cursor-pointer" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Order Progress */}
        {order.status !== "cancelled" && (
          <div className="border-b border-stone-200 p-4 sm:p-6">
            <h2 className="text-lg font-medium text-stone-900 mb-4">
              Order Progress
            </h2>
            <div className="flex items-center justify-between relative">
              {["Pending", "Confirmed", "Shipped", "Delivered"].map(
                (step, index) => (
                  <div
                    key={step}
                    className="flex flex-col items-center relative z-10"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        index <= progressIndex
                          ? "bg-terracotta-600 text-white"
                          : "bg-stone-200 text-stone-500"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span
                      className={`text-xs mt-2 text-center ${
                        index <= progressIndex
                          ? "text-terracotta-600"
                          : "text-stone-500"
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                )
              )}

              {/* Progress Line */}
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-stone-200">
                <div
                  className="h-full bg-terracotta-600 transition-all duration-300"
                  style={{ width: `${(progressIndex / 3) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="border-b border-stone-200 p-4 sm:p-6">
          <h2 className="text-lg font-medium text-stone-900 mb-4">
            Order Items
          </h2>
          <div className="space-y-4">
            {orderItems.map((item, index) => {
              const productId = safeString(item.productId);
              // Get current stock from products API
              const currentStock = getCurrentStock(productId);
              const requiredQuantity = safeNumber(item.quantity);

              return (
                <div
                  key={item.id || index}
                  className="flex items-center gap-4 p-4 bg-stone-50 rounded-md"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                    <Image
                      src={safeString(
                        item.product?.productImages?.[0] || "/Profile.jpg"
                      )}
                      alt={safeString(item.product?.productName || "Product")}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover rounded-md"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/Profile.jpg";
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-medium text-stone-900 truncate">
                      {safeString(
                        item.product?.productName || "Unknown Product"
                      )}
                    </h3>
                    <p className="text-sm text-stone-600">
                      SKU: {safeString(item.product?.skuCode || "N/A")}
                    </p>
                    <p className="text-sm text-stone-600">
                      Category: {safeString(item.product?.category || "N/A")}
                    </p>
                    <p className="text-sm text-stone-600">
                      Quantity: {requiredQuantity}
                    </p>

                    {/* Display current stock from products API */}
                    <p
                      className={`text-sm ${
                        currentStock < requiredQuantity
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      Current Stock: {currentStock}
                      {currentStock < requiredQuantity && (
                        <span className="ml-2 text-red-600 font-medium">
                          (Insufficient: need {requiredQuantity - currentStock}{" "}
                          more)
                        </span>
                      )}
                    </p>

                    {item.product?.weight && (
                      <p className="text-sm text-stone-600">
                        Weight: {item.product.weight}kg
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm sm:text-base font-medium text-stone-900">
                      ₹{safeNumber(item.priceAtPurchase).toFixed(2)}
                    </p>
                    {requiredQuantity > 1 && (
                      <p className="text-xs text-stone-600">
                        ₹
                        {(
                          safeNumber(item.priceAtPurchase) / requiredQuantity
                        ).toFixed(2)}{" "}
                        each
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Total */}
          <div className="mt-6 pt-4 border-t border-stone-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-stone-900">
                Total Amount
              </span>
              <span className="text-lg font-bold text-terracotta-700">
                ₹{safeNumber(order.totalAmount).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Customer & Shipping Info */}
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Info */}
            <div>
              <h3 className="text-base font-medium text-stone-900 mb-3 flex items-center">
                <Phone className="w-5 h-5 mr-2 text-terracotta-600" />
                Customer Information
              </h3>
              <div className="bg-stone-50 p-4 rounded-md">
                <p className="font-medium text-stone-900">
                  {safeString(order.buyer?.firstName)}{" "}
                  {safeString(order.buyer?.lastName)}
                </p>
                <p className="text-sm text-stone-600 mt-1">
                  {safeString(order.buyer?.email || "N/A")}
                </p>
                {order.buyer?.phone && (
                  <p className="text-sm text-stone-600">{order.buyer.phone}</p>
                )}
                <p className="text-sm text-stone-600 mt-2">
                  Payment: {safeString(order.paymentMethod || "N/A")}
                </p>
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <h3 className="text-base font-medium text-stone-900 mb-3 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-terracotta-600" />
                Shipping Address
              </h3>
              <div className="bg-stone-50 p-4 rounded-md">
                <p className="font-medium text-stone-900">
                  {safeString(order.shippingAddress?.firstName)}{" "}
                  {safeString(order.shippingAddress?.lastName)}
                </p>
                {order.shippingAddress?.company && (
                  <p className="text-sm text-stone-600">
                    {order.shippingAddress.company}
                  </p>
                )}
                <p className="text-sm text-stone-600 mt-1">
                  {safeString(order.shippingAddress?.street || "N/A")}
                </p>
                {order.shippingAddress?.apartment && (
                  <p className="text-sm text-stone-600">
                    {order.shippingAddress.apartment}
                  </p>
                )}
                <p className="text-sm text-stone-600">
                  {safeString(order.shippingAddress?.city || "N/A")},{" "}
                  {safeString(order.shippingAddress?.state || "N/A")}{" "}
                  {safeString(order.shippingAddress?.postalCode || "N/A")}
                </p>
                <p className="text-sm text-stone-600">
                  {safeString(order.shippingAddress?.country || "N/A")}
                </p>
                <p className="text-sm text-stone-600 mt-2 flex items-center">
                  <Phone className="w-4 h-4 mr-1" />
                  {safeString(order.shippingAddress?.phone || "N/A")}
                </p>
              </div>
            </div>
          </div>

          {/* Tracking Info */}
          {order.trackingNumber && (
            <div className="mt-6">
              <h3 className="text-base font-medium text-stone-900 mb-3 flex items-center">
                <Package className="w-5 h-5 mr-2 text-terracotta-600" />
                Tracking Information
              </h3>
              <div className="bg-stone-50 p-4 rounded-md">
                <p className="text-sm text-stone-600">Tracking Number</p>
                <p className="font-medium text-stone-900">
                  {order.trackingNumber}
                </p>
                {order.estimatedDelivery && (
                  <div className="mt-2 flex items-center text-sm text-stone-600">
                    <Calendar className="w-4 h-4 mr-1" />
                    Est. Delivery:{" "}
                    {new Date(order.estimatedDelivery).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Order Dates */}
          <div className="mt-6">
            <h3 className="text-base font-medium text-stone-900 mb-3 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-terracotta-600" />
              Order Timeline
            </h3>
            <div className="bg-stone-50 p-4 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-stone-600">Order Placed:</span>
                <span className="text-sm font-medium text-stone-900">
                  {order.placedAt
                    ? new Date(order.placedAt).toLocaleString()
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-stone-600">Last Updated:</span>
                <span className="text-sm font-medium text-stone-900">
                  {order.updatedAt
                    ? new Date(order.updatedAt).toLocaleString()
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
