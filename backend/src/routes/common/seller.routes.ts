import express from "express";
import { getPublicSellerProfile } from "../../controllers/common/seller.controller";

const router = express.Router();

// Public route - no authentication required
router.get("/:id", getPublicSellerProfile);

export default router;

