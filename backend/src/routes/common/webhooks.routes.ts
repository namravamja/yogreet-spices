import express from "express";
import { asyncHandler } from "../../middleware/errorHandler";
import { razorpayWebhook, stripeWebhook } from "../../controllers/common/webhooks.controller";

const router = express.Router();

router.post("/razorpay", express.raw({ type: "*/*" }), asyncHandler(razorpayWebhook as any));
router.post("/stripe", express.raw({ type: "application/json" }), asyncHandler(stripeWebhook as any));

export default router;
