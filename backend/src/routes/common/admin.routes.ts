import { Router } from "express";
import * as adminController from "../../controllers/common/admin.controller";
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

export default router;

