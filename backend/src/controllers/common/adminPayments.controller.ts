import { Request, Response } from "express";
import mongoose from "mongoose";
import { Order } from "../../models/Order";
import { OrderItem } from "../../models/OrderItem";
import { SellerPayout } from "../../models/SellerPayout";
import { Payment } from "../../models/Payment";

interface AuthenticatedRequest extends Request {
  user?: { id: string; role: string };
}

export const listDisputes = async (_req: AuthenticatedRequest, res: Response) => {
  const disputes = await Order.find({ deliveryStatus: "disputed" })
    .sort({ createdAt: -1 })
    .lean();
  const enriched: any[] = [];
  for (const o of disputes) {
    const items = await OrderItem.find({ orderId: (o as any)._id })
      .populate({ path: "productId", select: "productName barcodeImage" })
      .lean();
    enriched.push({
      ...o,
      items: items.map((it: any) => ({
        id: it._id.toString(),
        quantity: it.quantity,
        priceAtPurchase: it.priceAtPurchase,
        productName: it.productId?.productName,
        productBarcodeImage: it.productId?.barcodeImage || null,
      })),
    });
  }
  res.json({ success: true, data: enriched });
};

export const forceRelease = async (req: AuthenticatedRequest, res: Response) => {
  const { orderId } = req.params;
  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });
  const currency = order.currency || "INR";
  const items = await OrderItem.find({ orderId: new mongoose.Types.ObjectId(orderId) }).lean();
  const totalsBySeller = new Map<string, number>();
  for (const it of items) {
    const seller = (it as any).sellerId?.toString();
    if (!seller) continue;
    const total = (it as any).priceAtPurchase * (it as any).quantity;
    totalsBySeller.set(seller, (totalsBySeller.get(seller) || 0) + total);
  }
  for (const [sellerId, amount] of totalsBySeller.entries()) {
    const existing = await SellerPayout.findOne({
      orderId: new mongoose.Types.ObjectId(orderId),
      sellerId: new mongoose.Types.ObjectId(sellerId),
    });
    if (existing?.released) continue;
    await SellerPayout.findOneAndUpdate(
      { orderId: new mongoose.Types.ObjectId(orderId), sellerId: new mongoose.Types.ObjectId(sellerId) },
      {
        orderId: new mongoose.Types.ObjectId(orderId),
        sellerId: new mongoose.Types.ObjectId(sellerId),
        amount,
        currency,
        gateway: "razorpay",
        released: true,
        releasedAt: new Date(),
      },
      { upsert: true }
    );
  }
  order.paymentStatus = "released";
  order.deliveryStatus = "delivered";
  await order.save();
  res.json({ success: true, message: "Payment force released" });
};

export const refund = async (req: AuthenticatedRequest, res: Response) => {
  const { orderId } = req.params;
  const { amount } = req.body as { amount?: number };
  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });
  if (order.paymentStatus !== "held") {
    return res.status(400).json({ success: false, message: "Only held payments can be refunded" });
  }
  await Payment.updateMany(
    { orderId: new mongoose.Types.ObjectId(orderId), gateway: "razorpay" },
    { $set: { status: "failed" } }
  );
  order.paymentStatus = "refunded";
  await order.save();
  res.json({ success: true, message: "Refund processed" });
};

export const resolveDispute = async (req: AuthenticatedRequest, res: Response) => {
  const { orderId } = req.params;
  const { action, amount } = req.body as { action: "refund" | "partial_refund" | "release"; amount?: number };
  if (!["refund", "partial_refund", "release"].includes(action)) {
    return res.status(400).json({ success: false, message: "Invalid action" });
  }
  if (action === "release") {
    return forceRelease(req, res);
  }
  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });
  await Payment.updateMany(
    { orderId: new mongoose.Types.ObjectId(orderId), gateway: "razorpay" },
    { $set: { status: "failed" } }
  );
  order.paymentStatus = "refunded";
  await order.save();
  res.json({ success: true, message: "Dispute resolved with refund" });
};
