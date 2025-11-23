import { Request, Response } from "express";
import * as productService from "../../services/common/product.service";

export const getProducts = async (req: Request, res: Response) => {
  const products = await productService.getProducts();
  res.status(200).json({ success: true, products });
};

