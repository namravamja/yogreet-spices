import express from "express";
import { getPublicSellerProfile, getTopSellers } from "../../controllers/common/seller.controller";
import { asyncHandler } from "../../middleware/errorHandler";

const router = express.Router();

// Public routes - no authentication required
router.get("/top", asyncHandler(getTopSellers as any));
router.get("/:id", asyncHandler(getPublicSellerProfile as any));

export default router;

