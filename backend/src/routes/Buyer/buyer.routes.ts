import express, { Request, Response, NextFunction } from "express";
import * as buyerController from "../../controllers/Buyer/buyer.controller";
import { verifyToken } from "../../middleware/authMiddleware";
import { uploadSingle } from "../../middleware/multer";

const router = express.Router();

// Middleware to check if user is a buyer
const verifyBuyer = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user || user.role !== "BUYER") {
    return res.status(403).json({ error: "Forbidden: Buyer access required" });
  }
  next();
};

// Protected routes - require authentication and buyer role
router.use(verifyToken);
router.use(verifyBuyer);

router.get("/view", buyerController.getBuyer as any);
router.put(
  "/update",
  uploadSingle.single("avatar"),
  buyerController.updateBuyer as any
);

// Address routes
router.get("/addresses", buyerController.getAddresses as any);
router.post("/addresses", buyerController.createAddress as any);
router.put("/addresses/:id", buyerController.updateAddress as any);
router.delete("/addresses/:id", buyerController.deleteAddress as any);
router.patch("/addresses/:id/default", buyerController.setDefaultAddress as any);

// Cart routes
router.get("/cart", buyerController.getCart as any);
router.post("/cart", buyerController.addToCart as any);
router.put("/cart/:id", buyerController.updateCartItem as any);
router.delete("/cart/:id", buyerController.removeCartItem as any);
router.delete("/cart", buyerController.clearCart as any);


export default router;

