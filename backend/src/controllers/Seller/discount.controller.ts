import { Request, Response } from "express";
import { Discount, Product } from "../../models";
import mongoose from "mongoose";

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

// Get all discounts for seller
export const getSellerDiscounts = async (req: AuthRequest, res: Response) => {
  try {
    const sellerId = req.user?.id;
    if (!sellerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const discounts = await Discount.find({ sellerId })
      .sort({ createdAt: -1 })
      .populate("applicableProducts", "productName");

    res.json({
      success: true,
      data: discounts,
    });
  } catch (error) {
    console.error("Get discounts error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch discounts" });
  }
};

// Get a single discount
export const getDiscount = async (req: AuthRequest, res: Response) => {
  try {
    const sellerId = req.user?.id;
    const { id } = req.params;

    if (!sellerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid discount ID" });
    }

    const discount = await Discount.findOne({ _id: id, sellerId })
      .populate("applicableProducts", "productName");

    if (!discount) {
      return res.status(404).json({ success: false, message: "Discount not found" });
    }

    res.json({
      success: true,
      data: discount,
    });
  } catch (error) {
    console.error("Get discount error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch discount" });
  }
};

// Create a new discount
export const createDiscount = async (req: AuthRequest, res: Response) => {
  try {
    const sellerId = req.user?.id;
    if (!sellerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const {
      code,
      name,
      description,
      type,
      value,
      minOrderAmount,
      maxDiscountAmount,
      usageLimit,
      applicableProducts,
      applicableCategories,
      isActive,
      startDate,
      endDate,
    } = req.body;

    // Validate required fields
    if (!code || !name || !type || value === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: "Code, name, type, and value are required" 
      });
    }

    // Validate discount type
    if (!["percentage", "fixed"].includes(type)) {
      return res.status(400).json({ 
        success: false, 
        message: "Type must be 'percentage' or 'fixed'" 
      });
    }

    // Validate percentage value
    if (type === "percentage" && (value < 0 || value > 100)) {
      return res.status(400).json({ 
        success: false, 
        message: "Percentage discount must be between 0 and 100" 
      });
    }

    // Check if code already exists for this seller
    const existingDiscount = await Discount.findOne({ 
      sellerId, 
      code: code.toUpperCase() 
    });

    if (existingDiscount) {
      return res.status(400).json({ 
        success: false, 
        message: "A discount with this code already exists" 
      });
    }

    const discount = new Discount({
      sellerId,
      code: code.toUpperCase(),
      name,
      description,
      type,
      value,
      minOrderAmount: minOrderAmount || 0,
      maxDiscountAmount,
      usageLimit,
      applicableProducts,
      applicableCategories,
      isActive: isActive !== undefined ? isActive : true,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : undefined,
    });

    await discount.save();

    res.status(201).json({
      success: true,
      message: "Discount created successfully",
      data: discount,
    });
  } catch (error) {
    console.error("Create discount error:", error);
    if ((error as any).code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: "A discount with this code already exists" 
      });
    }
    res.status(500).json({ success: false, message: "Failed to create discount" });
  }
};

// Update a discount
export const updateDiscount = async (req: AuthRequest, res: Response) => {
  try {
    const sellerId = req.user?.id;
    const { id } = req.params;

    if (!sellerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid discount ID" });
    }

    const {
      code,
      name,
      description,
      type,
      value,
      minOrderAmount,
      maxDiscountAmount,
      usageLimit,
      applicableProducts,
      applicableCategories,
      isActive,
      startDate,
      endDate,
    } = req.body;

    // Find the discount
    const discount = await Discount.findOne({ _id: id, sellerId });
    if (!discount) {
      return res.status(404).json({ success: false, message: "Discount not found" });
    }

    // If code is being changed, check for duplicates
    if (code && code.toUpperCase() !== discount.code) {
      const existingDiscount = await Discount.findOne({ 
        sellerId, 
        code: code.toUpperCase(),
        _id: { $ne: id }
      });
      if (existingDiscount) {
        return res.status(400).json({ 
          success: false, 
          message: "A discount with this code already exists" 
        });
      }
    }

    // Validate type if provided
    if (type && !["percentage", "fixed"].includes(type)) {
      return res.status(400).json({ 
        success: false, 
        message: "Type must be 'percentage' or 'fixed'" 
      });
    }

    // Validate percentage value
    const discountType = type || discount.type;
    const discountValue = value !== undefined ? value : discount.value;
    if (discountType === "percentage" && (discountValue < 0 || discountValue > 100)) {
      return res.status(400).json({ 
        success: false, 
        message: "Percentage discount must be between 0 and 100" 
      });
    }

    // Update fields
    if (code) discount.code = code.toUpperCase();
    if (name) discount.name = name;
    if (description !== undefined) discount.description = description;
    if (type) discount.type = type;
    if (value !== undefined) discount.value = value;
    if (minOrderAmount !== undefined) discount.minOrderAmount = minOrderAmount;
    if (maxDiscountAmount !== undefined) discount.maxDiscountAmount = maxDiscountAmount;
    if (usageLimit !== undefined) discount.usageLimit = usageLimit;
    if (applicableProducts !== undefined) discount.applicableProducts = applicableProducts;
    if (applicableCategories !== undefined) discount.applicableCategories = applicableCategories;
    if (isActive !== undefined) discount.isActive = isActive;
    if (startDate) discount.startDate = new Date(startDate);
    if (endDate !== undefined) (discount as any).endDate = endDate ? new Date(endDate) : undefined;

    await discount.save();

    res.json({
      success: true,
      message: "Discount updated successfully",
      data: discount,
    });
  } catch (error) {
    console.error("Update discount error:", error);
    if ((error as any).code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: "A discount with this code already exists" 
      });
    }
    res.status(500).json({ success: false, message: "Failed to update discount" });
  }
};

// Delete a discount
export const deleteDiscount = async (req: AuthRequest, res: Response) => {
  try {
    const sellerId = req.user?.id;
    const { id } = req.params;

    if (!sellerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid discount ID" });
    }

    const discount = await Discount.findOneAndDelete({ _id: id, sellerId });

    if (!discount) {
      return res.status(404).json({ success: false, message: "Discount not found" });
    }

    res.json({
      success: true,
      message: "Discount deleted successfully",
    });
  } catch (error) {
    console.error("Delete discount error:", error);
    res.status(500).json({ success: false, message: "Failed to delete discount" });
  }
};

// Toggle discount status
export const toggleDiscountStatus = async (req: AuthRequest, res: Response) => {
  try {
    const sellerId = req.user?.id;
    const { id } = req.params;

    if (!sellerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid discount ID" });
    }

    const discount = await Discount.findOne({ _id: id, sellerId });

    if (!discount) {
      return res.status(404).json({ success: false, message: "Discount not found" });
    }

    discount.isActive = !discount.isActive;
    await discount.save();

    res.json({
      success: true,
      message: `Discount ${discount.isActive ? "activated" : "deactivated"} successfully`,
      data: discount,
    });
  } catch (error) {
    console.error("Toggle discount error:", error);
    res.status(500).json({ success: false, message: "Failed to toggle discount status" });
  }
};

// Apply discount to products
export const applyDiscountToProducts = async (req: AuthRequest, res: Response) => {
  try {
    const sellerId = req.user?.id;
    const { id } = req.params;
    const { productIds } = req.body;

    if (!sellerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ success: false, message: "Product IDs are required" });
    }

    // Verify discount belongs to seller
    const discount = await Discount.findOne({ _id: id, sellerId });
    if (!discount) {
      return res.status(404).json({ success: false, message: "Discount not found" });
    }

    // Verify all products belong to seller
    const products = await Product.find({ _id: { $in: productIds }, sellerId });
    
    if (products.length !== productIds.length) {
      return res.status(400).json({ 
        success: false, 
        message: "Some products were not found or don't belong to you" 
      });
    }

    // Remove this discount from any products that previously had it
    await Product.updateMany(
      { activeDiscount: id },
      { $set: { activeDiscount: null } }
    );

    // Apply discount to selected products
    await Product.updateMany(
      { _id: { $in: productIds }, sellerId },
      { $set: { activeDiscount: id } }
    );

    // Update discount's applicableProducts array
    discount.applicableProducts = productIds;
    await discount.save();

    res.json({
      success: true,
      message: `Discount applied to ${productIds.length} product(s)`,
      data: discount,
    });
  } catch (error) {
    console.error("Apply discount error:", error);
    res.status(500).json({ success: false, message: "Failed to apply discount to products" });
  }
};

// Remove discount from all products
export const removeDiscountFromProducts = async (req: AuthRequest, res: Response) => {
  try {
    const sellerId = req.user?.id;
    const { id } = req.params;

    if (!sellerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Verify discount belongs to seller
    const discount = await Discount.findOne({ _id: id, sellerId });
    if (!discount) {
      return res.status(404).json({ success: false, message: "Discount not found" });
    }
    
    // Remove discount from all products that have it
    const result = await Product.updateMany(
      { activeDiscount: id },
      { $set: { activeDiscount: null } }
    );

    // Clear applicableProducts array
    discount.applicableProducts = [];
    await discount.save();

    res.json({
      success: true,
      message: `Discount removed from ${result.modifiedCount} product(s)`,
      data: discount,
    });
  } catch (error) {
    console.error("Remove discount error:", error);
    res.status(500).json({ success: false, message: "Failed to remove discount from products" });
  }
};

// Get products with discount info for a seller
export const getSellerProductsForDiscount = async (req: AuthRequest, res: Response) => {
  try {
    const sellerId = req.user?.id;
    const { discountId } = req.query;

    if (!sellerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    
    const products = await Product.find({ sellerId })
      .select("productName productImages activeDiscount")
      .populate("activeDiscount", "name code type value")
      .lean();

    // Mark which products are selected for the given discount
    const productsWithSelection = products.map((product: any) => ({
      ...product,
      isSelected: discountId ? product.activeDiscount?._id?.toString() === discountId : false,
      hasOtherDiscount: discountId 
        ? product.activeDiscount && product.activeDiscount._id?.toString() !== discountId
        : !!product.activeDiscount,
    }));

    res.json({
      success: true,
      data: productsWithSelection,
    });
  } catch (error) {
    console.error("Get seller products error:", error);
    res.status(500).json({ success: false, message: "Failed to get products" });
  }
};

// Validate a discount code (for buyers)
export const validateDiscountCode = async (req: Request, res: Response) => {
  try {
    const { code, sellerId, orderAmount } = req.body;

    if (!code || !sellerId) {
      return res.status(400).json({ 
        success: false, 
        message: "Code and sellerId are required" 
      });
    }

    const discount = await Discount.findOne({
      sellerId,
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!discount) {
      return res.status(404).json({ 
        success: false, 
        message: "Invalid discount code" 
      });
    }

    // Check date validity
    const now = new Date();
    if (discount.startDate && now < discount.startDate) {
      return res.status(400).json({ 
        success: false, 
        message: "This discount is not yet active" 
      });
    }

    if (discount.endDate && now > discount.endDate) {
      return res.status(400).json({ 
        success: false, 
        message: "This discount has expired" 
      });
    }

    // Check usage limit
    if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
      return res.status(400).json({ 
        success: false, 
        message: "This discount has reached its usage limit" 
      });
    }

    // Check minimum order amount
    if (orderAmount && discount.minOrderAmount && orderAmount < discount.minOrderAmount) {
      return res.status(400).json({ 
        success: false, 
        message: `Minimum order amount of ₹${discount.minOrderAmount} required` 
      });
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (orderAmount) {
      if (discount.type === "percentage") {
        discountAmount = (orderAmount * discount.value) / 100;
        if (discount.maxDiscountAmount) {
          discountAmount = Math.min(discountAmount, discount.maxDiscountAmount);
        }
      } else {
        discountAmount = discount.value;
      }
    }

    res.json({
      success: true,
      data: {
        id: discount._id,
        code: discount.code,
        name: discount.name,
        type: discount.type,
        value: discount.value,
        discountAmount: Math.round(discountAmount * 100) / 100,
        minOrderAmount: discount.minOrderAmount,
        maxDiscountAmount: discount.maxDiscountAmount,
      },
    });
  } catch (error) {
    console.error("Validate discount error:", error);
    res.status(500).json({ success: false, message: "Failed to validate discount" });
  }
};
