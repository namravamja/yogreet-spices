import { Request, Response } from "express";
import mongoose from "mongoose";
import { Order } from "../../models/Order";
import { OrderItem } from "../../models/OrderItem";
import { Buyer } from "../../models/Buyer";
import { sendAutoReleaseWarningEmail } from "../../helpers/orderMailer";
import { Product } from "../../models/Product";

interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

const ALLOWED_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;
type OrderStatus = (typeof ALLOWED_STATUSES)[number];

const verifySellerOwnsOrder = async (orderId: string, sellerId: string) => {
  const order = await Order.findById(orderId);
  if (!order) return { order: null, allowed: false };
  if (order.sellerId && order.sellerId.toString() === sellerId) {
    return { order, allowed: true };
  }
  const item = await OrderItem.findOne({
    orderId: new mongoose.Types.ObjectId(orderId),
    sellerId: new mongoose.Types.ObjectId(sellerId),
  }).lean();
  if (item) return { order, allowed: true };
  return { order, allowed: false };
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || user.role !== "SELLER") {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  const { orderId } = req.params;
  const { status } = req.body as { status?: string };
  if (!orderId) return res.status(400).json({ success: false, message: "Order ID required" });
  if (!status || !ALLOWED_STATUSES.includes(status as OrderStatus)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }
  const { order, allowed } = await verifySellerOwnsOrder(orderId, user.id);
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });
  if (!allowed) return res.status(403).json({ success: false, message: "Forbidden" });

  order.status = status as OrderStatus;

  if (status === "delivered") {
    const now = new Date();
    order.deliveryStatus = "delivered";
    order.deliveredAt = now;
    order.autoReleaseAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    try {
      const buyer = await Buyer.findById(order.buyerId).lean();
      const email = (buyer as any)?.email;
      const fullName = [ (buyer as any)?.firstName, (buyer as any)?.lastName ].filter(Boolean).join(" ");
      if (email && order.autoReleaseAt) {
        await sendAutoReleaseWarningEmail(email, fullName || "", orderId, order.autoReleaseAt);
      }
    } catch {}
  }

  await order.save();
  return res.json({ success: true, data: { id: order._id, status: order.status, deliveryStatus: order.deliveryStatus } });
};

export const getSellerOrders = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || user.role !== "SELLER") {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  const sellerId = user.id;
  const page = Math.max(parseInt(String(req.query.page || "1"), 10), 1);
  const limit = Math.max(Math.min(parseInt(String(req.query.limit || "10"), 10), 50), 1);
  const status = String(req.query.status || "").trim();

  const itemFilter: any = { sellerId: new mongoose.Types.ObjectId(sellerId) };

  // Find all order items for this seller (paged by orders, not items)
  const sellerItems = await OrderItem.find(itemFilter, { orderId: 1 })
    .lean();
  const orderIdStrings = Array.from(new Set(sellerItems.map((it: any) => String(it.orderId))));
  if (orderIdStrings.length === 0) {
    return res.json({ orders: [], pagination: { currentPage: page, totalPages: 1, totalCount: 0, hasNextPage: false, hasPreviousPage: false } });
  }

  const orderFilter: any = { _id: { $in: orderIdStrings.map((id) => new mongoose.Types.ObjectId(id)) } };
  if (status) {
    orderFilter.status = status;
  }

  const totalCount = await Order.countDocuments(orderFilter);
  const totalPages = Math.max(Math.ceil(totalCount / limit), 1);
  const skip = (page - 1) * limit;

  const orders = await Order.find(orderFilter)
    .sort({ placedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  // For each order, include only the items that belong to this seller and attach product info
  const resultOrders = [];
  for (const o of orders) {
    const items = await OrderItem.find({
      orderId: new mongoose.Types.ObjectId((o as any)._id),
      sellerId: new mongoose.Types.ObjectId(sellerId),
    }).lean();
    const productIds = items.map((it: any) => it.productId).filter(Boolean);
    const productsMap = new Map<string, any>();
    if (productIds.length > 0) {
      const products = await Product.find({ _id: { $in: productIds } }, { productName: 1, productImages: 1 }).lean();
      for (const p of products) productsMap.set(String((p as any)._id), p);
    }
    const shapedItems = items.map((it: any) => ({
      id: String(it._id),
      orderId: String(it.orderId),
      productId: String(it.productId),
      quantity: it.quantity,
      priceAtPurchase: it.priceAtPurchase,
      sellerId: String(it.sellerId),
      product: (() => {
        const p = productsMap.get(String(it.productId));
        if (!p) return undefined;
        return {
          id: String((p as any)._id),
          productName: (p as any).productName,
          productImages: (p as any).productImages || [],
          skuCode: undefined,
        };
      })(),
    }));

    resultOrders.push({
      id: String((o as any)._id),
      buyerId: String((o as any).buyerId),
      totalAmount: (o as any).totalAmount,
      status: (o as any).status,
      shippingAddressId: (o as any).shippingAddressId ? String((o as any).shippingAddressId) : undefined,
      paymentMethod: (o as any).paymentMethod,
      paymentStatus: (o as any).paymentStatus,
      placedAt: (o as any).placedAt,
      updatedAt: (o as any).updatedAt,
      orderItems: shapedItems,
      shippingAddress: undefined,
    });
  }

  return res.json({
    orders: resultOrders,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  });
};
