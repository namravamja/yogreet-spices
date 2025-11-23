import express, { Request, Response, NextFunction } from "express";
import * as productController from "../../controllers/Seller/product.controller";
import { verifyToken } from "../../middleware/authMiddleware";
import { uploadProductImages } from "../../middleware/multer";
import { asyncHandler } from "../../middleware/errorHandler";

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

// Product endpoints
router.get("/", asyncHandler(productController.getSellerProducts as any));
router.get("/:id", asyncHandler(productController.getSellerProduct as any));
router.post(
  "/",
  uploadProductImages,
  asyncHandler(productController.createProduct as any)
);
router.put(
  "/:id",
  uploadProductImages,
  asyncHandler(productController.updateProduct as any)
);
router.delete("/:id", asyncHandler(productController.deleteProduct as any));

export default router;

