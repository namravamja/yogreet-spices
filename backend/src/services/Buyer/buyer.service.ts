import { Buyer } from "../../models/Buyer";
import { Address } from "../../models/Address";
import { Cart } from "../../models/Cart";
import { Product } from "../../models/Product";
import { Seller } from "../../models/Seller";
import mongoose from "mongoose";

export interface BuyerUpdateData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: Date;
  gender?: string;
}

export const getBuyerById = async (id: string) => {
  const buyer = await Buyer.findById(id)
    .select("-password")
    .populate("addresses")
    .lean();
  
  if (!buyer) throw new Error("Buyer not found");
  
  return {
    ...buyer,
    id: buyer._id.toString(),
    addresses: buyer.addresses || [],
  };
};

export const updateBuyer = async (id: string, data: BuyerUpdateData) => {
  const buyer = await Buyer.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true }
  )
    .select("-password")
    .populate("addresses")
    .lean();
  
  if (!buyer) throw new Error("Buyer not found");
  
  return {
    ...buyer,
    id: buyer._id.toString(),
    addresses: buyer.addresses || [],
  };
};

// Address operations
export interface AddressCreateData {
  firstName: string;
  lastName: string;
  company?: string;
  street?: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}

export interface AddressUpdateData {
  firstName?: string;
  lastName?: string;
  company?: string;
  street?: string;
  apartment?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  isDefault?: boolean;
}

export const getBuyerAddresses = async (buyerId: string) => {
  const addresses = await Address.find({ userId: new mongoose.Types.ObjectId(buyerId) })
    .sort({ isDefault: -1, createdAt: -1 })
    .lean();
  
  return addresses.map(addr => ({
    ...addr,
    id: addr._id.toString(),
  }));
};

export const createAddress = async (buyerId: string, data: AddressCreateData) => {
  // If this address is set as default, unset all other default addresses
  if (data.isDefault) {
    await Address.updateMany(
      { userId: new mongoose.Types.ObjectId(buyerId), isDefault: true },
      { $set: { isDefault: false } }
    );
  }

  const address = await Address.create({
    ...data,
    userId: new mongoose.Types.ObjectId(buyerId),
  });
  
  return {
    ...address.toObject(),
    id: address._id.toString(),
  };
};

export const updateAddress = async (buyerId: string, addressId: string, data: AddressUpdateData) => {
  // If this address is set as default, unset all other default addresses
  if (data.isDefault === true) {
    await Address.updateMany(
      { 
        userId: new mongoose.Types.ObjectId(buyerId), 
        isDefault: true,
        _id: { $ne: new mongoose.Types.ObjectId(addressId) }
      },
      { $set: { isDefault: false } }
    );
  }

  const address = await Address.findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(addressId), userId: new mongoose.Types.ObjectId(buyerId) },
    { $set: data },
    { new: true }
  ).lean();
  
  if (!address) throw new Error("Address not found");
  
  return {
    ...address,
    id: address._id.toString(),
  };
};

export const deleteAddress = async (buyerId: string, addressId: string) => {
  // Check if this is the last address
  const addressCount = await Address.countDocuments({ userId: new mongoose.Types.ObjectId(buyerId) });

  if (addressCount <= 1) {
    throw new Error("Cannot delete the last address. You must have at least one address.");
  }

  await Address.findOneAndDelete({
    _id: new mongoose.Types.ObjectId(addressId),
    userId: new mongoose.Types.ObjectId(buyerId),
  });
};

export const setDefaultAddress = async (buyerId: string, addressId: string) => {
  // First, unset all default addresses
  await Address.updateMany(
    { userId: new mongoose.Types.ObjectId(buyerId), isDefault: true },
    { $set: { isDefault: false } }
  );

  // Then set the specified address as default
  const address = await Address.findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(addressId), userId: new mongoose.Types.ObjectId(buyerId) },
    { $set: { isDefault: true } },
    { new: true }
  ).lean();
  
  if (!address) throw new Error("Address not found");
  
  return {
    ...address,
    id: address._id.toString(),
  };
};

// Cart operations
export const getCartItems = async (buyerId: string) => {
  const cartItems = await Cart.find({ buyerId: new mongoose.Types.ObjectId(buyerId) })
    .populate({
      path: "productId",
      populate: {
        path: "sellerId",
        select: "fullName companyName",
      },
    })
    .sort({ createdAt: -1 })
    .lean();
  
  return cartItems.map(item => ({
    ...item,
    id: item._id.toString(),
    product: item.productId ? {
      ...(item.productId as any),
      id: (item.productId as any)._id.toString(),
      seller: (item.productId as any).sellerId ? {
        id: ((item.productId as any).sellerId as any)._id?.toString(),
        fullName: ((item.productId as any).sellerId as any).fullName,
        companyName: ((item.productId as any).sellerId as any).companyName,
      } : null,
    } : null,
  }));
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

  // Calculate total available stock from package weights
  const smallWeight = parseFloat((product as any).smallWeight || "0");
  const mediumWeight = parseFloat((product as any).mediumWeight || "0");
  const largeWeight = parseFloat((product as any).largeWeight || "0");
  const availableStock = smallWeight + mediumWeight + largeWeight;
  
  if (data.quantity > availableStock) {
    throw new Error(`Only ${availableStock} kg available in stock`);
  }

  // Check if item already exists in cart
  const existingCartItem = await Cart.findOne({
    buyerId: new mongoose.Types.ObjectId(buyerId),
    productId: new mongoose.Types.ObjectId(data.productId),
  });

  if (existingCartItem) {
    // Update quantity
    const newQuantity = existingCartItem.quantity + data.quantity;
    if (newQuantity > availableStock) {
      throw new Error(`Total quantity would exceed available stock of ${availableStock} kg`);
    }

    existingCartItem.quantity = newQuantity;
    await existingCartItem.save();

    const cartItem = await Cart.findById(existingCartItem._id)
      .populate({
        path: "productId",
        populate: {
          path: "sellerId",
          select: "fullName companyName",
        },
      })
      .lean();
    
    return {
      ...cartItem,
      id: cartItem!._id.toString(),
      product: (cartItem as any).productId ? {
        ...((cartItem as any).productId as any),
        id: ((cartItem as any).productId as any)._id.toString(),
        seller: ((cartItem as any).productId as any).sellerId ? {
          id: (((cartItem as any).productId as any).sellerId as any)._id?.toString(),
          fullName: (((cartItem as any).productId as any).sellerId as any).fullName,
          companyName: (((cartItem as any).productId as any).sellerId as any).companyName,
        } : null,
      } : null,
    };
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
          select: "fullName companyName",
        },
      })
      .lean();
    
    return {
      ...populatedCartItem,
      id: populatedCartItem!._id.toString(),
      product: (populatedCartItem as any).productId ? {
        ...((populatedCartItem as any).productId as any),
        id: ((populatedCartItem as any).productId as any)._id.toString(),
        seller: ((populatedCartItem as any).productId as any).sellerId ? {
          id: (((populatedCartItem as any).productId as any).sellerId as any)._id?.toString(),
          fullName: (((populatedCartItem as any).productId as any).sellerId as any).fullName,
          companyName: (((populatedCartItem as any).productId as any).sellerId as any).companyName,
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
  const product = cartItem.productId as any;
  const smallWeight = parseFloat(product?.smallWeight || "0");
  const mediumWeight = parseFloat(product?.mediumWeight || "0");
  const largeWeight = parseFloat(product?.largeWeight || "0");
  const availableStock = smallWeight + mediumWeight + largeWeight;
  
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
        select: "fullName companyName",
      },
    })
    .lean();
  
  return {
    ...updatedCartItem,
    id: updatedCartItem!._id.toString(),
    product: (updatedCartItem as any).productId ? {
      ...((updatedCartItem as any).productId as any),
      id: ((updatedCartItem as any).productId as any)._id.toString(),
      seller: ((updatedCartItem as any).productId as any).sellerId ? {
        id: (((updatedCartItem as any).productId as any).sellerId as any)._id?.toString(),
        fullName: (((updatedCartItem as any).productId as any).sellerId as any).fullName,
        companyName: (((updatedCartItem as any).productId as any).sellerId as any).companyName,
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
