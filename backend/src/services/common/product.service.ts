import { Product } from "../../models/Product";
import { Seller } from "../../models/Seller";
import { Review } from "../../models/Review";
import { BusinessAddress } from "../../models/BusinessAddress";
import mongoose from "mongoose";

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
  samplePrice?: string;
  sampleWeight?: string;
  sampleDescription?: string;
  smallPrice?: string;
  smallWeight?: string;
  smallDescription?: string;
  mediumPrice?: string;
  mediumWeight?: string;
  mediumDescription?: string;
  largePrice?: string;
  largeWeight?: string;
  largeDescription?: string;
}

export type UpdateProductData = Partial<CreateProductData>;

export const getProducts = async () => {
  try {
    const products = await Product.find()
      .populate({
        path: "sellerId",
        select: "email companyName fullName businessType businessLogo about productCategories createdAt businessAddressId",
        populate: {
          path: "businessAddressId",
          select: "city state country",
        },
      })
      .populate({
        path: "reviews",
        select: "rating",
      })
      .sort({ createdAt: -1 })
      .lean();

    // Transform to match expected format
    return products.map((product: any) => ({
      ...product,
      id: product._id.toString(),
      seller: product.sellerId ? {
        id: product.sellerId._id?.toString(),
        email: product.sellerId.email,
        companyName: product.sellerId.companyName,
        fullName: product.sellerId.fullName,
        businessType: product.sellerId.businessType,
        businessLogo: product.sellerId.businessLogo,
        about: product.sellerId.about,
        productCategories: product.sellerId.productCategories,
        createdAt: product.sellerId.createdAt,
        businessAddress: product.sellerId.businessAddressId,
      } : null,
      Review: product.reviews || [],
    }));
  } catch (error: any) {
    const errorMessage = error?.message || error?.error || "Unknown error occurred";
    throw new Error(`Failed to fetch products: ${errorMessage}`);
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
      (data.samplePrice && data.sampleWeight) ||
      (data.smallPrice && data.smallWeight) ||
      (data.mediumPrice && data.mediumWeight) ||
      (data.largePrice && data.largeWeight);

    if (!hasPackagePricing) {
      throw new Error("At least one package pricing (sample, small, medium, or large) must be provided");
    }

    // Verify seller exists and is verified
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      throw new Error("Seller not found");
    }

    // Check if seller is verified
    if (!seller.isVerified) {
      throw new Error("Your account must be verified before you can add products. Please complete your verification process.");
    }

    // Parse dates if provided as strings
    const manufacturingDate = data.manufacturingDate
      ? new Date(data.manufacturingDate)
      : undefined;
    const expiryDate = data.expiryDate ? new Date(data.expiryDate) : undefined;

    // Create product
    const productData: any = {
        productName: data.productName.trim(),
        category: data.category.trim(),
      subCategory: data.subCategory?.trim(),
      typeOfSpice: data.typeOfSpice?.trim(),
      form: data.form?.trim(),
        shortDescription: data.shortDescription.trim(),
        productImages: data.productImages,
        shippingCost: data.shippingCost.trim(),
        // About Product
      purityLevel: data.purityLevel?.trim(),
      originSource: data.originSource?.trim(),
      processingMethod: data.processingMethod?.trim(),
      shelfLife: data.shelfLife?.trim(),
        manufacturingDate: manufacturingDate,
        expiryDate: expiryDate,
        // Package pricing
      samplePrice: data.samplePrice?.trim(),
      sampleWeight: data.sampleWeight?.trim(),
      sampleDescription: data.sampleDescription?.trim(),
      smallPrice: data.smallPrice?.trim(),
      smallWeight: data.smallWeight?.trim(),
      smallDescription: data.smallDescription?.trim(),
      mediumPrice: data.mediumPrice?.trim(),
      mediumWeight: data.mediumWeight?.trim(),
      mediumDescription: data.mediumDescription?.trim(),
      largePrice: data.largePrice?.trim(),
      largeWeight: data.largeWeight?.trim(),
      largeDescription: data.largeDescription?.trim(),
      sellerId: new mongoose.Types.ObjectId(sellerId),
    };

    // Remove undefined values
    Object.keys(productData).forEach(key => {
      if (productData[key] === undefined || productData[key] === null) {
        delete productData[key];
      }
    });

    const product = await Product.create(productData);

    // Populate seller data
    const populatedProduct = await Product.findById((product as any)._id)
      .populate({
        path: "sellerId",
        select: "email companyName fullName businessType businessLogo about productCategories createdAt businessAddressId",
        populate: {
          path: "businessAddressId",
          select: "city state country",
        },
      })
      .lean();

    return {
      ...populatedProduct,
      id: populatedProduct!._id.toString(),
      seller: populatedProduct!.sellerId ? {
        id: (populatedProduct!.sellerId as any)._id?.toString(),
        email: (populatedProduct!.sellerId as any).email,
        companyName: (populatedProduct!.sellerId as any).companyName,
        fullName: (populatedProduct!.sellerId as any).fullName,
        businessType: (populatedProduct!.sellerId as any).businessType,
        businessLogo: (populatedProduct!.sellerId as any).businessLogo,
        about: (populatedProduct!.sellerId as any).about,
        productCategories: (populatedProduct!.sellerId as any).productCategories,
        createdAt: (populatedProduct!.sellerId as any).createdAt,
        businessAddress: (populatedProduct!.sellerId as any).businessAddressId,
      } : null,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to create product: ${(error as Error).message}`);
  }
};

export const getSellerProducts = async (sellerId: string) => {
  try {
    const products = await Product.find({ sellerId: new mongoose.Types.ObjectId(sellerId) })
      .populate({
        path: "reviews",
        select: "rating",
      })
      .sort({ createdAt: -1 })
      .lean();

    return products.map((product: any) => ({
      ...product,
      id: product._id.toString(),
      Review: product.reviews || [],
    }));
  } catch (error) {
    throw new Error(`Failed to fetch seller products: ${(error as Error).message}`);
  }
};

export const getSellerProduct = async (sellerId: string, productId: string) => {
  try {
    const product = await Product.findOne({
      _id: new mongoose.Types.ObjectId(productId),
      sellerId: new mongoose.Types.ObjectId(sellerId),
    })
      .populate({
        path: "reviews",
        select: "id rating title text date verified buyerId",
        populate: {
          path: "buyerId",
          select: "firstName lastName",
              },
      })
      .lean();

    if (!product) {
      throw new Error("Product not found or you don't have permission to view it");
    }

    return {
      ...product,
      id: product._id.toString(),
      Review: (product as any).reviews?.map((review: any) => ({
        id: review._id.toString(),
        rating: review.rating,
        title: review.title,
        text: review.text,
        date: review.date,
        verified: review.verified,
        buyer: review.buyerId ? {
          firstName: review.buyerId.firstName,
          lastName: review.buyerId.lastName,
        } : null,
      })) || [],
    };
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
    const existingProduct = await Product.findOne({
      _id: new mongoose.Types.ObjectId(productId),
      sellerId: new mongoose.Types.ObjectId(sellerId),
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
    if (data.samplePrice !== undefined) updateData.samplePrice = data.samplePrice?.trim() || null;
    if (data.sampleWeight !== undefined) updateData.sampleWeight = data.sampleWeight?.trim() || null;
    if (data.sampleDescription !== undefined) updateData.sampleDescription = data.sampleDescription?.trim() || null;
    if (data.smallPrice !== undefined) updateData.smallPrice = data.smallPrice?.trim() || null;
    if (data.smallWeight !== undefined) updateData.smallWeight = data.smallWeight?.trim() || null;
    if (data.smallDescription !== undefined) updateData.smallDescription = data.smallDescription?.trim() || null;
    if (data.mediumPrice !== undefined) updateData.mediumPrice = data.mediumPrice?.trim() || null;
    if (data.mediumWeight !== undefined) updateData.mediumWeight = data.mediumWeight?.trim() || null;
    if (data.mediumDescription !== undefined) updateData.mediumDescription = data.mediumDescription?.trim() || null;
    if (data.largePrice !== undefined) updateData.largePrice = data.largePrice?.trim() || null;
    if (data.largeWeight !== undefined) updateData.largeWeight = data.largeWeight?.trim() || null;
    if (data.largeDescription !== undefined) updateData.largeDescription = data.largeDescription?.trim() || null;

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Update product
    const product = await Product.findByIdAndUpdate(
      productId,
      { $set: updateData },
      { new: true }
    )
      .populate({
        path: "sellerId",
        select: "email companyName fullName businessType businessLogo about productCategories createdAt businessAddressId",
        populate: {
          path: "businessAddressId",
          select: "city state country",
        },
      })
      .populate({
        path: "reviews",
        select: "id rating title text date verified buyerId",
        populate: {
          path: "buyerId",
          select: "firstName lastName",
        },
      })
      .lean();

    if (!product) {
      throw new Error("Product not found");
    }

    return {
      ...product,
      id: product._id.toString(),
      seller: product.sellerId ? {
        id: (product.sellerId as any)._id?.toString(),
        email: (product.sellerId as any).email,
        companyName: (product.sellerId as any).companyName,
        fullName: (product.sellerId as any).fullName,
        businessType: (product.sellerId as any).businessType,
        businessLogo: (product.sellerId as any).businessLogo,
        about: (product.sellerId as any).about,
        productCategories: (product.sellerId as any).productCategories,
        createdAt: (product.sellerId as any).createdAt,
        businessAddress: (product.sellerId as any).businessAddressId,
      } : null,
      Review: (product as any).reviews?.map((review: any) => ({
        id: review._id.toString(),
        rating: review.rating,
        title: review.title,
        text: review.text,
        date: review.date,
        verified: review.verified,
        buyer: review.buyerId ? {
          firstName: review.buyerId.firstName,
          lastName: review.buyerId.lastName,
        } : null,
      })) || [],
    };
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
    const existingProduct = await Product.findOne({
      _id: new mongoose.Types.ObjectId(productId),
      sellerId: new mongoose.Types.ObjectId(sellerId),
    });

    if (!existingProduct) {
      throw new Error("Product not found or you don't have permission to delete it");
    }

    // Delete product and related records
    await Product.findByIdAndDelete(productId);
    // Delete related cart items, order items, and reviews
    const { Cart } = await import("../../models/Cart");
    const { OrderItem } = await import("../../models/OrderItem");
    await Cart.deleteMany({ productId: new mongoose.Types.ObjectId(productId) });
    await OrderItem.deleteMany({ productId: new mongoose.Types.ObjectId(productId) });
    await Review.deleteMany({ productId: new mongoose.Types.ObjectId(productId) });

    return { success: true, message: "Product deleted successfully" };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to delete product: ${(error as Error).message}`);
  }
};
