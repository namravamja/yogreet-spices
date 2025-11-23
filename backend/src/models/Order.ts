import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  buyerId: mongoose.Types.ObjectId;
  totalAmount: number;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  status: string;
  shippingAddressId?: mongoose.Types.ObjectId;
  paymentMethod: string;
  paymentStatus: string;
  placedAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    buyerId: { type: Schema.Types.ObjectId, ref: "Buyer", required: true },
    totalAmount: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, required: true, default: 0 },
    taxAmount: { type: Number, required: true, default: 0 },
    status: { type: String, default: "pending" },
    shippingAddressId: { type: Schema.Types.ObjectId, ref: "Address" },
    paymentMethod: { type: String, required: true },
    paymentStatus: { type: String, default: "unpaid" },
    placedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model<IOrder>("Order", OrderSchema);

