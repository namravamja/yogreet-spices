import express from "express";
import {
  loginBuyer,
  signupBuyer,
  loginSeller,
  signupSeller,
} from "../../controllers/common/auth.controller";
import { logout } from "../../controllers/common/logout.controller";
import { verifyEmail } from "../../controllers/common/verifymail.controller";
import { resendVerificationEmail } from "../../controllers/common/resendVerification.controller";

const router = express.Router();

// Buyer routes
router.post("/buyer/signup", signupBuyer);
router.post("/buyer/login", loginBuyer);

// Seller routes
router.post("/seller/signup", signupSeller);
router.post("/seller/login", loginSeller);

// Verification routes
router.get("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);

router.post("/logout", logout);

export default router;
