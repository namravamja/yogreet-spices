import express from "express";
import { getProducts } from "../../controllers/common/product.controller";
import { asyncHandler } from "../../middleware/errorHandler";

const router = express.Router();

// Public route - no authentication required
router.get("/", asyncHandler(getProducts as any));

export default router;

