import { Request, Response } from "express";
import * as buyerService from "../../services/Buyer/buyer.service";
import * as cartService from "../../services/Buyer/cart.service";
import * as orderService from "../../services/Buyer/order.service";
import { Buyer } from "../../models/Buyer";

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

export const getOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const orderId = req.params.id;
    if (!orderId) throw new Error("Invalid order ID");

    const order = await orderService.getOrderById(userId, orderId);
    res.json(order);
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};

export const autoVerifyBuyer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const buyer = await Buyer.findByIdAndUpdate(
      userId,
      { $set: { isVerified: true, isAuthenticated: true } },
      { new: true }
    )
      .select("-password")
      .lean();

    if (!buyer) throw new Error("Buyer not found");

    res.json({ success: true, message: "Buyer verified successfully", data: { id: buyer._id.toString(), isVerified: true } });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};

export const updateBuyerVerificationStep1 = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const {
      company_registration_number,
      company_name,
      date_of_incorporation,
      business_license_number,
      business_license_issuing_authority,
      business_license_expiry_date,
    } = req.body || {};

    const updates: any = {};
    if (company_registration_number !== undefined) updates.companyRegistrationNumber = company_registration_number;
    if (company_name !== undefined) updates.companyName = company_name;
    if (date_of_incorporation !== undefined) {
      updates.dateOfIncorporation = date_of_incorporation ? new Date(date_of_incorporation) : undefined;
    }
    if (business_license_number !== undefined) updates.businessLicenseNumber = business_license_number;
    if (business_license_issuing_authority !== undefined) updates.businessLicenseIssuingAuthority = business_license_issuing_authority;
    if (business_license_expiry_date !== undefined) {
      updates.businessLicenseExpiryDate = business_license_expiry_date ? new Date(business_license_expiry_date) : undefined;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(200).json({ success: true, message: "No changes", data: null });
    }

    const buyer = await Buyer.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true }
    ).select("-password").lean();

    if (!buyer) throw new Error("Buyer not found");

    return res.json({ success: true, message: "Step 1 details updated", data: { id: buyer._id.toString() } });
  } catch (error) {
    return res.status(400).json({ success: false, message: (error as Error).message });
  }
};

export const uploadBuyerVerificationStep1Docs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const files = (req as any).files as Record<string, Express.Multer.File[] | undefined>;
    const updates: any = {};

    const getUrl = (arr?: Express.Multer.File[]) => arr && arr[0] && ((arr[0] as any).path || (arr[0] as any).location || arr[0].path);

    const certUrl = getUrl(files?.company_registration_certificate as any);
    const ssmUrl = getUrl(files?.ssm_company_profile_document as any);
    const tradeUrl = getUrl(files?.business_trade_license_document as any);

    if (certUrl) updates.companyRegistrationCertificate = certUrl;
    if (ssmUrl) updates.ssmCompanyProfileDocument = ssmUrl;
    if (tradeUrl) updates.businessTradeLicenseDocument = tradeUrl;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: "No documents provided" });
    }

    await Buyer.findByIdAndUpdate(userId, { $set: updates });

    return res.json({ success: true, message: "Documents uploaded", data: updates });
  } catch (error) {
    return res.status(400).json({ success: false, message: (error as Error).message });
  }
};
