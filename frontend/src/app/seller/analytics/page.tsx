"use client";

import { useState } from "react";
import { useGetSellerAnalyticsQuery, useGetSalesInsightsQuery } from "@/services/api/sellerApi";
import { formatCurrency } from "@/utils/currency";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  ShoppingBag,
  Package,
  Star,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  AlertCircle,
} from "lucide-react";

export default function AnalyticsPage() {
  const [insightsPeriod, setInsightsPeriod] = useState("30d");
  
  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useGetSellerAnalyticsQuery({});
  const { data: insights, isLoading: insightsLoading } = useGetSalesInsightsQuery(insightsPeriod);

  if (analyticsLoading) {
    return <AnalyticsLoadingSkeleton />;
  }

  if (analyticsError || !analytics) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Unable to load analytics</h2>
          <p className="text-muted-foreground">
            There was an error loading your analytics data. Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  const { overview, comparison, charts, topProducts, recentReviews } = analytics;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Insights</h1>
          <p className="text-muted-foreground mt-1">
            Track your store performance and sales data
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(overview.totalRevenue)}
          icon={<IndianRupee className="h-5 w-5" />}
          trend={comparison.revenueGrowth}
          description="vs last month"
        />
        <StatCard
          title="Total Orders"
          value={overview.totalOrders.toString()}
          icon={<ShoppingBag className="h-5 w-5" />}
          trend={comparison.ordersGrowth}
          description="vs last month"
        />
        <StatCard
          title="Total Products"
          value={overview.totalProducts.toString()}
          icon={<Package className="h-5 w-5" />}
        />
        <StatCard
          title="Avg. Order Value"
          value={formatCurrency(overview.avgOrderValue)}
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Rating</p>
                <div className="flex items-center gap-2 mt-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-2xl font-bold">{overview.avgRating || 0}</span>
                  <span className="text-sm text-muted-foreground">({overview.totalReviews} reviews)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Orders</p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <span className="text-2xl font-bold">{overview.pendingOrders}</span>
                  <span className="text-sm text-muted-foreground">awaiting action</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month Revenue</p>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-5 w-5 text-green-500" />
                  <span className="text-2xl font-bold">{formatCurrency(comparison.thisMonth.revenue)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Sales
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Sales Chart */}
            <Card className="col-span-full">
              <CardHeader>
                <CardTitle>Daily Sales (Last 30 Days)</CardTitle>
                <CardDescription>Revenue and order trends over time</CardDescription>
              </CardHeader>
              <CardContent>
                <DailySalesChart data={charts.dailySales} />
              </CardContent>
            </Card>

            {/* Order Status Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
                <CardDescription>Current status distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <StatusBreakdown data={charts.statusBreakdown} />
              </CardContent>
            </Card>

            {/* Month Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Month Comparison</CardTitle>
                <CardDescription>This month vs last month</CardDescription>
              </CardHeader>
              <CardContent>
                <MonthComparison data={comparison} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products */}
            <Card className="col-span-full lg:col-span-1">
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>Products by revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <TopProductsList products={topProducts} />
              </CardContent>
            </Card>

            {/* Revenue by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Category</CardTitle>
                <CardDescription>Sales distribution across categories</CardDescription>
              </CardHeader>
              <CardContent>
                <CategoryRevenue data={charts.revenueByCategory} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="flex justify-end">
            <Select value={insightsPeriod} onValueChange={setInsightsPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {insightsLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Skeleton className="h-[300px]" />
              <Skeleton className="h-[300px]" />
            </div>
          ) : insights ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Key Insights */}
              <Card>
                <CardHeader>
                  <CardTitle>Key Insights</CardTitle>
                  <CardDescription>Best performing times</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Peak Hour</p>
                        <p className="text-sm text-muted-foreground">Best time for sales</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-lg">{insights.insights.peakHour}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Best Day</p>
                        <p className="text-sm text-muted-foreground">Highest sales day</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-lg">{insights.insights.bestDay}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Total Transactions</p>
                        <p className="text-sm text-muted-foreground">In selected period</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-lg">{insights.insights.totalTransactions}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Sales by Day of Week */}
              <Card>
                <CardHeader>
                  <CardTitle>Sales by Day of Week</CardTitle>
                  <CardDescription>Revenue distribution across days</CardDescription>
                </CardHeader>
                <CardContent>
                  <SalesByDayChart data={insights.charts.salesByDayOfWeek} />
                </CardContent>
              </Card>
            </div>
          ) : null}

          {/* Recent Reviews */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Reviews</CardTitle>
              <CardDescription>Latest customer feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentReviewsList reviews={recentReviews} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  icon,
  trend,
  description,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: number;
  description?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="p-2 bg-primary/10 rounded-lg">{icon}</div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-sm ${trend >= 0 ? "text-green-600" : "text-red-600"}`}>
              {trend >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{description || title}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Daily Sales Chart (Simple bar representation)
function DailySalesChart({ data }: { data: Array<{ date: string; revenue: number; orders: number; units: number }> }) {
  if (!data || data.length === 0) {
    return <EmptyState message="No sales data available" />;
  }

  const maxRevenue = Math.max(...data.map(d => d.revenue), 1);

  return (
    <div className="space-y-4">
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary rounded" />
          <span>Revenue</span>
        </div>
      </div>
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {data.map((item) => (
          <div key={item.date} className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground w-20 shrink-0">
              {new Date(item.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
            </span>
            <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium w-24 text-right">{formatCurrency(item.revenue)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Status Breakdown Component
function StatusBreakdown({ data }: { data: { pending: number; confirmed: number; shipped: number; delivered: number } }) {
  const statuses = [
    { key: "pending", label: "Pending", color: "bg-yellow-500" },
    { key: "confirmed", label: "Confirmed", color: "bg-blue-500" },
    { key: "shipped", label: "Shipped", color: "bg-purple-500" },
    { key: "delivered", label: "Delivered", color: "bg-green-500" },
  ];

  const total = Object.values(data).reduce((sum, val) => sum + val, 0) || 1;

  return (
    <div className="space-y-4">
      {statuses.map(({ key, label, color }) => (
        <div key={key} className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{label}</span>
            <span className="font-medium">{data[key as keyof typeof data]}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full ${color} rounded-full transition-all`}
              style={{ width: `${(data[key as keyof typeof data] / total) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Month Comparison Component
function MonthComparison({
  data,
}: {
  data: {
    thisMonth: { revenue: number; orders: number };
    lastMonth: { revenue: number; orders: number };
    revenueGrowth: number;
    ordersGrowth: number;
  };
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">This Month</p>
          <p className="text-xl font-bold mt-1">{formatCurrency(data.thisMonth.revenue)}</p>
          <p className="text-sm text-muted-foreground">{data.thisMonth.orders} orders</p>
        </div>
        <div className="p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">Last Month</p>
          <p className="text-xl font-bold mt-1">{formatCurrency(data.lastMonth.revenue)}</p>
          <p className="text-sm text-muted-foreground">{data.lastMonth.orders} orders</p>
        </div>
      </div>
      <div className="flex justify-center gap-8">
        <div className="text-center">
          <div className={`flex items-center justify-center gap-1 ${data.revenueGrowth >= 0 ? "text-green-600" : "text-red-600"}`}>
            {data.revenueGrowth >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
            <span className="text-xl font-bold">{Math.abs(data.revenueGrowth)}%</span>
          </div>
          <p className="text-sm text-muted-foreground">Revenue Growth</p>
        </div>
        <div className="text-center">
          <div className={`flex items-center justify-center gap-1 ${data.ordersGrowth >= 0 ? "text-green-600" : "text-red-600"}`}>
            {data.ordersGrowth >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
            <span className="text-xl font-bold">{Math.abs(data.ordersGrowth)}%</span>
          </div>
          <p className="text-sm text-muted-foreground">Orders Growth</p>
        </div>
      </div>
    </div>
  );
}

// Top Products List
function TopProductsList({
  products,
}: {
  products: Array<{ id: string; name: string; category: string; units: number; revenue: number }>;
}) {
  if (!products || products.length === 0) {
    return <EmptyState message="No product data available" />;
  }

  return (
    <div className="space-y-4">
      {products.map((product, index) => (
        <div key={product.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold">
              {index + 1}
            </div>
            <div>
              <p className="font-medium truncate max-w-[200px]">{product.name}</p>
              <p className="text-sm text-muted-foreground">{product.units} units sold</p>
            </div>
          </div>
          <p className="font-semibold">{formatCurrency(product.revenue)}</p>
        </div>
      ))}
    </div>
  );
}

// Category Revenue Component
function CategoryRevenue({
  data,
}: {
  data: Array<{ category: string; revenue: number; percentage: number }>;
}) {
  if (!data || data.length === 0) {
    return <EmptyState message="No category data available" />;
  }

  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-orange-500",
    "bg-teal-500",
  ];

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={item.category} className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded ${colors[index % colors.length]}`} />
              {item.category}
            </span>
            <span className="font-medium">{formatCurrency(item.revenue)} ({item.percentage}%)</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full ${colors[index % colors.length]} rounded-full transition-all`}
              style={{ width: `${item.percentage}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Sales by Day Chart
function SalesByDayChart({ data }: { data: Array<{ day: string; revenue: number }> }) {
  if (!data || data.length === 0) {
    return <EmptyState message="No insights data available" />;
  }

  const maxRevenue = Math.max(...data.map(d => d.revenue), 1);

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.day} className="flex items-center gap-4">
          <span className="text-sm w-24 shrink-0">{item.day}</span>
          <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
            />
          </div>
          <span className="text-sm font-medium w-24 text-right">{formatCurrency(item.revenue)}</span>
        </div>
      ))}
    </div>
  );
}

// Recent Reviews List
function RecentReviewsList({
  reviews,
}: {
  reviews: Array<{ id: string; productName: string; rating: number; comment: string; createdAt: string }>;
}) {
  if (!reviews || reviews.length === 0) {
    return <EmptyState message="No reviews yet" />;
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="p-4 border rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium">{review.productName}</p>
              <div className="flex items-center gap-1 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                  />
                ))}
              </div>
            </div>
            <span className="text-sm text-muted-foreground">
              {new Date(review.createdAt).toLocaleDateString()}
            </span>
          </div>
          {review.comment && <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>}
        </div>
      ))}
    </div>
  );
}

// Empty State Component
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

// Loading Skeleton
function AnalyticsLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <Skeleton className="h-10 w-64" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-[400px]" />
    </div>
  );
}
