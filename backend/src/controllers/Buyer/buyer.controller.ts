import { Request, Response } from "express";
import * as buyerService from "../../services/Buyer/buyer.service";
import * as cartService from "../../services/Buyer/cart.service";
import * as orderService from "../../services/Buyer/order.service";

interface AuthenticatedRequest extends Request {
  user?: { id: string; role: string };
  file?: Express.Multer.File;
}

export const getBuyer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const buyer = await buyerService.getBuyerById(userId);
    // Match reference format: return buyer data directly (addresses included)
    // Reference uses { source: "cache" | "db", data: buyer } but for RTK Query we return data directly
    res.json(buyer);
  } catch (error) {
    res.status(404).json({ success: false, message: (error as Error).message });
  }
};

export const updateBuyer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new Error("Unauthorized");

    // Prepare update data
    const updateData: buyerService.BuyerUpdateData = { ...req.body };

    // If an image was uploaded, use the Cloudinary URL from multer
    if (req.file) {
      // Multer with CloudinaryStorage sets req.file.path to the Cloudinary URL
      updateData.avatar = (req.file as any).path || (req.file as any).location || req.file.path;
    }

    // Convert dateOfBirth string to Date if provided
    if (updateData.dateOfBirth && typeof updateData.dateOfBirth === 'string') {
      updateData.dateOfBirth = new Date(updateData.dateOfBirth);
    }

    // Remove undefined/null values
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof buyerService.BuyerUpdateData] === undefined || 
          updateData[key as keyof buyerService.BuyerUpdateData] === null) {
        delete updateData[key as keyof buyerService.BuyerUpdateData];
      }
    });

    const buyer = await buyerService.updateBuyer(userId, updateData);
    res.json({ success: true, message: "Profile updated successfully", data: buyer });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};

// Address controllers
export const getAddresses = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const addresses = await buyerService.getBuyerAddresses(userId);
    res.json(addresses);
  } catch (error) {
    res.status(404).json({ success: false, message: (error as Error).message });
  }
};

export const createAddress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const addressData: buyerService.AddressCreateData = req.body;
    const address = await buyerService.createAddress(userId, addressData);
    res.status(201).json({ success: true, message: "Address created successfully", data: address });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};

export const updateAddress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const addressId = req.params.id;
    if (!addressId) throw new Error("Invalid address ID");

    const addressData: buyerService.AddressUpdateData = req.body;
    const address = await buyerService.updateAddress(userId, addressId, addressData);
    res.json({ success: true, message: "Address updated successfully", data: address });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};

export const deleteAddress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const addressId = req.params.id;
    if (!addressId) throw new Error("Invalid address ID");

    await buyerService.deleteAddress(userId, addressId);
    res.status(200).json({ success: true, message: "Address deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};

export const setDefaultAddress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const addressId = req.params.id;
    if (!addressId) throw new Error("Invalid address ID");

    const address = await buyerService.setDefaultAddress(userId, addressId);
    res.json({ success: true, message: "Default address updated successfully", data: address });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};

// Cart controllers
export const getCart = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const cartItems = await cartService.getCartItems(userId);
    res.json(cartItems);
  } catch (error) {
    res.status(404).json({ success: false, message: (error as Error).message });
  }
};

export const addToCart = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const cartItem = await cartService.addToCart(userId, req.body);
    res.status(201).json({ success: true, message: "Item added to cart successfully", data: cartItem });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};

export const updateCartItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const cartItemId = req.params.id;
    const cartItem = await cartService.updateCartItem(userId, cartItemId, req.body);
    res.json({ success: true, message: "Cart item updated successfully", data: cartItem });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};

export const removeCartItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const cartItemId = req.params.id;
    await cartService.removeCartItem(userId, cartItemId);
    res.status(200).json({ success: true, message: "Item removed from cart successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};

export const clearCart = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new Error("Unauthorized");

    await cartService.clearCart(userId);
    res.status(200).json({ success: true, message: "Cart cleared successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};

// Order controllers
export const getOrders = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const orders = await orderService.getBuyerOrders(userId);
    res.json(orders);
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};

export const createOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const orderData: orderService.CreateOrderData = req.body;
    const order = await orderService.createOrder(userId, orderData);
    res.status(201).json({ success: true, message: "Order placed successfully", data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};


