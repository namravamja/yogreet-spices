import { Router } from "express";
import {
  getSellerDiscounts,
  getDiscount,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  toggleDiscountStatus,
  validateDiscountCode,
  applyDiscountToProducts,
  removeDiscountFromProducts,
  getSellerProductsForDiscount,
} from "../../controllers/Seller/discount.controller";

const router = Router();

// GET /api/sellers/discounts - Get all discounts for seller
router.get("/", getSellerDiscounts);

// GET /api/sellers/discounts/products - Get seller products for discount selection
router.get("/products", getSellerProductsForDiscount);

// GET /api/sellers/discounts/:id - Get a single discount
router.get("/:id", getDiscount);

// POST /api/sellers/discounts - Create a new discount
router.post("/", createDiscount);

// PUT /api/sellers/discounts/:id - Update a discount
router.put("/:id", updateDiscount);

// DELETE /api/sellers/discounts/:id - Delete a discount
router.delete("/:id", deleteDiscount);

// PATCH /api/sellers/discounts/:id/toggle - Toggle discount active status
router.patch("/:id/toggle", toggleDiscountStatus);

// POST /api/sellers/discounts/:id/apply - Apply discount to products
router.post("/:id/apply", applyDiscountToProducts);

// POST /api/sellers/discounts/:id/remove - Remove discount from products
router.post("/:id/remove", removeDiscountFromProducts);

// POST /api/sellers/discounts/validate - Validate discount code (public endpoint)
router.post("/validate", validateDiscountCode);

export default router;
