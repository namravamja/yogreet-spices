import { Request, Response } from "express";
import { DeliveryPartner } from "../../models";
import { comparePassword, generateToken } from "../../utils/jwt";
import { getCookieOptions } from "../../utils/cookieOptions";

/**
 * Login delivery partner
 * POST /api/delivery/auth/login
 */
export const loginDeliveryPartner = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
      return;
    }

    // Find delivery partner by email
    const deliveryPartner = await DeliveryPartner.findOne({ email });

    if (!deliveryPartner) {
      res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
      return;
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, deliveryPartner.password);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
      return;
    }

    // Generate JWT token
    const token = generateToken({
      id: deliveryPartner._id.toString(),
      role: "DELIVERY_PARTNER",
    });

    // Set token in HTTP-only cookie
    res.cookie("token", token, getCookieOptions(req));

    // Return success response (exclude password)
    res.status(200).json({
      success: true,
      message: "Login successful",
      deliveryPartner: {
        id: deliveryPartner._id,
        name: deliveryPartner.name,
        email: deliveryPartner.email,
        phone: deliveryPartner.phone,
        operatingRegions: deliveryPartner.operatingRegions,
        serviceType: deliveryPartner.serviceType,
      },
    });
  } catch (error: any) {
    console.error("Error in loginDeliveryPartner:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error during login",
    });
  }
};

/**
 * Logout delivery partner
 * POST /api/delivery/auth/logout
 */
export const logoutDeliveryPartner = async (req: Request, res: Response) => {
  try {
    // Clear the token cookie
    res.clearCookie("token");

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error: any) {
    console.error("Error in logoutDeliveryPartner:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error during logout",
    });
  }
};
