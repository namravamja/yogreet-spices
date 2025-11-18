import { Request, Response, NextFunction } from "express";
import { verifyVerificationToken } from "../../utils/jwt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      const acceptsJson = req.headers.accept?.includes("application/json");
      if (acceptsJson) {
      res.status(400).json({ error: "Verification token is required" });
      } else {
        res.redirect(`${process.env.FRONTEND_URL}/verify-email?status=error&message=${encodeURIComponent("Verification token is required")}`);
      }
      return;
    }

    const payload = verifyVerificationToken(token);

    if (payload.role === "BUYER") {
      const buyer = await prisma.buyer.findUnique({
        where: { id: payload.id },
      });

      if (!buyer) {
        const acceptsJson = req.headers.accept?.includes("application/json");
        if (acceptsJson) {
        res.status(400).json({ error: "Invalid verification token" });
        } else {
          res.redirect(`${process.env.FRONTEND_URL}/verify-email?status=error&message=${encodeURIComponent("Invalid verification token")}`);
        }
        return;
      }
      
      if (buyer.isVerified) {
        // Already verified - return success but don't update
        const acceptsJson = req.headers.accept?.includes("application/json");
        if (acceptsJson) {
          res.json({ 
            success: true, 
            message: "Email is already verified",
            role: payload.role 
          });
        } else {
          res.redirect(`${process.env.FRONTEND_URL}/verify-email?status=already`);
        }
        return;
      }

      if (buyer.verifyToken !== token || buyer.verifyExpires! < new Date()) {
        const acceptsJson = req.headers.accept?.includes("application/json");
        if (acceptsJson) {
          res.status(400).json({ error: "Verification token expired or invalid" });
        } else {
          res.redirect(`${process.env.FRONTEND_URL}/verify-email?status=error&message=${encodeURIComponent("Verification token expired or invalid")}`);
        }
        return;
      }

      await prisma.buyer.update({
        where: { id: buyer.id },
        data: {
          isVerified: true,
          verifyToken: null,
          verifyExpires: null,
        },
      });

      // Return success response for API call, or redirect for browser
      const buyerAcceptsJson = req.headers.accept?.includes("application/json");
      if (buyerAcceptsJson) {
        res.json({ 
          success: true, 
          message: "Email verified successfully",
          role: payload.role 
        });
      } else {
        res.redirect(`${process.env.FRONTEND_URL}/verify-email?status=success`);
      }
      return;
    } else if (payload.role === "SELLER") {
      const seller = await prisma.seller.findUnique({
        where: { id: payload.id },
      });

      if (!seller) {
        const acceptsJson = req.headers.accept?.includes("application/json");
        if (acceptsJson) {
        res.status(400).json({ error: "Invalid verification token" });
        } else {
          res.redirect(`${process.env.FRONTEND_URL}/verify-email?status=error&message=${encodeURIComponent("Invalid verification token")}`);
        }
        return;
      }
      
      if (seller.isVerified) {
        // Already verified - return success but don't update
        const acceptsJson = req.headers.accept?.includes("application/json");
        if (acceptsJson) {
          res.json({ 
            success: true, 
            message: "Email is already verified",
            role: payload.role 
          });
        } else {
          res.redirect(`${process.env.FRONTEND_URL}/become-seller?openLogin=true&verified=already`);
        }
        return;
      }

      if (seller.verifyToken !== token || seller.verifyExpires! < new Date()) {
        const acceptsJson = req.headers.accept?.includes("application/json");
        if (acceptsJson) {
          res.status(400).json({ error: "Verification token expired or invalid" });
        } else {
          res.redirect(`${process.env.FRONTEND_URL}/verify-email?status=error&message=${encodeURIComponent("Verification token expired or invalid")}`);
        }
        return;
      }

      await prisma.seller.update({
        where: { id: seller.id },
        data: {
          isVerified: true,
          verifyToken: null,
          verifyExpires: null,
        },
      });

      // Return success response for API call, or redirect for browser
      const sellerAcceptsJson = req.headers.accept?.includes("application/json");
      if (sellerAcceptsJson) {
        res.json({ 
          success: true, 
          message: "Email verified successfully",
          role: payload.role 
        });
      } else {
        res.redirect(`${process.env.FRONTEND_URL}/become-seller?openLogin=true&verified=true`);
      }
      return;
    } else {
      const acceptsJson = req.headers.accept?.includes("application/json");
      if (acceptsJson) {
      res.status(400).json({ error: "Invalid role in token" });
      } else {
        res.redirect(`${process.env.FRONTEND_URL}/verify-email?status=error&message=${encodeURIComponent("Invalid role in token")}`);
      }
      return;
    }
  } catch (err: any) {
    // Return error response for API call, or redirect for browser
    const acceptsJson = req.headers.accept?.includes("application/json");
    if (acceptsJson) {
      res.status(400).json({ 
        success: false, 
        error: err.message || "Verification failed" 
      });
    } else {
      const errorParam = encodeURIComponent(err.message || "Verification failed");
      res.redirect(`${process.env.FRONTEND_URL}/verify-email?status=error&message=${errorParam}`);
    }
  }
};

