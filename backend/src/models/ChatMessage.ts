import mongoose, { Schema, Document } from "mongoose";

export interface IChatMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  senderRole: "buyer" | "seller";
  text: string;
  imageUrl?: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: "ChatConversation", required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, required: true },
    senderRole: { type: String, enum: ["buyer", "seller"], required: true },
    text: { type: String, required: false, trim: true, maxlength: 2000, default: "" },
    imageUrl: { type: String, default: null },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const ChatMessage = mongoose.model<IChatMessage>("ChatMessage", ChatMessageSchema);
