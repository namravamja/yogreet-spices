import { Cart } from "../../models/Cart";
import { Product } from "../../models/Product";
import mongoose from "mongoose";

// Cart operations
export const getCartItems = async (buyerId: string) => {
  const cartItems = await Cart.find({ buyerId: new mongoose.Types.ObjectId(buyerId) })
    .populate({
      path: "productId",
      populate: {
        path: "sellerId",
        select: "fullName companyName businessLogo businessAddressId",
        populate: {
          path: "businessAddressId",
          select: "city state country",
        },
      },
    })
    .sort({ createdAt: -1 })
    .lean();
  
  return cartItems.map(item => {
    const product = item.productId as any;
    const seller = product?.sellerId;
    
    return {
      ...item,
      id: item._id.toString(),
      product: product ? {
        ...product,
        id: product._id.toString(),
        seller: seller ? {
          id: seller._id?.toString(),
          fullName: seller.fullName || null,
          companyName: seller.companyName || seller.fullName || "Unknown Seller",
          businessLogo: seller.businessLogo || null,
          businessAddress: seller.businessAddressId || null,
        } : null,
      } : null,
    };
  });
};

export interface AddToCartData {
  productId: string;
  quantity: number; // in kg
}

export const addToCart = async (buyerId: string, data: AddToCartData) => {
  // Check if product exists and has stock
  const product = await Product.findById(data.productId).lean();

  if (!product) {
    throw new Error("Product not found");
  }

  // Validate quantity
  if (!data.quantity || data.quantity <= 0) {
    throw new Error("Quantity must be greater than 0");
  }

  // Calculate total available stock from package weights
  const sampleWeight = parseFloat((product as any).sampleWeight || "0");
  const smallWeight = parseFloat((product as any).smallWeight || "0");
  const mediumWeight = parseFloat((product as any).mediumWeight || "0");
  const largeWeight = parseFloat((product as any).largeWeight || "0");
  const availableStock = sampleWeight + smallWeight + mediumWeight + largeWeight;
  
  if (data.quantity > availableStock) {
    throw new Error(`Only ${availableStock} kg available in stock`);
  }

  // Check if item already exists in cart
  const existingCartItem = await Cart.findOne({
    buyerId: new mongoose.Types.ObjectId(buyerId),
    productId: new mongoose.Types.ObjectId(data.productId),
  });

  if (existingCartItem) {
    // Prevent adding duplicate products
    throw new Error("This product is already in your cart");
  } else {
    // Create new cart item
    const cartItem = await Cart.create({
      buyerId: new mongoose.Types.ObjectId(buyerId),
      productId: new mongoose.Types.ObjectId(data.productId),
      quantity: data.quantity,
    });

    const populatedCartItem = await Cart.findById(cartItem._id)
      .populate({
        path: "productId",
        populate: {
          path: "sellerId",
          select: "fullName companyName businessLogo businessAddressId",
          populate: {
            path: "businessAddressId",
            select: "city state country",
          },
        },
      })
      .lean();
    
    const product = (populatedCartItem as any)?.productId;
    const seller = product?.sellerId;
    
    return {
      ...populatedCartItem,
      id: populatedCartItem!._id.toString(),
      product: product ? {
        ...product,
        id: product._id.toString(),
        seller: seller ? {
          id: seller._id?.toString(),
          fullName: seller.fullName || null,
          companyName: seller.companyName || seller.fullName || "Unknown Seller",
          businessLogo: seller.businessLogo || null,
          businessAddress: seller.businessAddressId || null,
        } : null,
      } : null,
    };
  }
};

export interface UpdateCartItemData {
  quantity: number;
}

export const updateCartItem = async (buyerId: string, cartItemId: string, data: UpdateCartItemData) => {
  const cartItem = await Cart.findOne({
    _id: new mongoose.Types.ObjectId(cartItemId),
    buyerId: new mongoose.Types.ObjectId(buyerId),
  }).populate("productId").lean();

  if (!cartItem) {
    throw new Error("Cart item not found");
  }

  // Calculate total available stock from package weights
  const cartProduct = cartItem.productId as any;
  const sampleWeight = parseFloat(cartProduct?.sampleWeight || "0");
  const smallWeight = parseFloat(cartProduct?.smallWeight || "0");
  const mediumWeight = parseFloat(cartProduct?.mediumWeight || "0");
  const largeWeight = parseFloat(cartProduct?.largeWeight || "0");
  const availableStock = sampleWeight + smallWeight + mediumWeight + largeWeight;
  
  if (data.quantity > availableStock) {
    throw new Error(`Only ${availableStock} kg available in stock`);
  }

  if (data.quantity <= 0) {
    throw new Error("Quantity must be greater than 0");
  }

  const updatedCartItem = await Cart.findByIdAndUpdate(
    cartItemId,
    { $set: { quantity: data.quantity } },
    { new: true }
  )
    .populate({
      path: "productId",
      populate: {
        path: "sellerId",
        select: "fullName companyName businessLogo businessAddressId",
        populate: {
          path: "businessAddressId",
          select: "city state country",
        },
      },
    })
    .lean();
  
  const updatedProduct = (updatedCartItem as any)?.productId;
  const seller = updatedProduct?.sellerId;
  
  return {
    ...updatedCartItem,
    id: updatedCartItem!._id.toString(),
    product: updatedProduct ? {
      ...updatedProduct,
      id: updatedProduct._id.toString(),
      seller: seller ? {
        id: seller._id?.toString(),
        fullName: seller.fullName || null,
        companyName: seller.companyName || seller.fullName || "Unknown Seller",
        businessLogo: seller.businessLogo || null,
        businessAddress: seller.businessAddressId || null,
      } : null,
    } : null,
  };
};

export const removeCartItem = async (buyerId: string, cartItemId: string) => {
  const cartItem = await Cart.findOne({
    _id: new mongoose.Types.ObjectId(cartItemId),
    buyerId: new mongoose.Types.ObjectId(buyerId),
  });

  if (!cartItem) {
    throw new Error("Cart item not found");
  }

  await Cart.findByIdAndDelete(cartItemId);
};

export const clearCart = async (buyerId: string) => {
  await Cart.deleteMany({ buyerId: new mongoose.Types.ObjectId(buyerId) });
};

