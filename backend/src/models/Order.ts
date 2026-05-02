import mongoose, { Schema, Document } from "mongoose";

// Order Status Type
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "seller_preparing"
  | "ready_for_pickup"
  | "pickup_assigned"
  | "picked_up"
  | "in_transit"
  | "customs_processing"
  | "out_for_delivery"
  | "delivered"
  | "completed"
  | "pickup_failed"
  | "delivery_failed"
  | "reschedule_requested"
  | "returned"
  | "cancelled"
  | "damaged_reported";

// Issue Type
export type IssueType =
  | "seller_not_ready"
  | "package_damaged"
  | "address_issue"
  | "customs_hold"
  | "customer_unavailable"
  | "delivery_delayed"
  | "payment_issue"
  | "return_initiated"
  | "missing_package";

// Delivery Log Entry
export interface IDeliveryLog {
  status: OrderStatus;
  actor: {
    role: "buyer" | "seller" | "delivery_partner" | "admin" | "system";
    userId?: mongoose.Types.ObjectId;
    name?: string;
  };
  timestamp: Date;
  notes?: string;
  metadata?: Record<string, any>;
}

// Delivery Issue
export interface IDeliveryIssue {
  type: IssueType;
  description: string;
  reportedBy: {
    role: "delivery_partner";
    userId: mongoose.Types.ObjectId;
  };
  reportedAt: Date;
  images?: string[];
  resolved: boolean;
  resolvedAt?: Date;
  resolution?: string;
}

export interface IOrder extends Document {
  buyerId: mongoose.Types.ObjectId;
  sellerId?: mongoose.Types.ObjectId;
  totalAmount: number;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  status: OrderStatus;
  shippingAddressId?: mongoose.Types.ObjectId;
  paymentMethod: string;
  paymentStatus: "pending" | "held" | "released" | "refunded";
  deliveryStatus: "pending" | "delivered" | "disputed";
  gateway?: "razorpay" | "stripe";
  currency?: string;
  mode?: "test" | "live";
  deliveredAt?: Date | null;
  autoReleaseAt?: Date | null;
  buyerBarcodeImage?: string | null;
  disputeId?: mongoose.Types.ObjectId | null;
  placedAt: Date;
  updatedAt: Date;
  
  // Delivery Partner Fields
  deliveryPartnerId?: mongoose.Types.ObjectId;
  deliveryPartnerType?: "universal" | null;
  assignedAt?: Date;
  pickupTime?: Date;
  deliveredTime?: Date;
  
  // Proof Images
  pickupProofImages: string[];
  deliveryProofImages: string[];
  
  // Delivery Timeline
  deliveryLogs: IDeliveryLog[];
  
  // Issue Tracking
  deliveryIssue?: IDeliveryIssue;
}

const OrderSchema = new Schema<IOrder>(
  {
    buyerId: { type: Schema.Types.ObjectId, ref: "Buyer", required: true },
    sellerId: { type: Schema.Types.ObjectId, ref: "Seller" },
    totalAmount: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, required: true, default: 0 },
    taxAmount: { type: Number, required: true, default: 0 },
    status: { 
      type: String, 
      enum: [
        "pending",
        "confirmed",
        "seller_preparing",
        "ready_for_pickup",
        "pickup_assigned",
        "picked_up",
        "in_transit",
        "customs_processing",
        "out_for_delivery",
        "delivered",
        "completed",
        "pickup_failed",
        "delivery_failed",
        "reschedule_requested",
        "returned",
        "cancelled",
        "damaged_reported"
      ],
      default: "pending" 
    },
    shippingAddressId: { type: Schema.Types.ObjectId, ref: "Address" },
    paymentMethod: { type: String, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "held", "released", "refunded"],
      default: "pending",
      index: true,
    },
    deliveryStatus: {
      type: String,
      enum: ["pending", "delivered", "disputed"],
      default: "pending",
      index: true,
    },
    gateway: {
      type: String,
      enum: ["razorpay", "stripe"],
      default: "razorpay",
    },
    currency: { type: String, default: "INR" },
    mode: { type: String, enum: ["test", "live"], default: "test" },
    deliveredAt: { type: Date, default: null },
    autoReleaseAt: { type: Date, default: null, index: true },
    buyerBarcodeImage: { type: String, default: null },
    disputeId: { type: Schema.Types.ObjectId, ref: "Dispute", default: null },
    placedAt: { type: Date, default: Date.now },
    
    // Delivery Partner Fields
    deliveryPartnerId: { type: Schema.Types.ObjectId, ref: "DeliveryPartner" },
    deliveryPartnerType: { type: String, enum: ["universal", null], default: null },
    assignedAt: { type: Date },
    pickupTime: { type: Date },
    deliveredTime: { type: Date },
    
    // Proof Images
    pickupProofImages: { type: [String], default: [] },
    deliveryProofImages: { type: [String], default: [] },
    
    // Delivery Timeline
    deliveryLogs: {
      type: [{
        status: { type: String, required: true },
        actor: {
          role: { 
            type: String, 
            enum: ["buyer", "seller", "delivery_partner", "admin", "system"],
            required: true 
          },
          userId: { type: Schema.Types.ObjectId },
          name: { type: String }
        },
        timestamp: { type: Date, default: Date.now },
        notes: { type: String },
        metadata: { type: Schema.Types.Mixed }
      }],
      default: []
    },
    
    // Issue Tracking (optional subdocument)
    deliveryIssue: {
      type: new Schema({
        type: { 
          type: String, 
          enum: [
            "seller_not_ready",
            "package_damaged",
            "address_issue",
            "customs_hold",
            "customer_unavailable",
            "delivery_delayed",
            "payment_issue",
            "return_initiated",
            "missing_package"
          ],
          required: true 
        },
        description: { type: String, required: true },
        reportedBy: {
          type: new Schema({
            role: { type: String, enum: ["delivery_partner"], required: true },
            userId: { type: Schema.Types.ObjectId, required: true }
          }, { _id: false }),
          required: true
        },
        reportedAt: { type: Date, default: Date.now },
        images: { type: [String], default: [] },
        resolved: { type: Boolean, default: false },
        resolvedAt: { type: Date },
        resolution: { type: String }
      }, { _id: false })
    }
  },
  {
    timestamps: true,
  }
);

OrderSchema.index({ buyerId: 1, placedAt: -1 });
OrderSchema.index({ gateway: 1 });
OrderSchema.index({ deliveryPartnerId: 1 });
OrderSchema.index({ status: 1 });

export const Order = mongoose.model<IOrder>("Order", OrderSchema);
