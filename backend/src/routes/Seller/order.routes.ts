import express, { Request, Response, NextFunction } from "express";
import { verifyToken } from "../../middleware/authMiddleware";
import { asyncHandler } from "../../middleware/errorHandler";
import { updateOrderStatus, getSellerOrders } from "../../controllers/Seller/order.controller";

const router = express.Router();

const verifySeller = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user || user.role !== "SELLER") {
    return res.status(403).json({ success: false, message: "Forbidden: Seller access required" });
  }
  next();
};

router.use(verifyToken);
router.use(verifySeller);

router.get("/", asyncHandler(getSellerOrders as any));
router.patch("/:orderId/status", asyncHandler(updateOrderStatus as any));

export default router;
