import mongoose, { Schema, Document } from "mongoose";

export interface IAddress extends Document {
  firstName: string;
  lastName: string;
  company?: string;
  street?: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  userId: mongoose.Types.ObjectId;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    company: { type: String },
    street: { type: String },
    apartment: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: "Buyer", required: true },
    isDefault: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    collection: "buyer_addresses",
  }
);

export const Address = mongoose.model<IAddress>("Address", AddressSchema);

