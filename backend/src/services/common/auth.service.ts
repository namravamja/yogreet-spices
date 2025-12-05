import {
  hashPassword,
  comparePassword,
  generateToken,
  generateVerificationToken,
} from "../../utils/jwt";
import { sendVerificationEmail } from "../../helpers/mailer";
import { Buyer } from "../../models/Buyer";
import { Seller } from "../../models/Seller";
import { Admin } from "../../models/Admin";

interface SignupData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface SellerSignupData {
  email: string;
  password: string;
  fullName?: string;
  companyName?: string; // Merged from storeName and companyName
  mobile?: string;
  businessType?: string;
  productCategories?: string[] | string;
}


export const signupBuyer = async (data: SignupData) => {
  const existing = await Buyer.findOne({ email: data.email });
  if (existing) throw new Error("Email already registered");

  const hashed: string = await hashPassword(data.password);

  const buyer = await Buyer.create({
    ...data,
    password: hashed,
    // TEMPORARY: Set email as verified by default (no email verification)
    isVerified: true,
  });

  // TEMPORARY: Email verification disabled - code commented out
  // const verifyToken = generateVerificationToken({
  //   id: buyer._id.toString(),
  //   role: "BUYER",
  // });

  // // Save token & expiry (5 minutes expiry)
  // buyer.verifyToken = verifyToken;
  // buyer.verifyExpires = new Date(Date.now() + 5 * 60 * 1000);
  // await buyer.save();

  // // Send verification email - throw error if it fails so user knows
  // try {
  //   await sendVerificationEmail(buyer.email, verifyToken, "BUYER");
  // } catch (error) {
  //   const errorMessage = error instanceof Error ? error.message : "Unknown error";
  //   console.error("❌ Failed to send verification email to buyer:", errorMessage);
  //   // Delete the buyer account if email fails to send
  //   await Buyer.findByIdAndDelete(buyer._id);
  //   throw new Error(`Account creation failed: Could not send verification email. ${errorMessage}`);
  // }

  // setTimeout(async () => {
  //   const freshBuyer = await Buyer.findById(buyer._id);
  //   if (freshBuyer && !freshBuyer.isVerified) {
  //     await Buyer.findByIdAndDelete(buyer._id);
  //   }
  // }, 7 * 60 * 1000); // 7 minutes delay

  await buyer.save();

  return {
    message: "Buyer created successfully. You can now log in.",
    id: buyer._id.toString(),
  };
};

export const loginBuyer = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const buyer = await Buyer.findOne({ email });
  if (
    !buyer ||
    !buyer.password ||
    !(await comparePassword(password, buyer.password))
  ) {
    throw new Error("Invalid credentials");
  }
  // TEMPORARY: Email verification check disabled
  // if (!buyer.isVerified) {
  //   throw new Error("Please verify your email before logging in");
  // }
  const token = generateToken({ id: buyer._id.toString(), role: "BUYER" });

  buyer.isAuthenticated = true;
  await buyer.save();

  return { token, buyer: buyer.toObject() };
};

export const signupSeller = async (data: SellerSignupData) => {
  const existing = await Seller.findOne({ email: data.email });
  if (existing) throw new Error("Email already registered");

  const hashed = await hashPassword(data.password);

  // Handle productCategories: convert string to array if needed
  let productCategories: string[] = [];
  if (data.productCategories) {
    if (Array.isArray(data.productCategories)) {
      productCategories = data.productCategories;
    } else if (typeof data.productCategories === 'string') {
      try {
        // Try to parse as JSON first
        productCategories = JSON.parse(data.productCategories);
      } catch {
        // If not JSON, treat as comma-separated string
        productCategories = data.productCategories.split(',').map(cat => cat.trim()).filter(Boolean);
      }
    }
  }

  // Prepare seller data according to schema
  const sellerData: any = {
    email: data.email,
    password: hashed,
    fullName: data.fullName,
    companyName: data.companyName,
    mobile: data.mobile,
    businessType: data.businessType,
    productCategories: productCategories.length > 0 ? productCategories : [],
  };
  
  // Backward compatibility: if storeName is provided (from old frontend), use it for companyName
  const signupDataAny = data as any;
  if (signupDataAny.storeName && !data.companyName) {
    sellerData.companyName = signupDataAny.storeName;
  }

  // Remove undefined values
  Object.keys(sellerData).forEach(key => {
    if (sellerData[key] === undefined || sellerData[key] === null) {
      delete sellerData[key];
    }
  });

  const seller = await Seller.create(sellerData);

  // TEMPORARY: Set email as verified by default (no email verification)
  (seller as any).isVerified = true;
  await (seller as any).save();

  // TEMPORARY: Email verification disabled - code commented out
  // const verifyToken = generateVerificationToken({
  //   id: (seller as any)._id.toString(),
  //   role: "SELLER",
  // });

  // (seller as any).verifyToken = verifyToken;
  // (seller as any).verifyExpires = new Date(Date.now() + 5 * 60 * 1000);
  // await (seller as any).save();

  // // Send verification email - throw error if it fails so user knows
  // try {
  //   await sendVerificationEmail((seller as any).email, verifyToken, "SELLER");
  // } catch (error) {
  //   const errorMessage = error instanceof Error ? error.message : "Unknown error";
  //   console.error("❌ Failed to send verification email to seller:", errorMessage);
  //   // Delete the seller account if email fails to send
  //   await Seller.findByIdAndDelete((seller as any)._id);
  //   throw new Error(`Account creation failed: Could not send verification email. ${errorMessage}`);
  // }

  // setTimeout(async () => {
  //   const freshSeller = await Seller.findById((seller as any)._id);
  //   if (freshSeller && !freshSeller.isVerified) {
  //     await Seller.findByIdAndDelete((seller as any)._id);
  //     console.log(
  //       `Deleted unverified seller with id ${(seller as any)._id} after 7 minutes`
  //     );
  //   }
  // }, 7 * 60 * 1000);

  return {
    message: "Seller created successfully. You can now log in.",
    id: (seller as any)._id.toString(),
  };
};

export const loginSeller = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const seller = await Seller.findOne({ email });
  if (
    !seller ||
    !seller.password ||
    !(await comparePassword(password, seller.password))
  ) {
    throw new Error("Invalid credentials");
  }
  // TEMPORARY: Email verification check disabled
  // if (!seller.isVerified) {
  //   throw new Error("Please verify your email before logging in");
  // }
  const token = generateToken({ id: seller._id.toString(), role: "SELLER" });

  seller.isAuthenticated = true;
  await seller.save();

  return { token, seller: seller.toObject() };
};

export const loginAdmin = async ({
  username,
  password,
}: {
  username: string;
  password: string;
}) => {
  const admin = await Admin.findOne({ username });
  if (
    !admin ||
    !admin.password ||
    !(await comparePassword(password, admin.password))
  ) {
    throw new Error("Invalid credentials");
  }
  const token = generateToken({ id: admin._id.toString(), role: "ADMIN" });

  return { token, admin: admin.toObject() };
};

