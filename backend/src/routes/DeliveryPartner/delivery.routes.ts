import express from "express";
import * as authController from "../../controllers/DeliveryPartner/auth.controller";
import * as deliveryController from "../../controllers/DeliveryPartner/delivery.controller";
import { verifyDeliveryPartner } from "../../middleware/authMiddleware";
import { validateStatusTransition as validateStatusTransitionMiddleware } from "../../middleware/statusValidation";
import { uploadMultipleImages } from "../../middleware/multer";
import { asyncHandler } from "../../middleware/errorHandler";

const router = express.Router();

// Authentication routes (public)
router.post("/auth/login", asyncHandler(authController.loginDeliveryPartner as any));
router.post("/auth/logout", asyncHandler(authController.logoutDeliveryPartner as any));

// Protected routes - require delivery partner authentication
router.use(verifyDeliveryPartner);

// Order management routes
router.get("/orders", asyncHandler(deliveryController.getDeliveryOrders as any));
router.get("/orders/:id", asyncHandler(deliveryController.getDeliveryOrderById as any));

// Status update route with validation middleware
router.patch(
  "/orders/:id/status",
  validateStatusTransitionMiddleware,
  asyncHandler(deliveryController.updateDeliveryStatus as any)
);

// Proof upload route with multer for file handling
router.post(
  "/orders/:id/upload-proof",
  uploadMultipleImages("proofImages", 5),
  asyncHandler(deliveryController.uploadProofImages as any)
);

// Issue reporting route
router.post(
  "/orders/:id/report-issue",
  asyncHandler(deliveryController.reportDeliveryIssue as any)
);

// Profile routes
router.get("/profile", asyncHandler(deliveryController.getDeliveryProfile as any));
router.patch("/profile", asyncHandler(deliveryController.updateDeliveryProfile as any));

export default router;
