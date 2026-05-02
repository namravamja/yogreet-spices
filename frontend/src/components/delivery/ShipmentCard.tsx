"use client";

import React from "react";
import Link from "next/link";
import {
  Package,
  User,
  Store,
  MapPin,
  IndianRupee,
  ChevronRight,
  Upload,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DeliveryStatusBadge, OrderStatus } from "./DeliveryStatusBadge";

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

interface ShipmentCardProps {
  order: Order;
  onStatusUpdate?: (orderId: string) => void;
  onUploadProof?: (orderId: string) => void;
  onReportIssue?: (orderId: string) => void;
  showActions?: boolean;
  className?: string;
}

export function ShipmentCard({
  order,
  onStatusUpdate,
  onUploadProof,
  onReportIssue,
  showActions = true,
  className,
}: ShipmentCardProps) {
  const displayOrderId = order.orderId || order._id.slice(-8).toUpperCase();
  
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "N/A";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return "₹0.00";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getDestination = () => {
    const addr = order.shippingAddress;
    if (!addr) return "N/A";
    return `${addr.city || ""}${addr.city && addr.country ? ", " : ""}${addr.country || ""}`.trim() || "N/A";
  };

  // Determine which actions to show based on status
  const canUpdateStatus = [
    "pickup_assigned",
    "picked_up",
    "in_transit",
    "customs_processing",
    "out_for_delivery",
  ].includes(order.status);

  const needsProof = ["pickup_assigned", "out_for_delivery"].includes(
    order.status
  );

  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-all duration-300",
        "overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-stone-100 bg-stone-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yogreet-sage/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-yogreet-sage" />
            </div>
            <div>
              <p className="text-sm font-manrope font-semibold text-yogreet-charcoal">
                Order #{displayOrderId}
              </p>
              <p className="text-xs text-stone-500 font-inter">
                {formatDate(order.assignedAt || order.createdAt)}
              </p>
            </div>
          </div>
          <DeliveryStatusBadge status={order.status} size="sm" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Buyer */}
        {order.buyer && (
          <div className="flex items-start gap-3">
            <User className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-stone-500 font-inter mb-0.5">Buyer</p>
              <p className="text-sm font-manrope font-medium text-yogreet-charcoal truncate">
                {order.buyer.name}
              </p>
            </div>
          </div>
        )}

        {/* Seller */}
        {order.seller && (
          <div className="flex items-start gap-3">
            <Store className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-stone-500 font-inter mb-0.5">Seller</p>
              <p className="text-sm font-manrope font-medium text-yogreet-charcoal truncate">
                {order.seller.businessName || order.seller.name}
              </p>
            </div>
          </div>
        )}

        {/* Destination */}
        <div className="flex items-start gap-3">
          <MapPin className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-stone-500 font-inter mb-0.5">
              Destination
            </p>
            <p className="text-sm font-manrope font-medium text-yogreet-charcoal truncate">
              {getDestination()}
            </p>
          </div>
        </div>

        {/* Amount */}
        {order.totalAmount !== undefined && (
          <div className="flex items-start gap-3">
            <IndianRupee className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-stone-500 font-inter mb-0.5">Amount</p>
              <p className="text-sm font-manrope font-semibold text-yogreet-sage">
                {formatCurrency(order.totalAmount)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="p-4 border-t border-stone-100 bg-stone-50">
          <div className="flex items-center gap-2">
            {/* View Details */}
            <Link
              href={`/delivery-partner/orders/${order._id}`}
              className="flex-1 py-2 px-3 rounded-lg bg-white border border-stone-200 hover:border-yogreet-sage hover:bg-yogreet-sage/5 transition-colors flex items-center justify-center gap-2 text-sm font-manrope font-medium text-yogreet-charcoal"
            >
              View Details & Update Status
              <ChevronRight className="w-4 h-4" />
            </Link>

            {/* Quick Actions */}
            {needsProof && onUploadProof && (
              <button
                onClick={() => onUploadProof(order._id)}
                className="py-2 px-3 rounded-lg bg-yogreet-sage text-white hover:bg-yogreet-sage/90 transition-colors flex items-center justify-center gap-1.5 text-sm font-manrope font-medium"
                title="Upload Proof"
              >
                <Upload className="w-4 h-4" />
              </button>
            )}

            {canUpdateStatus && onReportIssue && (
              <button
                onClick={() => onReportIssue(order._id)}
                className="py-2 px-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center justify-center gap-1.5 text-sm font-manrope font-medium"
                title="Report Issue"
              >
                <AlertTriangle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
