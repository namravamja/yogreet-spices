"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Cell, Pie, PieChart } from "recharts";
import { formatCurrency } from "@/utils/currency";
import type { RevenueDistribution } from "./types";

const chartConfig: ChartConfig = {
  "Whole Spices": { label: "Whole Spices", color: "var(--chart-1)" },
  "Ground Spices": { label: "Ground Spices", color: "var(--chart-2)" },
  "Spice Blends": { label: "Spice Blends", color: "var(--chart-3)" },
  "Organic Range": { label: "Organic Range", color: "var(--chart-4)" },
  "Premium Collection": { label: "Premium Collection", color: "var(--chart-5)" },
};

interface RevenueDistributionChartProps {
  data?: RevenueDistribution[];
  isLoading?: boolean;
  className?: string;
}

export function RevenueDistributionChart({
  data = [],
  isLoading,
  className,
}: RevenueDistributionChartProps) {
  const totalRevenue = data.reduce((sum, item) => sum + item.value, 0);

  if (isLoading) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[280px] w-full rounded-full mx-auto max-w-[280px]" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Revenue by Category</CardTitle>
        <CardDescription>Distribution of revenue across product categories</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => (
                    <div className="flex items-center justify-between gap-4">
                      <span>{name}</span>
                      <span className="font-medium">{formatCurrency(Number(value))}</span>
                    </div>
                  )}
                />
              }
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              strokeWidth={2}
              stroke="var(--background)"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>

        {/* Legend */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="size-3 rounded-full shrink-0"
                style={{ backgroundColor: item.fill }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{item.category}</p>
                <p className="text-xs text-muted-foreground">
                  {item.percentage}% · {formatCurrency(item.value)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="mt-4 pt-4 border-t flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total Revenue</span>
          <span className="text-lg font-semibold">{formatCurrency(totalRevenue)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
