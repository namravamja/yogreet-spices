import { Router } from "express";
import { getSellerAnalytics, getSalesInsights } from "../../controllers/Seller/analytics.controller";

const router = Router();

// GET /api/sellers/analytics - Get comprehensive seller analytics
router.get("/", getSellerAnalytics);

// GET /api/sellers/analytics/insights - Get sales insights with time filters
router.get("/insights", getSalesInsights);

export default router;
