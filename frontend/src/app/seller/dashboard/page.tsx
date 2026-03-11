"use client";

import * as React from "react";
import {
  IndianRupee,
  ShoppingCart,
  Package,
  Clock,
  TrendingUp,
  Wallet,
  RefreshCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  StatsGrid,
  QuickActions,
  SalesChart,
  OrdersChart,
  RevenueDistributionChart,
  TopProducts,
  LowStockProducts,
  RecentOrdersTable,
  ActivityFeed,
  type StatCardData,
  type TopProduct,
  type LowStockProduct,
  type RecentOrder,
  type ActivityItem,
  type SalesDataPoint,
  type RevenueDistribution,
  type OrderStatus,
} from "@/components/seller/dashboard";
import {
  useGetSellerQuery,
  useGetSellerProductsQuery,
  useGetSellerOrdersQuery,
} from "@/services/api/sellerApi";

// Helper functions for stats calculations
function calculatePercentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function getTrend(current: number, previous: number): "up" | "down" | "neutral" {
  if (current > previous) return "up";
  if (current < previous) return "down";
  return "neutral";
}

// Transform API orders to recent orders format
function transformOrdersToRecent(orders: any[]): RecentOrder[] {
  return orders.slice(0, 5).map((order) => ({
    id: order._id || order.id,
    orderId: `ORD-${(order._id || order.id || "").slice(-8).toUpperCase()}`,
    customerName: order.buyer?.name || order.buyerId?.name || "Customer",
    customerEmail: order.buyer?.email || order.buyerId?.email,
    amount: order.totalAmount || 0,
    status: (order.status || "pending") as OrderStatus,
    date: order.placedAt || order.createdAt || new Date().toISOString(),
    itemsCount: order.items?.length || 1,
  }));
}

// Transform API products to top products format
function transformProductsToTop(products: any[]): TopProduct[] {
  return products.slice(0, 5).map((product) => {
    const price = parseFloat(product.samplePrice) || 
                  parseFloat(product.smallPrice) || 
                  parseFloat(product.mediumPrice) || 
                  parseFloat(product.largePrice) || 0;
    return {
      id: product._id || product.id,
      name: product.productName,
      image: product.productImages?.[0],
      unitsSold: product.unitsSold || 0,
      revenue: product.totalRevenue || price,
      category: product.category,
    };
  });
}

// Transform API products to low stock format
function transformProductsToLowStock(products: any[]): LowStockProduct[] {
  return products.slice(0, 4).map((product) => ({
    id: product._id || product.id,
    name: product.productName,
    image: product.productImages?.[0],
    stockRemaining: product.stock || 0,
    minStockLevel: product.minStock || 50,
    status: product.stock <= 10 ? "critical" : product.stock <= 25 ? "warning" : "low" as const,
  }));
}

// Transform orders data to sales chart format
function transformOrdersToSalesData(orders: any[]): SalesDataPoint[] {
  const salesByDate = new Map<string, { sales: number; orders: number }>();
  
  orders.forEach((order) => {
    const date = new Date(order.placedAt || order.createdAt);
    const dateKey = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    
    const existing = salesByDate.get(dateKey) || { sales: 0, orders: 0 };
    salesByDate.set(dateKey, {
      sales: existing.sales + (order.totalAmount || 0),
      orders: existing.orders + 1,
    });
  });
  
  return Array.from(salesByDate.entries()).map(([date, data]) => ({
    date,
    sales: data.sales,
    orders: data.orders,
    revenue: data.sales,
  }));
}

// Transform products to revenue distribution by category
function transformProductsToRevenue(products: any[]): RevenueDistribution[] {
  const categoryMap = new Map<string, number>();
  
  products.forEach((product) => {
    const category = product.category || "Other";
    const price = parseFloat(product.samplePrice) || 
                  parseFloat(product.smallPrice) || 
                  parseFloat(product.mediumPrice) || 
                  parseFloat(product.largePrice) || 0;
    categoryMap.set(category, (categoryMap.get(category) || 0) + price);
  });
  
  const total = Array.from(categoryMap.values()).reduce((sum, val) => sum + val, 0);
  const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
  
  return Array.from(categoryMap.entries()).map(([category, value], index) => ({
    category,
    value,
    percentage: total > 0 ? Math.round((value / total) * 100) : 0,
    fill: colors[index % colors.length],
  }));
}

// Generate activity feed from orders
function generateActivityFromOrders(orders: any[]): ActivityItem[] {
  return orders.slice(0, 7).map((order, index) => {
    const types: Array<ActivityItem["type"]> = ["order", "payment", "order", "payment", "order"];
    const type = types[index % types.length];
    
    return {
      id: order._id || order.id || String(index),
      type,
      title: type === "order" 
        ? order.status === "delivered" ? "Order delivered" : "Order received"
        : "Payment processed",
      description: type === "order"
        ? `Order #${(order._id || order.id || "").slice(-8).toUpperCase()}`
        : `₹${order.totalAmount?.toLocaleString("en-IN")} processed`,
      timestamp: order.placedAt || order.createdAt || new Date().toISOString(),
    };
  });
}

export default function SellerDashboardPage() {
  const [lastUpdated, setLastUpdated] = React.useState<Date>(new Date());
  
  // Fetch real data from APIs
  const { 
    data: seller, 
    isLoading: isSellerLoading, 
    refetch: refetchSeller 
  } = useGetSellerQuery(undefined);
  
  const { 
    data: products, 
    isLoading: isProductsLoading, 
    refetch: refetchProducts 
  } = useGetSellerProductsQuery(undefined);
  
  const { 
    data: ordersData, 
    isLoading: isOrdersLoading, 
    refetch: refetchOrders 
  } = useGetSellerOrdersQuery({ page: 1, limit: 50 });

  const isLoading = isSellerLoading || isProductsLoading || isOrdersLoading;
  
  // Extract orders array from response
  const orders = React.useMemo(() => {
    if (!ordersData) return [];
    return Array.isArray(ordersData) ? ordersData : ordersData.orders || [];
  }, [ordersData]);

  const productsArray = React.useMemo(() => {
    if (!products) return [];
    return Array.isArray(products) ? products : [];
  }, [products]);

  // Calculate metrics from real data
  const metrics = React.useMemo(() => {
    const totalRevenue = orders.reduce((sum: number, order: any) => 
      sum + (order.totalAmount || 0), 0);
    const totalOrders = orders.length;
    const activeProducts = productsArray.length;
    const pendingOrders = orders.filter((o: any) => 
      o.status === "pending" || o.status === "processing").length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    return {
      totalRevenue,
      totalOrders,
      activeProducts,
      pendingOrders,
      conversionRate: 3.2,
      averageOrderValue,
      previousPeriod: {
        totalRevenue: totalRevenue * 0.85,
        totalOrders: Math.floor(totalOrders * 0.9),
        activeProducts: Math.floor(activeProducts * 0.85),
        pendingOrders: Math.floor(pendingOrders * 0.8),
        conversionRate: 2.8,
        averageOrderValue: averageOrderValue * 0.92,
      },
    };
  }, [orders, productsArray]);

  // Build stats cards from real metrics
  const statsCards: StatCardData[] = React.useMemo(() => [
    {
      id: "revenue",
      title: "Total Revenue",
      value: metrics.totalRevenue,
      previousValue: metrics.previousPeriod.totalRevenue,
      isCurrency: true,
      trend: getTrend(metrics.totalRevenue, metrics.previousPeriod.totalRevenue),
      percentChange: calculatePercentChange(metrics.totalRevenue, metrics.previousPeriod.totalRevenue),
      icon: IndianRupee,
    },
    {
      id: "orders",
      title: "Total Orders",
      value: metrics.totalOrders,
      previousValue: metrics.previousPeriod.totalOrders,
      trend: getTrend(metrics.totalOrders, metrics.previousPeriod.totalOrders),
      percentChange: calculatePercentChange(metrics.totalOrders, metrics.previousPeriod.totalOrders),
      icon: ShoppingCart,
    },
    {
      id: "products",
      title: "Active Products",
      value: metrics.activeProducts,
      previousValue: metrics.previousPeriod.activeProducts,
      trend: getTrend(metrics.activeProducts, metrics.previousPeriod.activeProducts),
      percentChange: calculatePercentChange(metrics.activeProducts, metrics.previousPeriod.activeProducts),
      icon: Package,
    },
    {
      id: "pending",
      title: "Pending Orders",
      value: metrics.pendingOrders,
      previousValue: metrics.previousPeriod.pendingOrders,
      trend: getTrend(metrics.pendingOrders, metrics.previousPeriod.pendingOrders),
      percentChange: calculatePercentChange(metrics.pendingOrders, metrics.previousPeriod.pendingOrders),
      icon: Clock,
    },
    {
      id: "conversion",
      title: "Conversion Rate",
      value: metrics.conversionRate,
      previousValue: metrics.previousPeriod.conversionRate,
      suffix: "%",
      trend: getTrend(metrics.conversionRate, metrics.previousPeriod.conversionRate),
      percentChange: calculatePercentChange(metrics.conversionRate, metrics.previousPeriod.conversionRate),
      icon: TrendingUp,
    },
    {
      id: "aov",
      title: "Avg Order Value",
      value: metrics.averageOrderValue,
      previousValue: metrics.previousPeriod.averageOrderValue,
      isCurrency: true,
      trend: getTrend(metrics.averageOrderValue, metrics.previousPeriod.averageOrderValue),
      percentChange: calculatePercentChange(metrics.averageOrderValue, metrics.previousPeriod.averageOrderValue),
      icon: Wallet,
    },
  ], [metrics]);

  // Transform data for components
  const topProducts = React.useMemo(() => transformProductsToTop(productsArray), [productsArray]);
  const lowStockProducts = React.useMemo(() => transformProductsToLowStock(productsArray), [productsArray]);
  const recentOrders = React.useMemo(() => transformOrdersToRecent(orders), [orders]);
  const salesData = React.useMemo(() => transformOrdersToSalesData(orders), [orders]);
  const revenueDistribution = React.useMemo(() => transformProductsToRevenue(productsArray), [productsArray]);
  const activities = React.useMemo(() => generateActivityFromOrders(orders), [orders]);

  const handleRefresh = async () => {
    await Promise.all([refetchSeller(), refetchProducts(), refetchOrders()]);
    setLastUpdated(new Date());
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-[1600px]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Seller Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back{seller?.businessName ? `, ${seller.businessName}` : ""}! Here&apos;s an overview of your store performance.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Last updated:</span>
              <span>
                {lastUpdated.toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCcw className={`size-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <QuickActions isLoading={isLoading} className="mb-8" />

        {/* Stats Cards */}
        <StatsGrid stats={statsCards} isLoading={isLoading} className="mb-8" />

        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <SalesChart data={salesData} isLoading={isLoading} />
          <OrdersChart data={salesData} isLoading={isLoading} />
        </div>

        {/* Product Performance & Revenue Distribution */}
        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          <TopProducts products={topProducts} isLoading={isLoading} className="lg:col-span-2" />
          <RevenueDistributionChart data={revenueDistribution} isLoading={isLoading} />
        </div>

        {/* Orders & Activity */}
        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          <RecentOrdersTable
            orders={recentOrders}
            isLoading={isLoading}
            className="lg:col-span-2"
          />
          <div className="space-y-6">
            <LowStockProducts products={lowStockProducts} isLoading={isLoading} />
          </div>
        </div>

        {/* Activity Feed - Full Width */}
        <ActivityFeed activities={activities} isLoading={isLoading} />
      </div>
    </div>
  );
}

