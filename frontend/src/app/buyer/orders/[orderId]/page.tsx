"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Package,
  Calendar,
  MapPin,
  CreditCard,
  Download,
  Printer,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import PageHero from "@/components/shared/PageHero";
import { PLACEHOLDER_JPG_URL } from "@/constants/static-images";
import { useGetOrderQuery } from "@/services/api/buyerApi";
import { formatCurrency } from "@/utils/currency";
import { useConfirmReleaseMutation, useRaiseDisputeMutation } from "@/services/api/publicApi";
import { toast } from "sonner";

// Order details fetched from API via `useGetOrderQuery`

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const paymentStatusColors: Record<string, string> = {
  unpaid: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "delivered":
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    case "shipped":
      return <Truck className="w-5 h-5 text-orange-600" />;
    case "processing":
      return <Clock className="w-5 h-5 text-purple-600" />;
    case "cancelled":
      return <AlertCircle className="w-5 h-5 text-red-600" />;
    default:
      return <Clock className="w-5 h-5 text-yellow-600" />;
  }
};

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params?.orderId as string | undefined;

  const { data: orderData, isLoading: isLoadingOrder, error: orderError } = useGetOrderQuery(
    orderId as string,
    { skip: !orderId }
  );

  const isLoading = isLoadingOrder;
  const error = orderError;
  const [confirmRelease, { isLoading: isReleasing }] = useConfirmReleaseMutation();
  const [raiseDispute, { isLoading: isDisputing }] = useRaiseDisputeMutation();
  const [disputeFile, setDisputeFile] = useState<File | null>(null);
  const [disputePreview, setDisputePreview] = useState<string | null>(null);
  const [nowTs, setNowTs] = useState<number>(Date.now());
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!orderData || !(orderData as any).autoReleaseAt) return;
    const id = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(id);
  }, [orderData]);

  const remainingMs = useMemo(() => {
    const t = (orderData as any)?.autoReleaseAt;
    if (!t) return null;
    const end = new Date(t as any).getTime();
    return Math.max(0, end - nowTs);
  }, [orderData, nowTs]);

  const formatRemaining = (ms?: number | null) => {
    if (ms === null || ms === undefined) return "";
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (days > 0) {
      return `${days}d ${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Normalize API response to the shape used by this component
  const order = orderData
    ? {
        id: orderData.id || orderData._id,
        status: orderData.status || "pending",
        paymentStatus: orderData.paymentStatus || "unpaid",
        deliveryStatus: (orderData as any).deliveryStatus,
        autoReleaseAt: (orderData as any).autoReleaseAt,
        placedAt: orderData.placedAt || orderData.createdAt,
        deliveredAt: orderData.deliveredAt,
        totalAmount: orderData.totalAmount || 0,
        shippingCost: orderData.shippingCost || 0,
        taxAmount: orderData.taxAmount || 0,
        paymentMethod: orderData.paymentMethod || "N/A",
        estimatedDelivery: orderData.estimatedDelivery,
        updatedAt: orderData.updatedAt,
        // backend populates `shippingAddressId`; accept that or `shippingAddress`/`address`
        shippingAddress: orderData.shippingAddress || orderData.shippingAddressId || orderData.address || null,
        orderItems: (orderData.orderItems || orderData.items || []).map((item: any) => ({
          id: item.id || item._id,
          productId: item.productId || item.product?.id || item.product?._id,
          quantity: item.quantity || item.qty || 0,
          priceAtPurchase: item.priceAtPurchase || item.price || 0,
          product:
            item.product ||
            ({
              productName: item.productName || item.name,
              productImages: item.productImages || [],
              category: item.category,
              description: item.description || item.shortDescription,
            } as any),
          artist: item.product?.seller || item.artist || {},
        })),
        tracking:
          orderData.tracking ||
          (orderData.trackingNumber
            ? {
                carrier: orderData.carrier,
                trackingNumber: orderData.trackingNumber,
                status: orderData.status,
                updates: orderData.trackingUpdates || [],
              }
            : undefined),
      }
    : null;

  if (isLoading) {
    return (
      <main className="pt-10 pb-20">
        <div className="container mx-auto px-2 max-w-7xl">
          <div className="animate-pulse">
            <div className="h-8 bg-stone-200 rounded w-48 mb-8"></div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white border border-stone-200 p-6">
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
      </main>
    );
  }

  if (error) {
    return (
      <main className="pt-10 pb-20">
        <div className="container mx-auto px-2 max-w-7xl">
          <div className="text-center py-16">
            <h1 className="text-3xl font-light text-yogreet-charcoal mb-4">
              Error loading order
            </h1>
            <p className="text-stone-600 mb-8">Please try again later.</p>
            <Link href="/buyer/orders">
              <button className="bg-yogreet-red hover:bg-yogreet-red/90 text-white px-6 py-3 font-medium transition-colors cursor-pointer">
                Back to Orders
              </button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="pt-10 pb-20">
        <div className="container mx-auto px-2 max-w-7xl">
          <div className="text-center py-16">
            <Package className="w-24 h-24 mx-auto text-stone-300 mb-6" />
            <h1 className="text-3xl font-light text-yogreet-charcoal mb-4">
              Order not found
            </h1>
            <p className="text-stone-600 mb-8">
              The order you're looking for doesn't exist.
            </p>
            <Link href="/buyer/orders">
              <button className="bg-yogreet-red hover:bg-yogreet-red/90 text-white px-6 py-3 font-medium transition-colors cursor-pointer">
                Back to Orders
              </button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pb-20">
      <PageHero
        title="Order Details"
        subtitle=""
        description="Track your spice order progress, view delivery details, and manage your purchase history."
        breadcrumb={{
          items: [
            { label: "Home", href: "/" },
            { label: "My Orders", href: "/buyer/orders" },
            { label: "Order Details", isActive: true }
          ]
        }}
      />
      
      <div className="container mx-auto px-2 max-w-7xl">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {order.paymentStatus === "refunded" && (
              <div className="bg-stone-50 border border-stone-200 rounded-xs p-4 flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-stone-700 shrink-0 mt-0.5" />
                <p className="text-sm text-stone-800">
                  Refund processed — funds will arrive soon to your original payment method.
                </p>
              </div>
            )}
            {(order.paymentStatus === "held") && (
              <div className="bg-green-50 border border-green-200 rounded-xs p-4 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-green-700 shrink-0 mt-0.5" />
                <p className="text-sm text-green-800">
                  Secure Payment Protection (Test Mode) — Your payment is securely held and will be released after you confirm delivery.
                </p>
              </div>
            )}
            {order.paymentStatus === "held" && order.deliveryStatus === "delivered" && order.autoReleaseAt && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xs p-4 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-800 shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-900">
                  Confirm delivery to release payment. Otherwise, it will auto-release on {new Date(order.autoReleaseAt as any).toLocaleString()}.
                </p>
              </div>
            )}

            {/* Order Status */}
            <div className="bg-white border border-stone-200 shadow-sm">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-medium text-yogreet-charcoal flex items-center">
                    <Package className="w-5 h-5 mr-2 text-yogreet-red" />
                    Order Status
                  </h2>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(order.status)}
                    <span
                      className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                        statusColors[order.status?.toLowerCase()] ||
                        "bg-stone-100 text-stone-800"
                      }`}
                    >
                      {order.status
                        ? order.status.charAt(0).toUpperCase() +
                          order.status.slice(1).toLowerCase()
                        : "Unknown"}
                    </span>
                  </div>
                </div>
                
                {/* Tracking Timeline */}
                <div className="space-y-4">
                  {order.tracking?.updates?.map((update: any, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="shrink-0 w-6 h-6 bg-yogreet-red rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-yogreet-charcoal">
                          {update.message}
                        </p>
                        <p className="text-xs text-stone-500">
                          {new Date(update.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {order.tracking?.trackingNumber && (
                  <div className="mt-4 p-4 bg-stone-50 rounded-lg">
                    <p className="text-sm text-stone-600">
                      <strong>Tracking Number:</strong> {order.tracking.trackingNumber}
                    </p>
                    <p className="text-sm text-stone-600">
                      <strong>Carrier:</strong> {order.tracking.carrier}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white border border-stone-200 shadow-sm">
              <div className="p-6">
                <h2 className="text-xl font-medium text-yogreet-charcoal mb-4">
                  Order Items
                </h2>
                <div className="space-y-4">
                  {order.orderItems?.map((item: any) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border border-stone-200 rounded-lg">
                      <div className="relative w-20 h-20 shrink-0">
                        <Image
                          src={item.product?.productImages?.[0] || PLACEHOLDER_JPG_URL}
                          alt={item.product?.productName || "Product"}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <div className="flex-1">
                        <Link href={`/Products/${item.productId}`}>
                          <h4 className="font-medium text-yogreet-charcoal hover:text-yogreet-red transition-colors">
                            {item.product?.productName || "Unknown Product"}
                          </h4>
                        </Link>
                        <p className="text-sm text-stone-500">
                          By {item.artist?.storeName || item.artist?.fullName || "Unknown Artist"}
                        </p>
                        <p className="text-sm text-stone-600">
                          {item.product?.description}
                        </p>
                        <p className="text-sm text-stone-600">Qty: {item.quantity} × {formatCurrency(item.priceAtPurchase, (orderData as any)?.currency || "INR")}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-yogreet-charcoal">{formatCurrency(item.quantity * item.priceAtPurchase, (orderData as any)?.currency || "INR")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white border border-stone-200 shadow-sm">
              <div className="p-6">
                <h3 className="text-lg font-medium text-yogreet-charcoal mb-4">
                  Order Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-stone-600">Subtotal:</span>
                    <span className="text-yogreet-charcoal">{formatCurrency(order.totalAmount - (order.shippingCost || 0) - (order.taxAmount || 0), (orderData as any)?.currency || "INR")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">Shipping:</span>
                    <span className="text-yogreet-charcoal">{formatCurrency(order.shippingCost || 0, (orderData as any)?.currency || "INR")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">Tax:</span>
                    <span className="text-yogreet-charcoal">{formatCurrency(order.taxAmount || 0, (orderData as any)?.currency || "INR")}</span>
                  </div>
                  <hr className="border-stone-200 my-2" />
                  <div className="flex justify-between text-lg font-medium">
                    <span className="text-yogreet-charcoal">Total:</span>
                    <span className="text-yogreet-red">{formatCurrency(order.totalAmount, (orderData as any)?.currency || "INR")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white border border-stone-200 shadow-sm">
              <div className="p-6">
                <h3 className="text-lg font-medium text-yogreet-charcoal mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-yogreet-red" />
                  Payment
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-stone-600">Method:</span>
                    <span className="text-yogreet-charcoal">{order.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">Status:</span>
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        paymentStatusColors[order.paymentStatus?.toLowerCase()] ||
                        "bg-stone-100 text-stone-800"
                      }`}
                    >
                      {order.paymentStatus
                        ? order.paymentStatus.charAt(0).toUpperCase() +
                          order.paymentStatus.slice(1).toLowerCase()
                        : "Unknown"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white border border-stone-200 shadow-sm">
              <div className="p-6">
                <h3 className="text-lg font-medium text-yogreet-charcoal mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-yogreet-red" />
                  Shipping Address
                </h3>
                <div className="text-sm text-stone-600">
                  {(() => {
                    const addr = order.shippingAddress || {};
                    const fullName = [addr.firstName, addr.lastName].filter(Boolean).join(" ");
                    const line1 = addr.addressLine1 || addr.address || null;
                    const cityState = [addr.city, addr.state].filter(Boolean).join(", ");
                    const cityStatePostal = [cityState, addr.postalCode].filter(Boolean).join(" ");
                    const country = addr.country || null;
                    const phone = addr.phone || addr.phoneNumber || null;

                    return (
                      <>
                        {fullName ? (
                          <p className="font-medium text-yogreet-charcoal">{fullName}</p>
                        ) : null}
                        {line1 ? <p>{line1}</p> : null}
                        {cityStatePostal ? <p>{cityStatePostal}</p> : null}
                        {country ? <p>{country}</p> : null}
                        {phone ? <p className="mt-2">{phone}</p> : null}
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white border border-stone-200 shadow-sm">
              <div className="p-6">
                <h3 className="text-lg font-medium text-yogreet-charcoal mb-4">
                  Actions
                </h3>
                <div className="space-y-3">
                  {order.paymentStatus === "held" && order.status !== "cancelled" && (
                    <button
                      disabled={isReleasing}
                      onClick={async () => {
                        try {
                          await confirmRelease(order.id).unwrap();
                          window.location.reload();
                        } catch (e: any) {
                          console.error(e);
                        }
                      }}
                      className={`w-full bg-yogreet-sage hover:bg-yogreet-sage/90 text-white px-4 py-2 text-sm font-medium transition-colors cursor-pointer rounded flex items-center justify-center ${isReleasing ? "opacity-80 cursor-wait" : ""}`}
                    >
                      {isReleasing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Confirm & Release Payment
                        </>
                      )}
                    </button>
                  )}
                  
                  {(order.status !== "cancelled") &&
                   order.deliveryStatus !== "disputed" &&
                   ((order.paymentStatus === "held") ||
                    (order.deliveryStatus === "delivered" || order.status?.toLowerCase() === "delivered")) && (
                    <div className="space-y-2">
                      {order.autoReleaseAt && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-stone-600">Time left to raise an issue</span>
                          <span
                            className={`px-2 py-1 rounded ${
                              remainingMs && remainingMs > 0 ? "bg-yellow-100 text-yellow-800" : "bg-stone-100 text-stone-700"
                            }`}
                          >
                            {remainingMs && remainingMs > 0 ? formatRemaining(remainingMs) : "Window closed"}
                          </span>
                        </div>
                      )}
                      <label className="block text-sm text-stone-700">Upload product barcode photo</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const f = e.target.files?.[0] || null;
                          setDisputeFile(f);
                          if (disputePreview) {
                            try { URL.revokeObjectURL(disputePreview); } catch {}
                          }
                          if (f) {
                            setDisputePreview(URL.createObjectURL(f));
                          } else {
                            setDisputePreview(null);
                          }
                        }}
                        className="block w-full text-sm text-stone-700"
                        ref={fileInputRef}
                      />
                      {disputePreview && (
                        <div className="flex items-center gap-3 p-2 border border-stone-200 rounded">
                          <img src={disputePreview} alt="Dispute preview" className="w-16 h-16 object-contain rounded bg-white" />
                          <button
                            type="button"
                            onClick={() => {
                              if (disputePreview) {
                                try { URL.revokeObjectURL(disputePreview); } catch {}
                              }
                              setDisputePreview(null);
                              setDisputeFile(null);
                              if (fileInputRef.current) fileInputRef.current.value = "";
                            }}
                            className="px-2 py-1 text-xs border border-stone-300 rounded hover:bg-stone-50 cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                      <button
                        disabled={isDisputing || (remainingMs !== null && remainingMs <= 0)}
                        onClick={async () => {
                          if (!disputeFile) {
                            fileInputRef.current?.click();
                            return;
                          }
                          if (remainingMs !== null && remainingMs <= 0) {
                            toast.error("The dispute window has closed for this order");
                            return;
                          }
                          try {
                            await raiseDispute({ orderId: order.id, file: disputeFile }).unwrap();
                            toast.success("Issue raised successfully. Our team will review your evidence.");
                            window.location.reload();
                          } catch (e: any) {
                            console.error(e);
                            toast.error("Failed to raise issue. Please try again.");
                          }
                        }}
                        className={`w-full border border-stone-300 text-stone-700 hover:bg-stone-50 px-4 py-2 text-sm font-medium transition-colors cursor-pointer rounded flex items-center justify-center ${isDisputing ? "opacity-80 cursor-wait" : ""}`}
                      >
                        {isDisputing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Raise an Issue
                          </>
                        )}
                      </button>
                    </div>
                  )}
                  <button className="w-full bg-yogreet-red hover:bg-yogreet-red/90 text-white px-4 py-2 text-sm font-medium transition-colors cursor-pointer rounded flex items-center justify-center">
                    <Download className="w-4 h-4 mr-2" />
                    Download Invoice
                  </button>
                  <button className="w-full border border-stone-300 text-stone-700 hover:bg-stone-50 px-4 py-2 text-sm font-medium transition-colors cursor-pointer rounded flex items-center justify-center">
                    <Printer className="w-4 h-4 mr-2" />
                    Print Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
