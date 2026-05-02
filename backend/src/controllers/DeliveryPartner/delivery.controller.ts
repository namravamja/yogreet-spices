import { Request, Response } from "express";
import * as deliveryService from "../../services/DeliveryPartner/delivery.service";

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

/**
 * Get all orders assigned to the delivery partner
 * GET /api/delivery/orders
 */
export const getDeliveryOrders = async (req: AuthRequest, res: Response) => {
  try {
    const partnerId = req.user?.id;

    if (!partnerId) {
      res.status(401).json({
        success: false,
        error: "Unauthorized: User ID not found",
      });
      return;
    }

    // Parse query filters
    const filters: any = {};
    
    if (req.query.status) {
      filters.status = req.query.status as string;
    }
    
    if (req.query.limit) {
      filters.limit = parseInt(req.query.limit as string);
    }
    
    if (req.query.skip) {
      filters.skip = parseInt(req.query.skip as string);
    }

    const orders = await deliveryService.getDeliveryPartnerOrders(partnerId, filters);

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error: any) {
    console.error("Error in getDeliveryOrders:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
};

/**
 * Get a specific order by ID
 * GET /api/delivery/orders/:id
 */
export const getDeliveryOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const partnerId = req.user?.id;
    const role = req.user?.role;

    if (!partnerId || !role) {
      res.status(401).json({
        success: false,
        error: "Unauthorized: User information not found",
      });
      return;
    }

    const order = await deliveryService.getOrderById(id, partnerId, role);

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error: any) {
    console.error("Error in getDeliveryOrderById:", error);
    
    if (error.message.includes("Access denied")) {
      res.status(403).json({
        success: false,
        error: error.message,
        code: "ORDER_ACCESS_DENIED",
      });
      return;
    }
    
    if (error.message.includes("not found")) {
      res.status(404).json({
        success: false,
        error: error.message,
        code: "ORDER_NOT_FOUND",
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/**
 * Update order status
 * PATCH /api/delivery/orders/:id/status
 */
export const updateDeliveryStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, proofImages, notes } = req.body;
    const partnerId = req.user?.id;

    if (!partnerId) {
      res.status(401).json({
        success: false,
        error: "Unauthorized: User ID not found",
      });
      return;
    }

    if (!status) {
      res.status(400).json({
        success: false,
        error: "Status is required",
      });
      return;
    }

    const updatedOrder = await deliveryService.updateOrderStatus(
      id,
      status,
      partnerId,
      "delivery_partner",
      proofImages,
      notes
    );

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error("Error in updateDeliveryStatus:", error);
    
    if (error.message.includes("required") || error.message.includes("Invalid")) {
      res.status(400).json({
        success: false,
        error: error.message,
        code: "VALIDATION_ERROR",
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/**
 * Upload proof images
 * POST /api/delivery/orders/:id/upload-proof
 */
export const uploadProofImages = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { eventType } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({
        success: false,
        error: "No files uploaded",
      });
      return;
    }

    if (!eventType || !["pickup", "delivery"].includes(eventType)) {
      res.status(400).json({
        success: false,
        error: "Valid event type (pickup or delivery) is required",
      });
      return;
    }

    const uploadedUrls = await deliveryService.uploadProofImages(files, eventType);

    res.status(200).json({
      success: true,
      message: "Proof images uploaded successfully",
      images: uploadedUrls,
    });
  } catch (error: any) {
    console.error("Error in uploadProofImages:", error);
    
    if (error.message.includes("format") || error.message.includes("size")) {
      res.status(400).json({
        success: false,
        error: error.message,
        code: "INVALID_FILE",
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: "Internal server error during file upload",
    });
  }
};

/**
 * Report delivery issue
 * POST /api/delivery/orders/:id/report-issue
 */
export const reportDeliveryIssue = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { issueType, description, images } = req.body;
    const partnerId = req.user?.id;

    if (!partnerId) {
      res.status(401).json({
        success: false,
        error: "Unauthorized: User ID not found",
      });
      return;
    }

    if (!issueType || !description) {
      res.status(400).json({
        success: false,
        error: "Issue type and description are required",
      });
      return;
    }

    const updatedOrder = await deliveryService.reportIssue(
      id,
      issueType,
      description,
      partnerId,
      images
    );

    res.status(200).json({
      success: true,
      message: "Issue reported successfully",
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error("Error in reportDeliveryIssue:", error);
    
    if (error.message.includes("Invalid") || error.message.includes("required")) {
      res.status(400).json({
        success: false,
        error: error.message,
        code: "VALIDATION_ERROR",
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};


/**
 * Get delivery partner profile
 * GET /api/delivery/profile
 */
export const getDeliveryProfile = async (req: AuthRequest, res: Response) => {
  try {
    const partnerId = req.user?.id;

    if (!partnerId) {
      res.status(401).json({
        success: false,
        error: "Unauthorized: User ID not found",
      });
      return;
    }

    const { DeliveryPartner } = await import("../../models");
    const deliveryPartner = await DeliveryPartner.findById(partnerId).select("-password");

    if (!deliveryPartner) {
      res.status(404).json({
        success: false,
        error: "Delivery partner not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      deliveryPartner,
    });
  } catch (error: any) {
    console.error("Error in getDeliveryProfile:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/**
 * Update delivery partner profile
 * PATCH /api/delivery/profile
 */
export const updateDeliveryProfile = async (req: AuthRequest, res: Response) => {
  try {
    const partnerId = req.user?.id;

    if (!partnerId) {
      res.status(401).json({
        success: false,
        error: "Unauthorized: User ID not found",
      });
      return;
    }

    const { name, phone, alternatePhone, operatingRegions, serviceType } = req.body;

    const { DeliveryPartner } = await import("../../models");
    const deliveryPartner = await DeliveryPartner.findById(partnerId);

    if (!deliveryPartner) {
      res.status(404).json({
        success: false,
        error: "Delivery partner not found",
      });
      return;
    }

    // Update allowed fields
    if (name) deliveryPartner.name = name;
    if (phone) deliveryPartner.phone = phone;
    if (alternatePhone !== undefined) deliveryPartner.alternatePhone = alternatePhone;
    if (operatingRegions) deliveryPartner.operatingRegions = operatingRegions;
    if (serviceType) deliveryPartner.serviceType = serviceType;

    await deliveryPartner.save();

    // Return updated profile without password
    const updatedProfile = deliveryPartner.toObject();
    delete updatedProfile.password;

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      deliveryPartner: updatedProfile,
    });
  } catch (error: any) {
    console.error("Error in updateDeliveryProfile:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
