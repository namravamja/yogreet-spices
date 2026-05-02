import mongoose, { Schema, Document } from "mongoose";

export interface IDeliveryPartner extends Document {
  // Identity
  name: string;
  email: string;
  password: string;
  
  // Contact Information
  phone: string;
  alternatePhone?: string;
  
  // Operational Details
  operatingRegions: string[]; // Countries served
  serviceType: "air" | "sea" | "multimodal";
  
  // Authentication
  isAuthenticated: boolean;
  forgotPasswordToken?: string;
  forgotPasswordExpires?: Date;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

const DeliveryPartnerSchema = new Schema<IDeliveryPartner>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    alternatePhone: { type: String },
    operatingRegions: { type: [String], default: [] },
    serviceType: { 
      type: String, 
      enum: ["air", "sea", "multimodal"], 
      default: "multimodal" 
    },
    isAuthenticated: { type: Boolean, default: false },
    forgotPasswordToken: { type: String, unique: true, sparse: true },
    forgotPasswordExpires: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Create index on email for authentication queries
DeliveryPartnerSchema.index({ email: 1 });

export const DeliveryPartner = mongoose.model<IDeliveryPartner>(
  "DeliveryPartner",
  DeliveryPartnerSchema
);
