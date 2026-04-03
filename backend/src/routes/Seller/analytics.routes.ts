import { Router } from "express";
import { getSellerAnalytics, getSalesInsights } from "../../controllers/Seller/analytics.controller";
import { asyncHandler } from "../../middleware/errorHandler";

const router = Router();

// GET /api/sellers/analytics - Get comprehensive seller analytics
router.get("/", asyncHandler(getSellerAnalytics as any));

// GET /api/sellers/analytics/insights - Get sales insights with time filters
router.get("/insights", asyncHandler(getSalesInsights as any));

export default router;

