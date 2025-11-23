import mongoose, { Schema, Document } from "mongoose";

export interface ICart extends Document {
  buyerId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

const CartSchema = new Schema<ICart>(
  {
    buyerId: { type: Schema.Types.ObjectId, ref: "Buyer", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

CartSchema.index({ buyerId: 1, productId: 1 }, { unique: true });

export const Cart = mongoose.model<ICart>("Cart", CartSchema);

