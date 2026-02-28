import { Router } from "express";
import * as adminController from "../../controllers/common/admin.controller";
import * as adminPayments from "../../controllers/common/adminPayments.controller";
import { verifyToken } from "../../middleware/authMiddleware";
import { asyncHandler } from "../../middleware/errorHandler";

const router = Router();

// All admin routes require authentication
// TODO: Add admin role check middleware
router.get("/view", verifyToken, asyncHandler(adminController.getAdmin as any));
router.get("/sellers", verifyToken, asyncHandler(adminController.getAllSellers as any));
router.get("/sellers/:id", verifyToken, asyncHandler(adminController.getSellerById as any));
router.post("/sellers/verify-document", verifyToken, asyncHandler(adminController.verifyDocument as any));
router.post("/sellers/unverify-document", verifyToken, asyncHandler(adminController.unverifyDocument as any));
router.post("/sellers/update-verification-status", verifyToken, asyncHandler(adminController.updateSellerVerificationStatus as any));
router.post("/sellers/mark-fields-reviewed", verifyToken, asyncHandler(adminController.markFieldsAsReviewed as any));
router.get("/buyers", verifyToken, asyncHandler(adminController.getAllBuyers as any));
router.get("/stats", verifyToken, asyncHandler(adminController.getAdminStats as any));

// Payments & disputes
router.get("/disputes", verifyToken, asyncHandler(adminPayments.listDisputes as any));
router.post("/payments/:orderId/refund", verifyToken, asyncHandler(adminPayments.refund as any));
router.post("/payments/:orderId/force-release", verifyToken, asyncHandler(adminPayments.forceRelease as any));
router.post("/payments/:orderId/resolve-dispute", verifyToken, asyncHandler(adminPayments.resolveDispute as any));

export default router;
