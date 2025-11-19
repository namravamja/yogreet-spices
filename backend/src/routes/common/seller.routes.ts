import express from "express";
import { getPublicSellerProfile, getTopSellers } from "../../controllers/common/seller.controller";

const router = express.Router();

// Public routes - no authentication required
router.get("/top", getTopSellers);
router.get("/:id", getPublicSellerProfile);

export default router;

