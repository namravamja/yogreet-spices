"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ShoppingCart,
  Package,
  CreditCard,
  AlertTriangle,
  Star,
  ArrowUpRight,
  Bell,
} from "lucide-react";
import type { ActivityItem } from "./types";

const activityIcons: Record<ActivityItem["type"], React.ComponentType<{ className?: string }>> = {
  order: ShoppingCart,
  product: Package,
  payment: CreditCard,
  stock: AlertTriangle,
  review: Star,
};

const activityColors: Record<ActivityItem["type"], string> = {
  order: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
  product: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
  payment: "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400",
  stock: "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
  review: "bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400",
};

interface ActivityFeedProps {
  activities?: ActivityItem[];
  isLoading?: boolean;
  className?: string;
  maxItems?: number;
}

export function ActivityFeed({
  activities = [],
  isLoading,
  className,
  maxItems = 7,
}: ActivityFeedProps) {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}m ago`;
    }
    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    }
    if (diffInHours < 48) {
      return "Yesterday";
    }
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  const displayActivities = activities.slice(0, maxItems);

  if (isLoading) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: maxItems }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="size-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Bell className="size-4" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your store&apos;s latest updates</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {displayActivities.map((activity, index) => {
              const Icon = activityIcons[activity.type];
              const colorClass = activityColors[activity.type];

              return (
                <div key={activity.id} className="flex items-start gap-3">
                  {/* Icon */}
                  <div
                    className={cn(
                      "flex items-center justify-center size-8 rounded-full shrink-0",
                      colorClass
                    )}
                  >
                    <Icon className="size-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className="text-sm font-medium">{activity.title}</p>
                    {activity.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {activity.description}
                      </p>
                    )}
                  </div>

                  {/* Timestamp */}
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatTimestamp(activity.timestamp)}
                  </span>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
