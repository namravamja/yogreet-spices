import { Request, Response, NextFunction } from "express";
import { verifyVerificationToken } from "../../utils/jwt";
import { Buyer } from "../../models/Buyer";
import { Seller } from "../../models/Seller";

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // TEMPORARY: Email verification disabled - all users automatically verified
    const acceptsJson = req.headers.accept?.includes("application/json");
    if (acceptsJson) {
      res.json({ 
        success: true, 
        message: "Email verification is disabled. Account is automatically verified."
      });
    } else {
      res.redirect(`${process.env.FRONTEND_URL}/?openLogin=true`);
    }
    return;

    // ===== COMMENTED OUT: Original verification code below =====
    // const { token } = req.query;
    // if (!token || typeof token !== "string") { ... }
    // const payload = verifyVerificationToken(token);
    // [All original buyer and seller verification logic commented out]
  } catch (error) {
    const acceptsJson = req.headers.accept?.includes("application/json");
    if (acceptsJson) {
      res.status(500).json({ error: "Internal server error" });
    } else {
      res.redirect(`${process.env.FRONTEND_URL}/verify-email?status=error&message=${encodeURIComponent("Internal server error")}`);
    }
  }
};


