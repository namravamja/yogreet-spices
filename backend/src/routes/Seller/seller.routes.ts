import express, { Request, Response, NextFunction } from "express";
import * as sellerController from "../../controllers/Seller/seller.controller";
import { verifyToken } from "../../middleware/authMiddleware";
import { uploadFlexibleImages, uploadSellerVerificationDocuments } from "../../middleware/multer";
import { asyncHandler } from "../../middleware/errorHandler";
import productRoutes from "./product.routes";
import orderRoutes from "./order.routes";

const router = express.Router();

// Middleware to check if user is a seller
const verifySeller = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user || user.role !== "SELLER") {
    return res.status(403).json({ success: false, message: "Forbidden: Seller access required" });
  }
  next();
};

// Protected routes - require authentication and seller role
router.use(verifyToken);
router.use(verifySeller);

router.get("/view", asyncHandler(sellerController.getSeller as any));
router.put(
  "/update",
  uploadFlexibleImages([
    { name: "businessLogo", maxCount: 1 },
    { name: "storePhotos", maxCount: 10 },
  ]),
  asyncHandler(sellerController.updateSeller as any)
);

// Verification endpoints
router.get("/verification", asyncHandler(sellerController.getSellerVerification as any));
router.put(
  "/verification",
  uploadSellerVerificationDocuments,
  asyncHandler(sellerController.updateSellerVerification as any)
);

// Product routes (delegated to separate product routes file)
router.use("/products", productRoutes);
router.use("/orders", orderRoutes);

export default router;
