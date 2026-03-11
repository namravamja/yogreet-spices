import { Request, Response } from "express";
import { Order, OrderItem, Product, Review } from "../../models";
import mongoose from "mongoose";

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

// Get comprehensive seller analytics
export const getSellerAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const sellerId = req.user?.id;
    if (!sellerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const sellerObjectId = new mongoose.Types.ObjectId(sellerId);
    const now = new Date();
    
    // Date ranges
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get all order items for this seller
    const orderItems = await OrderItem.find({ sellerId: sellerObjectId })
      .populate({
        path: "orderId",
        model: "Order",
        select: "status totalAmount placedAt paymentStatus deliveryStatus buyerId",
      })
      .populate({
        path: "productId",
        model: "Product",
        select: "productName category",
      });

    // Filter valid orders
    const validOrderItems = orderItems.filter(
      (item) => item.orderId && (item.orderId as any).status !== "cancelled"
    );

    // Calculate total revenue
    const totalRevenue = validOrderItems.reduce(
      (sum, item) => sum + item.priceAtPurchase * item.quantity,
      0
    );

    // Get orders grouped by date for charts
    const ordersByDate = new Map<string, { revenue: number; orders: Set<string>; units: number }>();
    
    validOrderItems.forEach((item) => {
      const order = item.orderId as any;
      const date = new Date(order.placedAt);
      const dateKey = date.toISOString().split("T")[0];
      
      const existing = ordersByDate.get(dateKey) || { revenue: 0, orders: new Set(), units: 0 };
      existing.revenue += item.priceAtPurchase * item.quantity;
      existing.orders.add(order._id.toString());
      existing.units += item.quantity;
      ordersByDate.set(dateKey, existing);
    });

    // Convert to array for charts
    const dailySales = Array.from(ordersByDate.entries())
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        orders: data.orders.size,
        units: data.units,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30); // Last 30 days

    // Calculate this month vs last month
    const thisMonthOrders = validOrderItems.filter((item) => {
      const orderDate = new Date((item.orderId as any).placedAt);
      return orderDate >= thisMonthStart;
    });
    
    const lastMonthOrders = validOrderItems.filter((item) => {
      const orderDate = new Date((item.orderId as any).placedAt);
      return orderDate >= lastMonthStart && orderDate <= lastMonthEnd;
    });

    const thisMonthRevenue = thisMonthOrders.reduce(
      (sum, item) => sum + item.priceAtPurchase * item.quantity,
      0
    );
    
    const lastMonthRevenue = lastMonthOrders.reduce(
      (sum, item) => sum + item.priceAtPurchase * item.quantity,
      0
    );

    // Get unique order count
    const uniqueOrderIds = new Set(validOrderItems.map((item) => (item.orderId as any)._id.toString()));
    const totalOrders = uniqueOrderIds.size;

    // Calculate this month orders count
    const thisMonthOrderIds = new Set(
      thisMonthOrders.map((item) => (item.orderId as any)._id.toString())
    );
    const lastMonthOrderIds = new Set(
      lastMonthOrders.map((item) => (item.orderId as any)._id.toString())
    );

    // Get products count
    const products = await Product.find({ sellerId: sellerObjectId });
    const totalProducts = products.length;

    // Get product performance
    const productSales = new Map<string, { name: string; category: string; units: number; revenue: number }>();
    
    validOrderItems.forEach((item) => {
      const product = item.productId as any;
      if (!product) return;
      
      const productId = product._id.toString();
      const existing = productSales.get(productId) || {
        name: product.productName,
        category: product.category,
        units: 0,
        revenue: 0,
      };
      existing.units += item.quantity;
      existing.revenue += item.priceAtPurchase * item.quantity;
      productSales.set(productId, existing);
    });

    const topProducts = Array.from(productSales.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Revenue by category
    const categoryRevenue = new Map<string, number>();
    validOrderItems.forEach((item) => {
      const product = item.productId as any;
      if (!product) return;
      
      const category = product.category || "Other";
      categoryRevenue.set(
        category,
        (categoryRevenue.get(category) || 0) + item.priceAtPurchase * item.quantity
      );
    });

    const revenueByCategory = Array.from(categoryRevenue.entries())
      .map(([category, revenue]) => ({
        category,
        revenue,
        percentage: totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 100) : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // Get average order value
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get recent reviews
    const reviews = await Review.find({ sellerId: sellerObjectId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("productId", "productName");

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    // Pending orders
    const pendingOrders = validOrderItems.filter(
      (item) => (item.orderId as any).status === "pending"
    );
    const pendingOrderIds = new Set(pendingOrders.map((item) => (item.orderId as any)._id.toString()));

    // Order status breakdown
    const statusBreakdown = {
      pending: 0,
      confirmed: 0,
      shipped: 0,
      delivered: 0,
    };
    
    validOrderItems.forEach((item) => {
      const status = (item.orderId as any).status;
      if (status in statusBreakdown) {
        statusBreakdown[status as keyof typeof statusBreakdown]++;
      }
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalRevenue,
          totalOrders,
          totalProducts,
          avgOrderValue: Math.round(avgOrderValue),
          avgRating: Math.round(avgRating * 10) / 10,
          totalReviews: reviews.length,
          pendingOrders: pendingOrderIds.size,
        },
        comparison: {
          thisMonth: {
            revenue: thisMonthRevenue,
            orders: thisMonthOrderIds.size,
          },
          lastMonth: {
            revenue: lastMonthRevenue,
            orders: lastMonthOrderIds.size,
          },
          revenueGrowth: lastMonthRevenue > 0 
            ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
            : thisMonthRevenue > 0 ? 100 : 0,
          ordersGrowth: lastMonthOrderIds.size > 0
            ? Math.round(((thisMonthOrderIds.size - lastMonthOrderIds.size) / lastMonthOrderIds.size) * 100)
            : thisMonthOrderIds.size > 0 ? 100 : 0,
        },
        charts: {
          dailySales,
          revenueByCategory,
          statusBreakdown,
        },
        topProducts,
        recentReviews: reviews.map((r) => ({
          id: r._id,
          productName: (r.productId as any)?.productName || "Unknown Product",
          rating: r.rating,
          comment: r.text,
          createdAt: r.date,
        })),
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch analytics" });
  }
};

// Get sales insights with filters
export const getSalesInsights = async (req: AuthRequest, res: Response) => {
  try {
    const sellerId = req.user?.id;
    if (!sellerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { period = "30d" } = req.query;
    const sellerObjectId = new mongoose.Types.ObjectId(sellerId);
    
    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "1y":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get order items within date range
    const orderItems = await OrderItem.find({ sellerId: sellerObjectId })
      .populate({
        path: "orderId",
        model: "Order",
        match: { placedAt: { $gte: startDate }, status: { $ne: "cancelled" } },
        select: "status totalAmount placedAt buyerId",
      })
      .populate({
        path: "productId",
        model: "Product",
        select: "productName category",
      });

    const validOrderItems = orderItems.filter((item) => item.orderId);

    // Calculate hourly distribution (best selling hours)
    const hourlyDistribution = new Array(24).fill(0);
    validOrderItems.forEach((item) => {
      const hour = new Date((item.orderId as any).placedAt).getHours();
      hourlyDistribution[hour] += item.priceAtPurchase * item.quantity;
    });

    // Calculate day of week distribution
    const dayOfWeekDistribution = new Array(7).fill(0);
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    validOrderItems.forEach((item) => {
      const day = new Date((item.orderId as any).placedAt).getDay();
      dayOfWeekDistribution[day] += item.priceAtPurchase * item.quantity;
    });

    const salesByDayOfWeek = dayNames.map((name, index) => ({
      day: name,
      revenue: dayOfWeekDistribution[index],
    }));

    // Best selling hours
    const salesByHour = hourlyDistribution.map((revenue, hour) => ({
      hour: `${hour.toString().padStart(2, "0")}:00`,
      revenue,
    }));

    // Find peak hours
    const peakHourIndex = hourlyDistribution.indexOf(Math.max(...hourlyDistribution));
    const peakHour = `${peakHourIndex.toString().padStart(2, "0")}:00 - ${(peakHourIndex + 1).toString().padStart(2, "0")}:00`;

    // Find best day
    const bestDayIndex = dayOfWeekDistribution.indexOf(Math.max(...dayOfWeekDistribution));
    const bestDay = dayNames[bestDayIndex];

    res.json({
      success: true,
      data: {
        period,
        insights: {
          peakHour,
          bestDay,
          totalTransactions: new Set(validOrderItems.map((item) => (item.orderId as any)._id.toString())).size,
        },
        charts: {
          salesByHour,
          salesByDayOfWeek,
        },
      },
    });
  } catch (error) {
    console.error("Sales insights error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch sales insights" });
  }
};
