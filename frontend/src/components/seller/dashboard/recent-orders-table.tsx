"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpRight, Eye } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import type { RecentOrder, OrderStatus } from "./types";

const statusConfig: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  },
  processing: {
    label: "Processing",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400",
  },
  seller_preparing: {
    label: "Preparing",
    className: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
  },
  ready_for_pickup: {
    label: "Ready for Pickup",
    className: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  },
  pickup_assigned: {
    label: "Pickup Assigned",
    className: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400",
  },
  picked_up: {
    label: "Picked Up",
    className: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400",
  },
  in_transit: {
    label: "In Transit",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  },
  customs_processing: {
    label: "Customs",
    className: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    className: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400",
  },
  shipped: {
    label: "Shipped",
    className: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
  },
  delivered: {
    label: "Delivered",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  },
  pickup_failed: {
    label: "Pickup Failed",
    className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  },
  delivery_failed: {
    label: "Delivery Failed",
    className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  },
  reschedule_requested: {
    label: "Reschedule",
    className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
  },
  returned: {
    label: "Returned",
    className: "bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-400",
  },
  damaged_reported: {
    label: "Damaged",
    className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  },
};

interface RecentOrdersTableProps {
  orders?: RecentOrder[];
  isLoading?: boolean;
  className?: string;
  maxItems?: number;
}

export function RecentOrdersTable({
  orders = [],
  isLoading,
  className,
  maxItems = 5,
}: RecentOrdersTableProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const displayOrders = orders.slice(0, maxItems);

  if (isLoading) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-9 w-24" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: maxItems }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
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
            <CardTitle className="text-base font-semibold">Recent Orders</CardTitle>
            <CardDescription>Latest orders from your customers</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/seller/orders">
              View All
              <ArrowUpRight className="size-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="pr-6 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="pl-6 font-medium">{order.orderId}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-sm">{order.customerName}</p>
                    {order.itemsCount && (
                      <p className="text-xs text-muted-foreground">
                        {order.itemsCount} item{order.itemsCount > 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{formatCurrency(order.amount)}</TableCell>
                <TableCell>
                  <Badge className={cn("text-xs", statusConfig[order.status]?.className || "bg-gray-100 text-gray-700")}>
                    {statusConfig[order.status]?.label || order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDate(order.date)}
                </TableCell>
                <TableCell className="pr-6 text-right">
                  <Button variant="ghost" size="icon-sm" asChild>
                    <Link href={`/seller/orders/${order.id}`}>
                      <Eye className="size-4" />
                      <span className="sr-only">View order</span>
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
