import mongoose, { Schema, Document } from "mongoose";

export interface IDiscount extends Document {
  sellerId: mongoose.Types.ObjectId;
  code: string;
  name: string;
  description?: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  applicableProducts?: mongoose.Types.ObjectId[];
  applicableCategories?: string[];
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DiscountSchema = new Schema<IDiscount>(
  {
    sellerId: { type: Schema.Types.ObjectId, ref: "Seller", required: true, index: true },
    code: { 
      type: String, 
      required: true, 
      uppercase: true,
      trim: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    type: { 
      type: String, 
      enum: ["percentage", "fixed"], 
      required: true,
      default: "percentage",
    },
    value: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0, min: 0 },
    maxDiscountAmount: { type: Number, default: null },
    usageLimit: { type: Number, default: null },
    usedCount: { type: Number, default: 0, min: 0 },
    applicableProducts: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    applicableCategories: [{ type: String }],
    isActive: { type: Boolean, default: true, index: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique code per seller
DiscountSchema.index({ sellerId: 1, code: 1 }, { unique: true });

// Index for finding active discounts
DiscountSchema.index({ sellerId: 1, isActive: 1, startDate: 1, endDate: 1 });

export const Discount = mongoose.model<IDiscount>("Discount", DiscountSchema);
