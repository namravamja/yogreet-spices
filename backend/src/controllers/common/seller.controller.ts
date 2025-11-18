import { Request, Response } from "express";
import * as sellerService from "../../services/common/seller.service";

export const getPublicSellerProfile = async (req: Request, res: Response) => {
  try {
    const sellerId = req.params.id;
    if (!sellerId) {
      return res.status(400).json({ error: "Seller ID is required" });
    }

    const seller = await sellerService.getPublicSellerProfile(sellerId);
    res.json(seller);
  } catch (error) {
    const statusCode = (error as Error).message.includes("not found") ? 404 : 400;
    res.status(statusCode).json({ error: (error as Error).message });
  }
};

