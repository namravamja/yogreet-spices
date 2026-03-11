"use client";

import { useState } from "react";
import { Loader2, AlertTriangle, Clock, CheckCircle, XCircle, Eye, Filter, Search, Download } from "lucide-react";
import Link from "next/link";
import { useGetDisputesQuery, useGetDisputeStatsQuery, Dispute } from "@/services/api/adminApi";
import { formatCurrency } from "@/utils/currency";

const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const statusColors: Record<string, string> = {
  open: "bg-red-100 text-red-800 border-red-200",
  under_review: "bg-yellow-100 text-yellow-800 border-yellow-200",
  awaiting_seller: "bg-blue-100 text-blue-800 border-blue-200",
  resolved: "bg-green-100 text-green-800 border-green-200",
  escalated: "bg-purple-100 text-purple-800 border-purple-200",
};

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

const reasonLabels: Record<string, string> = {
  not_received: "Not Received",
  wrong_item: "Wrong Item",
  damaged: "Damaged",
  quality_issue: "Quality Issue",
  other: "Other",
};

export default function AdminDisputesPage() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const { data: disputes = [], isLoading, isError, refetch } = useGetDisputesQuery(
    { status: statusFilter || undefined, priority: priorityFilter || undefined }
  );
  const { data: stats } = useGetDisputeStatsQuery();

  // Export disputes to Excel
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (priorityFilter) params.append("priority", priorityFilter);

      const response = await fetch(`${BASE_API_URL}/admin/disputes/export?${params.toString()}`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      // Get the blob and create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `disputes_export_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export disputes. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // Filter by search
  const filteredDisputes = disputes.filter((d: Dispute) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      d._id.toLowerCase().includes(query) ||
      d.orderId.toLowerCase().includes(query) ||
      d.buyerInfo.fullName.toLowerCase().includes(query) ||
      d.buyerInfo.email.toLowerCase().includes(query) ||
      d.products.some((p) => p.productName.toLowerCase().includes(query)) ||
      d.products.some((p) => p.sellerName?.toLowerCase().includes(query))
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-yogreet-red" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-red-600 bg-red-50 border border-red-200 rounded-xs">
        Failed to load disputes. Please try again.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 max-w-7xl py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-yogreet-charcoal mb-1">Dispute Management</h1>
        <p className="text-sm text-stone-600">
          Review and resolve buyer-seller disputes with complete order and evidence history
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white border border-stone-200 rounded-xs p-4">
            <div className="text-2xl font-semibold text-yogreet-charcoal">{stats.total}</div>
            <div className="text-sm text-stone-600">Total Disputes</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xs p-4">
            <div className="text-2xl font-semibold text-red-700">{stats.open}</div>
            <div className="text-sm text-red-600">Open</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xs p-4">
            <div className="text-2xl font-semibold text-yellow-700">{stats.underReview}</div>
            <div className="text-sm text-yellow-600">Under Review</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xs p-4">
            <div className="text-2xl font-semibold text-green-700">{stats.resolved}</div>
            <div className="text-sm text-green-600">Resolved</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-xs p-4">
            <div className="text-2xl font-semibold text-orange-700">{stats.highPriority}</div>
            <div className="text-sm text-orange-600">High Priority</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-stone-200 rounded-xs p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-stone-500" />
            <span className="text-sm font-medium text-stone-700">Filters:</span>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search by ID, buyer, product, seller..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-stone-300 rounded text-sm w-64"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-stone-300 rounded text-sm"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="under_review">Under Review</option>
            <option value="awaiting_seller">Awaiting Seller</option>
            <option value="resolved">Resolved</option>
            <option value="escalated">Escalated</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-stone-300 rounded text-sm"
          >
            <option value="">All Priority</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <button
            onClick={() => refetch()}
            className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-sm transition-colors"
          >
            Refresh
          </button>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export Excel
              </>
            )}
          </button>
        </div>
      </div>

      {/* Disputes List */}
      {filteredDisputes.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-xs p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-stone-400 mx-auto mb-3" />
          <p className="text-stone-600">No disputes found matching your criteria</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDisputes.map((dispute: Dispute) => {
            const shortDisputeId = dispute._id.slice(0, 8).toUpperCase();
            const shortOrderId = dispute.orderId.slice(0, 8).toUpperCase();
            const createdDate = new Date(dispute.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            return (
              <div
                key={dispute._id}
                className="bg-white border border-stone-200 rounded-xs overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Header Row */}
                <div className="p-4 border-b border-stone-100 bg-stone-50">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="text-sm text-stone-500">Dispute ID</div>
                        <div className="font-mono font-semibold text-yogreet-charcoal">#{shortDisputeId}</div>
                      </div>
                      <div className="h-8 w-px bg-stone-200" />
                      <div>
                        <div className="text-sm text-stone-500">Order ID</div>
                        <div className="font-mono text-stone-700">#{shortOrderId}</div>
                      </div>
                      <div className="h-8 w-px bg-stone-200" />
                      <div>
                        <div className="text-sm text-stone-500">Created</div>
                        <div className="text-stone-700">{createdDate}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded border ${statusColors[dispute.status]}`}>
                        {dispute.status.replace("_", " ").toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${priorityColors[dispute.priority]}`}>
                        {dispute.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Buyer Info */}
                    <div>
                      <h4 className="text-sm font-semibold text-stone-700 mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full" />
                        Buyer Information
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div className="text-yogreet-charcoal font-medium">{dispute.buyerInfo.fullName}</div>
                        <div className="text-stone-600">{dispute.buyerInfo.email}</div>
                        {dispute.buyerInfo.phone && (
                          <div className="text-stone-600">{dispute.buyerInfo.phone}</div>
                        )}
                      </div>
                    </div>

                    {/* Order & Reason Info */}
                    <div>
                      <h4 className="text-sm font-semibold text-stone-700 mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-orange-500 rounded-full" />
                        Dispute Details
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div>
                          <span className="text-stone-500">Amount: </span>
                          <span className="font-semibold text-yogreet-charcoal">
                            {formatCurrency(dispute.orderInfo.totalAmount, dispute.orderInfo.currency)}
                          </span>
                        </div>
                        <div>
                          <span className="text-stone-500">Reason: </span>
                          <span className="text-yogreet-charcoal">{reasonLabels[dispute.reason]}</span>
                        </div>
                        {dispute.reasonDescription && (
                          <div className="text-stone-600 italic truncate">"{dispute.reasonDescription}"</div>
                        )}
                      </div>
                    </div>

                    {/* Products Summary */}
                    <div>
                      <h4 className="text-sm font-semibold text-stone-700 mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full" />
                        Products ({dispute.products.length})
                      </h4>
                      <div className="space-y-1 text-sm">
                        {dispute.products.slice(0, 2).map((p, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span className="text-stone-700 truncate max-w-[180px]">{p.productName}</span>
                            <span className="text-stone-500">×{p.quantity}</span>
                          </div>
                        ))}
                        {dispute.products.length > 2 && (
                          <div className="text-stone-500">+{dispute.products.length - 2} more</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Evidence Preview */}
                  <div className="mt-4 pt-4 border-t border-stone-100">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-stone-500">Buyer Proof:</span>
                        {dispute.buyerEvidence.barcodeImage ? (
                          <img
                            src={dispute.buyerEvidence.barcodeImage}
                            alt="Buyer proof"
                            className="w-12 h-12 object-cover border border-stone-200 rounded"
                          />
                        ) : (
                          <span className="text-sm text-stone-400">None</span>
                        )}
                      </div>

                      {dispute.sellerEvidence?.barcodeImage && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-stone-500">Seller Response:</span>
                          <img
                            src={dispute.sellerEvidence.barcodeImage}
                            alt="Seller proof"
                            className="w-12 h-12 object-cover border border-stone-200 rounded"
                          />
                        </div>
                      )}

                      <div className="ml-auto flex items-center gap-2">
                        <span className="text-xs text-stone-500">
                          {dispute.timeline.length} events • {dispute.adminNotes.length} notes
                        </span>
                        <Link
                          href={`/admin/disputes/${dispute._id}`}
                          className="inline-flex items-center gap-1 px-4 py-2 bg-yogreet-red hover:bg-yogreet-red/90 text-white text-sm font-medium rounded transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Resolution Info (if resolved) */}
                  {dispute.resolution && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                      <div className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-medium">
                          Resolved: {dispute.resolution.action.replace("_", " ")}
                        </span>
                        {dispute.resolution.refundAmount && (
                          <span className="text-green-700">
                            ({formatCurrency(dispute.resolution.refundAmount, dispute.orderInfo.currency)})
                          </span>
                        )}
                        <span className="text-green-600 text-sm ml-auto">
                          by {dispute.resolution.resolvedByName} on{" "}
                          {new Date(dispute.resolution.resolvedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Back Link */}
      <div className="mt-8">
        <Link href="/admin" className="text-yogreet-red hover:underline">
          ← Back to Admin Dashboard
        </Link>
      </div>
    </div>
  );
}
