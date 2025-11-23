import express from "express";
import {
  loginBuyer,
  signupBuyer,
  loginSeller,
  signupSeller,
  loginAdmin,
} from "../../controllers/common/auth.controller";
import { logout } from "../../controllers/common/logout.controller";
import { verifyEmail } from "../../controllers/common/verifymail.controller";
import { resendVerificationEmail } from "../../controllers/common/resendVerification.controller";
import { asyncHandler } from "../../middleware/errorHandler";

const router = express.Router();

// Buyer routes
router.post("/buyer/signup", asyncHandler(signupBuyer as any));
router.post("/buyer/login", asyncHandler(loginBuyer as any));

// Seller routes
router.post("/seller/signup", asyncHandler(signupSeller as any));
router.post("/seller/login", asyncHandler(loginSeller as any));

// Admin routes
router.post("/admin/login", asyncHandler(loginAdmin as any));

// Verification routes
router.get("/verify-email", asyncHandler(verifyEmail as any));
router.post("/resend-verification", asyncHandler(resendVerificationEmail as any));

router.post("/logout", asyncHandler(logout as any));

export default router;
