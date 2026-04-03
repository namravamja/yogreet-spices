import mongoose, { Schema, Document } from "mongoose";

export interface IChatConversation extends Document {
  buyerId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  lastMessage?: string;
  lastMessageAt?: Date;
  buyerUnreadCount: number;
  sellerUnreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ChatConversationSchema = new Schema<IChatConversation>(
  {
    buyerId: { type: Schema.Types.ObjectId, ref: "Buyer", required: true },
    sellerId: { type: Schema.Types.ObjectId, ref: "Seller", required: true },
    lastMessage: { type: String, default: "" },
    lastMessageAt: { type: Date, default: Date.now },
    buyerUnreadCount: { type: Number, default: 0 },
    sellerUnreadCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Unique conversation per buyer-seller pair
ChatConversationSchema.index({ buyerId: 1, sellerId: 1 }, { unique: true });

export const ChatConversation = mongoose.model<IChatConversation>("ChatConversation", ChatConversationSchema);
