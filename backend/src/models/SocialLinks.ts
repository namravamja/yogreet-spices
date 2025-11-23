import mongoose, { Schema, Document } from "mongoose";

export interface ISocialLinks extends Document {
  website?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
}

const SocialLinksSchema = new Schema<ISocialLinks>(
  {
    website: { type: String },
    instagram: { type: String },
    facebook: { type: String },
    twitter: { type: String },
  },
  {
    timestamps: false,
  }
);

export const SocialLinks = mongoose.model<ISocialLinks>("SocialLinks", SocialLinksSchema);

