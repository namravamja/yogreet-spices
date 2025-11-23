import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Buyer } from "../../models/Buyer";
import { Seller } from "../../models/Seller";

interface AuthPayload {
  id: string;
  role: "BUYER" | "SELLER" | "ADMIN";
}

export const logout = async (req: Request, res: Response) => {
  const token = req.cookies.token;

  if (token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as AuthPayload;

      (req as any).user = decoded;

      if (decoded.role === "BUYER") {
        await Buyer.findByIdAndUpdate(decoded.id, { isAuthenticated: false });
      } else if (decoded.role === "SELLER") {
        await Seller.findByIdAndUpdate(decoded.id, { isAuthenticated: false });
      }
    } catch (err) {
      // Token might be expired or tampered — ignore and still clear cookie
    }
  }

  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  res.json({ message: "Logged out successfully" });
};

