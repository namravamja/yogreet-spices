"use client";

import React from "react";
import { CheckCircle2, Circle, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { OrderStatus } from "./DeliveryStatusBadge";

interface DeliveryLog {
  status: OrderStatus;
  timestamp: Date | string;
}

interface TrackingPanelProps {
  currentStatus: OrderStatus;
  deliveryLogs: DeliveryLog[];
  estimatedDelivery?: Date | string;
  className?: string;
}

interface Milestone {
  status: OrderStatus;
  label: string;
  description: string;
}

const milestones: Milestone[] = [
  {
    status: "confirmed",
    label: "Confirmed",
    description: "Order confirmed",
  },
  {
    status: "picked_up",
    label: "Picked Up",
    description: "Package collected",
  },
  {
    status: "in_transit",
    label: "In Transit",
    description: "On the way",
  },
  {
    status: "out_for_delivery",
    label: "Out for Delivery",
    description: "Final delivery",
  },
  {
    status: "delivered",
    label: "Delivered",
    description: "Package delivered",
  },
];

const statusOrder: OrderStatus[] = [
  "pending",
  "confirmed",
  "seller_preparing",
  "ready_for_pickup",
  "pickup_assigned",
  "picked_up",
  "in_transit",
  "customs_processing",
  "out_for_delivery",
  "delivered",
  "completed",
];

export function TrackingPanel({
  currentStatus,
  deliveryLogs,
  estimatedDelivery,
  className,
}: TrackingPanelProps) {
  const currentStatusIndex = statusOrder.indexOf(currentStatus);

  const getMilestoneStatus = (
    milestone: Milestone
  ): "completed" | "current" | "pending" => {
    const milestoneIndex = statusOrder.indexOf(milestone.status);

    if (milestoneIndex < currentStatusIndex) {
      return "completed";
    } else if (milestoneIndex === currentStatusIndex) {
      return "current";
    } else {
      return "pending";
    }
  };

  const getMilestoneTimestamp = (milestoneStatus: OrderStatus) => {
    const log = deliveryLogs.find((log) => log.status === milestoneStatus);
    if (!log) return null;

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(log.timestamp));
  };

  const formatEstimatedDelivery = () => {
    if (!estimatedDelivery) return null;
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date(estimatedDelivery));
  };

  // Check if order is in a failure state
  const isFailureState = [
    "pickup_failed",
    "delivery_failed",
    "cancelled",
    "returned",
    "damaged_reported",
  ].includes(currentStatus);

  return (
    <div className={cn("bg-white rounded-xl border border-stone-200 p-6", className)}>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-poppins font-medium text-yogreet-charcoal mb-2">
          Shipment Tracking
        </h3>
        {estimatedDelivery && !isFailureState && (
          <p className="text-sm text-stone-500 font-inter">
            Estimated delivery: {formatEstimatedDelivery()}
          </p>
        )}
        {isFailureState && (
          <p className="text-sm text-red-600 font-inter">
            Delivery issue reported
          </p>
        )}
      </div>

      {/* Progress Bar - Desktop */}
      <div className="hidden md:block">
        <div className="relative">
          {/* Background Line */}
          <div className="absolute top-6 left-0 right-0 h-0.5 bg-stone-200" />

          {/* Progress Line */}
          <div
            className="absolute top-6 left-0 h-0.5 bg-yogreet-sage transition-all duration-500"
            style={{
              width: `${(currentStatusIndex / (milestones.length - 1)) * 100}%`,
            }}
          />

          {/* Milestones */}
          <div className="relative flex justify-between">
            {milestones.map((milestone, index) => {
              const status = getMilestoneStatus(milestone);
              const timestamp = getMilestoneTimestamp(milestone.status);

              return (
                <div key={milestone.status} className="flex flex-col items-center">
                  {/* Icon */}
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 z-10",
                      status === "completed" &&
                        "bg-yogreet-sage text-white shadow-lg shadow-yogreet-sage/30",
                      status === "current" &&
                        "bg-yogreet-sage text-white shadow-lg shadow-yogreet-sage/30 ring-4 ring-yogreet-sage/20",
                      status === "pending" && "bg-stone-100 text-stone-400"
                    )}
                  >
                    {status === "completed" ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : status === "current" ? (
                      <Package className="w-6 h-6 animate-pulse" />
                    ) : (
                      <Circle className="w-6 h-6" />
                    )}
                  </div>

                  {/* Label */}
                  <div className="mt-3 text-center max-w-[120px]">
                    <p
                      className={cn(
                        "text-sm font-manrope font-medium mb-1",
                        status === "pending"
                          ? "text-stone-400"
                          : "text-yogreet-charcoal"
                      )}
                    >
                      {milestone.label}
                    </p>
                    <p className="text-xs text-stone-500 font-inter">
                      {milestone.description}
                    </p>
                    {timestamp && (
                      <p className="text-xs text-yogreet-sage font-inter mt-1">
                        {timestamp}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Progress List - Mobile */}
      <div className="md:hidden space-y-4">
        {milestones.map((milestone, index) => {
          const status = getMilestoneStatus(milestone);
          const timestamp = getMilestoneTimestamp(milestone.status);

          return (
            <div key={milestone.status} className="flex gap-4">
              {/* Icon and Line */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                    status === "completed" &&
                      "bg-yogreet-sage text-white shadow-lg shadow-yogreet-sage/30",
                    status === "current" &&
                      "bg-yogreet-sage text-white shadow-lg shadow-yogreet-sage/30 ring-4 ring-yogreet-sage/20",
                    status === "pending" && "bg-stone-100 text-stone-400"
                  )}
                >
                  {status === "completed" ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : status === "current" ? (
                    <Package className="w-5 h-5 animate-pulse" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </div>
                {index < milestones.length - 1 && (
                  <div
                    className={cn(
                      "w-0.5 h-12 mt-2",
                      status === "completed" ? "bg-yogreet-sage" : "bg-stone-200"
                    )}
                  />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                <p
                  className={cn(
                    "text-sm font-manrope font-medium mb-1",
                    status === "pending"
                      ? "text-stone-400"
                      : "text-yogreet-charcoal"
                  )}
                >
                  {milestone.label}
                </p>
                <p className="text-xs text-stone-500 font-inter">
                  {milestone.description}
                </p>
                {timestamp && (
                  <p className="text-xs text-yogreet-sage font-inter mt-1">
                    {timestamp}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
