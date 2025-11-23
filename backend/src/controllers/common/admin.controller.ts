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
    const { id } = req.params;
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

