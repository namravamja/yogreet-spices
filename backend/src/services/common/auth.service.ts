import { PrismaClient } from "@prisma/client";
import {
  hashPassword,
  comparePassword,
  generateToken,
  generateVerificationToken,
} from "../../utils/jwt";
import { sendVerificationEmail } from "../../helpers/mailer";

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

const prisma = new PrismaClient();

export const signupBuyer = async (data: SignupData) => {
  const existing = await prisma.buyer.findUnique({
    where: { email: data.email },
  });
  if (existing) throw new Error("Email already registered");

  const hashed: string = await hashPassword(data.password);

  const buyer = await prisma.buyer.create({
    data: { ...data, password: hashed },
  });

  const verifyToken = generateVerificationToken({
    id: buyer.id,
    role: "BUYER",
  });

  // Save token & expiry (5 minutes expiry)
  await prisma.buyer.update({
    where: { id: buyer.id },
    data: {
      verifyToken,
      verifyExpires: new Date(Date.now() + 5 * 60 * 1000),
    },
  });

  // Send verification email (catch errors to not block registration)
  try {
    await sendVerificationEmail(buyer.email, verifyToken, "BUYER");
  } catch (error) {
    console.error("Failed to send verification email:", error);
  }

  setTimeout(async () => {
    const freshBuyer = await prisma.buyer.findUnique({
      where: { id: buyer.id },
    });
    if (freshBuyer && !freshBuyer.isVerified) {
      await prisma.buyer.delete({ where: { id: buyer.id } });
    }
  }, 7 * 60 * 1000); // 7 minutes delay

  return {
    message: "Buyer created, Please check your email to verify your account.",
    id: buyer.id,
  };
};

export const loginBuyer = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const buyer = await prisma.buyer.findUnique({ where: { email } });
  if (
    !buyer ||
    !buyer.password ||
    !(await comparePassword(password, buyer.password))
  ) {
    throw new Error("Invalid credentials");
  }
  if (!buyer.isVerified) {
    throw new Error("Please verify your email before logging in");
  }
  const token = generateToken({ id: buyer.id, role: "BUYER" });

  await prisma.buyer.update({
    where: { id: buyer.id },
    data: { isAuthenticated: true },
  });

  return { token, buyer };
};

export const signupSeller = async (data: SellerSignupData) => {
  const existing = await prisma.seller.findUnique({
    where: { email: data.email },
  });
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
    companyName: data.companyName, // Merged from storeName and companyName
    mobile: data.mobile,
    businessType: data.businessType,
    productCategories: productCategories.length > 0 ? productCategories : undefined,
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

  const seller = await prisma.seller.create({
    data: sellerData,
  });

  const verifyToken = generateVerificationToken({
    id: seller.id,
    role: "SELLER",
  });

  await prisma.seller.update({
    where: { id: seller.id },
    data: {
      verifyToken,
      verifyExpires: new Date(Date.now() + 5 * 60 * 1000),
    },
  });

  // Send verification email (catch errors to not block registration)
  try {
    await sendVerificationEmail(seller.email, verifyToken, "SELLER");
  } catch (error) {
    console.error("Failed to send verification email:", error);
  }

  setTimeout(async () => {
    const freshSeller = await prisma.seller.findUnique({
      where: { id: seller.id },
    });
    if (freshSeller && !freshSeller.isVerified) {
      await prisma.seller.delete({ where: { id: seller.id } });
      console.log(
        `Deleted unverified seller with id ${seller.id} after 7 minutes`
      );
    }
  }, 7 * 60 * 1000);

  return {
    message: "Seller created, Please check your email to verify your account.",
    id: seller.id,
  };
};

export const loginSeller = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const seller = await prisma.seller.findUnique({ where: { email } });
  if (
    !seller ||
    !seller.password ||
    !(await comparePassword(password, seller.password))
  ) {
    throw new Error("Invalid credentials");
  }
  if (!seller.isVerified) {
    throw new Error("Please verify your email before logging in");
  }
  const token = generateToken({ id: seller.id, role: "SELLER" });

  await prisma.seller.update({
    where: { id: seller.id },
    data: { isAuthenticated: true },
  });

  return { token, seller };
};

