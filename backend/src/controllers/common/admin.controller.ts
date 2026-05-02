import { Request, Response } from "express";
import * as adminService from "../../services/common/admin.service";

interface AuthenticatedRequest extends Request {
  user?: { id: string; role: string };
}

export const getAllSellers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sellers = await adminService.getAllSellers();
    res.json(sellers);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getAllBuyers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const buyers = await adminService.getAllBuyers();
    res.json(buyers);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getAdminStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = await adminService.getAdminStats();
    res.json(stats);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getAdmin = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const admin = await adminService.getAdminById(userId);
    res.json({ source: "db", data: admin });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getSellerById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    if (!id) {
      return res.status(400).json({ error: "Seller ID is required" });
    }
    const seller = await adminService.getSellerById(id);
    res.json(seller);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const verifyDocument = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sellerId, documentField } = req.body;
    if (!sellerId || !documentField) {
      return res.status(400).json({ error: "Seller ID and document field are required" });
    }
    const verifiedDocuments = await adminService.verifySellerDocument(sellerId, documentField);
    res.json({ message: "Document verified successfully", verifiedDocuments });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const unverifyDocument = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sellerId, documentField } = req.body;
    if (!sellerId || !documentField) {
      return res.status(400).json({ error: "Seller ID and document field are required" });
    }
    const verifiedDocuments = await adminService.unverifySellerDocument(sellerId, documentField);
    res.json({ message: "Document unverified successfully", verifiedDocuments });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const updateSellerVerificationStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sellerId, status, notes } = req.body;
    if (!sellerId || !status) {
      return res.status(400).json({ error: "Seller ID and status are required" });
    }
    if (status !== "approved" && status !== "rejected") {
      return res.status(400).json({ error: "Status must be 'approved' or 'rejected'" });
    }
    const result = await adminService.updateSellerVerificationStatus(sellerId, status, notes);
    res.json({ message: `Seller verification ${status} successfully`, ...result });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const markFieldsAsReviewed = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sellerId, fields } = req.body;
    if (!sellerId || !fields || !Array.isArray(fields)) {
      return res.status(400).json({ error: "Seller ID and fields array are required" });
    }
    const result = await adminService.markFieldsAsReviewed(sellerId, fields);
    res.json({ message: "Fields marked as reviewed successfully", ...result });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getBuyerById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    if (!id) {
      return res.status(400).json({ error: "Buyer ID is required" });
    }
    const buyer = await adminService.getBuyerById(id);
    res.json(buyer);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getSellerProductsById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    if (!id) {
      return res.status(400).json({ error: "Seller ID is required" });
    }
    const products = await adminService.getSellerProductsById(id);
    res.json(products);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getBuyerOrdersById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    if (!id) {
      return res.status(400).json({ error: "Buyer ID is required" });
    }
    const orders = await adminService.getBuyerOrdersById(id);
    res.json(orders);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getSellerOrdersById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    if (!id) {
      return res.status(400).json({ error: "Seller ID is required" });
    }
    const orders = await adminService.getSellerOrdersById(id);
    res.json(orders);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};



/**
 * Get delivery overview with analytics
 * GET /api/admin/delivery-overview
 */
export const getDeliveryOverview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { getDeliveryAnalytics } = await import("../../services/DeliveryPartner/delivery.service");
    const analytics = await getDeliveryAnalytics();
    
    res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error("Error in getDeliveryOverview:", error);
    res.status(500).json({ 
      success: false,
      error: (error as Error).message 
    });
  }
};

/**
 * Get delivery partner profile
 * GET /api/admin/delivery-partner
 */
export const getDeliveryPartnerProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { DeliveryPartner } = await import("../../models");
    
    // Get the universal delivery partner (there should be only one)
    const deliveryPartner = await DeliveryPartner.findOne().select("-password");
    
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
  } catch (error) {
    console.error("Error in getDeliveryPartnerProfile:", error);
    res.status(500).json({ 
      success: false,
      error: (error as Error).message 
    });
  }
};

/**
 * Get delivery analytics
 * GET /api/admin/delivery-analytics
 */
export const getDeliveryAnalytics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { getDeliveryAnalytics } = await import("../../services/DeliveryPartner/delivery.service");
    const analytics = await getDeliveryAnalytics();
    
    res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error("Error in getDeliveryAnalytics:", error);
    res.status(500).json({ 
      success: false,
      error: (error as Error).message 
    });
  }
};

/**
 * Get order delivery timeline
 * GET /api/admin/orders/:id/delivery-timeline
 */
export const getOrderDeliveryTimeline = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({
        success: false,
        error: "Order ID is required",
      });
      return;
    }
    
    const { Order } = await import("../../models");
    const order = await Order.findById(id)
      .populate("deliveryPartnerId", "name email phone")
      .select("deliveryLogs deliveryIssue pickupProofImages deliveryProofImages status");
    
    if (!order) {
      res.status(404).json({
        success: false,
        error: "Order not found",
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      timeline: {
        deliveryLogs: order.deliveryLogs,
        deliveryIssue: order.deliveryIssue,
        pickupProofImages: order.pickupProofImages,
        deliveryProofImages: order.deliveryProofImages,
        currentStatus: order.status,
        deliveryPartner: order.deliveryPartnerId,
      },
    });
  } catch (error) {
    console.error("Error in getOrderDeliveryTimeline:", error);
    res.status(500).json({ 
      success: false,
      error: (error as Error).message 
    });
  }
};
