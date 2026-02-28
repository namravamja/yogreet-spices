import { Payment } from "../../models/Payment";
import { SellerPayout } from "../../models/SellerPayout";
import Razorpay from "razorpay";
import mongoose from "mongoose";

export type Gateway = "razorpay" | "stripe";

export interface CreatePaymentParams {
  orderId: string;
  amount: number;
  currency: string;
}

export interface CreatePaymentResult {
  gateway: Gateway;
  razorpay?: {
    orderId: string;
    keyId: string;
    amount: number;
    currency: string;
  };
}

export interface PayoutResult {
  id: string;
}

export interface PaymentService {
  create(params: CreatePaymentParams): Promise<CreatePaymentResult>;
  verifyAndMarkHeld(payload: any, signature: string | undefined, secret: string | undefined): Promise<void>;
  releaseToSeller(orderId: string, sellerId: string, amount: number, currency: string): Promise<PayoutResult>;
  refund(orderId: string, amount?: number): Promise<void>;
}

export class RazorpayService implements PaymentService {
  private instance: Razorpay;

  constructor() {
    this.instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || "",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "",
    });
  }

  async create(params: CreatePaymentParams): Promise<CreatePaymentResult> {
    const rzpOrder = await this.instance.orders.create({
      amount: Math.round(params.amount * 100),
      currency: params.currency,
      receipt: params.orderId,
      notes: { type: "escrow_hold" },
    });

    await Payment.create({
      orderId: new mongoose.Types.ObjectId(params.orderId),
      gateway: "razorpay",
      amount: params.amount,
      currency: params.currency,
      gatewayOrderId: rzpOrder.id,
      razorpayOrderId: rzpOrder.id,
      status: "created",
    });

    return {
      gateway: "razorpay",
      razorpay: {
        orderId: rzpOrder.id,
        keyId: process.env.RAZORPAY_KEY_ID || "",
        amount: Number(rzpOrder.amount),
        currency: String(rzpOrder.currency),
      },
    };
  }

  async verifyAndMarkHeld(payload: any, signature: string | undefined, secret: string | undefined): Promise<void> {
    const crypto = await import("crypto");
    const body = payload?.rawString ? String(payload.rawString) : JSON.stringify(payload);
    const expectedSignature = crypto
      .createHmac("sha256", secret || "")
      .update(body)
      .digest("hex");
    if (!signature || expectedSignature !== signature) {
      throw new Error("Invalid Razorpay webhook signature");
    }

    const data = payload?.json ?? payload;
    const event = data?.event;
    if (event === "payment.captured") {
      const paymentId = data?.payload?.payment?.entity?.id;
      const orderId = data?.payload?.payment?.entity?.order_id;
      const amount = (data?.payload?.payment?.entity?.amount || 0) / 100;
      const currency = data?.payload?.payment?.entity?.currency;

      await Payment.findOneAndUpdate(
        { $or: [{ gatewayPaymentId: paymentId }, { gatewayOrderId: orderId }], gateway: "razorpay" },
        {
          gatewayPaymentId: paymentId,
          gatewayOrderId: orderId,
          razorpayPaymentId: paymentId,
          razorpayOrderId: orderId,
          status: "succeeded",
          amount,
          currency,
          rawWebhookData: data,
          webhookPayload: data,
          signature,
        },
        { upsert: true }
      );
    } else if (event === "payment.failed") {
      const paymentId = data?.payload?.payment?.entity?.id;
      const orderId = data?.payload?.payment?.entity?.order_id;
      await Payment.findOneAndUpdate(
        { $or: [{ gatewayPaymentId: paymentId }, { gatewayOrderId: orderId }], gateway: "razorpay" },
        {
          gatewayPaymentId: paymentId,
          gatewayOrderId: orderId,
          razorpayPaymentId: paymentId,
          razorpayOrderId: orderId,
          status: "failed",
          rawWebhookData: data,
          webhookPayload: data,
          signature,
        },
        { upsert: true }
      );
    }
  }

  async releaseToSeller(orderId: string, sellerId: string, amount: number, currency: string): Promise<PayoutResult> {
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

    return { id: `simulated_${orderId}_${sellerId}` };
  }

  async refund(_orderId: string, _amount?: number): Promise<void> {
    return;
  }
}

export const getPaymentService = (gateway: Gateway): PaymentService => {
  return new RazorpayService();
};
