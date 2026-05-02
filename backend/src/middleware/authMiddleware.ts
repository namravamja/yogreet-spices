import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthPayload {
  id: string;
  role: "BUYER" | "SELLER" | "ADMIN" | "DELIVERY_PARTNER";
}

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token;

  if (!token) {
    res.status(401).json({ error: "Unauthorized Access" });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as AuthPayload;
    (req as any).user = decoded; // attach decoded payload (including id) to req.user
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }
};

export const verifyDeliveryPartner = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token;

  if (!token) {
    res.status(401).json({ error: "Unauthorized Access" });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as AuthPayload;
    
    if (decoded.role !== "DELIVERY_PARTNER") {
      res.status(403).json({ error: "Forbidden: Delivery Partner access required" });
      return;
    }
    
    (req as any).user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }
};


