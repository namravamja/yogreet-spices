"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, User, Package, Truck, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { DeliveryStatusBadge, OrderStatus } from "./DeliveryStatusBadge";

interface DeliveryLog {
  status: OrderStatus;
  actor: {
    role: "buyer" | "seller" | "delivery_partner" | "admin" | "system";
    userId?: string;
    name?: string;
  };
  timestamp: Date | string;
  notes?: string;
  metadata?: any;
}

interface DeliveryTimelineProps {
  logs: DeliveryLog[];
  showProofImages?: boolean;
  className?: string;
  maxVisible?: number;
}

const roleConfig = {
  buyer: {
    icon: User,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    label: "Buyer",
  },
  seller: {
    icon: Package,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    label: "Seller",
  },
  delivery_partner: {
    icon: Truck,
    color: "text-yogreet-sage",
    bgColor: "bg-yogreet-sage/10",
    label: "Delivery Partner",
  },
  admin: {
    icon: Shield,
    color: "text-red-600",
    bgColor: "bg-red-100",
    label: "Admin",
  },
  system: {
    icon: Package,
    color: "text-stone-600",
    bgColor: "bg-stone-100",
    label: "System",
  },
};

export function DeliveryTimeline({
  logs,
  showProofImages = true,
  className,
  maxVisible = 5,
}: DeliveryTimelineProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Sort logs by timestamp (newest first)
  const sortedLogs = [...logs].sort(
    (a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const visibleLogs = isExpanded
    ? sortedLogs
    : sortedLogs.slice(0, maxVisible);
  const hasMore = sortedLogs.length > maxVisible;

  const formatTimestamp = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (logs.length === 0) {
    return (
      <div className={cn("text-center py-8 text-stone-500", className)}>
        <Package className="w-12 h-12 mx-auto mb-3 text-stone-300" />
        <p className="font-inter">No delivery events yet</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-stone-200" />

        {/* Timeline events */}
        <div className="space-y-6">
          {visibleLogs.map((log, index) => {
            const roleInfo = roleConfig[log.actor.role];
            const RoleIcon = roleInfo.icon;
            const isLast = index === visibleLogs.length - 1;

            return (
              <div key={index} className="relative flex gap-4">
                {/* Icon */}
                <div
                  className={cn(
                    "relative z-10 flex items-center justify-center w-12 h-12 rounded-full shrink-0",
                    roleInfo.bgColor
                  )}
                >
                  <RoleIcon className={cn("w-5 h-5", roleInfo.color)} />
                </div>

                {/* Content */}
                <div className="flex-1 pb-6">
                  <div className="bg-white rounded-lg border border-stone-200 p-4 shadow-sm">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={cn(
                              "text-xs font-manrope font-medium",
                              roleInfo.color
                            )}
                          >
                            {roleInfo.label}
                          </span>
                          {log.actor.name && (
                            <span className="text-xs text-stone-500 font-inter">
                              • {log.actor.name}
                            </span>
                          )}
                        </div>
                        <DeliveryStatusBadge
                          status={log.status}
                          size="sm"
                          showIcon={true}
                        />
                      </div>
                      <time className="text-xs text-stone-500 font-inter shrink-0">
                        {formatTimestamp(log.timestamp)}
                      </time>
                    </div>

                    {/* Notes */}
                    {log.notes && (
                      <p className="text-sm text-stone-600 font-inter mt-2">
                        {log.notes}
                      </p>
                    )}

                    {/* Metadata - Proof Images */}
                    {showProofImages &&
                      log.metadata?.proofImages &&
                      log.metadata.proofImages.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-stone-500 font-manrope font-medium mb-2">
                            Proof Images:
                          </p>
                          <div className="flex gap-2 flex-wrap">
                            {log.metadata.proofImages.map(
                              (url: string, imgIndex: number) => (
                                <a
                                  key={imgIndex}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block w-20 h-20 rounded-lg overflow-hidden border border-stone-200 hover:border-yogreet-sage transition-colors"
                                >
                                  <img
                                    src={url}
                                    alt={`Proof ${imgIndex + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </a>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* Metadata - Other Info */}
                    {log.metadata &&
                      Object.keys(log.metadata).filter(
                        (key) => key !== "proofImages"
                      ).length > 0 && (
                        <div className="mt-3 text-xs text-stone-500 font-inter">
                          {Object.entries(log.metadata)
                            .filter(([key]) => key !== "proofImages")
                            .map(([key, value]) => (
                              <div key={key}>
                                <span className="font-medium">{key}:</span>{" "}
                                {String(value)}
                              </div>
                            ))}
                        </div>
                      )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expand/Collapse Button */}
      {hasMore && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-2 py-3 text-sm font-manrope font-medium text-yogreet-sage hover:text-yogreet-sage/80 transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Show {sortedLogs.length - maxVisible} More Events
            </>
          )}
        </button>
      )}
    </div>
  );
}
