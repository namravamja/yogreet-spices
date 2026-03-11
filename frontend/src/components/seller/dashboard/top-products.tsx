"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, ArrowUpRight, Package } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import type { TopProduct } from "./types";

interface TopProductsProps {
  products?: TopProduct[];
  isLoading?: boolean;
  className?: string;
  maxItems?: number;
}

export function TopProducts({
  products = [],
  isLoading,
  className,
  maxItems = 5,
}: TopProductsProps) {
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-IN").format(value);
  };

  const displayProducts = products.slice(0, maxItems);

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
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-4 w-20" />
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
              <TrendingUp className="size-4 text-emerald-600" />
              Top Selling Products
            </CardTitle>
            <CardDescription>Your best performing products this period</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/seller/products">
              View All
              <ArrowUpRight className="size-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayProducts.map((product, index) => (
            <div
              key={product.id}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              {/* Rank Badge */}
              <div className="flex items-center justify-center size-6 rounded-full bg-muted text-xs font-semibold">
                {index + 1}
              </div>

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
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{product.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {product.category && (
                    <Badge variant="secondary" className="text-xs">
                      {product.category}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatNumber(product.unitsSold)} units
                  </span>
                </div>
              </div>

              {/* Revenue */}
              <div className="text-right shrink-0">
                <p className="font-semibold text-sm">{formatCurrency(product.revenue)}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
