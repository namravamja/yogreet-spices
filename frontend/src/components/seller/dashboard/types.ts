// Dashboard Types & Interfaces

export type TimePeriod = "daily" | "weekly" | "monthly" | "yearly";

export interface StatCardData {
  id: string;
  title: string;
  value: number;
  previousValue?: number;
  prefix?: string;
  suffix?: string;
  isCurrency?: boolean;
  trend?: "up" | "down" | "neutral";
  percentChange?: number;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface SalesDataPoint {
  date: string;
  sales: number;
  orders: number;
  revenue: number;
}

export interface RevenueDistribution {
  category: string;
  value: number;
  percentage: number;
  fill?: string;
}

export interface TopProduct {
  id: string;
  name: string;
  image?: string;
  unitsSold: number;
  revenue: number;
  category?: string;
}

export interface LowStockProduct {
  id: string;
  name: string;
  image?: string;
  stockRemaining: number;
  minStockLevel: number;
  status: "critical" | "warning" | "low";
}

export interface RecentOrder {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail?: string;
  amount: number;
  status: OrderStatus;
  date: string;
  itemsCount?: number;
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface ActivityItem {
  id: string;
  type: "order" | "product" | "payment" | "stock" | "review";
  title: string;
  description?: string;
  timestamp: string;
  icon?: React.ComponentType<{ className?: string }>;
  metadata?: Record<string, unknown>;
}

export interface QuickAction {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  variant?: "default" | "outline" | "secondary";
}

export interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  activeProducts: number;
  pendingOrders: number;
  conversionRate: number;
  averageOrderValue: number;
  previousPeriod: {
    totalRevenue: number;
    totalOrders: number;
    activeProducts: number;
    pendingOrders: number;
    conversionRate: number;
    averageOrderValue: number;
  };
}

export interface ChartConfig {
  [key: string]: {
    label: string;
    color: string;
  };
}
