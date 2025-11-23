import express, { Request, Response, NextFunction } from "express";
import * as buyerController from "../../controllers/Buyer/buyer.controller";
import { verifyToken } from "../../middleware/authMiddleware";
import { uploadSingle } from "../../middleware/multer";
import { asyncHandler } from "../../middleware/errorHandler";

const router = express.Router();

// Middleware to check if user is a buyer
const verifyBuyer = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user || user.role !== "BUYER") {
    return res.status(403).json({ success: false, message: "Forbidden: Buyer access required" });
  }
  next();
};

// Protected routes - require authentication and buyer role
router.use(verifyToken);
router.use(verifyBuyer);

router.get("/view", asyncHandler(buyerController.getBuyer as any));
router.put(
  "/update",
  uploadSingle.single("avatar"),
  asyncHandler(buyerController.updateBuyer as any)
);

// Address routes
router.get("/addresses", asyncHandler(buyerController.getAddresses as any));
router.post("/addresses", asyncHandler(buyerController.createAddress as any));
router.put("/addresses/:id", asyncHandler(buyerController.updateAddress as any));
router.delete("/addresses/:id", asyncHandler(buyerController.deleteAddress as any));
router.patch("/addresses/:id/default", asyncHandler(buyerController.setDefaultAddress as any));

// Cart routes
router.get("/cart", asyncHandler(buyerController.getCart as any));
router.post("/cart", asyncHandler(buyerController.addToCart as any));
router.put("/cart/:id", asyncHandler(buyerController.updateCartItem as any));
router.delete("/cart/:id", asyncHandler(buyerController.removeCartItem as any));
router.delete("/cart", asyncHandler(buyerController.clearCart as any));

// Order routes
router.get("/orders", asyncHandler(buyerController.getOrders as any));
router.post("/orders", asyncHandler(buyerController.createOrder as any));

export default router;

