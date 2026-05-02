"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Package,
  MapPin,
  User,
  Store,
  Phone,
  Mail,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { DeliveryStatusBadge, OrderStatus } from "@/components/delivery/DeliveryStatusBadge";
import { DeliveryTimeline } from "@/components/delivery/DeliveryTimeline";
import { ProofUploader } from "@/components/delivery/ProofUploader";
import { IssueModal } from "@/components/delivery/IssueModal";
import { toast } from "sonner";

interface Order {
  _id: string;
  orderId?: string;
  status: OrderStatus;
  buyer?: {
    name: string;
    email?: string;
    phone?: string;
  };
  seller?: {
    businessName: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  shippingAddress?: {
    firstName?: string;
    lastName?: string;
    street?: string;
    apartment?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    phone?: string;
  };
  totalAmount?: number;
  currency?: string;
  createdAt?: Date | string;
  assignedAt?: Date | string;
  pickupTime?: Date | string;
  deliveredTime?: Date | string;
  deliveryLogs?: any[];
  pickupProofImages?: string[];
  deliveryProofImages?: string[];
  deliveryIssue?: any;
}

// Valid status transitions for delivery partner
const VALID_NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  pending: [],
  confirmed: [],
  seller_preparing: [],
  ready_for_pickup: ["pickup_assigned"], // Allow manual assignment if auto-assignment failed
  pickup_assigned: ["picked_up", "pickup_failed"],
  picked_up: ["in_transit"],
  in_transit: ["customs_processing", "out_for_delivery"],
  customs_processing: ["out_for_delivery"],
  out_for_delivery: ["delivered", "delivery_failed"],
  delivered: [],
  completed: [],
  pickup_failed: ["reschedule_requested"],
  delivery_failed: ["reschedule_requested"],
  reschedule_requested: ["pickup_assigned"],
  returned: [],
  cancelled: [],
  damaged_reported: [],
};

export default function DeliveryPartnerOrderDetail() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "">("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showProofUploader, setShowProofUploader] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [proofType, setProofType] = useState<"pickup" | "delivery">("pickup");

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/delivery/orders/${orderId}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/delivery-partner/login");
          return;
        }
        throw new Error("Failed to fetch order");
      }

      const data = await response.json();
      setOrder(data.order);
    } catch (err: any) {
      setError(err.message || "Failed to load order");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedStatus || !order) return;

    // Check if proof is required
    const requiresProof = ["picked_up", "delivered"].includes(selectedStatus);
    if (requiresProof) {
      const proofImages =
        selectedStatus === "picked_up"
          ? order.pickupProofImages
          : order.deliveryProofImages;

      if (!proofImages || proofImages.length === 0) {
        toast.error(
          `Please upload ${selectedStatus === "picked_up" ? "pickup" : "delivery"} proof images first`
        );
        setProofType(selectedStatus === "picked_up" ? "pickup" : "delivery");
        setShowProofUploader(true);
        return;
      }
    }

    setIsUpdating(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/delivery/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ status: selectedStatus }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update status");
      }

      toast.success("Status updated successfully");
      await fetchOrder();
      setSelectedStatus("");
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleProofUpload = async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("proofImages", file);
    });
    formData.append("eventType", proofType);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/delivery/orders/${orderId}/upload-proof`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to upload proof");
      }

      toast.success("Proof images uploaded successfully");
      await fetchOrder();
      setShowProofUploader(false);
    } catch (err: any) {
      throw new Error(err.message || "Failed to upload proof");
    }
  };

  const handleIssueReport = async (data: {
    type: string;
    description: string;
    images?: File[];
  }) => {
    const formData = new FormData();
    formData.append("issueType", data.type);
    formData.append("description", data.description);
    if (data.images) {
      data.images.forEach((file) => {
        formData.append("images", file);
      });
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/delivery/orders/${orderId}/report-issue`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to report issue");
      }

      toast.success("Issue reported successfully");
      await fetchOrder();
    } catch (err: any) {
      throw new Error(err.message || "Failed to report issue");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-yogreet-sage animate-spin mx-auto mb-4" />
          <p className="text-stone-600 font-inter">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-poppins font-medium text-yogreet-charcoal mb-2">
            {error || "Order not found"}
          </h1>
          <Link
            href="/delivery-partner"
            className="inline-block mt-4 px-6 py-3 bg-yogreet-sage text-white rounded-lg font-manrope font-medium hover:bg-yogreet-sage/90 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const displayOrderId = order.orderId || order._id.slice(-8).toUpperCase();
  const validNextStatuses = VALID_NEXT_STATUSES[order.status] || [];

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/delivery-partner"
            className="inline-flex items-center text-stone-600 hover:text-yogreet-sage mb-4 font-inter text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-poppins font-light text-yogreet-charcoal mb-2">
                Order <span className="font-medium">#{displayOrderId}</span>
              </h1>
              <p className="text-stone-600 font-inter text-sm">
                Assigned on{" "}
                {order.assignedAt
                  ? new Date(order.assignedAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
            <DeliveryStatusBadge status={order.status} size="lg" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Update */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
              <h2 className="text-xl font-poppins font-medium text-yogreet-charcoal mb-4">
                Update Status
              </h2>

              {/* Workflow Instructions */}
              {order.status === "ready_for_pickup" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <h3 className="text-sm font-manrope font-semibold text-yellow-900 mb-2">
                    ⚠️ Manual Assignment Required
                  </h3>
                  <p className="text-sm text-yellow-800 font-inter mb-3">
                    This order should have been auto-assigned but wasn't. Please manually update the status to "Pickup Assigned" to begin the delivery process.
                  </p>
                  <ol className="text-sm text-yellow-800 font-inter space-y-1 list-decimal list-inside">
                    <li>Select "Pickup Assigned" from the dropdown below</li>
                    <li>Click "Update Status"</li>
                    <li>Then proceed with pickup</li>
                  </ol>
                </div>
              )}

              {order.status === "pickup_assigned" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h3 className="text-sm font-manrope font-semibold text-blue-900 mb-2">
                    📸 Next Steps:
                  </h3>
                  <ol className="text-sm text-blue-800 font-inter space-y-1 list-decimal list-inside">
                    <li>Go to pickup location</li>
                    <li>Click "Upload Proof" below and take photos of the package</li>
                    <li>After uploading, update status to "Picked Up"</li>
                  </ol>
                </div>
              )}

              {order.status === "out_for_delivery" && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <h3 className="text-sm font-manrope font-semibold text-green-900 mb-2">
                    📸 Next Steps:
                  </h3>
                  <ol className="text-sm text-green-800 font-inter space-y-1 list-decimal list-inside">
                    <li>Deliver package to recipient</li>
                    <li>Click "Upload Proof" below and take photos of delivered package</li>
                    <li>After uploading, update status to "Delivered"</li>
                  </ol>
                </div>
              )}

              {validNextStatuses.length > 0 ? (
                <div className="space-y-4">
                  {/* Proof Upload Section - Show prominently when needed */}
                  {(order.status === "pickup_assigned" || order.status === "out_for_delivery") && (
                    <div className="border-2 border-dashed border-yogreet-sage/30 rounded-lg p-4 bg-yogreet-sage/5">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-yogreet-sage/20 flex items-center justify-center shrink-0">
                          <Upload className="w-5 h-5 text-yogreet-sage" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-manrope font-semibold text-yogreet-charcoal mb-1">
                            {order.status === "pickup_assigned" ? "Upload Pickup Proof" : "Upload Delivery Proof"}
                          </h3>
                          <p className="text-xs text-stone-600 font-inter">
                            Required before updating to {order.status === "pickup_assigned" ? "Picked Up" : "Delivered"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setProofType(order.status === "pickup_assigned" ? "pickup" : "delivery");
                          setShowProofUploader(true);
                        }}
                        className="w-full px-4 py-3 bg-yogreet-sage text-white rounded-lg font-manrope font-medium hover:bg-yogreet-sage/90 transition-colors flex items-center justify-center gap-2"
                      >
                        <Upload className="w-5 h-5" />
                        Take & Upload Photos
                      </button>
                      
                      {/* Show uploaded count */}
                      {((order.status === "pickup_assigned" && order.pickupProofImages && order.pickupProofImages.length > 0) ||
                        (order.status === "out_for_delivery" && order.deliveryProofImages && order.deliveryProofImages.length > 0)) && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-green-700 font-inter">
                          <CheckCircle2 className="w-4 h-4" />
                          {order.status === "pickup_assigned" 
                            ? `${order.pickupProofImages?.length} photo(s) uploaded`
                            : `${order.deliveryProofImages?.length} photo(s) uploaded`
                          }
                        </div>
                      )}
                    </div>
                  )}

                  {/* Status Update Dropdown */}
                  <div className="flex gap-4">
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                      className="flex-1 px-4 py-3 border border-stone-300 rounded-lg focus:border-yogreet-sage focus:outline-none focus:ring-2 focus:ring-yogreet-sage/20 font-inter"
                      disabled={isUpdating}
                    >
                      <option value="">Select new status...</option>
                      {validNextStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status
                            .split("_")
                            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                            .join(" ")}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleStatusUpdate}
                      disabled={!selectedStatus || isUpdating}
                      className="px-6 py-3 bg-yogreet-sage text-white rounded-lg font-manrope font-medium hover:bg-yogreet-sage/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Update Status
                        </>
                      )}
                    </button>
                  </div>

                  {/* Other Action Buttons - Only show when not in critical photo upload states */}
                  {order.status !== "pickup_assigned" && order.status !== "out_for_delivery" && (
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => {
                          setProofType(
                            order.status === "pickup_assigned" ? "pickup" : "delivery"
                          );
                          setShowProofUploader(true);
                        }}
                        className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-manrope font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Upload Additional Proof
                      </button>
                      <button
                        onClick={() => setShowIssueModal(true)}
                        className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-manrope font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        Report Issue
                      </button>
                    </div>
                  )}

                  {/* Report Issue - Always available */}
                  {(order.status === "pickup_assigned" || order.status === "out_for_delivery") && (
                    <button
                      onClick={() => setShowIssueModal(true)}
                      className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-manrope font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      Report Issue (Pickup/Delivery Failed)
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-stone-500 font-inter">
                  No status updates available for this order.
                </p>
              )}
            </div>

            {/* Delivery Timeline */}
            {order.deliveryLogs && order.deliveryLogs.length > 0 && (
              <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
                <h2 className="text-xl font-poppins font-medium text-yogreet-charcoal mb-4">
                  Delivery Timeline
                </h2>
                <DeliveryTimeline logs={order.deliveryLogs} showProofImages={true} />
              </div>
            )}

            {/* Proof Images */}
            {((order.pickupProofImages && order.pickupProofImages.length > 0) ||
              (order.deliveryProofImages && order.deliveryProofImages.length > 0)) && (
              <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
                <h2 className="text-xl font-poppins font-medium text-yogreet-charcoal mb-4">
                  Proof Images
                </h2>
                <div className="space-y-4">
                  {order.pickupProofImages && order.pickupProofImages.length > 0 && (
                    <div>
                      <h3 className="text-sm font-manrope font-medium text-stone-700 mb-2">
                        Pickup Proof
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {order.pickupProofImages.map((url, index) => (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="aspect-square rounded-lg overflow-hidden border border-stone-200 hover:border-yogreet-sage transition-colors"
                          >
                            <img
                              src={url}
                              alt={`Pickup proof ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  {order.deliveryProofImages && order.deliveryProofImages.length > 0 && (
                    <div>
                      <h3 className="text-sm font-manrope font-medium text-stone-700 mb-2">
                        Delivery Proof
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {order.deliveryProofImages.map((url, index) => (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="aspect-square rounded-lg overflow-hidden border border-stone-200 hover:border-yogreet-sage transition-colors"
                          >
                            <img
                              src={url}
                              alt={`Delivery proof ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Buyer Info */}
            {order.buyer && (
              <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
                <h3 className="text-lg font-poppins font-medium text-yogreet-charcoal mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-yogreet-sage" />
                  Buyer
                </h3>
                <div className="space-y-3 text-sm font-inter">
                  <div>
                    <p className="text-stone-500 text-xs mb-1">Name</p>
                    <p className="text-yogreet-charcoal font-medium">{order.buyer.name}</p>
                  </div>
                  {order.buyer.email && (
                    <div>
                      <p className="text-stone-500 text-xs mb-1">Email</p>
                      <p className="text-yogreet-charcoal break-all">{order.buyer.email}</p>
                    </div>
                  )}
                  {order.buyer.phone && (
                    <div>
                      <p className="text-stone-500 text-xs mb-1">Phone</p>
                      <p className="text-yogreet-charcoal">{order.buyer.phone}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Seller Info */}
            {order.seller && (
              <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
                <h3 className="text-lg font-poppins font-medium text-yogreet-charcoal mb-4 flex items-center gap-2">
                  <Store className="w-5 h-5 text-yogreet-sage" />
                  Seller
                </h3>
                <div className="space-y-3 text-sm font-inter">
                  <div>
                    <p className="text-stone-500 text-xs mb-1">Business Name</p>
                    <p className="text-yogreet-charcoal font-medium">
                      {order.seller.businessName || order.seller.name}
                    </p>
                  </div>
                  {order.seller.email && (
                    <div>
                      <p className="text-stone-500 text-xs mb-1">Email</p>
                      <p className="text-yogreet-charcoal break-all">{order.seller.email}</p>
                    </div>
                  )}
                  {order.seller.phone && (
                    <div>
                      <p className="text-stone-500 text-xs mb-1">Phone</p>
                      <p className="text-yogreet-charcoal">{order.seller.phone}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
                <h3 className="text-lg font-poppins font-medium text-yogreet-charcoal mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-yogreet-sage" />
                  Delivery Address
                </h3>
                <div className="text-sm text-stone-600 font-inter space-y-1">
                  {order.shippingAddress.firstName && (
                    <p className="font-medium text-yogreet-charcoal">
                      {[order.shippingAddress.firstName, order.shippingAddress.lastName]
                        .filter(Boolean)
                        .join(" ")}
                    </p>
                  )}
                  {order.shippingAddress.street && <p>{order.shippingAddress.street}</p>}
                  {order.shippingAddress.apartment && (
                    <p>{order.shippingAddress.apartment}</p>
                  )}
                  {order.shippingAddress.city && (
                    <p>
                      {[
                        order.shippingAddress.city,
                        order.shippingAddress.state,
                        order.shippingAddress.postalCode,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
                  {order.shippingAddress.country && <p>{order.shippingAddress.country}</p>}
                  {order.shippingAddress.phone && (
                    <p className="mt-2 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {order.shippingAddress.phone}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Proof Uploader Modal */}
      {showProofUploader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-stone-200">
              <h2 className="text-xl font-poppins font-medium text-yogreet-charcoal">
                Upload {proofType === "pickup" ? "Pickup" : "Delivery"} Proof
              </h2>
            </div>
            <div className="p-6">
              <ProofUploader onUpload={handleProofUpload} eventType={proofType} />
            </div>
            <div className="p-6 border-t border-stone-200 flex justify-end">
              <button
                onClick={() => setShowProofUploader(false)}
                className="px-6 py-2 text-stone-600 hover:text-stone-800 font-manrope font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Issue Modal */}
      <IssueModal
        orderId={orderId}
        isOpen={showIssueModal}
        onClose={() => setShowIssueModal(false)}
        onSubmit={handleIssueReport}
      />
    </div>
  );
}
