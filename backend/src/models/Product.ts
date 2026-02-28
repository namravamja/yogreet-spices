import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  productName: string;
  category: string;
  subCategory?: string;
  typeOfSpice?: string;
  form?: string;
  shortDescription: string;
  productImages: string[];
  barcodeImage?: string | null;
  shippingCost: string;
  
  // About Product
  purityLevel?: string;
  originSource?: string;
  processingMethod?: string;
  shelfLife?: string;
  manufacturingDate?: Date;
  expiryDate?: Date;
  
  // Package pricing
  samplePrice?: string;
  sampleWeight?: string;
  sampleDescription?: string;
  smallPrice?: string;
  smallWeight?: string;
  smallDescription?: string;
  mediumPrice?: string;
  mediumWeight?: string;
  mediumDescription?: string;
  largePrice?: string;
  largeWeight?: string;
  largeDescription?: string;
  
  sellerId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    productName: { type: String, required: true },
    category: { type: String, required: true },
    subCategory: { type: String },
    typeOfSpice: { type: String },
    form: { type: String },
    shortDescription: { type: String, required: true },
    productImages: { type: [String], default: [] },
    barcodeImage: { type: String, default: null },
    shippingCost: { type: String, required: true },
    
    // About Product
    purityLevel: { type: String },
    originSource: { type: String },
    processingMethod: { type: String },
    shelfLife: { type: String },
    manufacturingDate: { type: Date },
    expiryDate: { type: Date },
    
    // Package pricing
    samplePrice: { type: String },
    sampleWeight: { type: String },
    sampleDescription: { type: String },
    smallPrice: { type: String },
    smallWeight: { type: String },
    smallDescription: { type: String },
    mediumPrice: { type: String },
    mediumWeight: { type: String },
    mediumDescription: { type: String },
    largePrice: { type: String },
    largeWeight: { type: String },
    largeDescription: { type: String },
    
    sellerId: { type: Schema.Types.ObjectId, ref: "Seller", required: true },
  },
  {
    timestamps: true,
  }
);

// Add virtual for reviews
ProductSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "productId",
});

ProductSchema.set("toObject", { virtuals: true });
ProductSchema.set("toJSON", { virtuals: true });

export const Product = mongoose.model<IProduct>("Product", ProductSchema);
