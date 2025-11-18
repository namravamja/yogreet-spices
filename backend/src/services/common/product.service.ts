import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface CreateProductData {
  productName: string;
  category: string;
  subCategory?: string;
  typeOfSpice?: string;
  form?: string;
  shortDescription: string;
  productImages: string[];
  shippingCost: string;
  // About Product
  purityLevel?: string;
  originSource?: string;
  processingMethod?: string;
  shelfLife?: string;
  manufacturingDate?: string | Date;
  expiryDate?: string | Date;
  // Package pricing
  smallPrice?: string;
  smallWeight?: string;
  mediumPrice?: string;
  mediumWeight?: string;
  largePrice?: string;
  largeWeight?: string;
}

export type UpdateProductData = Partial<CreateProductData>;

export const getProducts = async () => {
  try {
    const products = await prisma.product.findMany({
      include: {
        seller: {
          select: {
            id: true,
            companyName: true,
            fullName: true,
            businessAddress: {
              select: {
                city: true,
                state: true,
                country: true,
              },
            },
          },
        },
        Review: {
          select: {
            rating: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return products;
  } catch (error) {
    throw new Error(`Failed to fetch products: ${(error as Error).message}`);
  }
};

export const createProduct = async (sellerId: string, data: CreateProductData) => {
  try {
    // Validate required fields
    if (!data.productName || !data.category || !data.shortDescription || !data.shippingCost) {
      throw new Error("Missing required fields: productName, category, shortDescription, and shippingCost are required");
    }

    if (!data.productImages || data.productImages.length === 0) {
      throw new Error("At least one product image is required");
    }

    // Validate that at least one package pricing is provided
    const hasPackagePricing = 
      (data.smallPrice && data.smallWeight) ||
      (data.mediumPrice && data.mediumWeight) ||
      (data.largePrice && data.largeWeight);

    if (!hasPackagePricing) {
      throw new Error("At least one package pricing (small, medium, or large) must be provided");
    }

    // Verify seller exists
    const seller = await prisma.seller.findUnique({
      where: { id: sellerId },
    });

    if (!seller) {
      throw new Error("Seller not found");
    }

    // Parse dates if provided as strings
    const manufacturingDate = data.manufacturingDate
      ? new Date(data.manufacturingDate)
      : null;
    const expiryDate = data.expiryDate ? new Date(data.expiryDate) : null;

    // Create product
    const product = await prisma.product.create({
      data: {
        productName: data.productName.trim(),
        category: data.category.trim(),
        subCategory: data.subCategory?.trim() || null,
        typeOfSpice: data.typeOfSpice?.trim() || null,
        form: data.form?.trim() || null,
        shortDescription: data.shortDescription.trim(),
        productImages: data.productImages,
        shippingCost: data.shippingCost.trim(),
        // About Product
        purityLevel: data.purityLevel?.trim() || null,
        originSource: data.originSource?.trim() || null,
        processingMethod: data.processingMethod?.trim() || null,
        shelfLife: data.shelfLife?.trim() || null,
        manufacturingDate: manufacturingDate,
        expiryDate: expiryDate,
        // Package pricing
        smallPrice: data.smallPrice?.trim() || null,
        smallWeight: data.smallWeight?.trim() || null,
        mediumPrice: data.mediumPrice?.trim() || null,
        mediumWeight: data.mediumWeight?.trim() || null,
        largePrice: data.largePrice?.trim() || null,
        largeWeight: data.largeWeight?.trim() || null,
        sellerId: sellerId,
      },
      include: {
        seller: {
          select: {
            id: true,
            companyName: true,
            fullName: true,
            businessAddress: {
              select: {
                city: true,
                state: true,
                country: true,
              },
            },
          },
        },
      },
    });

    return product;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to create product: ${(error as Error).message}`);
  }
};

export const getSellerProducts = async (sellerId: string) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        sellerId: sellerId,
      },
      include: {
        Review: {
          select: {
            rating: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return products;
  } catch (error) {
    throw new Error(`Failed to fetch seller products: ${(error as Error).message}`);
  }
};

export const getSellerProduct = async (sellerId: string, productId: string) => {
  try {
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        sellerId: sellerId, // Ensure the product belongs to the seller
      },
      include: {
        Review: {
          select: {
            id: true,
            rating: true,
            title: true,
            text: true,
            date: true,
            verified: true,
            buyer: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new Error("Product not found or you don't have permission to view it");
    }

    return product;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to fetch product: ${(error as Error).message}`);
  }
};

export const updateProduct = async (sellerId: string, productId: string, data: UpdateProductData) => {
  try {
    // Verify product exists and belongs to seller
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
        sellerId: sellerId,
      },
    });

    if (!existingProduct) {
      throw new Error("Product not found or you don't have permission to update it");
    }

    // Parse dates if provided as strings
    const manufacturingDate = data.manufacturingDate !== undefined
      ? (data.manufacturingDate ? new Date(data.manufacturingDate) : null)
      : undefined;
    const expiryDate = data.expiryDate !== undefined
      ? (data.expiryDate ? new Date(data.expiryDate) : null)
      : undefined;

    // Prepare update data
    const updateData: any = {};

    if (data.productName !== undefined) updateData.productName = data.productName.trim();
    if (data.category !== undefined) updateData.category = data.category.trim();
    if (data.subCategory !== undefined) updateData.subCategory = data.subCategory?.trim() || null;
    if (data.typeOfSpice !== undefined) updateData.typeOfSpice = data.typeOfSpice?.trim() || null;
    if (data.form !== undefined) updateData.form = data.form?.trim() || null;
    if (data.shortDescription !== undefined) updateData.shortDescription = data.shortDescription.trim();
    if (data.productImages !== undefined) updateData.productImages = data.productImages;
    if (data.shippingCost !== undefined) updateData.shippingCost = data.shippingCost.trim();
    
    // About Product
    if (data.purityLevel !== undefined) updateData.purityLevel = data.purityLevel?.trim() || null;
    if (data.originSource !== undefined) updateData.originSource = data.originSource?.trim() || null;
    if (data.processingMethod !== undefined) updateData.processingMethod = data.processingMethod?.trim() || null;
    if (data.shelfLife !== undefined) updateData.shelfLife = data.shelfLife?.trim() || null;
    if (manufacturingDate !== undefined) updateData.manufacturingDate = manufacturingDate;
    if (expiryDate !== undefined) updateData.expiryDate = expiryDate;
    
    // Package pricing
    if (data.smallPrice !== undefined) updateData.smallPrice = data.smallPrice?.trim() || null;
    if (data.smallWeight !== undefined) updateData.smallWeight = data.smallWeight?.trim() || null;
    if (data.mediumPrice !== undefined) updateData.mediumPrice = data.mediumPrice?.trim() || null;
    if (data.mediumWeight !== undefined) updateData.mediumWeight = data.mediumWeight?.trim() || null;
    if (data.largePrice !== undefined) updateData.largePrice = data.largePrice?.trim() || null;
    if (data.largeWeight !== undefined) updateData.largeWeight = data.largeWeight?.trim() || null;

    // Update product
    const product = await prisma.product.update({
      where: { id: productId },
      data: updateData,
      include: {
        seller: {
          select: {
            id: true,
            companyName: true,
            fullName: true,
            businessAddress: {
              select: {
                city: true,
                state: true,
                country: true,
              },
            },
          },
        },
        Review: {
          select: {
            id: true,
            rating: true,
            title: true,
            text: true,
            date: true,
            verified: true,
            buyer: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    return product;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to update product: ${(error as Error).message}`);
  }
};

export const deleteProduct = async (sellerId: string, productId: string) => {
  try {
    // Verify product exists and belongs to seller
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
        sellerId: sellerId,
      },
    });

    if (!existingProduct) {
      throw new Error("Product not found or you don't have permission to delete it");
    }

    // Delete product (cascade will handle related records)
    await prisma.product.delete({
      where: { id: productId },
    });

    return { success: true, message: "Product deleted successfully" };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to delete product: ${(error as Error).message}`);
  }
};

