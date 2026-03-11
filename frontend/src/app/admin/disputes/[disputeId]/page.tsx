"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  ArrowLeft,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Package,
  DollarSign,
  FileText,
  MessageSquare,
  Image as ImageIcon,
  Send,
  RefreshCw,
} from "lucide-react";
import {
  useGetDisputeByIdQuery,
  useUpdateDisputeStatusMutation,
  useUpdateDisputePriorityMutation,
  useResolveDisputeNewMutation,
  useAddAdminNoteMutation,
  Dispute,
} from "@/services/api/adminApi";
import { formatCurrency } from "@/utils/currency";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  open: "bg-red-100 text-red-800 border-red-200",
  under_review: "bg-yellow-100 text-yellow-800 border-yellow-200",
  awaiting_seller: "bg-blue-100 text-blue-800 border-blue-200",
  resolved: "bg-green-100 text-green-800 border-green-200",
  escalated: "bg-purple-100 text-purple-800 border-purple-200",
};

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-700 border-gray-200",
  medium: "bg-blue-100 text-blue-700 border-blue-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  critical: "bg-red-100 text-red-700 border-red-200",
};

const reasonLabels: Record<string, string> = {
  not_received: "Not Received",
  wrong_item: "Wrong Item",
  damaged: "Damaged",
  quality_issue: "Quality Issue",
  other: "Other",
};

const actionIcons: Record<string, React.ReactNode> = {
  created: <AlertTriangle className="w-4 h-4 text-red-500" />,
  evidence_added: <ImageIcon className="w-4 h-4 text-blue-500" />,
  admin_reviewed: <User className="w-4 h-4 text-purple-500" />,
  resolved: <CheckCircle className="w-4 h-4 text-green-500" />,
  escalated: <AlertTriangle className="w-4 h-4 text-orange-500" />,
  comment_added: <MessageSquare className="w-4 h-4 text-gray-500" />,
};

export default function DisputeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const disputeId = params.disputeId as string;

  const { data: dispute, isLoading, isError, refetch } = useGetDisputeByIdQuery(disputeId);
  const [updateStatus, { isLoading: updatingStatus }] = useUpdateDisputeStatusMutation();
  const [updatePriority, { isLoading: updatingPriority }] = useUpdateDisputePriorityMutation();
  const [resolveDispute, { isLoading: resolving }] = useResolveDisputeNewMutation();
  const [addNote, { isLoading: addingNote }] = useAddAdminNoteMutation();

  const [newNote, setNewNote] = useState("");
  const [resolutionAction, setResolutionAction] = useState<string>("refund");
  const [refundAmount, setRefundAmount] = useState<string>("");
  const [resolutionNotes, setResolutionNotes] = useState<string>("");
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-yogreet-red" />
      </div>
    );
  }

  if (isError || !dispute) {
    return (
      <div className="container mx-auto px-4 max-w-7xl py-6">
        <div className="bg-red-50 border border-red-200 rounded-xs p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-red-700">Dispute not found or failed to load</p>
          <Link href="/admin/disputes" className="text-yogreet-red hover:underline mt-4 inline-block">
            ← Back to Disputes
          </Link>
        </div>
      </div>
    );
  }

  const shortDisputeId = dispute._id.slice(0, 8).toUpperCase();
  const shortOrderId = dispute.orderId.slice(0, 8).toUpperCase();

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateStatus({ disputeId, status: newStatus }).unwrap();
      toast.success(`Status updated to ${newStatus.replace("_", " ")}`);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update status");
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    try {
      await updatePriority({ disputeId, priority: newPriority }).unwrap();
      toast.success(`Priority updated to ${newPriority}`);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update priority");
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      await addNote({ disputeId, note: newNote.trim() }).unwrap();
      toast.success("Note added successfully");
      setNewNote("");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to add note");
    }
  };

  const handleResolve = async () => {
    try {
      const payload: any = {
        disputeId,
        action: resolutionAction as any,
        notes: resolutionNotes || undefined,
      };
      if (resolutionAction === "partial_refund" && refundAmount) {
        payload.refundAmount = parseFloat(refundAmount);
      }
      await resolveDispute(payload).unwrap();
      toast.success("Dispute resolved successfully");
      setShowResolutionModal(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to resolve dispute");
    }
  };

  return (
    <div className="container mx-auto px-4 max-w-7xl py-6">
      {/* Header */}
      <div className="mb-6">
        <Link href="/admin/disputes" className="inline-flex items-center gap-1 text-yogreet-red hover:underline mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Disputes
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-yogreet-charcoal flex items-center gap-3">
              Dispute #{shortDisputeId}
              <span className={`px-2 py-1 text-sm font-medium rounded border ${statusColors[dispute.status]}`}>
                {dispute.status.replace("_", " ").toUpperCase()}
              </span>
              <span className={`px-2 py-1 text-sm font-medium rounded border ${priorityColors[dispute.priority]}`}>
                {dispute.priority.toUpperCase()}
              </span>
            </h1>
            <p className="text-sm text-stone-600 mt-1">
              Order #{shortOrderId} • Created {new Date(dispute.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-3 py-2 bg-stone-100 hover:bg-stone-200 rounded text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Buyer & Order Info */}
          <div className="bg-white border border-stone-200 rounded-xs p-5">
            <h2 className="text-lg font-semibold text-yogreet-charcoal mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" />
              Buyer & Order Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-stone-500 mb-2">Buyer Details</h3>
                <div className="space-y-2">
                  <div className="text-yogreet-charcoal font-medium">{dispute.buyerInfo.fullName}</div>
                  <div className="text-stone-600">{dispute.buyerInfo.email}</div>
                  {dispute.buyerInfo.phone && <div className="text-stone-600">{dispute.buyerInfo.phone}</div>}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-stone-500 mb-2">Order Details</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Total Amount:</span>
                    <span className="font-semibold">{formatCurrency(dispute.orderInfo.totalAmount, dispute.orderInfo.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Subtotal:</span>
                    <span>{formatCurrency(dispute.orderInfo.subtotal, dispute.orderInfo.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Shipping:</span>
                    <span>{formatCurrency(dispute.orderInfo.shippingCost, dispute.orderInfo.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Tax:</span>
                    <span>{formatCurrency(dispute.orderInfo.taxAmount, dispute.orderInfo.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Payment Method:</span>
                    <span className="capitalize">{dispute.orderInfo.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Placed:</span>
                    <span>{new Date(dispute.orderInfo.placedAt).toLocaleDateString()}</span>
                  </div>
                  {dispute.orderInfo.deliveredAt && (
                    <div className="flex justify-between">
                      <span className="text-stone-500">Delivered:</span>
                      <span>{new Date(dispute.orderInfo.deliveredAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Dispute Reason */}
          <div className="bg-white border border-stone-200 rounded-xs p-5">
            <h2 className="text-lg font-semibold text-yogreet-charcoal mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Dispute Reason
            </h2>
            <div className="bg-orange-50 border border-orange-200 rounded p-4">
              <div className="font-medium text-orange-800">{reasonLabels[dispute.reason]}</div>
              {dispute.reasonDescription && (
                <p className="text-orange-700 mt-2">{dispute.reasonDescription}</p>
              )}
            </div>
          </div>

          {/* Products */}
          <div className="bg-white border border-stone-200 rounded-xs p-5">
            <h2 className="text-lg font-semibold text-yogreet-charcoal mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-green-500" />
              Products in Dispute ({dispute.products.length})
            </h2>
            <div className="space-y-4">
              {dispute.products.map((product, idx) => (
                <div key={idx} className="border border-stone-200 rounded p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-yogreet-charcoal">{product.productName}</div>
                      <div className="text-sm text-stone-600 mt-1">
                        Seller: {product.sellerName || "Unknown"} ({product.sellerEmail || "N/A"})
                      </div>
                      <div className="text-sm text-stone-600">
                        Quantity: {product.quantity} × {formatCurrency(product.priceAtPurchase, dispute.orderInfo.currency)}
                      </div>
                    </div>
                    {product.productBarcodeImage && (
                      <div
                        className="ml-4 cursor-pointer"
                        onClick={() => setSelectedImage(product.productBarcodeImage!)}
                      >
                        <img
                          src={product.productBarcodeImage}
                          alt="Product barcode"
                          className="w-20 h-20 object-contain border border-stone-200 rounded"
                        />
                        <div className="text-xs text-stone-500 text-center mt-1">Product Barcode</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Evidence Comparison */}
          <div className="bg-white border border-stone-200 rounded-xs p-5">
            <h2 className="text-lg font-semibold text-yogreet-charcoal mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-purple-500" />
              Evidence Comparison
            </h2>
            
            {/* Original Product Barcode vs Received Barcode Comparison */}
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <h3 className="text-sm font-semibold text-yellow-800 mb-3">
                🔍 Barcode Comparison (Seller's Original vs Buyer's Received)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Seller's Original Product Barcode */}
                <div className="text-center">
                  <div className="text-xs font-medium text-green-700 mb-2 uppercase tracking-wide">
                    Seller's Original Product Barcode
                  </div>
                  {dispute.products.some(p => p.productBarcodeImage) ? (
                    <div className="space-y-2">
                      {dispute.products.filter(p => p.productBarcodeImage).map((product, idx) => (
                        <div key={idx} className="border border-green-300 rounded bg-white p-2">
                          <img
                            src={product.productBarcodeImage!}
                            alt="Seller's product barcode"
                            className="max-h-32 object-contain mx-auto cursor-pointer"
                            onClick={() => setSelectedImage(product.productBarcodeImage!)}
                          />
                          <div className="text-xs text-green-600 mt-1">{product.productName}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border border-stone-200 rounded bg-stone-50 p-4 text-stone-500 text-sm">
                      No barcode uploaded by seller
                    </div>
                  )}
                </div>
                
                {/* Buyer's Received Barcode */}
                <div className="text-center">
                  <div className="text-xs font-medium text-blue-700 mb-2 uppercase tracking-wide">
                    Buyer's Received Barcode
                  </div>
                  {dispute.buyerEvidence.barcodeImage ? (
                    <div className="border border-blue-300 rounded bg-white p-2">
                      <img
                        src={dispute.buyerEvidence.barcodeImage}
                        alt="Buyer's received barcode"
                        className="max-h-32 object-contain mx-auto cursor-pointer"
                        onClick={() => setSelectedImage(dispute.buyerEvidence.barcodeImage)}
                      />
                      <div className="text-xs text-blue-600 mt-1">What buyer received</div>
                    </div>
                  ) : (
                    <div className="border border-stone-200 rounded bg-stone-50 p-4 text-stone-500 text-sm">
                      No barcode evidence provided
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Buyer Evidence */}
              <div>
                <h3 className="text-sm font-medium text-blue-700 mb-3 flex items-center gap-2">
                  <span className="w-3 h-3 bg-blue-500 rounded-full" />
                  Buyer's Full Evidence
                </h3>
                <div className="border border-blue-200 rounded bg-blue-50 p-4">
                  {dispute.buyerEvidence.barcodeImage && (
                    <div
                      className="cursor-pointer mb-3"
                      onClick={() => setSelectedImage(dispute.buyerEvidence.barcodeImage)}
                    >
                      <img
                        src={dispute.buyerEvidence.barcodeImage}
                        alt="Buyer barcode proof"
                        className="max-h-48 object-contain mx-auto border border-blue-300 rounded bg-white"
                      />
                    </div>
                  )}
                  {dispute.buyerEvidence.description && (
                    <p className="text-sm text-blue-800 italic">"{dispute.buyerEvidence.description}"</p>
                  )}
                  {dispute.buyerEvidence.additionalImages && dispute.buyerEvidence.additionalImages.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs text-blue-600 mb-2">Additional Images:</div>
                      <div className="flex gap-2 flex-wrap">
                        {dispute.buyerEvidence.additionalImages.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`Additional ${idx + 1}`}
                            className="w-16 h-16 object-cover border border-blue-200 rounded cursor-pointer"
                            onClick={() => setSelectedImage(img)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Seller Evidence */}
              <div>
                <h3 className="text-sm font-medium text-green-700 mb-3 flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full" />
                  Seller's Response
                </h3>
                {dispute.sellerEvidence?.barcodeImage || dispute.sellerEvidence?.description ? (
                  <div className="border border-green-200 rounded bg-green-50 p-4">
                    {dispute.sellerEvidence.barcodeImage && (
                      <div
                        className="cursor-pointer mb-3"
                        onClick={() => setSelectedImage(dispute.sellerEvidence!.barcodeImage!)}
                      >
                        <img
                          src={dispute.sellerEvidence.barcodeImage}
                          alt="Seller barcode proof"
                          className="max-h-48 object-contain mx-auto border border-green-300 rounded bg-white"
                        />
                      </div>
                    )}
                    {dispute.sellerEvidence.description && (
                      <p className="text-sm text-green-800 italic">"{dispute.sellerEvidence.description}"</p>
                    )}
                    {dispute.sellerEvidence.respondedAt && (
                      <div className="text-xs text-green-600 mt-2">
                        Responded: {new Date(dispute.sellerEvidence.respondedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="border border-stone-200 rounded bg-stone-50 p-4 text-center text-stone-500">
                    No seller response yet
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white border border-stone-200 rounded-xs p-5">
            <h2 className="text-lg font-semibold text-yogreet-charcoal mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-500" />
              Timeline ({dispute.timeline.length} events)
            </h2>
            <div className="space-y-4">
              {dispute.timeline.map((event, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {actionIcons[event.action] || <Clock className="w-4 h-4 text-gray-400" />}
                  </div>
                  <div className="flex-1 pb-4 border-b border-stone-100 last:border-0">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-yogreet-charcoal">{event.description}</div>
                      <div className="text-xs text-stone-500">
                        {new Date(event.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-sm text-stone-600 mt-1">
                      by {event.performedBy.name || event.performedBy.role} ({event.performedBy.role})
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resolution (if resolved) */}
          {dispute.resolution && (
            <div className="bg-green-50 border border-green-200 rounded-xs p-5">
              <h2 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Resolution Details
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-green-600">Action:</span>
                  <span className="ml-2 font-medium text-green-800 capitalize">
                    {dispute.resolution.action.replace("_", " ")}
                  </span>
                </div>
                {dispute.resolution.refundAmount && (
                  <div>
                    <span className="text-green-600">Refund Amount:</span>
                    <span className="ml-2 font-medium text-green-800">
                      {formatCurrency(dispute.resolution.refundAmount, dispute.orderInfo.currency)}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-green-600">Resolved By:</span>
                  <span className="ml-2 text-green-800">{dispute.resolution.resolvedByName}</span>
                </div>
                <div>
                  <span className="text-green-600">Resolved At:</span>
                  <span className="ml-2 text-green-800">
                    {new Date(dispute.resolution.resolvedAt).toLocaleString()}
                  </span>
                </div>
                {dispute.resolution.notes && (
                  <div className="col-span-2">
                    <span className="text-green-600">Notes:</span>
                    <p className="mt-1 text-green-800">{dispute.resolution.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          {dispute.status !== "resolved" && (
            <div className="bg-white border border-stone-200 rounded-xs p-5">
              <h2 className="text-lg font-semibold text-yogreet-charcoal mb-4">Quick Actions</h2>
              
              {/* Status Change */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-stone-700 mb-2">Update Status</label>
                <select
                  value={dispute.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={updatingStatus}
                  className="w-full px-3 py-2 border border-stone-300 rounded text-sm"
                >
                  <option value="open">Open</option>
                  <option value="under_review">Under Review</option>
                  <option value="awaiting_seller">Awaiting Seller</option>
                  <option value="escalated">Escalated</option>
                </select>
              </div>

              {/* Priority Change */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-stone-700 mb-2">Update Priority</label>
                <select
                  value={dispute.priority}
                  onChange={(e) => handlePriorityChange(e.target.value)}
                  disabled={updatingPriority}
                  className="w-full px-3 py-2 border border-stone-300 rounded text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              {/* Resolve Button */}
              <button
                onClick={() => setShowResolutionModal(true)}
                className="w-full px-4 py-3 bg-yogreet-red hover:bg-yogreet-red/90 text-white font-medium rounded transition-colors"
              >
                Resolve Dispute
              </button>
            </div>
          )}

          {/* Admin Notes */}
          <div className="bg-white border border-stone-200 rounded-xs p-5">
            <h2 className="text-lg font-semibold text-yogreet-charcoal mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-500" />
              Admin Notes ({dispute.adminNotes.length})
            </h2>
            
            {/* Add Note */}
            <div className="mb-4">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add internal note..."
                className="w-full px-3 py-2 border border-stone-300 rounded text-sm resize-none"
                rows={3}
              />
              <button
                onClick={handleAddNote}
                disabled={!newNote.trim() || addingNote}
                className="mt-2 w-full px-3 py-2 bg-stone-800 hover:bg-stone-900 disabled:bg-stone-300 text-white text-sm rounded inline-flex items-center justify-center gap-2"
              >
                {addingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Add Note
              </button>
            </div>

            {/* Notes List */}
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {dispute.adminNotes.length === 0 ? (
                <p className="text-sm text-stone-500 text-center py-4">No notes yet</p>
              ) : (
                dispute.adminNotes.map((note, idx) => (
                  <div key={idx} className="bg-stone-50 border border-stone-200 rounded p-3">
                    <p className="text-sm text-yogreet-charcoal">{note.note}</p>
                    <div className="text-xs text-stone-500 mt-2">
                      {note.addedByName} • {new Date(note.addedAt).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Evidence History */}
          <div className="bg-white border border-stone-200 rounded-xs p-5">
            <h2 className="text-lg font-semibold text-yogreet-charcoal mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-purple-500" />
              Evidence History ({dispute.evidenceHistory.length})
            </h2>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {dispute.evidenceHistory.map((evidence, idx) => (
                <div key={idx} className="border border-stone-200 rounded p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 text-xs rounded capitalize ${
                      evidence.uploadedBy.role === "buyer" ? "bg-blue-100 text-blue-700" :
                      evidence.uploadedBy.role === "seller" ? "bg-green-100 text-green-700" :
                      "bg-purple-100 text-purple-700"
                    }`}>
                      {evidence.uploadedBy.role}
                    </span>
                    <span className="text-xs text-stone-500">{evidence.type}</span>
                  </div>
                  {evidence.url && (
                    <img
                      src={evidence.url}
                      alt="Evidence"
                      className="w-full h-24 object-contain bg-stone-50 rounded cursor-pointer"
                      onClick={() => setSelectedImage(evidence.url!)}
                    />
                  )}
                  {evidence.description && (
                    <p className="text-xs text-stone-600 mt-2">{evidence.description}</p>
                  )}
                  <div className="text-xs text-stone-400 mt-2">
                    {new Date(evidence.uploadedAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Resolution Modal */}
      {showResolutionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h3 className="text-lg font-semibold text-yogreet-charcoal mb-4">Resolve Dispute</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Resolution Action</label>
                <select
                  value={resolutionAction}
                  onChange={(e) => setResolutionAction(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded"
                >
                  <option value="refund">Full Refund to Buyer</option>
                  <option value="partial_refund">Partial Refund</option>
                  <option value="release_to_seller">Release to Seller (No Refund)</option>
                  <option value="rejected">Reject Dispute</option>
                </select>
              </div>

              {resolutionAction === "partial_refund" && (
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Refund Amount</label>
                  <input
                    type="number"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    placeholder={`Max: ${dispute.orderInfo.totalAmount}`}
                    className="w-full px-3 py-2 border border-stone-300 rounded"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Resolution Notes</label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Add notes about why this decision was made..."
                  className="w-full px-3 py-2 border border-stone-300 rounded resize-none"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowResolutionModal(false)}
                className="flex-1 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleResolve}
                disabled={resolving}
                className="flex-1 px-4 py-2 bg-yogreet-red hover:bg-yogreet-red/90 text-white rounded inline-flex items-center justify-center gap-2"
              >
                {resolving && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Full size"
            className="max-w-full max-h-full object-contain"
          />
          <button
            className="absolute top-4 right-4 text-white text-2xl"
            onClick={() => setSelectedImage(null)}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}