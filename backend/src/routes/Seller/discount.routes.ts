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
import { asyncHandler } from "../../middleware/errorHandler";

const router = Router();

// GET /api/sellers/discounts - Get all discounts for seller
router.get("/", asyncHandler(getSellerDiscounts as any));

// GET /api/sellers/discounts/products - Get seller products for discount selection
router.get("/products", asyncHandler(getSellerProductsForDiscount as any));

// GET /api/sellers/discounts/:id - Get a single discount
router.get("/:id", asyncHandler(getDiscount as any));

// POST /api/sellers/discounts - Create a new discount
router.post("/", asyncHandler(createDiscount as any));

// PUT /api/sellers/discounts/:id - Update a discount
router.put("/:id", asyncHandler(updateDiscount as any));

// DELETE /api/sellers/discounts/:id - Delete a discount
router.delete("/:id", asyncHandler(deleteDiscount as any));

// PATCH /api/sellers/discounts/:id/toggle - Toggle discount active status
router.patch("/:id/toggle", asyncHandler(toggleDiscountStatus as any));

// POST /api/sellers/discounts/:id/apply - Apply discount to products
router.post("/:id/apply", asyncHandler(applyDiscountToProducts as any));

// POST /api/sellers/discounts/:id/remove - Remove discount from products
router.post("/:id/remove", asyncHandler(removeDiscountFromProducts as any));

// POST /api/sellers/discounts/validate - Validate discount code (public endpoint)
router.post("/validate", asyncHandler(validateDiscountCode as any));

export default router;
