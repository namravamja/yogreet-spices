import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  buyerId: mongoose.Types.ObjectId;
  sellerId?: mongoose.Types.ObjectId;
  totalAmount: number;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  status: string;
  shippingAddressId?: mongoose.Types.ObjectId;
  paymentMethod: string;
  paymentStatus: "pending" | "held" | "released" | "refunded";
  deliveryStatus: "pending" | "delivered" | "disputed";
  gateway?: "razorpay" | "stripe";
  currency?: string;
  mode?: "test" | "live";
  deliveredAt?: Date | null;
  autoReleaseAt?: Date | null;
  buyerBarcodeImage?: string | null;
  placedAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    buyerId: { type: Schema.Types.ObjectId, ref: "Buyer", required: true },
    sellerId: { type: Schema.Types.ObjectId, ref: "Seller" },
    totalAmount: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, required: true, default: 0 },
    taxAmount: { type: Number, required: true, default: 0 },
    status: { type: String, default: "pending" },
    shippingAddressId: { type: Schema.Types.ObjectId, ref: "Address" },
    paymentMethod: { type: String, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "held", "released", "refunded"],
      default: "pending",
      index: true,
    },
    deliveryStatus: {
      type: String,
      enum: ["pending", "delivered", "disputed"],
      default: "pending",
      index: true,
    },
    gateway: {
      type: String,
      enum: ["razorpay", "stripe"],
      default: "razorpay",
    },
    currency: { type: String, default: "INR" },
    mode: { type: String, enum: ["test", "live"], default: "test" },
    deliveredAt: { type: Date, default: null },
    autoReleaseAt: { type: Date, default: null, index: true },
    buyerBarcodeImage: { type: String, default: null },
    placedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

OrderSchema.index({ buyerId: 1, placedAt: -1 });
OrderSchema.index({ gateway: 1 });

export const Order = mongoose.model<IOrder>("Order", OrderSchema);
