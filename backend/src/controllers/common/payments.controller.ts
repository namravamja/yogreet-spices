import { Request, Response } from "express";
import mongoose from "mongoose";
import { Order } from "../../models/Order";
import { OrderItem } from "../../models/OrderItem";
import { Payment } from "../../models/Payment";
import { SellerPayout } from "../../models/SellerPayout";
import { getPaymentService } from "../../services/payments";
import { Buyer } from "../../models/Buyer";
import { sendAutoReleaseWarningEmail } from "../../helpers/orderMailer";

interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

export const createPayment = async (req: AuthRequest, res: Response) => {
  const buyerId = req.user?.id;
  const { orderId } = req.params;
  if (!buyerId) return res.status(401).json({ success: false, message: "Unauthorized" });
  if (!orderId) return res.status(400).json({ success: false, message: "Order ID required" });

  const order = await Order.findById(orderId).lean();
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });
  if (order.buyerId?.toString() !== buyerId) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  if (order.paymentStatus !== "pending") {
    return res.status(400).json({ success: false, message: "Payment already initiated" });
  }
  const gateway = order.gateway || "razorpay";
  const service = getPaymentService(gateway);
  const result = await service.create({
    orderId: orderId,
    amount: order.totalAmount,
    currency: order.currency || "INR",
  });
  return res.json({ success: true, data: result });
};

export const markDeliveredBySeller = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || user.role !== "SELLER") {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  const { orderId } = req.params;
  if (!orderId) return res.status(400).json({ success: false, message: "Order ID required" });
  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });
  order.deliveryStatus = "delivered";
  const now = new Date();
  order.deliveredAt = now;
  order.autoReleaseAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  await order.save();
  try {
    const buyer = await Buyer.findById(order.buyerId).lean();
    const email = (buyer as any)?.email;
    const fullName = [ (buyer as any)?.firstName, (buyer as any)?.lastName ].filter(Boolean).join(" ");
    if (email) {
      await sendAutoReleaseWarningEmail(email, fullName || "", orderId, order.autoReleaseAt!);
    }
  } catch {}
  return res.json({ success: true, message: "Order marked as delivered" });
};

export const raiseDispute = async (req: AuthRequest, res: Response) => {
  const buyerId = req.user?.id;
  const { orderId } = req.params;
  if (!buyerId) return res.status(401).json({ success: false, message: "Unauthorized" });
  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });
  if (order.buyerId?.toString() !== buyerId) return res.status(403).json({ success: false, message: "Forbidden" });
  if (order.deliveryStatus === "disputed") {
    return res.status(400).json({ success: false, message: "Dispute already raised for this order" });
  }
  if (order.paymentStatus === "refunded") {
    return res.status(400).json({ success: false, message: "Order already refunded" });
  }
  const file: any = (req as any).file;
  const url = file?.path || file?.location || file?.secure_url;
  if (!url) {
    return res.status(400).json({ success: false, message: "Buyer barcode image is required" });
  }
  order.deliveryStatus = "disputed";
  order.buyerBarcodeImage = url;
  await order.save();
  return res.json({ success: true, message: "Dispute raised" });
};

export const confirmAndRelease = async (req: AuthRequest, res: Response) => {
  const buyerId = req.user?.id;
  const { orderId } = req.params;
  if (!buyerId) return res.status(401).json({ success: false, message: "Unauthorized" });
  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });
  if (order.buyerId?.toString() !== buyerId) return res.status(403).json({ success: false, message: "Forbidden" });
  if (order.paymentStatus !== "held") {
    return res.status(400).json({ success: false, message: "Funds not in held state" });
  }
  if (order.deliveryStatus === "disputed") {
    return res.status(400).json({ success: false, message: "Order in dispute" });
  }

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

  const updated = await Order.findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(orderId), paymentStatus: "held" },
    { $set: { paymentStatus: "released" } },
    { new: true }
  );
  if (!updated) {
    return res.status(409).json({ success: false, message: "Payment already released" });
  }
  return res.json({ success: true, message: "Payment released to seller(s)" });
};
