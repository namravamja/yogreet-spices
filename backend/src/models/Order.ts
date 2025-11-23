import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  buyerId: mongoose.Types.ObjectId;
  totalAmount: number;
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

