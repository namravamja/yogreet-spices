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
      res.status(400).json({ error: "Verification token is required" });
      return;
    }

    const payload = verifyVerificationToken(token);

    if (payload.role === "BUYER") {
      const buyer = await prisma.buyer.findUnique({
        where: { id: payload.id },
      });

      if (!buyer) {
        res.status(400).json({ error: "Invalid verification token" });
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
          // Redirect directly to buyer document verification page
          res.redirect(`${process.env.FRONTEND_URL}/buyer/verify-document/1?alreadyVerified=true`);
        }
        return;
      }

      if (buyer.verifyToken !== token || buyer.verifyExpires! < new Date()) {
        res
          .status(400)
          .json({ error: "Verification token expired or invalid" });
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
        // Redirect directly to buyer document verification page
        res.redirect(`${process.env.FRONTEND_URL}/buyer/verify-document/1?verified=true`);
      }
      return;
    } else if (payload.role === "SELLER") {
      const seller = await prisma.seller.findUnique({
        where: { id: payload.id },
      });

      if (!seller) {
        res.status(400).json({ error: "Invalid verification token" });
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
          // Redirect directly to seller document verification page
          res.redirect(`${process.env.FRONTEND_URL}/seller/verify-document/1?alreadyVerified=true`);
        }
        return;
      }

      if (seller.verifyToken !== token || seller.verifyExpires! < new Date()) {
        res
          .status(400)
          .json({ error: "Verification token expired or invalid" });
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
        // Redirect directly to seller document verification page
        res.redirect(`${process.env.FRONTEND_URL}/seller/verify-document/1?verified=true`);
      }
      return;
    } else {
      res.status(400).json({ error: "Invalid role in token" });
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
      // Redirect to appropriate document verification page with error based on token role if available
      const errorParam = encodeURIComponent(err.message || "Verification failed");
      // Try to get role from token if verification failed during token parsing
      try {
        const tokenRole = (req.query.token as string) ? 
          (JSON.parse(Buffer.from((req.query.token as string).split('.')[1], 'base64').toString()).role) : null;
        if (tokenRole === "SELLER") {
          res.redirect(`${process.env.FRONTEND_URL}/seller/verify-document/1?error=${errorParam}`);
        } else {
          res.redirect(`${process.env.FRONTEND_URL}/buyer/verify-document/1?error=${errorParam}`);
        }
      } catch {
        // Fallback to buyer document verification page if can't determine role
        res.redirect(`${process.env.FRONTEND_URL}/buyer/verify-document/1?error=${errorParam}`);
      }
    }
  }
};

