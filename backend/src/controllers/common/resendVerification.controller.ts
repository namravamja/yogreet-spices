import { Request, Response } from "express";
import { generateVerificationToken } from "../../utils/jwt";
import { sendVerificationEmail } from "../../helpers/mailer";
import { Buyer } from "../../models/Buyer";
import { Seller } from "../../models/Seller";

export const resendVerificationEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      res.status(400).json({ 
        success: false, 
        error: "Email and role are required" 
      });
      return;
    }

    if (role === "BUYER") {
      const buyer = await Buyer.findOne({ email });

      if (!buyer) {
        res.status(404).json({ 
          success: false, 
          error: "Email not found" 
        });
        return;
      }

      if (buyer.isVerified) {
        res.status(400).json({ 
          success: false, 
          error: "Email is already verified" 
        });
        return;
      }

      // Generate new verification token
      const verifyToken = generateVerificationToken({
        id: buyer._id.toString(),
        role: "BUYER",
      });

      // Update token and expiry (5 minutes expiry)
      buyer.verifyToken = verifyToken;
      buyer.verifyExpires = new Date(Date.now() + 5 * 60 * 1000);
      await buyer.save();

      // Send verification email
      try {
        await sendVerificationEmail(buyer.email, verifyToken, "BUYER");
        res.json({ 
          success: true, 
          message: "Verification email sent successfully" 
        });
      } catch (error) {
        console.error("Failed to send verification email:", error);
        res.status(500).json({ 
          success: false, 
          error: "Failed to send verification email" 
        });
      }
    } else if (role === "SELLER") {
      const seller = await Seller.findOne({ email });

      if (!seller) {
        res.status(404).json({ 
          success: false, 
          error: "Email not found" 
        });
        return;
      }

      if (seller.isVerified) {
        res.status(400).json({ 
          success: false, 
          error: "Email is already verified" 
        });
        return;
      }

      // Generate new verification token
      const verifyToken = generateVerificationToken({
        id: seller._id.toString(),
        role: "SELLER",
      });

      // Update token and expiry (5 minutes expiry)
      seller.verifyToken = verifyToken;
      seller.verifyExpires = new Date(Date.now() + 5 * 60 * 1000);
      await seller.save();

      // Send verification email
      try {
        await sendVerificationEmail(seller.email, verifyToken, "SELLER");
        res.json({ 
          success: true, 
          message: "Verification email sent successfully" 
        });
      } catch (error) {
        console.error("Failed to send verification email:", error);
        res.status(500).json({ 
          success: false, 
          error: "Failed to send verification email" 
        });
      }
    } else {
      res.status(400).json({ 
        success: false, 
        error: "Invalid role. Must be BUYER or SELLER" 
      });
    }
  } catch (error: any) {
    console.error("Resend verification error:", error);
    const errorMessage = error?.message || error?.error || "Internal server error";
    res.status(500).json({ 
      success: false, 
      error: errorMessage
    });
  }
};

