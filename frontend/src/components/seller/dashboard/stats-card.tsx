"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import type { StatCardData } from "./types";

interface StatsCardProps {
  data: StatCardData;
  isLoading?: boolean;
  className?: string;
}

export function StatsCard({ data, isLoading = false, className }: StatsCardProps) {
  const formatValue = (value: number) => {
    if (data.isCurrency) {
      return formatCurrency(value);
    }
    
    if (data.suffix === "%") {
      return `${value.toFixed(1)}%`;
    }
    
    return new Intl.NumberFormat("en-IN").format(value);
  };

  const getTrendIcon = () => {
    if (data.trend === "up") {
      return <TrendingUp className="size-4 text-emerald-600" />;
    }
    if (data.trend === "down") {
      return <TrendingDown className="size-4 text-red-500" />;
    }
    return <Minus className="size-4 text-muted-foreground" />;
  };

  const getTrendColor = () => {
    if (data.trend === "up") return "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30";
    if (data.trend === "down") return "text-red-500 bg-red-50 dark:bg-red-950/30";
    return "text-muted-foreground bg-muted";
  };

  if (isLoading) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="size-10 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden transition-all hover:shadow-md", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{data.title}</p>
            <p className="text-2xl font-bold tracking-tight">
              {data.prefix}
              {formatValue(data.value)}
            </p>
            
            {data.percentChange !== undefined && (
              <div className="flex items-center gap-2 pt-1">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
                    getTrendColor()
                  )}
                >
                  {getTrendIcon()}
                  {Math.abs(data.percentChange).toFixed(1)}%
                </span>
                <span className="text-xs text-muted-foreground">vs last period</span>
              </div>
            )}
          </div>

          {data.icon && (
            <div className="rounded-lg bg-muted p-2.5">
              <data.icon className="size-5 text-muted-foreground" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface StatsGridProps {
  stats: StatCardData[];
  isLoading?: boolean;
  className?: string;
}

export function StatsGrid({ stats, isLoading, className }: StatsGridProps) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6", className)}>
      {stats.map((stat) => (
        <StatsCard key={stat.id} data={stat} isLoading={isLoading} />
      ))}
    </div>
  );
}
