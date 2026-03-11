"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, ArrowUpRight, Package, AlertCircle, Info } from "lucide-react";
import type { LowStockProduct } from "./types";

interface LowStockProductsProps {
  products?: LowStockProduct[];
  isLoading?: boolean;
  className?: string;
  maxItems?: number;
}

export function LowStockProducts({
  products = [],
  isLoading,
  className,
  maxItems = 4,
}: LowStockProductsProps) {
  const getStatusConfig = (status: LowStockProduct["status"]) => {
    switch (status) {
      case "critical":
        return {
          label: "Critical",
          icon: AlertCircle,
          className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
          progressColor: "bg-red-500",
        };
      case "warning":
        return {
          label: "Warning",
          icon: AlertTriangle,
          className: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
          progressColor: "bg-amber-500",
        };
      case "low":
        return {
          label: "Low",
          icon: Info,
          className: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
          progressColor: "bg-blue-500",
        };
    }
  };

  const displayProducts = products.slice(0, maxItems);
  const criticalCount = products.filter((p) => p.status === "critical").length;

  if (isLoading) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-52" />
            </div>
            <Skeleton className="h-9 w-24" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: maxItems }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="size-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-2 w-full" />
                </div>
                <Skeleton className="h-6 w-16" />
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
              <AlertTriangle className="size-4 text-amber-500" />
              Low Stock Alert
              {criticalCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {criticalCount} Critical
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Products that need restocking soon</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/seller/products?filter=low-stock">
              Manage
              <ArrowUpRight className="size-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {displayProducts.length === 0 ? (
          <div className="text-center py-8">
            <Package className="size-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">All products are well stocked!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayProducts.map((product) => {
              const statusConfig = getStatusConfig(product.status);
              const stockPercentage = Math.min(
                100,
                (product.stockRemaining / product.minStockLevel) * 100
              );

              return (
                <div
                  key={product.id}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {/* Product Image */}
                  <div className="relative size-12 rounded-lg overflow-hidden bg-muted shrink-0">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center size-full">
                        <Package className="size-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm truncate">{product.name}</p>
                      <Badge className={cn("text-xs shrink-0", statusConfig.className)}>
                        <statusConfig.icon className="size-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <Progress
                        value={stockPercentage}
                        className="h-1.5"
                        // Custom color based on status
                      />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{product.stockRemaining} units left</span>
                        <span>Min: {product.minStockLevel}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
