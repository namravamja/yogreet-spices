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

    // Handle existingImages - URLs sent separately from uploaded files
    let existingImageUrls: string[] = [];
    if (typeof productData.existingImages === 'string') {
      try {
        existingImageUrls = JSON.parse(productData.existingImages);
      } catch {
        existingImageUrls = [];
      }
    }
    // Remove existingImages from productData as it's not a model field
    delete productData.existingImages;

    // Legacy support: Handle productImages if it's a string (from older API calls)
    if (typeof productData.productImages === 'string') {
      try {
        const parsed = JSON.parse(productData.productImages);
        // Filter out base64 strings, only keep URLs
        existingImageUrls = [
          ...existingImageUrls,
          ...parsed.filter((url: string) => typeof url === 'string' && !url.startsWith('data:'))
        ];
      } catch {
        // If not valid JSON, ignore
      }
    }

    // Combine existing URLs with newly uploaded images
    const allImages = [...existingImageUrls, ...newImageUrls];
    if (allImages.length > 0) {
      productData.productImages = Array.from(new Set(allImages));
    } else {
      // If no images provided, don't update the field
      delete productData.productImages;
    }

    if (newBarcodeUrl) {
      productData.barcodeImage = newBarcodeUrl;
    }

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
