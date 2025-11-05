import { Request, Response } from "express";
import * as productService from "../../services/common/product.service";

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await productService.getProducts();
    res.status(200).json({ success: true, products });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};

