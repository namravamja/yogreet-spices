"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useGetAdminQuery } from "@/services/api/adminApi";
import { formatCurrency } from "@/utils/currency";

export default function AdminDisputesPage() {
  const { data: adminData } = useGetAdminQuery(undefined);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const statusColor = (s: string = "") =>
    s.toLowerCase() === "held"
      ? "bg-yellow-100 text-yellow-800"
      : s.toLowerCase() === "released"
      ? "bg-green-100 text-green-800"
      : s.toLowerCase() === "refunded"
      ? "bg-gray-100 text-gray-800"
      : "bg-stone-100 text-stone-800";

  useEffect(() => {
    const load = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const res = await fetch(`${base}/admin/disputes`, { credentials: "include" });
        const json = await res.json();
        setOrders(json.data || []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="p-6">Loading disputes...</div>;
  if (error) return <div className="p-6 text-red-600">Failed to load disputes: {error}</div>;

  return (
    <div className="container mx-auto px-2 max-w-7xl py-6">
      <h1 className="text-2xl font-medium text-yogreet-charcoal mb-1">Disputes</h1>
      <p className="text-sm text-stone-600 mb-6">Manage refunds and force releases for disputed orders.</p>
      {orders.length === 0 ? (
        <div className="text-stone-600 bg-white border border-stone-200 rounded-xs p-6">No disputes found.</div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => {
            const shortId = String(o._id).slice(0, 8).toUpperCase();
            return (
              <div key={o._id} className="bg-white border border-stone-200 shadow-sm rounded-xs p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="font-medium text-yogreet-charcoal">Order #{shortId}</div>
                    <div className="text-sm text-stone-600">Amount: {formatCurrency(o.totalAmount || 0, o.currency || "INR")}</div>
                    <div className="text-sm">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(o.paymentStatus)}`}>
                        {String(o.paymentStatus || "").charAt(0).toUpperCase() + String(o.paymentStatus || "").slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      disabled={actionLoading?.endsWith(String(o._id)) || false}
                      className={`px-3 py-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded cursor-pointer transition-colors inline-flex items-center ${actionLoading === `release-${o._id}` ? "opacity-80 cursor-wait" : ""}`}
                      onClick={async () => {
                        setActionLoading(`release-${o._id}`);
                        try {
                          const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
                          await fetch(`${base}/admin/payments/${o._id}/force-release`, { method: "POST", credentials: "include" });
                          location.reload();
                        } finally {
                          setActionLoading(null);
                        }
                      }}
                    >
                      {actionLoading === `release-${o._id}` ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          Processing…
                        </>
                      ) : (
                        "Force Release"
                      )}
                    </button>
                    <button
                      disabled={actionLoading?.endsWith(String(o._id)) || false}
                      className={`px-3 py-1 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded cursor-pointer transition-colors inline-flex items-center ${actionLoading === `refund-${o._id}` ? "opacity-80 cursor-wait" : ""}`}
                      onClick={async () => {
                        setActionLoading(`refund-${o._id}`);
                        try {
                          const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
                          await fetch(`${base}/admin/payments/${o._id}/refund`, { method: "POST", credentials: "include" });
                          location.reload();
                        } finally {
                          setActionLoading(null);
                        }
                      }}
                    >
                      {actionLoading === `refund-${o._id}` ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          Processing…
                        </>
                      ) : (
                        "Refund"
                      )}
                    </button>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-yogreet-charcoal">Buyer Barcode</div>
                    {o.buyerBarcodeImage ? (
                      <img src={o.buyerBarcodeImage} alt={`Buyer barcode ${shortId}`} className="border border-stone-200 rounded-xs max-h-40 object-contain bg-white" />
                    ) : (
                      <div className="text-xs text-stone-500 border border-stone-200 rounded-xs p-2 bg-stone-50">No buyer barcode provided</div>
                    )}
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <div className="text-sm font-medium text-yogreet-charcoal">Product Barcodes</div>
                    <div className="flex gap-3 flex-wrap">
                      {(o.items || []).map((it: any, idx: number) => (
                        <div key={idx} className="border border-stone-200 rounded-xs p-2 bg-white">
                          <div className="text-xs text-stone-700 mb-1 font-medium">{it.productName || "Product"}</div>
                          {it.productBarcodeImage ? (
                            <img src={it.productBarcodeImage} alt={`Product barcode ${idx}`} className="max-h-32 object-contain" />
                          ) : (
                            <div className="text-xs text-stone-500">No barcode</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className="mt-6">
        <Link href="/admin" className="text-yogreet-red hover:underline">Back to Admin</Link>
      </div>
    </div>
  );
}
