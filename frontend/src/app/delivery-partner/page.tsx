"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
} from "lucide-react";
import { ShipmentCard } from "@/components/delivery/ShipmentCard";
import { OrderStatus } from "@/components/delivery/DeliveryStatusBadge";

interface Order {
  _id: string;
  orderId?: string;
  status: OrderStatus;
  buyer?: {
    name: string;
    email?: string;
  };
  seller?: {
    businessName: string;
    name?: string;
  };
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  totalAmount?: number;
  createdAt?: Date | string;
  assignedAt?: Date | string;
}

interface ActivityLog {
  orderId: string;
  status: OrderStatus;
  timestamp: Date | string;
  orderDisplayId: string;
}

export default function DeliveryPartnerDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "pickup" | "transit" | "delivery">("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/delivery/orders`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/delivery-partner/login");
          return;
        }
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err: any) {
      setError(err.message || "Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  // Group orders by status categories
  const pickupPending = orders.filter((o) =>
    ["pickup_assigned", "ready_for_pickup"].includes(o.status)
  );
  const inTransit = orders.filter((o) =>
    ["picked_up", "in_transit", "customs_processing"].includes(o.status)
  );
  const outForDelivery = orders.filter((o) => o.status === "out_for_delivery");
  const delivered = orders.filter((o) =>
    ["delivered", "completed"].includes(o.status)
  );
  const failedShipments = orders.filter((o) =>
    ["pickup_failed", "delivery_failed", "reschedule_requested", "damaged_reported"].includes(
      o.status
    )
  );

  // Get filtered orders
  const getFilteredOrders = () => {
    switch (selectedFilter) {
      case "pickup":
        return pickupPending;
      case "transit":
        return [...inTransit, ...outForDelivery];
      case "delivery":
        return delivered;
      default:
        return orders;
    }
  };

  const filteredOrders = getFilteredOrders();

  // Get recent activity (last 10 status updates)
  const recentActivity: ActivityLog[] = orders
    .filter((o) => o.assignedAt)
    .sort(
      (a, b) =>
        new Date(b.assignedAt!).getTime() - new Date(a.assignedAt!).getTime()
    )
    .slice(0, 10)
    .map((o) => ({
      orderId: o._id,
      status: o.status,
      timestamp: o.assignedAt!,
      orderDisplayId: o.orderId || o._id.slice(-8).toUpperCase(),
    }));

  const formatTimestamp = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yogreet-sage border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone-600 font-inter">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-poppins font-light text-yogreet-charcoal mb-2">
            Delivery
            <span className="font-medium text-yogreet-sage"> Dashboard</span>
          </h1>
          <p className="text-stone-600 font-inter">
            Manage your assigned deliveries and track shipments
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800 font-inter">{error}</p>
              <button
                onClick={fetchOrders}
                className="text-sm text-red-600 hover:text-red-700 font-manrope font-medium mt-2"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Pickup Pending */}
          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-2xl font-poppins font-semibold text-yogreet-charcoal">
                {pickupPending.length}
              </span>
            </div>
            <h3 className="text-sm font-manrope font-medium text-stone-600 mb-1">
              Pickup Pending
            </h3>
            <p className="text-xs text-stone-500 font-inter">
              Ready for collection
            </p>
          </div>

          {/* In Transit */}
          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-2xl font-poppins font-semibold text-yogreet-charcoal">
                {inTransit.length + outForDelivery.length}
              </span>
            </div>
            <h3 className="text-sm font-manrope font-medium text-stone-600 mb-1">
              In Transit
            </h3>
            <p className="text-xs text-stone-500 font-inter">
              On the way
            </p>
          </div>

          {/* Delivered */}
          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-2xl font-poppins font-semibold text-yogreet-charcoal">
                {delivered.length}
              </span>
            </div>
            <h3 className="text-sm font-manrope font-medium text-stone-600 mb-1">
              Delivered
            </h3>
            <p className="text-xs text-stone-500 font-inter">
              Successfully completed
            </p>
          </div>

          {/* Failed Shipments */}
          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <span className="text-2xl font-poppins font-semibold text-yogreet-charcoal">
                {failedShipments.length}
              </span>
            </div>
            <h3 className="text-sm font-manrope font-medium text-stone-600 mb-1">
              Issues
            </h3>
            <p className="text-xs text-stone-500 font-inter">
              Requires attention
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Orders List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm">
              {/* Header with Filters */}
              <div className="p-6 border-b border-stone-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-poppins font-medium text-yogreet-charcoal">
                    Active Shipments
                  </h2>
                  <span className="text-sm text-stone-500 font-inter">
                    {filteredOrders.length} orders
                  </span>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 overflow-x-auto">
                  {[
                    { key: "all", label: "All", count: orders.length },
                    { key: "pickup", label: "Pickup", count: pickupPending.length },
                    { key: "transit", label: "Transit", count: inTransit.length + outForDelivery.length },
                    { key: "delivery", label: "Delivered", count: delivered.length },
                  ].map((filter) => (
                    <button
                      key={filter.key}
                      onClick={() => setSelectedFilter(filter.key as any)}
                      className={`px-4 py-2 rounded-lg text-sm font-manrope font-medium transition-colors whitespace-nowrap ${
                        selectedFilter === filter.key
                          ? "bg-yogreet-sage text-white"
                          : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                      }`}
                    >
                      {filter.label} ({filter.count})
                    </button>
                  ))}
                </div>
              </div>

              {/* Orders Grid */}
              <div className="p-6">
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 mx-auto text-stone-300 mb-4" />
                    <p className="text-stone-500 font-inter">
                      No orders in this category
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredOrders.map((order) => (
                      <ShipmentCard key={order._id} order={order} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-yogreet-sage" />
                <h2 className="text-lg font-poppins font-medium text-yogreet-charcoal">
                  Recent Activity
                </h2>
              </div>

              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 mx-auto text-stone-300 mb-3" />
                  <p className="text-sm text-stone-500 font-inter">
                    No recent activity
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 pb-4 border-b border-stone-100 last:border-0 last:pb-0"
                    >
                      <div className="w-2 h-2 rounded-full bg-yogreet-sage mt-2 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-manrope font-medium text-yogreet-charcoal mb-1">
                          Order #{activity.orderDisplayId}
                        </p>
                        <p className="text-xs text-stone-500 font-inter">
                          Status updated to {activity.status.replace(/_/g, " ")}
                        </p>
                        <p className="text-xs text-stone-400 font-inter mt-1">
                          {formatTimestamp(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
