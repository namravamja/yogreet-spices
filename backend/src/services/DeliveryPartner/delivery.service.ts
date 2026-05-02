import mongoose from "mongoose";
import { Order, DeliveryPartner, IOrder, OrderStatus, IDeliveryLog } from "../../models";
import { validateStatusTransition } from "../../utils/statusTransition";

/**
 * Auto-assign the universal delivery partner to an order
 * @param orderId - The order ID to assign delivery partner to
 */
export const autoAssignDeliveryPartner = async (orderId: string): Promise<void> => {
  try {
    // Find the universal delivery partner (there should be only one)
    const deliveryPartner = await DeliveryPartner.findOne();
    
    if (!deliveryPartner) {
      throw new Error("Universal delivery partner not found in the system");
    }

    // Find the order
    const order = await Order.findById(orderId);
    
    if (!order) {
      throw new Error("Order not found");
    }

    // Check if already assigned
    if (order.deliveryPartnerId) {
      console.log(`Order ${orderId} already has a delivery partner assigned`);
      return;
    }

    // Assign delivery partner
    order.deliveryPartnerId = deliveryPartner._id as mongoose.Types.ObjectId;
    order.deliveryPartnerType = "universal";
    order.assignedAt = new Date();
    order.status = "pickup_assigned";

    // Add delivery log entry
    const logEntry: IDeliveryLog = {
      status: "pickup_assigned",
      actor: {
        role: "system",
        name: "System Auto-Assignment",
      },
      timestamp: new Date(),
      notes: `Delivery partner "${deliveryPartner.name}" automatically assigned`,
      metadata: {
        deliveryPartnerId: deliveryPartner._id,
        deliveryPartnerName: deliveryPartner.name,
      },
    };

    order.deliveryLogs.push(logEntry);

    await order.save();
    
    console.log(`Delivery partner assigned to order ${orderId}`);
    
    // Send notifications (don't await to avoid blocking)
    const { notifyDeliveryPartnerAssigned } = await import("../common/deliveryNotification.service");
    notifyDeliveryPartnerAssigned(orderId, deliveryPartner.name).catch(err => {
      console.error("Failed to send assignment notifications:", err);
    });
  } catch (error) {
    console.error("Error in autoAssignDeliveryPartner:", error);
    throw error;
  }
};

/**
 * Add a delivery log entry to an order
 * @param orderId - The order ID
 * @param log - Partial delivery log entry
 */
export const addDeliveryLog = async (
  orderId: string,
  log: Partial<IDeliveryLog>
): Promise<void> => {
  try {
    const order = await Order.findById(orderId);
    
    if (!order) {
      throw new Error("Order not found");
    }

    const logEntry: IDeliveryLog = {
      status: log.status || order.status,
      actor: log.actor || { role: "system" },
      timestamp: log.timestamp || new Date(),
      notes: log.notes,
      metadata: log.metadata,
    };

    order.deliveryLogs.push(logEntry);
    await order.save();
  } catch (error) {
    console.error("Error in addDeliveryLog:", error);
    throw error;
  }
};

/**
 * Get orders assigned to a delivery partner with optional filters
 * @param partnerId - The delivery partner ID
 * @param filters - Optional filters (status, date range, etc.)
 */
export const getDeliveryPartnerOrders = async (
  partnerId: string,
  filters?: {
    status?: OrderStatus;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    skip?: number;
  }
): Promise<IOrder[]> => {
  try {
    const query: any = { deliveryPartnerId: partnerId };

    if (filters?.status) {
      query.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      query.assignedAt = {};
      if (filters.startDate) {
        query.assignedAt.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.assignedAt.$lte = filters.endDate;
      }
    }

    const orders = await Order.find(query)
      .populate("buyerId", "email firstName lastName companyName")
      .populate("sellerId", "email fullName companyName")
      .populate("shippingAddressId")
      .sort({ assignedAt: -1 })
      .limit(filters?.limit || 100)
      .skip(filters?.skip || 0);

    return orders;
  } catch (error) {
    console.error("Error in getDeliveryPartnerOrders:", error);
    throw error;
  }
};

/**
 * Get a specific order by ID with role-based access control
 * @param orderId - The order ID
 * @param requesterId - The ID of the user requesting the order
 * @param role - The role of the requester
 */
export const getOrderById = async (
  orderId: string,
  requesterId: string,
  role: string
): Promise<IOrder> => {
  try {
    const order = await Order.findById(orderId)
      .populate("buyerId", "email firstName lastName companyName phone")
      .populate("sellerId", "email fullName companyName phone")
      .populate("shippingAddressId")
      .populate("deliveryPartnerId", "name email phone");

    if (!order) {
      throw new Error("Order not found");
    }

    // Role-based access control
    if (role === "delivery_partner") {
      // Delivery partner can only access orders assigned to them
      if (order.deliveryPartnerId?.toString() !== requesterId) {
        throw new Error("Access denied: Order not assigned to this delivery partner");
      }
    } else if (role === "buyer") {
      // Buyer can only access their own orders
      if (order.buyerId.toString() !== requesterId) {
        throw new Error("Access denied: Not your order");
      }
    } else if (role === "seller") {
      // Seller can only access orders they are selling
      if (order.sellerId?.toString() !== requesterId) {
        throw new Error("Access denied: Not your order");
      }
    }
    // Admin can access all orders (no restriction)

    return order;
  } catch (error) {
    console.error("Error in getOrderById:", error);
    throw error;
  }
};

/**
 * Validate a status transition wrapper
 * @param currentStatus - Current order status
 * @param newStatus - Desired new status
 */
export const validateTransition = (
  currentStatus: OrderStatus,
  newStatus: OrderStatus
) => {
  return validateStatusTransition(currentStatus, newStatus);
};

/**
 * Update order status with validation and timeline tracking
 * @param orderId - The order ID
 * @param newStatus - The new status to set
 * @param actorId - The ID of the user performing the update
 * @param actorRole - The role of the user performing the update
 * @param proofImages - Optional proof images for pickup/delivery
 * @param notes - Optional notes about the status change
 * @returns Updated order
 */
export const updateOrderStatus = async (
  orderId: string,
  newStatus: OrderStatus,
  actorId: string,
  actorRole: "buyer" | "seller" | "delivery_partner" | "admin" | "system",
  proofImages?: string[],
  notes?: string
): Promise<IOrder> => {
  try {
    const order = await Order.findById(orderId)
      .populate("deliveryPartnerId", "name");

    if (!order) {
      throw new Error("Order not found");
    }

    // Validate status transition
    const validation = validateStatusTransition(order.status, newStatus);
    if (!validation.valid) {
      throw new Error(validation.reason || "Invalid status transition");
    }

    // Check for required proof images
    if (newStatus === "picked_up") {
      if (!proofImages || proofImages.length === 0) {
        throw new Error("Proof images are required for pickup confirmation");
      }
      order.pickupProofImages = [...order.pickupProofImages, ...proofImages];
      order.pickupTime = new Date();
    }

    if (newStatus === "delivered") {
      if (!proofImages || proofImages.length === 0) {
        throw new Error("Proof images are required for delivery confirmation");
      }
      order.deliveryProofImages = [...order.deliveryProofImages, ...proofImages];
      order.deliveredTime = new Date();
      order.deliveredAt = new Date();
    }

    // Check for required issue report (handled separately in reportIssue function)
    const failureStates: OrderStatus[] = ["pickup_failed", "delivery_failed", "damaged_reported"];
    if (failureStates.includes(newStatus) && !order.deliveryIssue) {
      throw new Error(`An issue report is required before transitioning to ${newStatus}`);
    }

    // Update status
    const previousStatus = order.status;
    order.status = newStatus;

    // Get actor name
    let actorName = "Unknown";
    if (actorRole === "delivery_partner" && order.deliveryPartnerId) {
      actorName = (order.deliveryPartnerId as any).name || "Delivery Partner";
    } else if (actorRole === "system") {
      actorName = "System";
    }

    // Add delivery log entry
    const logEntry: IDeliveryLog = {
      status: newStatus,
      actor: {
        role: actorRole,
        userId: actorRole !== "system" ? new mongoose.Types.ObjectId(actorId) : undefined,
        name: actorName,
      },
      timestamp: new Date(),
      notes,
      metadata: {
        previousStatus,
        proofImagesCount: proofImages?.length || 0,
      },
    };

    order.deliveryLogs.push(logEntry);

    await order.save();

    // Send status update notifications (don't await to avoid blocking)
    const { notifyStatusUpdate } = await import("../common/deliveryNotification.service");
    notifyStatusUpdate(orderId, newStatus).catch(err => {
      console.error("Failed to send status update notifications:", err);
    });

    return order;
  } catch (error) {
    console.error("Error in updateOrderStatus:", error);
    throw error;
  }
};

/**
 * Upload proof images to Cloudinary
 * @param files - Array of uploaded files
 * @param eventType - Type of event (pickup or delivery)
 * @returns Array of uploaded image URLs
 */
export const uploadProofImages = async (
  files: Express.Multer.File[],
  eventType: "pickup" | "delivery"
): Promise<string[]> => {
  try {
    if (!files || files.length === 0) {
      throw new Error("No files provided for upload");
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      // Check if file was already uploaded by multer CloudinaryStorage middleware
      // CloudinaryStorage adds a 'path' property with the Cloudinary URL
      if ((file as any).path) {
        uploadedUrls.push((file as any).path);
        console.log(`✅ Using pre-uploaded file: ${(file as any).path}`);
        continue;
      }

      // If not pre-uploaded, upload manually using buffer
      if (!file.buffer) {
        console.warn(`⚠️  Skipping file without buffer: ${file.originalname}`);
        continue;
      }

      const cloudinary = (await import("../../utils/cloudinary")).default;
      const { isCloudinaryConfigured } = await import("../../utils/cloudinary");

      if (!isCloudinaryConfigured()) {
        throw new Error("Cloudinary is not configured. Please set up Cloudinary credentials.");
      }

      const validFormats = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      const maxSize = 10 * 1024 * 1024; // 10MB

      // Validate file format
      if (!validFormats.includes(file.mimetype)) {
        throw new Error(
          `Invalid file format: ${file.mimetype}. Supported formats: JPEG, PNG, WebP`
        );
      }

      // Validate file size
      if (file.size > maxSize) {
        throw new Error(
          `File size exceeds maximum limit of 10MB. File size: ${(file.size / 1024 / 1024).toFixed(2)}MB`
        );
      }

      // Upload to Cloudinary
      const result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `delivery-proofs/${eventType}`,
            resource_type: "image",
            transformation: [
              { width: 1200, height: 1200, crop: "limit" },
              { quality: "auto" },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        uploadStream.end(file.buffer);
      });

      uploadedUrls.push(result.secure_url);
    }

    if (uploadedUrls.length === 0) {
      throw new Error("No valid files were uploaded");
    }

    return uploadedUrls;
  } catch (error) {
    console.error("Error in uploadProofImages:", error);
    throw error;
  }
};

/**
 * Report an issue during delivery operations
 * @param orderId - The order ID
 * @param issueType - Type of issue
 * @param description - Description of the issue
 * @param reporterId - ID of the delivery partner reporting the issue
 * @param images - Optional proof images
 * @returns Updated order
 */
export const reportIssue = async (
  orderId: string,
  issueType: string,
  description: string,
  reporterId: string,
  images?: string[]
): Promise<IOrder> => {
  try {
    const order = await Order.findById(orderId)
      .populate("deliveryPartnerId", "name");

    if (!order) {
      throw new Error("Order not found");
    }

    // Validate issue type
    const validIssueTypes = [
      "seller_not_ready",
      "package_damaged",
      "address_issue",
      "customs_hold",
      "customer_unavailable",
      "delivery_delayed",
      "payment_issue",
      "return_initiated",
      "missing_package",
    ];

    if (!validIssueTypes.includes(issueType)) {
      throw new Error(`Invalid issue type: ${issueType}`);
    }

    if (!description || description.trim().length === 0) {
      throw new Error("Issue description is required");
    }

    // Create delivery issue object
    order.deliveryIssue = {
      type: issueType as any,
      description: description.trim(),
      reportedBy: {
        role: "delivery_partner",
        userId: new mongoose.Types.ObjectId(reporterId),
      },
      reportedAt: new Date(),
      images: images || [],
      resolved: false,
    };

    // Determine appropriate failure status based on issue type
    let newStatus: OrderStatus = order.status;
    
    if (issueType === "seller_not_ready" || issueType === "missing_package") {
      newStatus = "pickup_failed";
    } else if (
      issueType === "customer_unavailable" ||
      issueType === "address_issue"
    ) {
      newStatus = "delivery_failed";
    } else if (issueType === "package_damaged") {
      newStatus = "damaged_reported";
    } else if (issueType === "return_initiated") {
      newStatus = "returned";
    }
    // For other issues like customs_hold, delivery_delayed, keep current status

    // Update status if it changed
    const previousStatus = order.status;
    if (newStatus !== previousStatus) {
      order.status = newStatus;
    }

    // Get actor name
    const actorName = order.deliveryPartnerId 
      ? (order.deliveryPartnerId as any).name || "Delivery Partner"
      : "Delivery Partner";

    // Add delivery log entry with issue details
    const logEntry: IDeliveryLog = {
      status: newStatus,
      actor: {
        role: "delivery_partner",
        userId: new mongoose.Types.ObjectId(reporterId),
        name: actorName,
      },
      timestamp: new Date(),
      notes: `Issue reported: ${issueType} - ${description}`,
      metadata: {
        issueType,
        issueDescription: description,
        issueImages: images || [],
        previousStatus,
      },
    };

    order.deliveryLogs.push(logEntry);

    await order.save();

    // Send issue reported notifications (don't await to avoid blocking)
    const { notifyIssueReported } = await import("../common/deliveryNotification.service");
    notifyIssueReported(orderId, issueType, description).catch(err => {
      console.error("Failed to send issue reported notifications:", err);
    });

    return order;
  } catch (error) {
    console.error("Error in reportIssue:", error);
    throw error;
  }
};

/**
 * Delivery Analytics Interface
 */
export interface DeliveryAnalytics {
  totalOrders: number;
  ordersByStatus: Record<string, number>;
  averageDeliveryTime: number; // in hours
  issueFrequency: Record<string, number>;
  successRate: number; // percentage
  completedOrders: number;
  failedOrders: number;
}

/**
 * Get delivery analytics and statistics
 * @returns Delivery analytics object
 */
export const getDeliveryAnalytics = async (): Promise<DeliveryAnalytics> => {
  try {
    // Get all orders with delivery partner assigned
    const orders = await Order.find({ deliveryPartnerId: { $exists: true, $ne: null } });

    const analytics: DeliveryAnalytics = {
      totalOrders: orders.length,
      ordersByStatus: {},
      averageDeliveryTime: 0,
      issueFrequency: {},
      successRate: 0,
      completedOrders: 0,
      failedOrders: 0,
    };

    if (orders.length === 0) {
      return analytics;
    }

    // Count orders by status
    orders.forEach((order) => {
      const status = order.status;
      analytics.ordersByStatus[status] = (analytics.ordersByStatus[status] || 0) + 1;

      // Count completed and failed orders
      if (status === "completed" || status === "delivered") {
        analytics.completedOrders++;
      } else if (
        status === "pickup_failed" ||
        status === "delivery_failed" ||
        status === "returned" ||
        status === "damaged_reported"
      ) {
        analytics.failedOrders++;
      }

      // Count issue frequency
      if (order.deliveryIssue) {
        const issueType = order.deliveryIssue.type;
        analytics.issueFrequency[issueType] = (analytics.issueFrequency[issueType] || 0) + 1;
      }
    });

    // Calculate average delivery time (from assignedAt to deliveredTime)
    const deliveredOrders = orders.filter(
      (order) => order.assignedAt && order.deliveredTime
    );

    if (deliveredOrders.length > 0) {
      const totalDeliveryTime = deliveredOrders.reduce((sum, order) => {
        const assignedTime = order.assignedAt!.getTime();
        const deliveredTime = order.deliveredTime!.getTime();
        const diffInHours = (deliveredTime - assignedTime) / (1000 * 60 * 60);
        return sum + diffInHours;
      }, 0);

      analytics.averageDeliveryTime = totalDeliveryTime / deliveredOrders.length;
    }

    // Calculate success rate
    const totalProcessedOrders = analytics.completedOrders + analytics.failedOrders;
    if (totalProcessedOrders > 0) {
      analytics.successRate = (analytics.completedOrders / totalProcessedOrders) * 100;
    }

    return analytics;
  } catch (error) {
    console.error("Error in getDeliveryAnalytics:", error);
    throw error;
  }
};
