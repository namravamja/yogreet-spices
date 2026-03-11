import mongoose from "mongoose";
import * as XLSX from "xlsx";
import { Dispute, IDispute, IDisputeEvent, IDisputeProduct, IDisputeEvidence } from "../../models/Dispute";
import { Order } from "../../models/Order";
import { OrderItem } from "../../models/OrderItem";
import { Buyer } from "../../models/Buyer";
import { Product } from "../../models/Product";
import { Seller } from "../../models/Seller";
import { Payment } from "../../models/Payment";
import { SellerPayout } from "../../models/SellerPayout";
import { Admin } from "../../models/Admin";

interface CreateDisputeInput {
  orderId: string;
  buyerId: string;
  reason?: "not_received" | "wrong_item" | "damaged" | "quality_issue" | "other";
  reasonDescription?: string;
  barcodeImage: string;
  additionalImages?: string[];
  description?: string;
}

interface ResolveDisputeInput {
  disputeId: string;
  adminId: string;
  action: "refund" | "partial_refund" | "release_to_seller" | "rejected";
  refundAmount?: number;
  refundPercentage?: number;
  notes?: string;
}

interface AddAdminNoteInput {
  disputeId: string;
  adminId: string;
  note: string;
}

interface AddEvidenceInput {
  disputeId: string;
  userId: string;
  role: "buyer" | "seller" | "admin";
  type: "image" | "document" | "description";
  url?: string;
  description?: string;
}

// Create a new dispute
export const createDispute = async (input: CreateDisputeInput): Promise<IDispute> => {
  const { orderId, buyerId, reason, reasonDescription, barcodeImage, additionalImages, description } = input;

  // Get order with all details
  const order = await Order.findById(orderId).lean();
  if (!order) throw new Error("Order not found");

  // Check if dispute already exists for this order
  const existingDispute = await Dispute.findOne({ orderId: new mongoose.Types.ObjectId(orderId) });
  if (existingDispute) throw new Error("Dispute already exists for this order");

  // Get buyer info
  const buyer = await Buyer.findById(buyerId).lean();
  if (!buyer) throw new Error("Buyer not found");

  // Get order items with product and seller details
  const orderItems = await OrderItem.find({ orderId: new mongoose.Types.ObjectId(orderId) }).lean();
  
  const products: IDisputeProduct[] = [];
  for (const item of orderItems) {
    const product = await Product.findById(item.productId).select("productName barcodeImage").lean();
    const seller = await Seller.findById(item.sellerId).select("fullName email companyName").lean();
    
    products.push({
      productId: item.productId,
      productName: (product as any)?.productName || "Unknown Product",
      quantity: item.quantity,
      priceAtPurchase: item.priceAtPurchase,
      sellerId: item.sellerId,
      sellerName: (seller as any)?.companyName || (seller as any)?.fullName || "Unknown Seller",
      sellerEmail: (seller as any)?.email,
      productBarcodeImage: (product as any)?.barcodeImage,
    });
  }

  // Create initial timeline event
  const initialEvent: IDisputeEvent = {
    action: "created",
    performedBy: {
      role: "buyer",
      userId: new mongoose.Types.ObjectId(buyerId),
      name: `${(buyer as any).firstName || ""} ${(buyer as any).lastName || ""}`.trim(),
    },
    description: `Dispute created by buyer: ${reason || "not_received"}`,
    metadata: { reason, reasonDescription },
    createdAt: new Date(),
  };

  // Create initial evidence record
  const initialEvidence: IDisputeEvidence = {
    type: "image",
    url: barcodeImage,
    description: description || "Buyer barcode image as proof",
    uploadedBy: {
      role: "buyer",
      userId: new mongoose.Types.ObjectId(buyerId),
    },
    uploadedAt: new Date(),
  };

  // Determine priority based on order amount
  let priority: "low" | "medium" | "high" | "critical" = "medium";
  if (order.totalAmount > 50000) priority = "critical";
  else if (order.totalAmount > 20000) priority = "high";
  else if (order.totalAmount < 5000) priority = "low";

  // Create the dispute
  const dispute = new Dispute({
    orderId: new mongoose.Types.ObjectId(orderId),
    buyerId: new mongoose.Types.ObjectId(buyerId),
    buyerInfo: {
      fullName: `${(buyer as any).firstName || ""} ${(buyer as any).lastName || ""}`.trim(),
      email: (buyer as any).email,
      phone: (buyer as any).phone,
    },
    orderInfo: {
      totalAmount: order.totalAmount,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      taxAmount: order.taxAmount,
      currency: order.currency || "INR",
      paymentMethod: order.paymentMethod,
      gateway: order.gateway || "razorpay",
      placedAt: order.placedAt,
      deliveredAt: order.deliveredAt,
    },
    products,
    reason: reason || "not_received",
    reasonDescription,
    buyerEvidence: {
      barcodeImage,
      additionalImages: additionalImages || [],
      description,
    },
    evidenceHistory: [initialEvidence],
    status: "open",
    priority,
    timeline: [initialEvent],
    adminNotes: [],
  });

  await dispute.save();

  // Update order with dispute reference
  await Order.findByIdAndUpdate(orderId, {
    deliveryStatus: "disputed",
    buyerBarcodeImage: barcodeImage,
    disputeId: dispute._id,
  });

  return dispute;
};

// Get all disputes for admin
export const getAllDisputes = async (filters?: {
  status?: string;
  priority?: string;
  sellerId?: string;
  buyerId?: string;
}): Promise<IDispute[]> => {
  const query: any = {};
  
  if (filters?.status) query.status = filters.status;
  if (filters?.priority) query.priority = filters.priority;
  if (filters?.buyerId) query.buyerId = new mongoose.Types.ObjectId(filters.buyerId);
  if (filters?.sellerId) query["products.sellerId"] = new mongoose.Types.ObjectId(filters.sellerId);

  const disputes = await Dispute.find(query)
    .sort({ createdAt: -1 })
    .lean();

  return disputes;
};

// Get dispute by ID
export const getDisputeById = async (disputeId: string): Promise<IDispute | null> => {
  return Dispute.findById(disputeId).lean();
};

// Get dispute by order ID
export const getDisputeByOrderId = async (orderId: string): Promise<IDispute | null> => {
  return Dispute.findOne({ orderId: new mongoose.Types.ObjectId(orderId) }).lean();
};

// Update dispute status
export const updateDisputeStatus = async (
  disputeId: string,
  status: "open" | "under_review" | "awaiting_seller" | "resolved" | "escalated",
  adminId: string
): Promise<IDispute | null> => {
  const admin = await Admin.findById(adminId).lean();
  
  const event: IDisputeEvent = {
    action: status === "escalated" ? "escalated" : "admin_reviewed",
    performedBy: {
      role: "admin",
      userId: new mongoose.Types.ObjectId(adminId),
      name: (admin as any)?.username || "Admin",
    },
    description: `Status updated to: ${status}`,
    metadata: { previousStatus: null, newStatus: status },
    createdAt: new Date(),
  };

  return Dispute.findByIdAndUpdate(
    disputeId,
    {
      status,
      $push: { timeline: event },
    },
    { new: true }
  ).lean();
};

// Resolve dispute
export const resolveDispute = async (input: ResolveDisputeInput): Promise<IDispute | null> => {
  const { disputeId, adminId, action, refundAmount, refundPercentage, notes } = input;

  const dispute = await Dispute.findById(disputeId);
  if (!dispute) throw new Error("Dispute not found");

  const admin = await Admin.findById(adminId).lean();
  const adminName = (admin as any)?.username || "Admin";

  const order = await Order.findById(dispute.orderId);
  if (!order) throw new Error("Order not found");

  // Handle payment based on action
  if (action === "refund" || action === "partial_refund") {
    // Update payment records
    await Payment.updateMany(
      { orderId: dispute.orderId, gateway: order.gateway || "razorpay" },
      { $set: { status: "failed" } }
    );
    order.paymentStatus = "refunded";
  } else if (action === "release_to_seller") {
    // Release funds to seller(s)
    const items = await OrderItem.find({ orderId: dispute.orderId }).lean();
    const totalsBySeller = new Map<string, number>();
    
    for (const it of items) {
      const seller = (it as any).sellerId?.toString();
      if (!seller) continue;
      const total = (it as any).priceAtPurchase * (it as any).quantity;
      totalsBySeller.set(seller, (totalsBySeller.get(seller) || 0) + total);
    }

    for (const [sellerId, amount] of totalsBySeller.entries()) {
      const existing = await SellerPayout.findOne({
        orderId: dispute.orderId,
        sellerId: new mongoose.Types.ObjectId(sellerId),
      });
      if (existing?.released) continue;

      await SellerPayout.findOneAndUpdate(
        { orderId: dispute.orderId, sellerId: new mongoose.Types.ObjectId(sellerId) },
        {
          orderId: dispute.orderId,
          sellerId: new mongoose.Types.ObjectId(sellerId),
          amount,
          currency: order.currency || "INR",
          gateway: order.gateway || "razorpay",
          released: true,
          releasedAt: new Date(),
        },
        { upsert: true }
      );
    }
    order.paymentStatus = "released";
    order.deliveryStatus = "delivered";
  }

  await order.save();

  // Create resolution timeline event
  const resolutionEvent: IDisputeEvent = {
    action: "resolved",
    performedBy: {
      role: "admin",
      userId: new mongoose.Types.ObjectId(adminId),
      name: adminName,
    },
    description: `Dispute resolved with action: ${action}${refundAmount ? ` (Amount: ${refundAmount})` : ""}`,
    metadata: { action, refundAmount, refundPercentage, notes },
    createdAt: new Date(),
  };

  // Update dispute with resolution
  dispute.status = "resolved";
  dispute.resolution = {
    action,
    refundAmount,
    refundPercentage,
    resolvedBy: new mongoose.Types.ObjectId(adminId),
    resolvedByName: adminName,
    resolvedAt: new Date(),
    notes,
  };
  dispute.timeline.push(resolutionEvent);

  await dispute.save();

  return dispute;
};

// Add admin note
export const addAdminNote = async (input: AddAdminNoteInput): Promise<IDispute | null> => {
  const { disputeId, adminId, note } = input;

  const admin = await Admin.findById(adminId).lean();
  const adminName = (admin as any)?.username || "Admin";

  const noteEntry = {
    note,
    addedBy: new mongoose.Types.ObjectId(adminId),
    addedByName: adminName,
    addedAt: new Date(),
  };

  const event: IDisputeEvent = {
    action: "comment_added",
    performedBy: {
      role: "admin",
      userId: new mongoose.Types.ObjectId(adminId),
      name: adminName,
    },
    description: "Admin added a note",
    metadata: { note },
    createdAt: new Date(),
  };

  return Dispute.findByIdAndUpdate(
    disputeId,
    {
      $push: { adminNotes: noteEntry, timeline: event },
    },
    { new: true }
  ).lean();
};

// Add evidence
export const addEvidence = async (input: AddEvidenceInput): Promise<IDispute | null> => {
  const { disputeId, userId, role, type, url, description } = input;

  const evidence: IDisputeEvidence = {
    type,
    url,
    description,
    uploadedBy: {
      role,
      userId: new mongoose.Types.ObjectId(userId),
    },
    uploadedAt: new Date(),
  };

  // Get user name based on role
  let userName = "";
  if (role === "buyer") {
    const buyer = await Buyer.findById(userId).lean();
    userName = `${(buyer as any)?.firstName || ""} ${(buyer as any)?.lastName || ""}`.trim();
  } else if (role === "seller") {
    const seller = await Seller.findById(userId).lean();
    userName = (seller as any)?.companyName || (seller as any)?.fullName || "";
  } else {
    const admin = await Admin.findById(userId).lean();
    userName = (admin as any)?.username || "Admin";
  }

  const event: IDisputeEvent = {
    action: "evidence_added",
    performedBy: {
      role,
      userId: new mongoose.Types.ObjectId(userId),
      name: userName,
    },
    description: `${role.charAt(0).toUpperCase() + role.slice(1)} added ${type} evidence`,
    metadata: { type, url, description },
    createdAt: new Date(),
  };

  // If seller is adding evidence, update sellerEvidence
  const updateQuery: any = {
    $push: { evidenceHistory: evidence, timeline: event },
  };

  if (role === "seller" && type === "image" && url) {
    updateQuery.$set = {
      "sellerEvidence.barcodeImage": url,
      "sellerEvidence.description": description,
      "sellerEvidence.respondedAt": new Date(),
    };
  }

  return Dispute.findByIdAndUpdate(disputeId, updateQuery, { new: true }).lean();
};

// Update priority
export const updatePriority = async (
  disputeId: string,
  priority: "low" | "medium" | "high" | "critical",
  adminId: string
): Promise<IDispute | null> => {
  const admin = await Admin.findById(adminId).lean();

  const event: IDisputeEvent = {
    action: "admin_reviewed",
    performedBy: {
      role: "admin",
      userId: new mongoose.Types.ObjectId(adminId),
      name: (admin as any)?.username || "Admin",
    },
    description: `Priority updated to: ${priority}`,
    metadata: { priority },
    createdAt: new Date(),
  };

  return Dispute.findByIdAndUpdate(
    disputeId,
    {
      priority,
      $push: { timeline: event },
    },
    { new: true }
  ).lean();
};

// Get dispute statistics
export const getDisputeStats = async () => {
  const [total, open, underReview, resolved, highPriority] = await Promise.all([
    Dispute.countDocuments(),
    Dispute.countDocuments({ status: "open" }),
    Dispute.countDocuments({ status: "under_review" }),
    Dispute.countDocuments({ status: "resolved" }),
    Dispute.countDocuments({ priority: { $in: ["high", "critical"] } }),
  ]);

  return {
    total,
    open,
    underReview,
    resolved,
    highPriority,
  };
};

// Export disputes to Excel
export const exportDisputesToExcel = async (filters?: {
  status?: string;
  priority?: string;
  startDate?: string;
  endDate?: string;
}): Promise<Buffer> => {
  const query: any = {};
  
  if (filters?.status) query.status = filters.status;
  if (filters?.priority) query.priority = filters.priority;
  if (filters?.startDate || filters?.endDate) {
    query.createdAt = {};
    if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
    if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
  }

  const disputes = await Dispute.find(query).sort({ createdAt: -1 }).lean();

  // Format reason labels
  const reasonLabels: Record<string, string> = {
    not_received: "Product Not Received",
    wrong_item: "Wrong Item Received",
    damaged: "Product Damaged",
    quality_issue: "Quality Issue",
    other: "Other",
  };

  // Format resolution labels
  const resolutionLabels: Record<string, string> = {
    refund: "Full Refund to Buyer",
    partial_refund: "Partial Refund",
    release_to_seller: "Released to Seller",
    rejected: "Dispute Rejected",
  };

  // Main disputes sheet
  const mainSheetData = disputes.map((d, index) => ({
    "S.No": index + 1,
    "Dispute ID": d._id?.toString() || "",
    "Order ID": d.orderId?.toString() || "",
    "Status": d.status?.toUpperCase() || "",
    "Priority": d.priority?.toUpperCase() || "",
    "Reason": reasonLabels[d.reason] || d.reason || "",
    "Reason Description": d.reasonDescription || "",
    "Buyer Name": d.buyerInfo?.fullName || "",
    "Buyer Email": d.buyerInfo?.email || "",
    "Buyer Phone": d.buyerInfo?.phone || "",
    "Order Total": d.orderInfo?.totalAmount || 0,
    "Currency": d.orderInfo?.currency || "INR",
    "Payment Method": d.orderInfo?.paymentMethod || "",
    "Payment Gateway": d.orderInfo?.gateway || "",
    "Order Placed At": d.orderInfo?.placedAt ? new Date(d.orderInfo.placedAt).toLocaleString() : "",
    "Delivered At": d.orderInfo?.deliveredAt ? new Date(d.orderInfo.deliveredAt).toLocaleString() : "",
    "Dispute Created": d.createdAt ? new Date(d.createdAt).toLocaleString() : "",
    "Dispute Resolved": d.resolution?.resolvedAt ? new Date(d.resolution.resolvedAt).toLocaleString() : "",
    "Resolution": d.resolution?.action ? resolutionLabels[d.resolution.action] : "Pending",
    "Refund Amount": d.resolution?.refundAmount || "",
    "Resolution Notes": d.resolution?.notes || "",
    "No. of Products": d.products?.length || 0,
    "Buyer Evidence Link": d.buyerEvidence?.barcodeImage || "",
    "Buyer Evidence Description": d.buyerEvidence?.description || "",
    "Seller Response": d.sellerEvidence?.barcodeImage ? "Yes" : "No",
    "Admin Notes Count": d.adminNotes?.length || 0,
    "Timeline Events": d.timeline?.length || 0,
  }));

  // Products sheet (detailed breakdown)
  const productsData: any[] = [];
  disputes.forEach((d) => {
    if (d.products && d.products.length > 0) {
      d.products.forEach((p, pIndex) => {
        productsData.push({
          "Dispute ID": d._id?.toString() || "",
          "Order ID": d.orderId?.toString() || "",
          "Product S.No": pIndex + 1,
          "Product ID": p.productId?.toString() || "",
          "Product Name": p.productName || "",
          "Seller ID": p.sellerId?.toString() || "",
          "Seller Name": p.sellerName || "",
          "Seller Email": p.sellerEmail || "",
          "Quantity": p.quantity || 0,
          "Price at Purchase": p.priceAtPurchase || 0,
          "Total": (p.quantity || 0) * (p.priceAtPurchase || 0),
          "Product Barcode Image": p.productBarcodeImage || "",
        });
      });
    }
  });

  // Timeline sheet (audit trail)
  const timelineData: any[] = [];
  disputes.forEach((d) => {
    if (d.timeline && d.timeline.length > 0) {
      d.timeline.forEach((t, tIndex) => {
        timelineData.push({
          "Dispute ID": d._id?.toString() || "",
          "Order ID": d.orderId?.toString() || "",
          "Event S.No": tIndex + 1,
          "Action": t.action || "",
          "Description": t.description || "",
          "Performed By Role": t.performedBy?.role || "",
          "Performed By Name": t.performedBy?.name || "",
          "Performed At": t.createdAt ? new Date(t.createdAt).toLocaleString() : "",
        });
      });
    }
  });

  // Admin notes sheet
  const adminNotesData: any[] = [];
  disputes.forEach((d) => {
    if (d.adminNotes && d.adminNotes.length > 0) {
      d.adminNotes.forEach((n, nIndex) => {
        adminNotesData.push({
          "Dispute ID": d._id?.toString() || "",
          "Order ID": d.orderId?.toString() || "",
          "Note S.No": nIndex + 1,
          "Admin ID": n.addedBy?.toString() || "",
          "Admin Name": n.addedByName || "",
          "Note": n.note || "",
          "Created At": n.addedAt ? new Date(n.addedAt).toLocaleString() : "",
        });
      });
    }
  });

  // Create workbook
  const workbook = XLSX.utils.book_new();

  // Add sheets
  const mainSheet = XLSX.utils.json_to_sheet(mainSheetData);
  XLSX.utils.book_append_sheet(workbook, mainSheet, "Disputes Summary");

  if (productsData.length > 0) {
    const productsSheet = XLSX.utils.json_to_sheet(productsData);
    XLSX.utils.book_append_sheet(workbook, productsSheet, "Products Detail");
  }

  if (timelineData.length > 0) {
    const timelineSheet = XLSX.utils.json_to_sheet(timelineData);
    XLSX.utils.book_append_sheet(workbook, timelineSheet, "Timeline Audit");
  }

  if (adminNotesData.length > 0) {
    const notesSheet = XLSX.utils.json_to_sheet(adminNotesData);
    XLSX.utils.book_append_sheet(workbook, notesSheet, "Admin Notes");
  }

  // Set column widths for main sheet
  mainSheet["!cols"] = [
    { wch: 5 },   // S.No
    { wch: 26 },  // Dispute ID
    { wch: 26 },  // Order ID
    { wch: 15 },  // Status
    { wch: 10 },  // Priority
    { wch: 25 },  // Reason
    { wch: 40 },  // Reason Description
    { wch: 25 },  // Buyer Name
    { wch: 30 },  // Buyer Email
    { wch: 15 },  // Buyer Phone
    { wch: 12 },  // Order Total
    { wch: 8 },   // Currency
    { wch: 15 },  // Payment Method
    { wch: 15 },  // Payment Gateway
    { wch: 22 },  // Order Placed At
    { wch: 22 },  // Delivered At
    { wch: 22 },  // Dispute Created
    { wch: 22 },  // Dispute Resolved
    { wch: 25 },  // Resolution
    { wch: 15 },  // Refund Amount
    { wch: 40 },  // Resolution Notes
    { wch: 15 },  // No. of Products
    { wch: 50 },  // Buyer Evidence Link
    { wch: 40 },  // Buyer Evidence Description
    { wch: 15 },  // Seller Response
    { wch: 18 },  // Admin Notes Count
    { wch: 15 },  // Timeline Events
  ];

  // Generate buffer
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  return buffer;
};
