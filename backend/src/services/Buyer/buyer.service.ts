import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface BuyerUpdateData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: Date;
  gender?: string;
}

export const getBuyerById = async (id: string) => {
  const buyer = await prisma.buyer.findUnique({
    where: { id },
    select: {
      password: false,
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      avatar: true,
      dateOfBirth: true,
      gender: true,
      createdAt: true,
      updatedAt: true,
      isVerified: true,
      isAuthenticated: true,
      addresses: true,
    },
  });
  if (!buyer) throw new Error("Buyer not found");
  return buyer;
};

export const updateBuyer = async (id: string, data: BuyerUpdateData) => {
  const buyer = await prisma.buyer.update({
    where: { id },
    data,
    select: {
      password: false,
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      avatar: true,
      dateOfBirth: true,
      gender: true,
      createdAt: true,
      updatedAt: true,
      isVerified: true,
      isAuthenticated: true,
      addresses: true,
    },
  });
  return buyer;
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
  const addresses = await prisma.address.findMany({
    where: { userId: buyerId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
  return addresses;
};

export const createAddress = async (buyerId: string, data: AddressCreateData) => {
  // If this address is set as default, unset all other default addresses
  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { userId: buyerId, isDefault: true },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
    data: {
      ...data,
      userId: buyerId,
    },
  });
  return address;
};

export const updateAddress = async (buyerId: string, addressId: number, data: AddressUpdateData) => {
  // If this address is set as default, unset all other default addresses
  if (data.isDefault === true) {
    await prisma.address.updateMany({
      where: { userId: buyerId, isDefault: true, id: { not: addressId } },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.update({
    where: { id: addressId, userId: buyerId },
    data,
  });
  return address;
};

export const deleteAddress = async (buyerId: string, addressId: number) => {
  // Check if this is the last address
  const addressCount = await prisma.address.count({
    where: { userId: buyerId },
  });

  if (addressCount <= 1) {
    throw new Error("Cannot delete the last address. You must have at least one address.");
  }

  await prisma.address.delete({
    where: { id: addressId, userId: buyerId },
  });
};

export const setDefaultAddress = async (buyerId: string, addressId: number) => {
  // First, unset all default addresses
  await prisma.address.updateMany({
    where: { userId: buyerId, isDefault: true },
    data: { isDefault: false },
  });

  // Then set the specified address as default
  const address = await prisma.address.update({
    where: { id: addressId, userId: buyerId },
    data: { isDefault: true },
  });
  return address;
};

// Cart operations
export const getCartItems = async (buyerId: string) => {
  const cartItems = await prisma.cart.findMany({
    where: { buyerId },
    include: {
      product: {
        include: {
          seller: {
            select: {
              id: true,
              fullName: true,
              companyName: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return cartItems;
};

export interface AddToCartData {
  productId: string;
  quantity: number; // in kg
}

export const addToCart = async (buyerId: string, data: AddToCartData) => {
  // Check if product exists and has stock
  const product = await prisma.product.findUnique({
    where: { id: data.productId },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  // Calculate total available stock from package weights
  const smallWeight = parseFloat(product.smallWeight || "0");
  const mediumWeight = parseFloat(product.mediumWeight || "0");
  const largeWeight = parseFloat(product.largeWeight || "0");
  const availableStock = smallWeight + mediumWeight + largeWeight;
  
  if (data.quantity > availableStock) {
    throw new Error(`Only ${availableStock} kg available in stock`);
  }

  // Check if item already exists in cart
  const existingCartItem = await prisma.cart.findUnique({
    where: {
      buyerId_productId: {
        buyerId,
        productId: data.productId,
      },
    },
  });

  if (existingCartItem) {
    // Update quantity
    const newQuantity = existingCartItem.quantity + data.quantity;
    if (newQuantity > availableStock) {
      throw new Error(`Total quantity would exceed available stock of ${availableStock} kg`);
    }

    const cartItem = await prisma.cart.update({
      where: { id: existingCartItem.id },
      data: { quantity: newQuantity },
      include: {
        product: {
          include: {
            seller: {
              select: {
                id: true,
                fullName: true,
                companyName: true,
              },
            },
          },
        },
      },
    });
    return cartItem;
  } else {
    // Create new cart item
    const cartItem = await prisma.cart.create({
      data: {
        buyerId,
        productId: data.productId,
        quantity: data.quantity,
      },
      include: {
        product: {
          include: {
            seller: {
              select: {
                id: true,
                fullName: true,
                companyName: true,
              },
            },
          },
        },
      },
    });
    return cartItem;
  }
};

export interface UpdateCartItemData {
  quantity: number;
}

export const updateCartItem = async (buyerId: string, cartItemId: string, data: UpdateCartItemData) => {
  const cartItem = await prisma.cart.findUnique({
    where: { id: cartItemId },
    include: { product: true },
  });

  if (!cartItem || cartItem.buyerId !== buyerId) {
    throw new Error("Cart item not found");
  }

  // Calculate total available stock from package weights
  const smallWeight = parseFloat(cartItem.product.smallWeight || "0");
  const mediumWeight = parseFloat(cartItem.product.mediumWeight || "0");
  const largeWeight = parseFloat(cartItem.product.largeWeight || "0");
  const availableStock = smallWeight + mediumWeight + largeWeight;
  
  if (data.quantity > availableStock) {
    throw new Error(`Only ${availableStock} kg available in stock`);
  }

  if (data.quantity <= 0) {
    throw new Error("Quantity must be greater than 0");
  }

  const updatedCartItem = await prisma.cart.update({
    where: { id: cartItemId },
    data: { quantity: data.quantity },
    include: {
      product: {
        include: {
          seller: {
            select: {
              id: true,
              fullName: true,
              companyName: true,
            },
          },
        },
      },
    },
  });
  return updatedCartItem;
};

export const removeCartItem = async (buyerId: string, cartItemId: string) => {
  const cartItem = await prisma.cart.findUnique({
    where: { id: cartItemId },
  });

  if (!cartItem || cartItem.buyerId !== buyerId) {
    throw new Error("Cart item not found");
  }

  await prisma.cart.delete({
    where: { id: cartItemId },
  });
};

export const clearCart = async (buyerId: string) => {
  await prisma.cart.deleteMany({
    where: { buyerId },
  });
};


