import express, { Request, Response, NextFunction } from "express";
import * as sellerController from "../../controllers/Seller/seller.controller";
import { verifyToken } from "../../middleware/authMiddleware";
import { uploadSingle, uploadSellerVerificationDocuments } from "../../middleware/multer";

const router = express.Router();

// Middleware to check if user is a seller
const verifySeller = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user || user.role !== "SELLER") {
    return res.status(403).json({ error: "Forbidden: Seller access required" });
  }
  next();
};

// Protected routes - require authentication and seller role
router.use(verifyToken);
router.use(verifySeller);

router.get("/view", sellerController.getSeller as any);
router.put(
  "/update",
  uploadSingle.single("businessLogo"),
  sellerController.updateSeller as any
);

// Verification endpoints
router.get("/verification", sellerController.getSellerVerification as any);
router.put(
  "/verification",
  uploadSellerVerificationDocuments,
  sellerController.updateSellerVerification as any
);

export default router;

