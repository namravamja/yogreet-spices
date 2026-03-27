"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  Eye,
  Download,
  Filter,
  Search,
  Calendar,
  User,
} from "lucide-react";
import PageHero from "@/components/shared/PageHero";
import { useGetOrdersQuery } from "@/services/api/buyerApi";
import { PLACEHOLDER_JPG_URL } from "@/constants/static-images";

// Status color mappings with Yogreet theme
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

export default function BuyerOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const formatCurrency = (amount: number) => `₹${Number(amount || 0).toFixed(2)}`;

  const formatOrderDate = (dateValue: string) =>
    new Date(dateValue).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const getTaxAmount = (order: any) =>
    Number(order.taxAmount || Math.round(Number(order.totalAmount || 0) * 0.08));

  const getShippingAmount = (order: any) => Number(order.shippingCost || 0);

  const getSubtotalAmount = (order: any) =>
    Number(order.totalAmount || 0) - getShippingAmount(order) - getTaxAmount(order);

  const buildInvoiceHtml = (order: any) => {
    const safeId = String(order.id || "");
    const invoiceNo = safeId.slice(0, 8).toUpperCase();
    const createdDate = formatOrderDate(order.placedAt);
    const shipping = getShippingAmount(order);
    const tax = getTaxAmount(order);
    const subtotal = getSubtotalAmount(order);
    const itemRows = (order.orderItems || [])
      .map(
        (item: any) => `
          <tr>
            <td>${item.product?.productName || "Unknown Product"}</td>
            <td>${item.artist?.storeName || item.artist?.fullName || "Unknown Seller"}</td>
            <td>${item.quantity || 0}</td>
            <td>${formatCurrency(Number(item.priceAtPurchase || 0))}</td>
            <td>${formatCurrency(Number(item.quantity || 0) * Number(item.priceAtPurchase || 0))}</td>
          </tr>
        `
      )
      .join("");

    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Invoice #${invoiceNo}</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 24px; color: #1f2937; }
      .header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 24px; }
      .brand { font-size: 24px; font-weight: 700; color: #7f1d1d; }
      .muted { color: #6b7280; font-size: 13px; }
      .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; background: #f3f4f6; font-size: 12px; }
      table { width: 100%; border-collapse: collapse; margin-top: 16px; }
      th, td { border: 1px solid #e5e7eb; padding: 10px; text-align: left; font-size: 13px; }
      th { background: #f9fafb; }
      .totals { margin-top: 16px; margin-left: auto; width: 320px; }
      .totals-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e5e7eb; }
      .totals-row.total { font-weight: 700; font-size: 16px; border-bottom: none; margin-top: 6px; }
      .footer { margin-top: 32px; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 12px; }
    </style>
  </head>
  <body>
    <div class="header">
      <div>
        <div class="brand">Yogreet Spices</div>
        <div class="muted">Tax Invoice</div>
      </div>
      <div style="text-align: right;">
        <div><strong>Invoice #:</strong> ${invoiceNo}</div>
        <div><strong>Order ID:</strong> ${safeId}</div>
        <div><strong>Date:</strong> ${createdDate}</div>
        <div><strong>Payment:</strong> ${order.paymentMethod || "N/A"}</div>
      </div>
    </div>

    <div style="margin-bottom: 8px;">
      <span class="badge">Order Status: ${String(order.status || "pending")}</span>
      <span class="badge">Payment Status: ${String(order.paymentStatus || "unpaid")}</span>
    </div>

    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Seller</th>
          <th>Qty</th>
          <th>Unit Price</th>
          <th>Line Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-row"><span>Subtotal</span><span>${formatCurrency(subtotal)}</span></div>
      <div class="totals-row"><span>Shipping</span><span>${formatCurrency(shipping)}</span></div>
      <div class="totals-row"><span>Tax</span><span>${formatCurrency(tax)}</span></div>
      <div class="totals-row total"><span>Total</span><span>${formatCurrency(Number(order.totalAmount || 0))}</span></div>
    </div>

    <div class="footer">
      Generated from your Yogreet buyer account order history.
    </div>
  </body>
</html>`;
  };

  const handleDownloadInvoice = (order: any) => {
    const html = buildInvoiceHtml(order);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `invoice-${String(order.id || "order").slice(0, 8)}.html`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  // Fetch orders from API
  const { data: ordersData, isLoading, error } = useGetOrdersQuery(undefined, {
    skip: false,
  });

  // Transform API data to match frontend format
  const orders = useMemo(() => {
    if (!ordersData) return [];
    
    return ordersData.map((order: any) => ({
      id: order.id || order._id,
      status: order.status || "pending",
      paymentStatus: order.paymentStatus || "unpaid",
      placedAt: order.placedAt || order.createdAt,
      totalAmount: order.totalAmount || 0,
      shippingCost: order.shippingCost || 0,
      taxAmount: order.taxAmount || 0,
      paymentMethod: order.paymentMethod || "N/A",
      updatedAt: order.updatedAt || order.placedAt,
      orderItems: (order.orderItems || []).map((item: any) => ({
        id: item.id || item._id,
        productId: item.product?.id || item.productId?._id || item.productId || item.productId,
        quantity: item.quantity || 0,
        priceAtPurchase: item.priceAtPurchase || 0,
        product: {
          productName: item.product?.productName || "Unknown Product",
          productImages: item.product?.productImages || [PLACEHOLDER_JPG_URL],
          category: item.product?.category || "N/A",
        },
        artist: {
          storeName: item.seller?.companyName || item.seller?.fullName || "Unknown Seller",
          fullName: item.seller?.fullName || "Unknown Seller",
        },
      })),
    }));
  }, [ordersData]);

  const pagination = {
    currentPage: 1,
    totalPages: 1,
    totalCount: orders.length,
    hasNext: false,
    hasPrev: false,
  };

  // Filter orders based on search term and date
  const filteredOrders = useMemo(() => {
    let filtered = orders || [];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (order: any) =>
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.orderItems?.some(
            (item: any) =>
              item.product?.productName
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              (item.artist?.fullName &&
                item.artist.fullName
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase())) ||
              (item.artist?.storeName &&
                item.artist.storeName
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase()))
          )
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (order: any) => order.status?.toLowerCase() === statusFilter
      );
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const filterDate = new Date();

      switch (dateFilter) {
        case "week":
          filterDate.setDate(now.getDate() - 7);
          break;
        case "month":
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case "3months":
          filterDate.setMonth(now.getMonth() - 3);
          break;
        case "year":
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter(
        (order: any) => new Date(order.placedAt) >= filterDate
      );
    }

    return filtered;
  }, [orders, searchTerm, statusFilter, dateFilter]);

  // Check if any filters are active
  const hasActiveFilters =
    searchTerm || statusFilter !== "all" || dateFilter !== "all";

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
              Error loading orders
            </h1>
            <p className="text-stone-600 mb-8">Please try again later.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-yogreet-red hover:bg-yogreet-red/90 text-white px-6 py-3 font-medium transition-colors cursor-pointer mr-4"
            >
              Retry
            </button>
            <Link href="/Products">
              <button className="border border-stone-300 text-stone-700 hover:bg-stone-50 px-6 py-3 font-medium transition-colors cursor-pointer">
                Continue Shopping
              </button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Show "No orders yet" only when there are no orders at all AND no filters are active
  if ((!orders || orders.length === 0) && !hasActiveFilters) {
    return (
      <main className="pt-10 pb-20">
        <div className="container mx-auto px-2 max-w-7xl">
          <div className="text-center py-16">
            <Package className="w-24 h-24 mx-auto text-stone-300 mb-6" />
            <h1 className="text-3xl font-light text-yogreet-charcoal mb-4">
              No orders yet
            </h1>
            <p className="text-stone-600 mb-8">
              Start shopping to see your orders here.
            </p>
            <Link href="/Products">
              <button className="bg-yogreet-red hover:bg-yogreet-red/90 text-white px-6 py-3 font-medium transition-colors cursor-pointer">
                Start Shopping
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
        title="My Orders"
        subtitle=""
        description="Monitor your spice purchases, track deliveries, and manage your order history with trusted suppliers."
        breadcrumb={{
          items: [
            { label: "Home", href: "/" },
            { label: "My Orders", isActive: true }
          ]
        }}
      />
      
      <div className="container mx-auto px-2 max-w-7xl">

        {/* Filters */}
        <div className="bg-white border border-stone-200 shadow-sm mb-8">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-yogreet-red focus:border-transparent cursor-pointer"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-yogreet-red focus:border-transparent cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-yogreet-red focus:border-transparent cursor-pointer"
              >
                <option value="all">All Time</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="year">Last Year</option>
              </select>

              <div className="flex items-center text-sm text-stone-600">
                <Filter className="w-4 h-4 mr-2" />
                {filteredOrders.length} of {orders.length} orders
              </div>
            </div>
          </div>
        </div>

        {/* Show "No orders found" when filters are active but no results */}
        {filteredOrders.length === 0 && hasActiveFilters ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 mx-auto text-stone-300 mb-4" />
            <h3 className="text-lg font-medium text-yogreet-charcoal mb-2">
              No orders found
            </h3>
            <p className="text-stone-600 mb-4">
              No orders match your current filters. Try adjusting your search
              terms or filters.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setDateFilter("all");
              }}
              className="bg-yogreet-red hover:bg-yogreet-red/90 text-white px-4 py-2 text-sm font-medium transition-colors cursor-pointer rounded"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          /* Orders List */
          <div className="space-y-6">
            {filteredOrders.map((order: any) => (
              <div
                key={order.id}
                className="bg-white border border-stone-200 shadow-sm"
              >
                <div className="p-6 border-b border-stone-200">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                    <div>
                      <h3 className="text-lg font-medium text-yogreet-charcoal">
                        Order #{order.id.slice(0, 8)}
                      </h3>
                      <p className="text-sm text-stone-500 mt-1">
                        Placed on{" "}
                        {new Date(order.placedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                          statusColors[order.status?.toLowerCase()] ||
                          "bg-stone-100 text-stone-800"
                        }`}
                      >
                        {order.status
                          ? order.status.charAt(0).toUpperCase() +
                            order.status.slice(1).toLowerCase()
                          : "Unknown"}
                      </span>
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                          paymentStatusColors[
                            order.paymentStatus?.toLowerCase()
                          ] || "bg-stone-100 text-stone-800"
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

                <div className="p-6">
                  {/* Order Items */}
                  <div className="space-y-4 mb-6">
                    {order.orderItems?.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex items-center space-x-4"
                      >
                        <div className="relative w-16 h-16 shrink-0">
                          <Image
                            src={
                              item.product?.productImages?.[0] || PLACEHOLDER_JPG_URL
                            }
                            alt={item.product?.productName || "Product"}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                        <div className="flex-1">
                          <Link href={`/explore/${item.productId}`}>
                            <h4 className="font-medium text-yogreet-charcoal hover:text-yogreet-red transition-colors">
                              {item.product?.productName || "Unknown Product"}
                            </h4>
                          </Link>
                          <p className="text-sm text-stone-500">
                            By{" "}
                            {item.artist?.storeName ||
                              item.artist?.fullName ||
                              "Unknown Artist"}
                          </p>
                          <p className="text-sm text-stone-600">
                            Category: {item.product?.category || "N/A"}
                          </p>
                          <p className="text-sm text-stone-600">
                            Qty: {item.quantity} × ₹{item.priceAtPurchase}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-yogreet-charcoal">
                            ₹{item.quantity * item.priceAtPurchase}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <hr className="border-stone-200 my-4" />

                  {/* Order Summary */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
                    <div className="text-sm text-stone-600 mb-2 sm:mb-0">
                      <p>
                        Subtotal: ₹
                        {order.totalAmount -
                          (order.shippingCost || 0) -
                          (order.taxAmount ||
                            Math.round(order.totalAmount * 0.08))}
                      </p>
                      <p>Shipping: ₹{order.shippingCost || 0}</p>
                      <p>
                        Tax: ₹
                        {order.taxAmount ||
                          Math.round(order.totalAmount * 0.08)}
                      </p>
                      <p>Payment Method: {order.paymentMethod || "N/A"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-medium text-yogreet-charcoal">
                        Total: ₹{order.totalAmount}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-4 border-t border-stone-200">
                    <div className="text-sm text-stone-600 mb-2 sm:mb-0">
                      {order.estimatedDelivery &&
                        order.status?.toLowerCase() === "shipped" && (
                          <p>
                            <Calendar className="w-4 h-4 inline mr-1" />
                            Estimated delivery:{" "}
                            {new Date(
                              order.estimatedDelivery
                            ).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        )}
                      {order.updatedAt && (
                        <p className="text-xs text-stone-500 mt-1">
                          Last updated:{" "}
                          {new Date(order.updatedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDownloadInvoice(order)}
                        className="border border-stone-300 text-stone-700 hover:bg-stone-50 px-3 py-1 text-sm font-medium transition-colors cursor-pointer rounded"
                      >
                        <Download className="w-4 h-4 mr-2 inline" />
                        Download Invoice
                      </button>
                      <Link href={`/buyer/orders/${order.id}`}>
                        <button className="border border-yogreet-red bg-yogreet-red/10 text-yogreet-red hover:bg-yogreet-red hover:text-white px-3 py-1 text-sm font-medium transition-colors cursor-pointer rounded">
                          <Eye className="w-4 h-4 mr-2 inline" />
                          View Details
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 mt-8">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={!pagination.hasPrev}
              className="px-4 py-2 border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed rounded"
            >
              Previous
            </button>
            <span className="text-stone-600">
              Page {pagination.currentPage} of {pagination.totalPages}
              {pagination.totalCount > 0 &&
                ` (${pagination.totalCount} orders total)`}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(pagination.totalPages, prev + 1)
                )
              }
              disabled={!pagination.hasNext}
              className="px-4 py-2 border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer disabled:cursor-not-allowed rounded"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
