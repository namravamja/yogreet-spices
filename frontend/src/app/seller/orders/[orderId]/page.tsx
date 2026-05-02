"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  User,
  Calendar,
  Mail,
  Phone,
} from "lucide-react";
import { PLACEHOLDER_JPG_URL } from "@/constants/static-images";
import { useGetSellerOrderQuery, useUpdateOrderStatusMutation } from "@/services/api/sellerApi";
import { formatCurrency } from "@/utils/currency";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const ALLOWED_STATUSES = [
  "pending",
  "confirmed", 
  "seller_preparing",
  "ready_for_pickup",
  "cancelled"
] as const;
type OrderStatus = (typeof ALLOWED_STATUSES)[number];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  seller_preparing: "bg-purple-100 text-purple-800",
  ready_for_pickup: "bg-green-100 text-green-800",
  pickup_assigned: "bg-indigo-100 text-indigo-800",
  picked_up: "bg-cyan-100 text-cyan-800",
  in_transit: "bg-blue-100 text-blue-800",
  out_for_delivery: "bg-teal-100 text-teal-800",
  delivered: "bg-green-100 text-green-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

const paymentStatusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  held: "bg-blue-100 text-blue-800",
  released: "bg-green-100 text-green-800",
  refunded: "bg-gray-100 text-gray-800",
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "delivered":
    case "completed":
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    case "ready_for_pickup":
    case "pickup_assigned":
    case "picked_up":
    case "in_transit":
    case "out_for_delivery":
      return <Truck className="w-5 h-5 text-blue-600" />;
    case "seller_preparing":
      return <Package className="w-5 h-5 text-purple-600" />;
    case "confirmed":
      return <CheckCircle className="w-5 h-5 text-blue-600" />;
    case "cancelled":
      return <XCircle className="w-5 h-5 text-red-600" />;
    default:
      return <Clock className="w-5 h-5 text-yellow-600" />;
  }
};

export default function SellerOrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.orderId as string | undefined;

  const { isAuthenticated, isLoading: authLoading } = useAuth("seller");
  const [updateOrderStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null);

  const {
    data: orderData,
    isLoading,
    error,
    refetch,
  } = useGetSellerOrderQuery(orderId as string, {
    skip: !orderId || !isAuthenticated,
  });

  // Normalize order data
  const order = useMemo(() => {
    if (!orderData) return null;
    return {
      id: orderData.id || orderData._id,
      status: (orderData.status || "pending") as OrderStatus,
      paymentStatus: orderData.paymentStatus || "pending",
      deliveryStatus: orderData.deliveryStatus,
      autoReleaseAt: orderData.autoReleaseAt,
      placedAt: orderData.placedAt,
      deliveredAt: orderData.deliveredAt,
      totalAmount: orderData.totalAmount || 0,
      subtotal: orderData.subtotal || 0,
      shippingCost: orderData.shippingCost || 0,
      taxAmount: orderData.taxAmount || 0,
      sellerSubtotal: orderData.sellerSubtotal || 0,
      paymentMethod: orderData.paymentMethod || "N/A",
      currency: orderData.currency || "INR",
      mode: orderData.mode,
      updatedAt: orderData.updatedAt,
      shippingAddress: orderData.shippingAddress || null,
      buyer: orderData.buyer || null,
      orderItems: (orderData.orderItems || []).map((item: any) => ({
        id: item.id || item._id,
        productId: item.productId,
        quantity: item.quantity || 0,
        priceAtPurchase: item.priceAtPurchase || 0,
        product: item.product || null,
      })),
    };
  }, [orderData]);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!orderId || !newStatus || newStatus === order?.status) return;

    try {
      await updateOrderStatus({ orderId, status: newStatus }).unwrap();
      toast.success(`Order status updated to ${newStatus}`);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update order status");
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
            Please login to view order details.
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
        <div className="animate-pulse">
          <div className="h-8 bg-stone-200 rounded w-48 mb-8"></div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white border border-stone-200 p-6 rounded-md">
                <div className="h-6 bg-stone-200 rounded w-32 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-stone-200 rounded w-full"></div>
                  <div className="h-4 bg-stone-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl">
        <div className="text-center py-16">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-light text-stone-900 mb-4 font-poppins">
            Error loading order
          </h1>
          <p className="text-stone-600 mb-8 font-inter">
            {(error as any)?.data?.message || "Please try again later."}
          </p>
          <Link
            href="/seller/orders"
            className="bg-yogreet-sage hover:bg-yogreet-sage/90 text-white px-6 py-3 font-manrope font-medium transition-colors cursor-pointer inline-block rounded-md"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  // Order not found
  if (!order) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl">
        <div className="text-center py-16">
          <Package className="w-24 h-24 mx-auto text-stone-300 mb-6" />
          <h1 className="text-3xl font-light text-stone-900 mb-4 font-poppins">
            Order not found
          </h1>
          <p className="text-stone-600 mb-8 font-inter">
            The order you're looking for doesn't exist or you don't have access.
          </p>
          <Link
            href="/seller/orders"
            className="bg-yogreet-sage hover:bg-yogreet-sage/90 text-white px-6 py-3 font-manrope font-medium transition-colors cursor-pointer inline-block rounded-md"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const shortOrderId = order.id?.slice(0, 8).toUpperCase() || "";

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <Link
          href="/seller/orders"
          className="inline-flex items-center text-stone-600 hover:text-yogreet-sage mb-4 font-inter text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-light text-stone-900 font-poppins">
              Order #{shortOrderId}
            </h1>
            <p className="text-sm text-stone-600 font-inter mt-1">
              Placed on{" "}
              {order.placedAt
                ? new Date(order.placedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "N/A"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(order.status)}
            <span
              className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                statusColors[order.status] || "bg-stone-100 text-stone-800"
              }`}
            >
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Status Alerts */}
      {order.paymentStatus === "held" && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6 flex items-start gap-2">
          <CreditCard className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800 font-inter">
            <strong>Payment Held</strong> — Payment will be released after buyer confirms delivery
            {order.mode === "test" && " (Test Mode)"}
          </p>
        </div>
      )}
      {order.paymentStatus === "released" && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6 flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-green-700 shrink-0 mt-0.5" />
          <p className="text-sm text-green-800 font-inter">
            <strong>Payment Released</strong> — Funds have been released to your account
          </p>
        </div>
      )}
      {order.paymentStatus === "refunded" && (
        <div className="bg-stone-50 border border-stone-200 rounded-md p-4 mb-6 flex items-start gap-2">
          <XCircle className="w-5 h-5 text-stone-700 shrink-0 mt-0.5" />
          <p className="text-sm text-stone-800 font-inter">
            <strong>Refunded</strong> — This order has been refunded to the buyer
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white border border-stone-200 rounded-md shadow-sm">
            <div className="p-6">
              <h2 className="text-xl font-medium text-stone-900 mb-4 font-manrope flex items-center">
                <Package className="w-5 h-5 mr-2 text-yogreet-sage" />
                Order Items
              </h2>
              <div className="space-y-4">
                {order.orderItems.map((item: any, index: number) => (
                  <div
                    key={item.id || index}
                    className="flex items-center space-x-4 p-4 border border-stone-200 rounded-md"
                  >
                    <div className="relative w-20 h-20 shrink-0">
                      <Image
                        src={item.product?.productImages?.[0] || PLACEHOLDER_JPG_URL}
                        alt={item.product?.productName || "Product"}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-stone-900 truncate font-manrope">
                        {item.product?.productName || "Unknown Product"}
                      </h4>
                      {item.product?.category && (
                        <p className="text-sm text-stone-500 font-inter">
                          {item.product.category}
                        </p>
                      )}
                      {item.product?.skuCode && (
                        <p className="text-xs text-stone-400 font-inter">
                          SKU: {item.product.skuCode}
                        </p>
                      )}
                      <p className="text-sm text-stone-600 font-inter mt-1">
                        Qty: {item.quantity} × {formatCurrency(item.priceAtPurchase, order.currency)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-medium text-stone-900 font-manrope">
                        {formatCurrency(item.quantity * item.priceAtPurchase, order.currency)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Update Status */}
          <div className="bg-white border border-stone-200 rounded-md shadow-sm">
            <div className="p-6">
              <h2 className="text-xl font-medium text-stone-900 mb-4 font-manrope flex items-center">
                <Truck className="w-5 h-5 mr-2 text-yogreet-sage" />
                Update Order Status
              </h2>
              
              {/* Show info if delivery partner is assigned */}
              {(order as any).deliveryPartnerId && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4 flex items-start gap-2">
                  <Truck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800 font-inter">
                    <strong>Delivery Partner Assigned</strong>
                    <p className="mt-1">
                      This order has been assigned to our logistics partner. They will handle pickup and delivery.
                    </p>
                  </div>
                </div>
              )}
              
              {/* Show info about ready for pickup */}
              {order.status === "seller_preparing" && (
                <div className="bg-purple-50 border border-purple-200 rounded-md p-4 mb-4 flex items-start gap-2">
                  <Package className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
                  <div className="text-sm text-purple-800 font-inter">
                    <strong>Next Step:</strong> Mark as "Ready for Pickup" when your package is prepared and ready for collection by our delivery partner.
                  </div>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4">
                <select
                  value={selectedStatus || order.status}
                  onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                  disabled={
                    isUpdating || 
                    order.status === "cancelled" || 
                    !["pending", "confirmed", "seller_preparing", "ready_for_pickup"].includes(order.status)
                  }
                  className="flex-1 px-4 py-2 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage bg-white font-inter disabled:bg-stone-100 disabled:cursor-not-allowed"
                >
                  {ALLOWED_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleStatusChange(selectedStatus || order.status)}
                  disabled={
                    isUpdating ||
                    !selectedStatus ||
                    selectedStatus === order.status ||
                    order.status === "cancelled" ||
                    !["pending", "confirmed", "seller_preparing", "ready_for_pickup"].includes(order.status)
                  }
                  className="px-6 py-2 bg-yogreet-sage hover:bg-yogreet-sage/90 text-white rounded-md font-manrope font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Status"
                  )}
                </button>
              </div>
              
              {order.status === "cancelled" && (
                <p className="text-sm text-stone-500 mt-3 font-inter">
                  Status cannot be changed for cancelled orders.
                </p>
              )}
              
              {!["pending", "confirmed", "seller_preparing", "ready_for_pickup", "cancelled"].includes(order.status) && (
                <p className="text-sm text-stone-500 mt-3 font-inter">
                  This order is now being handled by the delivery partner. Status updates will be managed by them.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white border border-stone-200 rounded-md shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-medium text-stone-900 mb-4 font-manrope">
                Order Summary
              </h3>
              <div className="space-y-2 text-sm font-inter">
                <div className="flex justify-between">
                  <span className="text-stone-600">Your Items Subtotal:</span>
                  <span className="text-stone-900">
                    {formatCurrency(order.sellerSubtotal, order.currency)}
                  </span>
                </div>
                <hr className="border-stone-200 my-2" />
                <div className="flex justify-between text-lg font-medium">
                  <span className="text-stone-900">Your Earnings:</span>
                  <span className="text-yogreet-sage">
                    {formatCurrency(order.sellerSubtotal, order.currency)}
                  </span>
                </div>
                {order.paymentStatus === "held" && (
                  <p className="text-xs text-stone-500 mt-2">
                    * Earnings will be released after buyer confirmation
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white border border-stone-200 rounded-md shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-medium text-stone-900 mb-4 flex items-center font-manrope">
                <CreditCard className="w-5 h-5 mr-2 text-yogreet-sage" />
                Payment
              </h3>
              <div className="space-y-2 text-sm font-inter">
                <div className="flex justify-between">
                  <span className="text-stone-600">Method:</span>
                  <span className="text-stone-900">
                    {order.paymentMethod === "card"
                      ? "Credit Card"
                      : order.paymentMethod?.toUpperCase() || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-600">Status:</span>
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                      paymentStatusColors[order.paymentStatus] || "bg-stone-100 text-stone-800"
                    }`}
                  >
                    {order.paymentStatus
                      ? order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)
                      : "Unknown"}
                  </span>
                </div>
                {order.mode === "test" && (
                  <div className="flex justify-between">
                    <span className="text-stone-600">Mode:</span>
                    <span className="text-orange-600 font-medium">Test</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Buyer Information */}
          {order.buyer && (
            <div className="bg-white border border-stone-200 rounded-md shadow-sm">
              <div className="p-6">
                <h3 className="text-lg font-medium text-stone-900 mb-4 flex items-center font-manrope">
                  <User className="w-5 h-5 mr-2 text-yogreet-sage" />
                  Buyer Information
                </h3>
                <div className="space-y-3 text-sm font-inter">
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
                    <span className="text-stone-900">
                      {[order.buyer.firstName, order.buyer.lastName].filter(Boolean).join(" ") ||
                        "N/A"}
                    </span>
                  </div>
                  {order.buyer.email && (
                    <div className="flex items-start gap-2">
                      <Mail className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
                      <span className="text-stone-600 break-all">{order.buyer.email}</span>
                    </div>
                  )}
                  {order.buyer.phone && (
                    <div className="flex items-start gap-2">
                      <Phone className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
                      <span className="text-stone-600">{order.buyer.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-white border border-stone-200 rounded-md shadow-sm">
              <div className="p-6">
                <h3 className="text-lg font-medium text-stone-900 mb-4 flex items-center font-manrope">
                  <MapPin className="w-5 h-5 mr-2 text-yogreet-sage" />
                  Shipping Address
                </h3>
                <div className="text-sm text-stone-600 font-inter space-y-1">
                  {(() => {
                    const addr = order.shippingAddress;
                    const fullName = [addr.firstName, addr.lastName].filter(Boolean).join(" ");
                    const streetLine = [addr.street, addr.apartment].filter(Boolean).join(", ");
                    const cityState = [addr.city, addr.state].filter(Boolean).join(", ");
                    const cityStatePostal = [cityState, addr.postalCode].filter(Boolean).join(" ");

                    return (
                      <>
                        {fullName && (
                          <p className="font-medium text-stone-900">{fullName}</p>
                        )}
                        {addr.company && <p>{addr.company}</p>}
                        {streetLine && <p>{streetLine}</p>}
                        {cityStatePostal && <p>{cityStatePostal}</p>}
                        {addr.country && <p>{addr.country}</p>}
                        {addr.phone && <p className="mt-2">{addr.phone}</p>}
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white border border-stone-200 rounded-md shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-medium text-stone-900 mb-4 flex items-center font-manrope">
                <Calendar className="w-5 h-5 mr-2 text-yogreet-sage" />
                Timeline
              </h3>
              <div className="space-y-3 text-sm font-inter">
                <div className="flex justify-between">
                  <span className="text-stone-600">Order Placed:</span>
                  <span className="text-stone-900">
                    {order.placedAt
                      ? new Date(order.placedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "N/A"}
                  </span>
                </div>
                {order.deliveredAt && (
                  <div className="flex justify-between">
                    <span className="text-stone-600">Delivered:</span>
                    <span className="text-stone-900">
                      {new Date(order.deliveredAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
                {order.autoReleaseAt && order.paymentStatus === "held" && (
                  <div className="flex justify-between">
                    <span className="text-stone-600">Auto Release:</span>
                    <span className="text-orange-600">
                      {new Date(order.autoReleaseAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-stone-600">Last Updated:</span>
                  <span className="text-stone-900">
                    {order.updatedAt
                      ? new Date(order.updatedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
