import express from "express";
import { verifyToken } from "../../middleware/authMiddleware";
import { asyncHandler } from "../../middleware/errorHandler";
import { createPayment, confirmAndRelease, raiseDispute, markDeliveredBySeller } from "../../controllers/common/payments.controller";
import { uploadSingle } from "../../middleware/multer";

const router = express.Router();

router.use(verifyToken);

router.post("/create/:orderId", asyncHandler(createPayment as any));
router.post("/:orderId/release", asyncHandler(confirmAndRelease as any));
router.post("/:orderId/dispute", uploadSingle.single("buyerBarcodeImage"), asyncHandler(raiseDispute as any));
router.patch("/:orderId/delivered", asyncHandler(markDeliveredBySeller as any));

export default router;
