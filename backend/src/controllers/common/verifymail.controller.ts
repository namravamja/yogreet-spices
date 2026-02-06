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
    const { token } = req.query;
    const acceptsJson = req.headers.accept?.includes("application/json");

    if (!token || typeof token !== "string") {
      if (acceptsJson) {
        res.status(400).json({ success: false, error: "Token is required" });
      } else {
        res.redirect(`${process.env.FRONTEND_URL}/verify-email?status=error&message=${encodeURIComponent("Token is required")}`);
      }
      return;
    }

    let payload;
    try {
      payload = verifyVerificationToken(token);
    } catch (err: any) {
      if (acceptsJson) {
        res.status(400).json({ success: false, error: err.message || "Invalid token" });
      } else {
        res.redirect(`${process.env.FRONTEND_URL}/verify-email?status=error&message=${encodeURIComponent(err.message || "Invalid token")}`);
      }
      return;
    }

    if (payload.role === "BUYER") {
      const buyer = await Buyer.findById(payload.id);
      if (!buyer) {
        if (acceptsJson) {
          res.status(404).json({ success: false, error: "Buyer not found" });
        } else {
          res.redirect(`${process.env.FRONTEND_URL}/verify-email?status=error&message=${encodeURIComponent("Buyer not found")}`);
        }
        return;
      }

      if (buyer.isVerified) {
        if (acceptsJson) {
          res.json({ success: true, message: "Email already verified" });
        } else {
          res.redirect(`${process.env.FRONTEND_URL}/verify-email?status=success&message=${encodeURIComponent("Email already verified")}&role=BUYER`);
        }
        return;
      }

      if (!buyer.verifyToken || buyer.verifyToken !== token) {
        if (acceptsJson) {
          res.status(400).json({ success: false, error: "Invalid verification token" });
        } else {
          res.redirect(`${process.env.FRONTEND_URL}/verify-email?status=error&message=${encodeURIComponent("Invalid verification token")}`);
        }
        return;
      }

      if (!buyer.verifyExpires || buyer.verifyExpires.getTime() < Date.now()) {
        if (acceptsJson) {
          res.status(400).json({ success: false, error: "Verification token expired" });
        } else {
          res.redirect(`${process.env.FRONTEND_URL}/verify-email?status=error&message=${encodeURIComponent("Verification token expired")}`);
        }
        return;
      }

      buyer.isVerified = true;
      buyer.isAuthenticated = true;
      buyer.verifyToken = undefined as any;
      buyer.verifyExpires = undefined as any;
      await buyer.save();

      if (acceptsJson) {
        res.json({ success: true, message: "Email verified successfully", role: "BUYER" });
      } else {
        res.redirect(`${process.env.FRONTEND_URL}/verify-email?status=success&message=${encodeURIComponent("Email verified successfully")}&role=BUYER`);
      }
      return;
    }

    if (payload.role === "SELLER") {
      const seller = await Seller.findById(payload.id) as any;
      if (!seller) {
        if (acceptsJson) {
          res.status(404).json({ success: false, error: "Seller not found" });
        } else {
          res.redirect(`${process.env.FRONTEND_URL}/verify-email?status=error&message=${encodeURIComponent("Seller not found")}`);
        }
        return;
      }

      if (seller.isVerified) {
        if (acceptsJson) {
          res.json({ success: true, message: "Email already verified" });
        } else {
          res.redirect(`${process.env.FRONTEND_URL}/verify-email?status=success&message=${encodeURIComponent("Email already verified")}&role=SELLER`);
        }
        return;
      }

      if (!seller.verifyToken || seller.verifyToken !== token) {
        if (acceptsJson) {
          res.status(400).json({ success: false, error: "Invalid verification token" });
        } else {
          res.redirect(`${process.env.FRONTEND_URL}/verify-email?status=error&message=${encodeURIComponent("Invalid verification token")}`);
        }
        return;
      }

      if (!seller.verifyExpires || seller.verifyExpires.getTime() < Date.now()) {
        if (acceptsJson) {
          res.status(400).json({ success: false, error: "Verification token expired" });
        } else {
          res.redirect(`${process.env.FRONTEND_URL}/verify-email?status=error&message=${encodeURIComponent("Verification token expired")}`);
        }
        return;
      }

      seller.isVerified = true;
      seller.isAuthenticated = true;
      seller.verifyToken = undefined;
      seller.verifyExpires = undefined;
      await seller.save();

      if (acceptsJson) {
        res.json({ success: true, message: "Email verified successfully", role: "SELLER" });
      } else {
        res.redirect(`${process.env.FRONTEND_URL}/verify-email?status=success&message=${encodeURIComponent("Email verified successfully")}&role=SELLER`);
      }
      return;
    }
  } catch (error) {
    const acceptsJson = req.headers.accept?.includes("application/json");
    if (acceptsJson) {
      res.status(500).json({ error: "Internal server error" });
    } else {
      res.redirect(`${process.env.FRONTEND_URL}/verify-email?status=error&message=${encodeURIComponent("Internal server error")}`);
    }
  }
};


