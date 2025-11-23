import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem extends Document {
  orderId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  quantity: number;
  priceAtPurchase: number;
  sellerId: mongoose.Types.ObjectId;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true },
    priceAtPurchase: { type: Number, required: true },
    sellerId: { type: Schema.Types.ObjectId, ref: "Seller", required: true },
  },
  {
    timestamps: false,
  }
);

export const OrderItem = mongoose.model<IOrderItem>("OrderItem", OrderItemSchema);

