import mongoose, { Schema, Document } from "mongoose";

// Dispute timeline event interface
export interface IDisputeEvent {
  action: "created" | "evidence_added" | "admin_reviewed" | "resolved" | "escalated" | "comment_added";
  performedBy: {
    role: "buyer" | "seller" | "admin";
    userId: mongoose.Types.ObjectId;
    name?: string;
  };
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

// Product info stored in dispute for historical record
export interface IDisputeProduct {
  productId: mongoose.Types.ObjectId;
  productName: string;
  quantity: number;
  priceAtPurchase: number;
  sellerId: mongoose.Types.ObjectId;
  sellerName?: string;
  sellerEmail?: string;
  productBarcodeImage?: string;
}

// Evidence interface
export interface IDisputeEvidence {
  type: "image" | "document" | "description";
  url?: string;
  description?: string;
  uploadedBy: {
    role: "buyer" | "seller" | "admin";
    userId: mongoose.Types.ObjectId;
  };
  uploadedAt: Date;
}

export interface IDispute extends Document {
  // Core references
  orderId: mongoose.Types.ObjectId;
  buyerId: mongoose.Types.ObjectId;
  
  // Buyer info snapshot (for historical record)
  buyerInfo: {
    fullName: string;
    email: string;
    phone?: string;
  };
  
  // Order info snapshot
  orderInfo: {
    totalAmount: number;
    subtotal: number;
    shippingCost: number;
    taxAmount: number;
    currency: string;
    paymentMethod: string;
    gateway: string;
    placedAt: Date;
    deliveredAt?: Date;
  };
  
  // Products involved
  products: IDisputeProduct[];
  
  // Dispute details
  reason: "not_received" | "wrong_item" | "damaged" | "quality_issue" | "other";
  reasonDescription?: string;
  
  // Evidence from buyer
  buyerEvidence: {
    barcodeImage: string;
    additionalImages?: string[];
    description?: string;
  };
  
  // Evidence from seller (optional response)
  sellerEvidence?: {
    barcodeImage?: string;
    additionalImages?: string[];
    description?: string;
    respondedAt?: Date;
  };
  
  // All evidence collected
  evidenceHistory: IDisputeEvidence[];
  
  // Status
  status: "open" | "under_review" | "awaiting_seller" | "resolved" | "escalated";
  priority: "low" | "medium" | "high" | "critical";
  
  // Resolution details
  resolution?: {
    action: "refund" | "partial_refund" | "release_to_seller" | "rejected";
    refundAmount?: number;
    refundPercentage?: number;
    resolvedBy: mongoose.Types.ObjectId;
    resolvedByName?: string;
    resolvedAt: Date;
    notes?: string;
  };
  
  // Admin notes (internal)
  adminNotes: {
    note: string;
    addedBy: mongoose.Types.ObjectId;
    addedByName?: string;
    addedAt: Date;
  }[];
  
  // Timeline of all actions
  timeline: IDisputeEvent[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const DisputeEventSchema = new Schema<IDisputeEvent>(
  {
    action: {
      type: String,
      enum: ["created", "evidence_added", "admin_reviewed", "resolved", "escalated", "comment_added"],
      required: true,
    },
    performedBy: {
      role: { type: String, enum: ["buyer", "seller", "admin"], required: true },
      userId: { type: Schema.Types.ObjectId, required: true },
      name: { type: String },
    },
    description: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const DisputeProductSchema = new Schema<IDisputeProduct>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    priceAtPurchase: { type: Number, required: true },
    sellerId: { type: Schema.Types.ObjectId, ref: "Seller", required: true },
    sellerName: { type: String },
    sellerEmail: { type: String },
    productBarcodeImage: { type: String },
  },
  { _id: false }
);

const DisputeEvidenceSchema = new Schema<IDisputeEvidence>(
  {
    type: { type: String, enum: ["image", "document", "description"], required: true },
    url: { type: String },
    description: { type: String },
    uploadedBy: {
      role: { type: String, enum: ["buyer", "seller", "admin"], required: true },
      userId: { type: Schema.Types.ObjectId, required: true },
    },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const DisputeSchema = new Schema<IDispute>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    buyerId: { type: Schema.Types.ObjectId, ref: "Buyer", required: true, index: true },
    
    buyerInfo: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String },
    },
    
    orderInfo: {
      totalAmount: { type: Number, required: true },
      subtotal: { type: Number, required: true },
      shippingCost: { type: Number, required: true },
      taxAmount: { type: Number, required: true },
      currency: { type: String, required: true },
      paymentMethod: { type: String, required: true },
      gateway: { type: String, required: true },
      placedAt: { type: Date, required: true },
      deliveredAt: { type: Date },
    },
    
    products: [DisputeProductSchema],
    
    reason: {
      type: String,
      enum: ["not_received", "wrong_item", "damaged", "quality_issue", "other"],
      default: "not_received",
    },
    reasonDescription: { type: String },
    
    buyerEvidence: {
      barcodeImage: { type: String, required: true },
      additionalImages: [{ type: String }],
      description: { type: String },
    },
    
    sellerEvidence: {
      barcodeImage: { type: String },
      additionalImages: [{ type: String }],
      description: { type: String },
      respondedAt: { type: Date },
    },
    
    evidenceHistory: [DisputeEvidenceSchema],
    
    status: {
      type: String,
      enum: ["open", "under_review", "awaiting_seller", "resolved", "escalated"],
      default: "open",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    
    resolution: {
      action: { type: String, enum: ["refund", "partial_refund", "release_to_seller", "rejected"] },
      refundAmount: { type: Number },
      refundPercentage: { type: Number },
      resolvedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
      resolvedByName: { type: String },
      resolvedAt: { type: Date },
      notes: { type: String },
    },
    
    adminNotes: [
      {
        note: { type: String, required: true },
        addedBy: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
        addedByName: { type: String },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    
    timeline: [DisputeEventSchema],
  },
  { timestamps: true }
);

// Compound indexes
DisputeSchema.index({ status: 1, createdAt: -1 });
DisputeSchema.index({ buyerId: 1, createdAt: -1 });
DisputeSchema.index({ "products.sellerId": 1 });

export const Dispute = mongoose.model<IDispute>("Dispute", DisputeSchema);
