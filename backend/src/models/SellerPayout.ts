import mongoose, { Schema, Document } from "mongoose";

export interface ISellerPayout extends Document {
  orderId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  gateway: "razorpay" | "stripe";
  released: boolean;
  releasedAt?: Date;
  transferId?: string;
  payoutId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SellerPayoutSchema = new Schema<ISellerPayout>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    sellerId: { type: Schema.Types.ObjectId, ref: "Seller", required: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    gateway: { type: String, enum: ["razorpay", "stripe"], required: true },
    released: { type: Boolean, default: false, index: true },
    releasedAt: { type: Date },
    transferId: { type: String },
    payoutId: { type: String },
  },
  { timestamps: true }
);

SellerPayoutSchema.index({ orderId: 1, sellerId: 1 }, { unique: true });

export const SellerPayout = mongoose.model<ISellerPayout>("SellerPayout", SellerPayoutSchema);
