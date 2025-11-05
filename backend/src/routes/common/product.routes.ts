import express from "express";
import { getProducts } from "../../controllers/common/product.controller";

const router = express.Router();

// Public route - no authentication required
router.get("/", getProducts);

export default router;

