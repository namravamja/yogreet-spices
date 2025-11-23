import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  rating: number;
  title: string;
  text: string;
  date: Date;
  verified: boolean;
  buyerId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
}

const ReviewSchema = new Schema<IReview>(
  {
    rating: { type: Number, required: true },
    title: { type: String, required: true },
    text: { type: String, required: true },
    date: { type: Date, default: Date.now },
    verified: { type: Boolean, default: false },
    buyerId: { type: Schema.Types.ObjectId, ref: "Buyer", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    sellerId: { type: Schema.Types.ObjectId, ref: "Seller", required: true },
  },
  {
    timestamps: false,
  }
);

export const Review = mongoose.model<IReview>("Review", ReviewSchema);

