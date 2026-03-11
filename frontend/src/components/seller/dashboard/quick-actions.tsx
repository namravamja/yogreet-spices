"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Package,
  ShoppingCart,
  BarChart3,
  Percent,
  Settings,
  ArrowRight,
} from "lucide-react";
import type { QuickAction } from "./types";

const defaultQuickActions: QuickAction[] = [
  {
    id: "add-product",
    label: "Add New Product",
    href: "/seller/products/add",
    icon: Plus,
    description: "List a new product",
    variant: "default",
  },
  {
    id: "manage-inventory",
    label: "Manage Inventory",
    href: "/seller/products",
    icon: Package,
    description: "Update stock levels",
    variant: "outline",
  },
  {
    id: "view-orders",
    label: "View Orders",
    href: "/seller/orders",
    icon: ShoppingCart,
    description: "Check order status",
    variant: "outline",
  },
  {
    id: "view-analytics",
    label: "View Analytics",
    href: "/seller/analytics",
    icon: BarChart3,
    description: "Sales insights",
    variant: "outline",
  },
  {
    id: "manage-discounts",
    label: "Manage Discounts",
    href: "/seller/discounts",
    icon: Percent,
    description: "Set up promotions",
    variant: "outline",
  },
];

interface QuickActionsProps {
  actions?: QuickAction[];
  isLoading?: boolean;
  className?: string;
}

export function QuickActions({ actions = defaultQuickActions, isLoading, className }: QuickActionsProps) {
  if (isLoading) {
    return (
      <Card className={cn("", className)}>
        <CardHeader className="pb-4">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant={action.variant || "outline"}
              asChild
              className={cn(
                "h-auto flex-col gap-1 py-4 px-4",
                action.variant === "default" && "bg-yogreet-red hover:bg-yogreet-red/90 text-white"
              )}
            >
              <Link href={action.href}>
                <action.icon className="size-5 mb-1" />
                <span className="text-sm font-medium">{action.label}</span>
                {action.description && (
                  <span className="text-xs opacity-70">{action.description}</span>
                )}
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface QuickActionsCompactProps {
  actions?: QuickAction[];
  className?: string;
}

export function QuickActionsCompact({ actions = defaultQuickActions, className }: QuickActionsCompactProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {actions.slice(0, 4).map((action) => (
        <Button
          key={action.id}
          variant={action.variant || "outline"}
          size="sm"
          asChild
          className={cn(
            action.variant === "default" && "bg-yogreet-red hover:bg-yogreet-red/90 text-white"
          )}
        >
          <Link href={action.href}>
            <action.icon className="size-4 mr-2" />
            {action.label}
          </Link>
        </Button>
      ))}
    </div>
  );
}
