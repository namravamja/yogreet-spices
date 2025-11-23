import mongoose, { Schema, Document } from "mongoose";

export interface IBusinessAddress extends Document {
  street: string;
  city?: string;
  state?: string;
  country?: string;
  pinCode?: string;
}

const BusinessAddressSchema = new Schema<IBusinessAddress>(
  {
    street: { type: String, required: true },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    pinCode: { type: String },
  },
  {
    timestamps: false,
  }
);

export const BusinessAddress = mongoose.model<IBusinessAddress>("BusinessAddress", BusinessAddressSchema);

