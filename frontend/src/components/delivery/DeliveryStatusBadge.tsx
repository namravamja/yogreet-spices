import React from "react";
import {
  Package,
  PackageCheck,
  Truck,
  Plane,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  RotateCcw,
  PackageX,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "seller_preparing"
  | "ready_for_pickup"
  | "pickup_assigned"
  | "picked_up"
  | "in_transit"
  | "customs_processing"
  | "out_for_delivery"
  | "delivered"
  | "completed"
  | "pickup_failed"
  | "delivery_failed"
  | "reschedule_requested"
  | "returned"
  | "cancelled"
  | "damaged_reported";

interface DeliveryStatusBadgeProps {
  status: OrderStatus;
  className?: string;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

const statusConfig: Record<
  OrderStatus,
  {
    label: string;
    color: string;
    bgColor: string;
    icon: React.ElementType;
    description: string;
  }
> = {
  pending: {
    label: "Pending",
    color: "text-stone-600",
    bgColor: "bg-stone-100",
    icon: Clock,
    description: "Order is pending confirmation",
  },
  confirmed: {
    label: "Confirmed",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    icon: CheckCircle2,
    description: "Order has been confirmed",
  },
  seller_preparing: {
    label: "Preparing",
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    icon: Package,
    description: "Seller is preparing the shipment",
  },
  ready_for_pickup: {
    label: "Ready for Pickup",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    icon: PackageCheck,
    description: "Package is ready for pickup",
  },
  pickup_assigned: {
    label: "Pickup Assigned",
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
    icon: Truck,
    description: "Delivery partner assigned for pickup",
  },
  picked_up: {
    label: "Picked Up",
    color: "text-cyan-600",
    bgColor: "bg-cyan-100",
    icon: PackageCheck,
    description: "Package has been picked up",
  },
  in_transit: {
    label: "In Transit",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    icon: Plane,
    description: "Package is in transit",
  },
  customs_processing: {
    label: "Customs Processing",
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    icon: AlertTriangle,
    description: "Package is being processed by customs",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    color: "text-teal-600",
    bgColor: "bg-teal-100",
    icon: Truck,
    description: "Package is out for delivery",
  },
  delivered: {
    label: "Delivered",
    color: "text-green-600",
    bgColor: "bg-green-100",
    icon: CheckCircle2,
    description: "Package has been delivered",
  },
  completed: {
    label: "Completed",
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
    icon: CheckCircle2,
    description: "Order is completed",
  },
  pickup_failed: {
    label: "Pickup Failed",
    color: "text-red-600",
    bgColor: "bg-red-100",
    icon: XCircle,
    description: "Pickup attempt failed",
  },
  delivery_failed: {
    label: "Delivery Failed",
    color: "text-red-600",
    bgColor: "bg-red-100",
    icon: XCircle,
    description: "Delivery attempt failed",
  },
  reschedule_requested: {
    label: "Reschedule Requested",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    icon: RotateCcw,
    description: "Delivery reschedule requested",
  },
  returned: {
    label: "Returned",
    color: "text-gray-600",
    bgColor: "bg-gray-100",
    icon: RotateCcw,
    description: "Package has been returned",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-gray-600",
    bgColor: "bg-gray-100",
    icon: XCircle,
    description: "Order has been cancelled",
  },
  damaged_reported: {
    label: "Damaged",
    color: "text-red-600",
    bgColor: "bg-red-100",
    icon: PackageX,
    description: "Package damage reported",
  },
};

export function DeliveryStatusBadge({
  status,
  className,
  showIcon = true,
  size = "md",
}: DeliveryStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-manrope font-medium",
        config.bgColor,
        config.color,
        sizeClasses[size],
        className
      )}
      title={config.description}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      <span>{config.label}</span>
    </div>
  );
}
