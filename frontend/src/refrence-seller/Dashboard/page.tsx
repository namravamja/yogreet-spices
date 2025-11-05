"use client";

import { useState, useMemo } from "react";
import {
  Package,
  Users,
  Star,
  ShoppingBag,
  MessageSquare,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  TrendingUp,
  ShoppingCart,
  ChevronRight,
  Layers,
  DollarSign,
  User,
} from "lucide-react";
import Image from "next/image";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";
import Link from "next/link";
import { useGetartistQuery } from "@/services/api/artistApi";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/app/(auth)/components/auth-modal-provider";

// Custom tooltip component for charts
const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-stone-200 shadow-md rounded-md">
        <p className="text-sm font-medium text-stone-900">{label}</p>
        <p className="text-sm text-terracotta-600">
          {payload[0].name === "revenue" ? "₹" : ""}
          {payload[0].value?.toLocaleString()}
          {payload[0].name === "visitors" ? " visitors" : ""}
          {payload[0].name === "value" ? "%" : ""}
        </p>
      </div>
    );
  }
  return null;
};

// Safe data access utilities
const safeArray = <T,>(value: T[] | undefined | null): T[] => {
  return Array.isArray(value) ? value : [];
};

const safeNumber = (value: any): number => {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

const safeString = (value: any): string => {
  return value ? String(value) : "";
};

export default function ArtistDashboard() {
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedTimeframe, setSelectedTimeframe] = useState("weekly");

  const { isAuthenticated, isLoading: authLoading } = useAuth("artist");
  const { openArtistLogin } = useAuthModal();

  // Fetch artist data using RTK Query
  const {
    data: artistResponse,
    isLoading,
    error,
  } = useGetartistQuery(undefined, {
    skip: !isAuthenticated,
  });

  // Extract artist data from cache response format
  const artistData = useMemo(() => {
    if (!artistResponse) return null;

    // Handle cache response format: {source: 'cache', data: {...}}
    if (artistResponse.source && artistResponse.data) {
      return artistResponse.data;
    }

    // Handle direct object format as fallback
    if (typeof artistResponse === "object" && !Array.isArray(artistResponse)) {
      return artistResponse;
    }

    return null;
  }, [artistResponse]);

  // Helper function to group order items by orderId and filter by time range
  const getOrdersFromOrderItems = (orderItems: any[], range: string) => {
    const safeOrderItems = safeArray(orderItems);
    if (safeOrderItems.length === 0) return [];

    const now = new Date();
    const rangeDate = new Date();

    switch (range) {
      case "7d":
        rangeDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        rangeDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        rangeDate.setDate(now.getDate() - 90);
        break;
      case "1y":
        rangeDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        rangeDate.setDate(now.getDate() - 30);
    }

    // Group order items by orderId
    const orderGroups: { [key: string]: any } = {};
    safeOrderItems.forEach((orderItem) => {
      const orderId = safeString(orderItem?.orderId);
      if (!orderId) return;

      if (!orderGroups[orderId]) {
        orderGroups[orderId] = {
          orderId,
          items: [],
          totalAmount: 0,
          totalItems: 0,
          date:
            orderItem?.createdAt ||
            orderItem?.updatedAt ||
            new Date().toISOString(),
        };
      }
      orderGroups[orderId].items.push(orderItem);
      orderGroups[orderId].totalAmount +=
        safeNumber(orderItem?.priceAtPurchase) *
        safeNumber(orderItem?.quantity || 1);
      orderGroups[orderId].totalItems += safeNumber(orderItem?.quantity || 1);
    });

    // Convert to array and filter by date range
    const orders = Object.values(orderGroups).filter((order: any) => {
      const orderDate = new Date(order.date);
      return !isNaN(orderDate.getTime()) && orderDate >= rangeDate;
    });

    return orders;
  };

  // Generate revenue data based on grouped orders
  const revenueData = useMemo(() => {
    const defaultData = [
      { date: "Week 1", revenue: 0 },
      { date: "Week 2", revenue: 0 },
      { date: "Week 3", revenue: 0 },
      { date: "Week 4", revenue: 0 },
    ];

    if (!artistData?.orderItems) return defaultData;

    const orders = getOrdersFromOrderItems(artistData.orderItems, timeRange);
    if (orders.length === 0) return defaultData;

    const revenueByPeriod: { [key: string]: number } = {};

    orders.forEach((order: any) => {
      const orderDate = new Date(order.date);
      const revenue = safeNumber(order.totalAmount);

      let periodKey;
      if (selectedTimeframe === "weekly") {
        const startOfYear = new Date(orderDate.getFullYear(), 0, 1);
        const dayOfYear = Math.floor(
          (orderDate.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)
        );
        const weekNumber = Math.ceil(
          (dayOfYear + startOfYear.getDay() + 1) / 7
        );
        periodKey = `Week ${weekNumber}`;
      } else if (selectedTimeframe === "monthly") {
        periodKey = orderDate.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });
      } else {
        periodKey = orderDate.getFullYear().toString();
      }

      revenueByPeriod[periodKey] = (revenueByPeriod[periodKey] || 0) + revenue;
    });

    const result = Object.entries(revenueByPeriod).map(([date, revenue]) => ({
      date,
      revenue: Math.round(revenue),
    }));

    return result.sort((a, b) => a.date.localeCompare(b.date));
  }, [artistData, timeRange, selectedTimeframe]);

  // Calculate stats from real data with time filtering
  const stats = useMemo(() => {
    const defaultStats = [
      {
        title: "Total Products",
        value: "0",
        change: "0%",
        trend: "up" as const,
        icon: Package,
        color: "terracotta",
      },
      {
        title: "Orders",
        value: "0",
        change: "0%",
        trend: "up" as const,
        icon: ShoppingBag,
        color: "clay",
      },
      {
        title: "Reviews",
        value: "0",
        change: "0",
        trend: "up" as const,
        icon: Star,
        color: "terracotta",
      },
      {
        title: "Total Revenue",
        value: "₹0",
        change: "0%",
        trend: "up" as const,
        icon: DollarSign,
        color: "sage",
      },
    ];

    if (!artistData) return defaultStats;

    const totalProducts = safeArray(artistData.products).length;
    const orders = getOrdersFromOrderItems(
      safeArray(artistData.orderItems),
      timeRange
    );
    const totalOrders = orders.length;
    const reviews = safeArray(artistData.Review);
    const totalReviews = reviews.length;

    const averageRating =
      totalReviews > 0
        ? (
            reviews.reduce(
              (sum: number, review: any) => sum + safeNumber(review?.rating),
              0
            ) / totalReviews
          ).toFixed(1)
        : "0";

    // Calculate total revenue from orders
    const totalRevenue = orders.reduce(
      (sum: number, order: any) => sum + safeNumber(order.totalAmount),
      0
    );

    return [
      {
        title: "Total Products",
        value: totalProducts.toString(),
        change: "+12%",
        trend: "up" as const,
        icon: Package,
        color: "terracotta",
      },
      {
        title: "Orders",
        value: totalOrders.toString(),
        change: "+15%",
        trend: "up" as const,
        icon: ShoppingBag,
        color: "clay",
      },
      {
        title: "Avg Rating",
        value: averageRating,
        change: "+0.2",
        trend: "up" as const,
        icon: Star,
        color: "terracotta",
      },
      {
        title: "Total Revenue",
        value: `₹${totalRevenue.toLocaleString()}`,
        change: "+18%",
        trend: "up" as const,
        icon: DollarSign,
        color: "sage",
      },
    ];
  }, [artistData, timeRange]);

  // Calculate sales by category from order items
  const salesByCategory = useMemo(() => {
    if (!artistData?.orderItems) return [];

    const orders = getOrdersFromOrderItems(
      safeArray(artistData.orderItems),
      timeRange
    );
    if (orders.length === 0) return [];

    const categoryRevenue: { [key: string]: number } = {};
    let totalRevenue = 0;

    // Get all order items from filtered orders
    const allOrderItems = orders.flatMap((order: any) =>
      safeArray(order.items)
    );

    allOrderItems.forEach((orderItem: any) => {
      const category = safeString(orderItem?.product?.category || "Other");
      const revenue =
        safeNumber(orderItem?.priceAtPurchase) *
        safeNumber(orderItem?.quantity || 1);
      categoryRevenue[category] = (categoryRevenue[category] || 0) + revenue;
      totalRevenue += revenue;
    });

    return Object.entries(categoryRevenue).map(([name, revenue]) => ({
      name,
      value: totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 100) : 0,
    }));
  }, [artistData, timeRange]);

  // Get recent orders (properly grouped)
  const recentOrders = useMemo(() => {
    if (!artistData?.orderItems) return [];

    const orders = getOrdersFromOrderItems(
      safeArray(artistData.orderItems),
      timeRange
    );

    return orders
      .sort((a: any, b: any) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 4)
      .map((order: any) => {
        const orderDate = new Date(order.date);
        const shortOrderId =
          safeString(order.orderId).split("-")[0]?.toUpperCase() || "UNKNOWN";

        return {
          id: `ORD-${shortOrderId}`,
          customer: "Customer",
          date: order.date,
          amount: safeNumber(order.totalAmount),
          status: safeString(order.items?.[0]?.status || "processing"),
          items: safeNumber(order.totalItems),
          image: "/Profile.jpg",
        };
      });
  }, [artistData, timeRange]);

  // Get top products based on sales from order items
  const topProducts = useMemo(() => {
    if (!artistData?.products || !artistData?.orderItems) return [];

    const orders = getOrdersFromOrderItems(
      safeArray(artistData.orderItems),
      timeRange
    );
    const allOrderItems = orders.flatMap((order: any) =>
      safeArray(order.items)
    );

    const productSales: { [key: string]: { sales: number; revenue: number } } =
      {};

    // Calculate sales for each product from order items
    allOrderItems.forEach((orderItem: any) => {
      const productId = safeString(
        orderItem?.product?.id || orderItem?.productId
      );
      if (productId) {
        const quantity = safeNumber(orderItem?.quantity);
        const revenue = safeNumber(orderItem?.priceAtPurchase) * quantity;

        if (!productSales[productId]) {
          productSales[productId] = { sales: 0, revenue: 0 };
        }
        productSales[productId].sales += quantity;
        productSales[productId].revenue += revenue;
      }
    });

    return safeArray(artistData.products)
      .map((product: any) => {
        const sales = productSales[product?.id]?.sales || 0;
        const revenue = productSales[product?.id]?.revenue || 0;

        return {
          id: safeString(product?.id),
          name: safeString(
            product?.productName ||
              product?.name ||
              product?.title ||
              "Unnamed Product"
          ),
          sales: sales,
          revenue: revenue,
          stock: safeNumber(product?.availableStock),
          image: safeString(
            product?.productImages?.[0] ||
              product?.images?.[0] ||
              "/Profile.jpg"
          ),
        };
      })
      .sort((a: { sales: number }, b: { sales: number }) => b.sales - a.sales)
      .slice(0, 4);
  }, [artistData, timeRange]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Show login prompt if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="container mx-auto px-4">
        <div className="text-center py-16">
          <User className="w-24 h-24 mx-auto text-stone-300 mb-6" />
          <h1 className="text-3xl font-light text-stone-900 mb-4">
            Login Required
          </h1>
          <p className="text-stone-600 mb-8">
            Please login to view your artist dashboard.
          </p>
          <button
            onClick={openArtistLogin}
            className="bg-terracotta-600 hover:bg-terracotta-700 text-white px-6 py-3 font-medium transition-colors cursor-pointer"
          >
            Login to Continue
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terracotta-500 mx-auto mb-4"></div>
            <p className="text-stone-600">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    console.error("Dashboard loading error:", error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading dashboard data</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-terracotta-500 hover:bg-terracotta-600 text-white px-4 py-2 rounded transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!artistData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-stone-600 mb-4">No dashboard data available</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-terracotta-500 hover:bg-terracotta-600 text-white px-4 py-2 rounded transition-colors cursor-pointer"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-light text-stone-900 mb-2">Dashboard</h1>
        <p className="text-stone-600">
          Welcome back, {safeString(artistData?.fullName) || "Artist"}! Here's
          what's happening with your store.
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="mb-8">
        <div className="flex space-x-2">
          {["7d", "30d", "90d", "1y"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 text-sm font-medium rounded-sm transition-colors cursor-pointer ${
                timeRange === range
                  ? "bg-terracotta-600 text-white"
                  : "bg-white text-stone-600 border border-stone-300 hover:bg-stone-50"
              }`}
            >
              {range === "7d" && "Last 7 days"}
              {range === "30d" && "Last 30 days"}
              {range === "90d" && "Last 90 days"}
              {range === "1y" && "Last year"}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white p-6 border border-stone-200 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-sm bg-${stat.color}-100`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <div
                  className={`flex items-center text-sm ${
                    stat.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 mr-1" />
                  )}
                  {stat.change}
                </div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-stone-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-stone-500 text-sm">{stat.title}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 sm:mb-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white shadow-sm border border-stone-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-stone-900 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-terracotta-600" />
              Revenue Overview
            </h3>
            <div className="flex items-center space-x-2">
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="text-sm border border-stone-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-terracotta-500 cursor-pointer"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={revenueData}
                margin={{ top: 10, right: 10, bottom: 30, left: 40 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f1f1"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tickFormatter={(value) => `₹${value.toLocaleString()}`}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  width={80}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="revenue"
                  name="revenue"
                  fill="rgba(203, 79, 48, 0.8)"
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                  className="hover:fill-terracotta-500"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by Category */}
        <div className="bg-white shadow-sm border border-stone-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-stone-900 flex items-center">
              <Layers className="w-5 h-5 mr-2 text-sage-600" />
              Sales by Category
            </h3>
          </div>
          <div className="h-80">
            {salesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={salesByCategory}
                  layout="vertical"
                  margin={{ top: 10, right: 10, bottom: 20, left: 80 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={true}
                    vertical={false}
                    stroke="#f1f1f1"
                  />
                  <XAxis
                    type="number"
                    tickFormatter={(value) => `${value}%`}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    width={80}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="value"
                    name="value"
                    fill="rgba(107, 134, 107, 0.8)"
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                    className="hover:fill-sage-500"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-stone-500 text-sm">
                  No sales data found for selected period
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 sm:mb-8">
        {/* Recent Orders */}
        <div className="bg-white shadow-sm border border-stone-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between p-5 border-b border-stone-100">
            <h3 className="text-lg font-medium text-stone-900 flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2 text-terracotta-600" />
              Recent Orders
            </h3>
            <Link
              href="/Artist/Orders"
              className="text-sm text-terracotta-600 hover:text-terracotta-700 flex items-center"
            >
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            {recentOrders.length > 0 ? (
              <table className="w-full">
                <thead className="bg-stone-50 text-left">
                  <tr>
                    <th className="px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-stone-50 transition-colors"
                    >
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-stone-900">
                          {order.id}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-sm text-stone-600">
                          {new Date(order.date).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-stone-900">
                          ₹{order.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-sm text-stone-600">
                          {order.items} items
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 text-xs rounded-full ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center">
                <ShoppingCart className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                <p className="text-stone-500">
                  No recent orders found for selected period
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white shadow-sm border border-stone-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between p-5 border-b border-stone-100">
            <h3 className="text-lg font-medium text-stone-900 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-sage-600" />
              Top Selling Products
            </h3>
            <Link
              href="/Artist/Product"
              className="text-sm text-sage-600 hover:text-sage-700 flex items-center"
            >
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            {topProducts.length > 0 ? (
              <table className="w-full">
                <thead className="bg-stone-50 text-left">
                  <tr>
                    <th className="px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Sales
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Stock
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {topProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-stone-50 transition-colors"
                    >
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="relative w-8 h-8 mr-3 rounded overflow-hidden">
                            <Image
                              src={product.image || "/Profile.jpg"}
                              alt={product.name}
                              fill
                              className="object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/Profile.jpg";
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium text-stone-900">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-sm text-stone-600">
                          {product.sales} units
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-stone-900">
                          ₹{product.revenue.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`text-sm ${
                            product.stock < 10
                              ? "text-red-600"
                              : "text-stone-600"
                          }`}
                        >
                          {product.stock} in stock
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center">
                <TrendingUp className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                <p className="text-stone-500">
                  No product sales found for selected period
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-medium text-stone-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/Artist/Product/AddProduct"
            className="bg-white border border-stone-200 p-6 hover:shadow-md transition-shadow"
          >
            <Package className="w-8 h-8 text-terracotta-600 mb-3" />
            <h3 className="font-medium text-stone-900 mb-1">Add New Product</h3>
            <p className="text-stone-500 text-sm">
              Create a new product listing
            </p>
          </Link>
          <Link
            href="/Artist/Reviews"
            className="bg-white border border-stone-200 p-6 hover:shadow-md transition-shadow"
          >
            <MessageSquare className="w-8 h-8 text-sage-600 mb-3" />
            <h3 className="font-medium text-stone-900 mb-1">Check Reviews</h3>
            <p className="text-stone-500 text-sm">
              Check all reviews from buyers
            </p>
          </Link>
          <Link
            href="/Artist/MakeProfile"
            className="bg-white border border-stone-200 p-6 hover:shadow-md transition-shadow"
          >
            <Users className="w-8 h-8 text-clay-600 mb-3" />
            <h3 className="font-medium text-stone-900 mb-1">Update Profile</h3>
            <p className="text-stone-500 text-sm">Manage your artist profile</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
