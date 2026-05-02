import { Router } from "express";
import * as adminController from "../../controllers/common/admin.controller";
import * as adminPayments from "../../controllers/common/adminPayments.controller";
import * as disputeController from "../../controllers/common/dispute.controller";
import { verifyToken } from "../../middleware/authMiddleware";
import { asyncHandler } from "../../middleware/errorHandler";
import { uploadSingle } from "../../middleware/multer";

const router = Router();

// All admin routes require authentication
// TODO: Add admin role check middleware
router.get("/view", verifyToken, asyncHandler(adminController.getAdmin as any));
router.get("/sellers", verifyToken, asyncHandler(adminController.getAllSellers as any));
router.get("/sellers/:id", verifyToken, asyncHandler(adminController.getSellerById as any));
router.get("/sellers/:id/products", verifyToken, asyncHandler(adminController.getSellerProductsById as any));
router.get("/sellers/:id/orders", verifyToken, asyncHandler(adminController.getSellerOrdersById as any));
router.post("/sellers/verify-document", verifyToken, asyncHandler(adminController.verifyDocument as any));
router.post("/sellers/unverify-document", verifyToken, asyncHandler(adminController.unverifyDocument as any));
router.post("/sellers/update-verification-status", verifyToken, asyncHandler(adminController.updateSellerVerificationStatus as any));
router.post("/sellers/mark-fields-reviewed", verifyToken, asyncHandler(adminController.markFieldsAsReviewed as any));
router.get("/buyers", verifyToken, asyncHandler(adminController.getAllBuyers as any));
router.get("/buyers/:id", verifyToken, asyncHandler(adminController.getBuyerById as any));
router.get("/buyers/:id/orders", verifyToken, asyncHandler(adminController.getBuyerOrdersById as any));
router.get("/stats", verifyToken, asyncHandler(adminController.getAdminStats as any));

// Delivery partner monitoring routes
router.get("/delivery-overview", verifyToken, asyncHandler(adminController.getDeliveryOverview as any));
router.get("/delivery-partner", verifyToken, asyncHandler(adminController.getDeliveryPartnerProfile as any));
router.get("/delivery-analytics", verifyToken, asyncHandler(adminController.getDeliveryAnalytics as any));
router.get("/orders/:id/delivery-timeline", verifyToken, asyncHandler(adminController.getOrderDeliveryTimeline as any));

// Legacy payments & disputes endpoints (for backward compatibility)
router.get("/disputes", verifyToken, asyncHandler(disputeController.listDisputes as any));
router.post("/payments/:orderId/refund", verifyToken, asyncHandler(adminPayments.refund as any));
router.post("/payments/:orderId/force-release", verifyToken, asyncHandler(adminPayments.forceRelease as any));
router.post("/payments/:orderId/resolve-dispute", verifyToken, asyncHandler(adminPayments.resolveDispute as any));

// New comprehensive disputes routes
router.get("/disputes/stats", verifyToken, asyncHandler(disputeController.getDisputeStats as any));
router.get("/disputes/export", verifyToken, asyncHandler(disputeController.exportDisputes as any));
router.get("/disputes/:disputeId", verifyToken, asyncHandler(disputeController.getDisputeById as any));
router.get("/disputes/order/:orderId", verifyToken, asyncHandler(disputeController.getDisputeByOrderId as any));
router.patch("/disputes/:disputeId/status", verifyToken, asyncHandler(disputeController.updateDisputeStatus as any));
router.patch("/disputes/:disputeId/priority", verifyToken, asyncHandler(disputeController.updatePriority as any));
router.post("/disputes/:disputeId/resolve", verifyToken, asyncHandler(disputeController.resolveDispute as any));
router.post("/disputes/:disputeId/notes", verifyToken, asyncHandler(disputeController.addAdminNote as any));
router.post("/disputes/:disputeId/evidence", verifyToken, uploadSingle.single("file"), asyncHandler(disputeController.addEvidence as any));

export default router;
