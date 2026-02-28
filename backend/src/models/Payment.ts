import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  orderId: mongoose.Types.ObjectId;
  gateway: "razorpay" | "stripe";
  amount: number;
  currency: string;
  gatewayPaymentId?: string;
  intentId?: string;
  gatewayOrderId?: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  signature?: string;
  status: "created" | "succeeded" | "failed";
  rawWebhookData?: any;
  webhookPayload?: any;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    gateway: { type: String, enum: ["razorpay", "stripe"], required: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    gatewayPaymentId: { type: String },
    intentId: { type: String },
    gatewayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpayOrderId: { type: String },
    signature: { type: String },
    status: { type: String, enum: ["created", "succeeded", "failed"], default: "created", index: true },
    rawWebhookData: { type: Schema.Types.Mixed },
    webhookPayload: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

PaymentSchema.index({ intentId: 1 }, { unique: true, sparse: true });
PaymentSchema.index({ gatewayPaymentId: 1 }, { unique: true, sparse: true });
PaymentSchema.index({ gatewayOrderId: 1 }, { sparse: true });
PaymentSchema.index({ razorpayPaymentId: 1 }, { sparse: true });
PaymentSchema.index({ razorpayOrderId: 1 }, { sparse: true });

export const Payment = mongoose.model<IPayment>("Payment", PaymentSchema);
