import { Request, Response } from "express";
import * as productService from "../../services/common/product.service";

interface AuthenticatedRequest extends Request {
  user?: { id: string; role: string };
  file?: Express.Multer.File;
  files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
}

export const getSellerProducts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const products = await productService.getSellerProducts(userId);
    res.json(products);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getSellerProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const productId = req.params.id;
    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    const product = await productService.getSellerProduct(userId, productId);
    res.json(product);
  } catch (error) {
    const statusCode = (error as Error).message.includes("not found") ? 404 : 400;
    res.status(statusCode).json({ error: (error as Error).message });
  }
};

export const createProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new Error("Unauthorized");

    // Prepare product data from body
    const productData: any = { ...req.body };

    const filesAny = req.files as any;
    if (Array.isArray(filesAny)) {
      const imageUrls = filesAny.map((f: any) => f?.path || f?.location || f?.secure_url).filter(Boolean);
      if (imageUrls.length > 0) productData.productImages = imageUrls;
    } else if (filesAny && typeof filesAny === "object") {
      const productImagesArr = Array.isArray(filesAny["productImages"]) ? filesAny["productImages"] : [];
      const barcodeArr = Array.isArray(filesAny["barcodeImage"]) ? filesAny["barcodeImage"] : [];
      const imgUrls = productImagesArr.map((f: any) => f?.path || f?.location || f?.secure_url).filter(Boolean);
      if (imgUrls.length > 0) productData.productImages = imgUrls;
      const barcodeUrl = barcodeArr[0]?.path || barcodeArr[0]?.location || barcodeArr[0]?.secure_url;
      if (barcodeUrl) productData.barcodeImage = barcodeUrl;
    }

    // Handle productImages if it's a string (from FormData when no files uploaded)
    if (typeof productData.productImages === 'string') {
      try {
        productData.productImages = JSON.parse(productData.productImages);
      } catch {
        // If not valid JSON, treat as comma-separated string
        productData.productImages = String(productData.productImages)
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean);
      }
    }

    // Ensure productImages is an array
    if (!Array.isArray(productData.productImages)) {
      productData.productImages = [];
    }

    // Validate required fields
    if (!productData.productName || !productData.category || !productData.shortDescription || !productData.shippingCost) {
      return res.status(400).json({ error: "Missing required fields: productName, category, shortDescription, and shippingCost are required" });
    }

    if (!productData.productImages || productData.productImages.length === 0) {
      return res.status(400).json({ error: "At least one product image is required" });
    }
    if (!productData.barcodeImage) {
      return res.status(400).json({ error: "Product barcode image is required" });
    }

    // Create product
    const product = await productService.createProduct(userId, productData);
    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const updateProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const productId = req.params.id;
    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    // Prepare product data from body
    const productData: any = { ...req.body };

    const filesAny = req.files as any;
    let newImageUrls: string[] = [];
    let newBarcodeUrl: string | undefined;
    if (Array.isArray(filesAny) && filesAny.length > 0) {
      newImageUrls = filesAny.map((f: any) => f?.path || f?.location || f?.secure_url).filter(Boolean);
    } else if (filesAny && typeof filesAny === "object") {
      const productImagesArr = Array.isArray(filesAny["productImages"]) ? filesAny["productImages"] : [];
      const barcodeArr = Array.isArray(filesAny["barcodeImage"]) ? filesAny["barcodeImage"] : [];
      newImageUrls = productImagesArr.map((f: any) => f?.path || f?.location || f?.secure_url).filter(Boolean);
      newBarcodeUrl = barcodeArr[0]?.path || barcodeArr[0]?.location || barcodeArr[0]?.secure_url;
    }

    // Handle productImages if it's a string (from FormData)
    let existingImageUrls: string[] = [];
    if (typeof productData.productImages === 'string') {
      try {
        existingImageUrls = JSON.parse(productData.productImages);
      } catch {
        // If not valid JSON, treat as comma-separated string
        existingImageUrls = String(productData.productImages)
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean);
      }
    } else if (Array.isArray(productData.productImages)) {
      existingImageUrls = productData.productImages;
    }

    // Merge existing URLs with new uploaded images
    // If new files were uploaded, combine them with existing URLs
    // Otherwise, keep existing images
    if (newImageUrls.length > 0) {
      // New images uploaded - combine with existing URLs
      // Remove duplicates and keep order
      const allImages = [...existingImageUrls, ...newImageUrls];
      productData.productImages = Array.from(new Set(allImages));
    } else if (existingImageUrls.length > 0) {
      // No new files, but existing images were sent - use those
      productData.productImages = existingImageUrls;
    }
    if (newBarcodeUrl) {
      productData.barcodeImage = newBarcodeUrl;
    }
    // If neither, productImages will be undefined and won't be updated

    // Update product
    const product = await productService.updateProduct(userId, productId, productData);
    res.json({ success: true, product });
  } catch (error) {
    const statusCode = (error as Error).message.includes("not found") ? 404 : 400;
    res.status(statusCode).json({ error: (error as Error).message });
  }
};

export const deleteProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const productId = req.params.id;
    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    const result = await productService.deleteProduct(userId, productId);
    res.json(result);
  } catch (error) {
    const statusCode = (error as Error).message.includes("not found") ? 404 : 400;
    res.status(statusCode).json({ error: (error as Error).message });
  }
};
