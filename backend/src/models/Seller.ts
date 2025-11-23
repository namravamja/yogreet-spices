import mongoose, { Schema, Document } from "mongoose";

export interface ISeller extends Document {
  fullName?: string;
  email: string;
  mobile?: string;
  password?: string;
  businessType?: string;
  productCategories: string[];
  businessLogo?: string;
  about?: string;
  storePhotos: string[];
  profileCompletion: number;
  documentCompletion: number;
  companyName?: string;
  
  googleId?: string;
  provider?: string;
  isOAuthUser: boolean;
  
  businessAddressId?: mongoose.Types.ObjectId;
  documentsId?: mongoose.Types.ObjectId;
  socialLinksId?: mongoose.Types.ObjectId;
  
  bankName?: string;
  upiId?: string;
  
  createdAt: Date;
  updatedAt?: Date;
  isAuthenticated: boolean;
  forgotPasswordToken?: string;
  forgotPasswordExpires?: Date;
  verifyToken?: string;
  verifyExpires?: Date;
  isVerified: boolean;
}

const SellerSchema = new Schema<ISeller>(
  {
    fullName: { type: String },
    email: { type: String, required: true, unique: true },
    mobile: { type: String },
    password: { type: String },
    businessType: { type: String },
    productCategories: { type: [String], default: [] },
    businessLogo: { type: String },
    about: { type: String },
    storePhotos: { type: [String], default: [] },
    profileCompletion: { type: Number, default: 0 },
    documentCompletion: { type: Number, default: 0 },
    companyName: { type: String },
    
    googleId: { type: String, unique: true, sparse: true },
    provider: { type: String, default: "local" },
    isOAuthUser: { type: Boolean, default: false },
    
    businessAddressId: { type: Schema.Types.ObjectId, ref: "BusinessAddress", unique: true, sparse: true },
    documentsId: { type: Schema.Types.ObjectId, ref: "Documents", unique: true, sparse: true },
    socialLinksId: { type: Schema.Types.ObjectId, ref: "SocialLinks", unique: true, sparse: true },
    
    bankName: { type: String },
    upiId: { type: String },
    
    isAuthenticated: { type: Boolean, default: false },
    forgotPasswordToken: { type: String, unique: true, sparse: true },
    forgotPasswordExpires: { type: Date },
    verifyToken: { type: String, unique: true, sparse: true },
    verifyExpires: { type: Date },
    isVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Add virtual for reviews
SellerSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "sellerId",
});

SellerSchema.set("toObject", { virtuals: true });
SellerSchema.set("toJSON", { virtuals: true });

export const Seller = mongoose.model<ISeller>("Seller", SellerSchema);

