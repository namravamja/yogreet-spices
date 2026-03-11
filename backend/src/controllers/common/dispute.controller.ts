import { Request, Response } from "express";
import * as disputeService from "../../services/common/dispute.service";

interface AuthenticatedRequest extends Request {
  user?: { id: string; role: string };
}

// List all disputes with optional filters
export const listDisputes = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, priority, sellerId, buyerId } = req.query;
    
    const disputes = await disputeService.getAllDisputes({
      status: status as string,
      priority: priority as string,
      sellerId: sellerId as string,
      buyerId: buyerId as string,
    });

    res.json({ success: true, data: disputes });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch disputes" });
  }
};

// Get single dispute details
export const getDisputeById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { disputeId } = req.params;
    const dispute = await disputeService.getDisputeById(disputeId);
    
    if (!dispute) {
      return res.status(404).json({ success: false, message: "Dispute not found" });
    }

    res.json({ success: true, data: dispute });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch dispute" });
  }
};

// Get dispute by order ID
export const getDisputeByOrderId = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const dispute = await disputeService.getDisputeByOrderId(orderId);
    
    if (!dispute) {
      return res.status(404).json({ success: false, message: "No dispute found for this order" });
    }

    res.json({ success: true, data: dispute });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch dispute" });
  }
};

// Update dispute status
export const updateDisputeStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { disputeId } = req.params;
    const { status } = req.body;
    const adminId = req.user?.id;

    if (!adminId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const validStatuses = ["open", "under_review", "awaiting_seller", "resolved", "escalated"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const dispute = await disputeService.updateDisputeStatus(disputeId, status, adminId);
    
    if (!dispute) {
      return res.status(404).json({ success: false, message: "Dispute not found" });
    }

    res.json({ success: true, data: dispute, message: "Dispute status updated" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to update dispute status" });
  }
};

// Resolve dispute
export const resolveDispute = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { disputeId } = req.params;
    const { action, refundAmount, refundPercentage, notes } = req.body;
    const adminId = req.user?.id;

    if (!adminId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const validActions = ["refund", "partial_refund", "release_to_seller", "rejected"];
    if (!validActions.includes(action)) {
      return res.status(400).json({ success: false, message: "Invalid action" });
    }

    const dispute = await disputeService.resolveDispute({
      disputeId,
      adminId,
      action,
      refundAmount: refundAmount ? parseFloat(refundAmount) : undefined,
      refundPercentage: refundPercentage ? parseFloat(refundPercentage) : undefined,
      notes,
    });

    if (!dispute) {
      return res.status(404).json({ success: false, message: "Dispute not found" });
    }

    res.json({ success: true, data: dispute, message: "Dispute resolved successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to resolve dispute" });
  }
};

// Add admin note
export const addAdminNote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { disputeId } = req.params;
    const { note } = req.body;
    const adminId = req.user?.id;

    if (!adminId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!note || note.trim() === "") {
      return res.status(400).json({ success: false, message: "Note is required" });
    }

    const dispute = await disputeService.addAdminNote({
      disputeId,
      adminId,
      note: note.trim(),
    });

    if (!dispute) {
      return res.status(404).json({ success: false, message: "Dispute not found" });
    }

    res.json({ success: true, data: dispute, message: "Note added successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to add note" });
  }
};

// Add evidence (admin can add evidence too)
export const addEvidence = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { disputeId } = req.params;
    const { type, description } = req.body;
    const adminId = req.user?.id;

    if (!adminId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Get uploaded file URL if any
    const file: any = (req as any).file;
    const url = file?.path || file?.location || file?.secure_url;

    if (type === "image" && !url) {
      return res.status(400).json({ success: false, message: "Image file is required" });
    }

    const dispute = await disputeService.addEvidence({
      disputeId,
      userId: adminId,
      role: "admin",
      type,
      url,
      description,
    });

    if (!dispute) {
      return res.status(404).json({ success: false, message: "Dispute not found" });
    }

    res.json({ success: true, data: dispute, message: "Evidence added successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to add evidence" });
  }
};

// Update priority
export const updatePriority = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { disputeId } = req.params;
    const { priority } = req.body;
    const adminId = req.user?.id;

    if (!adminId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const validPriorities = ["low", "medium", "high", "critical"];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({ success: false, message: "Invalid priority" });
    }

    const dispute = await disputeService.updatePriority(disputeId, priority, adminId);

    if (!dispute) {
      return res.status(404).json({ success: false, message: "Dispute not found" });
    }

    res.json({ success: true, data: dispute, message: "Priority updated successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to update priority" });
  }
};

// Get dispute stats
export const getDisputeStats = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = await disputeService.getDisputeStats();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch stats" });
  }
};

// Export disputes to Excel
export const exportDisputes = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, priority, startDate, endDate } = req.query;

    const buffer = await disputeService.exportDisputesToExcel({
      status: status as string,
      priority: priority as string,
      startDate: startDate as string,
      endDate: endDate as string,
    });

    // Set headers for file download
    const filename = `disputes_export_${new Date().toISOString().split("T")[0]}.xlsx`;
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", buffer.length);

    res.send(buffer);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to export disputes" });
  }
};
