"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Filter,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Loader2,
  User,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

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

// Updated interfaces to match API response with optional properties
export interface ApiOrderItem {
  id?: string;
  orderId?: string;
  productId?: string;
  quantity?: number;
  priceAtPurchase?: number;
  sellerId?: string;
  product?: {
    id?: string;
    productName?: string;
    category?: string;
    productImages?: string[];
    skuCode?: string;
  };
}

export interface ApiBuyer {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string | null;
}

export interface ApiShippingAddress {
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
}

export interface ApiOrder {
  id?: string;
  buyerId?: string;
  totalAmount?: number;
  status?: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  shippingAddressId?: number;
  paymentMethod?: string;
  paymentStatus?: "paid" | "unpaid" | "failed";
  placedAt?: string;
  updatedAt?: string;
  buyer?: ApiBuyer;
  orderItems?: ApiOrderItem[];
  shippingAddress?: ApiShippingAddress;
}

export interface ApiPagination {
  currentPage?: number;
  totalPages?: number;
  totalCount?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export interface ApiOrdersData {
  orders?: ApiOrder[];
  pagination?: ApiPagination;
}

// Component interfaces
export interface OrderItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  sku: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  total: number;
  items: OrderItem[];
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    pinCode: string;
    phone: string;
  };
  paymentMethod: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

// Transform API order to component order format
const transformApiOrderToOrder = (apiOrder: ApiOrder): Order => {
  const orderItems = safeArray(apiOrder.orderItems);

  return {
    id: safeString(apiOrder.id),
    orderNumber: `ORD-${safeString(apiOrder.id).slice(0, 8).toUpperCase()}`,
    date: safeString(apiOrder.placedAt),
    status: (apiOrder.status as Order["status"]) || "pending",
    total: safeNumber(apiOrder.totalAmount),
    items: orderItems.map((item, index) => ({
      id: safeString(item.id || `item-${index}`),
      name: safeString(item.product?.productName || "Unknown Product"),
      image: safeString(item.product?.productImages?.[0] || "/placeholder.jpg"),
      price: safeNumber(item.priceAtPurchase),
      quantity: safeNumber(item.quantity || 1),
      sku: safeString(item.product?.skuCode || "N/A"),
    })),
    shippingAddress: {
      name:
        `${safeString(apiOrder.shippingAddress?.firstName)} ${safeString(
          apiOrder.shippingAddress?.lastName
        )}`.trim() || "N/A",
      street:
        `${safeString(apiOrder.shippingAddress?.street)} ${safeString(
          apiOrder.shippingAddress?.apartment
        )}`.trim() || "N/A",
      city: safeString(apiOrder.shippingAddress?.city || "N/A"),
      state: safeString(apiOrder.shippingAddress?.state || "N/A"),
      pinCode: safeString(apiOrder.shippingAddress?.postalCode || "N/A"),
      phone: safeString(apiOrder.shippingAddress?.phone || "N/A"),
    },
    paymentMethod:
      apiOrder.paymentMethod === "card"
        ? "Credit Card"
        : safeString(apiOrder.paymentMethod || "N/A").toUpperCase(),
    trackingNumber: undefined,
    estimatedDelivery: undefined,
  };
};

export default function SellerOrdersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);

  const { isAuthenticated, isLoading: authLoading } = useAuth("seller");

  // TODO: Replace with actual API call once backend endpoint is available
  // const {
  //   data: apiResponse,
  //   isLoading,
  //   isError,
  //   error,
  // } = useGetSellerOrdersQuery(
  //   {
  //     page: currentPage,
  //     limit,
  //     status: statusFilter !== "all" ? statusFilter : undefined,
  //   },
  //   {
  //     skip: !isAuthenticated,
  //   }
  // );

  const isLoading = false; // TODO: Set from API call
  const isError = false; // TODO: Set from API call
  const error: any = null; // TODO: Set from API call
  const apiResponse: any = null; // TODO: Get from API call

  // Extract orders data from cache response format using useMemo
  const ordersData = useMemo(() => {
    if (!apiResponse) return null;

    // Handle cache response format: {source: 'cache', data: {...}}
    if (apiResponse.source && apiResponse.data) {
      return apiResponse.data as ApiOrdersData;
    }

    // Handle direct object format as fallback
    if (
      typeof apiResponse === "object" &&
      !Array.isArray(apiResponse) &&
      apiResponse.data
    ) {
      return apiResponse.data as ApiOrdersData;
    }

    // Handle direct data format
    if (
      typeof apiResponse === "object" &&
      !Array.isArray(apiResponse) &&
      apiResponse.orders
    ) {
      return apiResponse as ApiOrdersData;
    }

    return null;
  }, [apiResponse]);

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "shipped":
        return <Truck className="w-4 h-4" />;
      case "delivered":
        return <Package className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "confirmed":
        return "text-blue-600 bg-blue-100";
      case "shipped":
        return "text-purple-600 bg-purple-100";
      case "delivered":
        return "text-green-600 bg-green-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const handleViewDetails = (orderId: string) => {
    if (orderId) {
      router.push(`/seller/orders/${orderId}`);
    }
  };

  // Show login prompt if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl">
        <div className="text-center py-16">
          <User className="w-24 h-24 mx-auto text-stone-300 mb-6" />
          <h1 className="text-3xl font-light text-stone-900 mb-4 font-poppins">
            Login Required
          </h1>
          <p className="text-stone-600 mb-8 font-inter">
            Please login to view your orders.
          </p>
          <Link
            href="/"
            className="bg-yogreet-sage hover:bg-yogreet-sage/90 text-white px-6 py-3 font-manrope font-medium transition-colors cursor-pointer inline-block rounded-md"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl">
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-yogreet-sage mx-auto mb-4 animate-spin" />
          <p className="text-stone-600 font-inter">Loading your orders...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    console.error("Orders loading error:", error);
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl">
        <div className="text-center py-12">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-stone-900 mb-2 font-manrope">
            Error loading orders
          </h3>
          <p className="text-stone-600 mb-4 font-inter">
            {error && typeof error === "object" && "message" in error
              ? String(error.message)
              : "Something went wrong while fetching your orders"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-yogreet-sage hover:bg-yogreet-sage/90 text-white px-4 py-2 rounded transition-colors cursor-pointer font-manrope"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!ordersData) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl">
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-stone-900 mb-2 font-manrope">
            No data available
          </h3>
          <p className="text-stone-600 font-inter">Unable to load orders data</p>
        </div>
      </div>
    );
  }

  // Transform API orders to component format
  const orders: Order[] = safeArray(ordersData.orders).map(
    transformApiOrderToOrder
  );

  // Client-side filtering for search (since API doesn't support search)
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-light text-stone-900 mb-2 font-poppins">
          Orders
        </h1>
        <p className="text-sm sm:text-base text-stone-600 font-inter">
          Track and manage your orders
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search orders by order number or product name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage font-inter"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1); // Reset to first page when filter changes
            }}
            className="pl-10 pr-8 py-2 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage bg-white cursor-pointer font-inter"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-white border border-stone-200 rounded-md">
            <Package className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-stone-900 mb-2 font-manrope">
              No orders found
            </h3>
            <p className="text-stone-600 font-inter">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria"
                : "You haven't received any orders yet"}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-stone-200 rounded-md p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Order Info */}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                    <h3 className="text-base sm:text-lg font-medium text-stone-900 font-manrope">
                      {order.orderNumber}
                    </h3>
                    <div
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)}
                      <span className="ml-1 capitalize font-inter">{order.status}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-stone-600 mb-4 font-inter">
                    <div>
                      <span className="font-medium">Order Date:</span>{" "}
                      {order.date
                        ? new Date(order.date).toLocaleDateString()
                        : "N/A"}
                    </div>
                    <div>
                      <span className="font-medium">Total:</span> ₹
                      {order.total.toFixed(2)}
                    </div>
                    <div>
                      <span className="font-medium">Items:</span>{" "}
                      {order.items.length} item
                      {order.items.length > 1 ? "s" : ""}
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="flex flex-wrap gap-2">
                    {order.items.slice(0, 3).map((item, index) => (
                      <div
                        key={item.id || index}
                        className="flex items-center bg-stone-50 rounded-md px-2 py-1"
                      >
                        <img
                          src={item.image || "/placeholder.jpg"}
                          alt={item.name}
                          className="w-6 h-6 object-cover rounded mr-2"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder.jpg";
                          }}
                        />
                        <span className="text-xs text-stone-700 truncate max-w-[120px] font-inter">
                          {item.name}
                        </span>
                        {item.quantity > 1 && (
                          <span className="text-xs text-stone-500 ml-1 font-inter">
                            ×{item.quantity}
                          </span>
                        )}
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="flex items-center bg-stone-50 rounded-md px-2 py-1">
                        <span className="text-xs text-stone-700 font-inter">
                          +{order.items.length - 3} more
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2 lg:flex-col lg:items-end">
                  <button
                    onClick={() => handleViewDetails(order.id)}
                    className="px-4 py-2 cursor-pointer bg-yogreet-sage text-white rounded-md hover:bg-yogreet-sage/90 transition-colors flex items-center justify-center text-sm font-manrope"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </button>

                  {order.trackingNumber && (
                    <button className="px-4 py-2 border border-stone-300 text-stone-700 rounded-md hover:bg-stone-50 transition-colors flex items-center justify-center text-sm cursor-pointer font-manrope">
                      <Truck className="w-4 h-4 mr-2" />
                      Track Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {ordersData.pagination &&
        ordersData.pagination.totalPages &&
        ordersData.pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={!ordersData.pagination.hasPreviousPage}
              className="px-4 py-2 border border-stone-300 text-stone-700 rounded-md hover:bg-stone-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-manrope"
            >
              Previous
            </button>

            <span className="text-sm text-stone-600 font-inter">
              Page {ordersData.pagination.currentPage || 1} of{" "}
              {ordersData.pagination.totalPages || 1}
            </span>

            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={!ordersData.pagination.hasNextPage}
              className="px-4 py-2 border border-stone-300 text-stone-700 rounded-md hover:bg-stone-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-manrope"
            >
              Next
            </button>
          </div>
        )}
    </div>
  );
}

