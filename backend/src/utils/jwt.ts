import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

export const comparePassword = async (input: string, hashed: string) => {
  return await bcrypt.compare(input, hashed);
};

export const generateToken = (payload: {
  id: string;
  role: "BUYER" | "SELLER" | "ADMIN";
}) => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });
};

export const generateVerificationToken = (payload: {
  id: string;
  role: "BUYER" | "SELLER";
}) => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "1d", // verification token valid for 1 day
  });
};

export const verifyVerificationToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
      role: "BUYER" | "SELLER";
    };
  } catch (err) {
    throw new Error("Invalid or expired verification token");
  }
};

