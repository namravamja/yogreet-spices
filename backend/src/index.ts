// Load .env variables FIRST before any other imports
import dotenv from "dotenv";
import path from "path";

// Load .env file from the backend directory
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { errorHandler, notFound } from "./middleware/errorHandler";
import { connectDB } from "./config/db";
import authRoutes from "./routes/common/auth.routes";
import buyerRoutes from "./routes/Buyer/buyer.routes";
import sellerRoutes from "./routes/Seller/seller.routes";
import productRoutes from "./routes/common/product.routes";
import publicSellerRoutes from "./routes/common/seller.routes";
import adminRoutes from "./routes/common/admin.routes";
import verificationRoutes from "./routes/common/verification.routes";
import paymentRoutes from "./routes/common/payments.routes";
import webhookRoutes from "./routes/common/webhooks.routes";
import { Order } from "./models/Order";
import { OrderItem } from "./models/OrderItem";
import { SellerPayout } from "./models/SellerPayout";
import mongoose from "mongoose";
import { Buyer } from "./models/Buyer";
import { sendAutoReleasedEmail } from "./helpers/orderMailer";

const app = express();
const PORT = process.env.PORT || 5000;

app.set("trust proxy", 1);

// Security middlewares
app.use(helmet());
app.use(
  cors({
    origin: [process.env.FRONTEND_URL || "http://localhost:3000"],
    credentials: true,
  })
);
app.use(cookieParser());

// Webhooks that require raw body (Stripe)
app.use("/api/webhooks", webhookRoutes);

// Body Parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Auth routes
app.use("/api/auth", authRoutes);

// Product routes (public)
app.use("/api/products", productRoutes);

// Public seller routes (for buyers to view seller profiles)
app.use("/api/sellers", publicSellerRoutes);

// Buyer routes
app.use("/api/buyer", buyerRoutes);

// Seller routes
app.use("/api/seller", sellerRoutes);

// Admin routes
app.use("/api/admin", adminRoutes);

// Document verification routes (public - no auth required)
app.use("/api/verify", verificationRoutes);

// Payments
app.use("/api/payments", paymentRoutes);

// 404 and error handlers
app.use(notFound);
app.use(errorHandler);

// Server start
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(
        `🌐 Frontend URL: ${
          process.env.FRONTEND_URL || "http://localhost:3000"
        }`
      );
      const runAutoRelease = async () => {
        try {
          const now = new Date();
          const candidates = await Order.find({
            paymentStatus: "held",
            deliveryStatus: "delivered",
            autoReleaseAt: { $ne: null, $lte: now },
          }).lean();
          for (const o of candidates) {
            const orderId = (o as any)._id.toString();
            const currency = (o as any).currency || "INR";
            const items = await OrderItem.find({ orderId: new mongoose.Types.ObjectId(orderId) }).lean();
            const totalsBySeller = new Map<string, number>();
            for (const it of items) {
              const seller = (it as any).sellerId?.toString();
              if (!seller) continue;
              const total = (it as any).priceAtPurchase * (it as any).quantity;
              totalsBySeller.set(seller, (totalsBySeller.get(seller) || 0) + total);
            }
            for (const [sellerId, amount] of totalsBySeller.entries()) {
              const existing = await SellerPayout.findOne({
                orderId: new mongoose.Types.ObjectId(orderId),
                sellerId: new mongoose.Types.ObjectId(sellerId),
              });
              if (existing?.released) continue;
              await SellerPayout.findOneAndUpdate(
                { orderId: new mongoose.Types.ObjectId(orderId), sellerId: new mongoose.Types.ObjectId(sellerId) },
                {
                  orderId: new mongoose.Types.ObjectId(orderId),
                  sellerId: new mongoose.Types.ObjectId(sellerId),
                  amount,
                  currency,
                  gateway: "razorpay",
                  released: true,
                  releasedAt: new Date(),
                },
                { upsert: true }
              );
            }
            const updated = await Order.findOneAndUpdate(
              { _id: new mongoose.Types.ObjectId(orderId), paymentStatus: "held" },
              { $set: { paymentStatus: "released" } },
              { new: true }
            );
            if (updated) {
              try {
                const buyer = await Buyer.findById(updated.buyerId).lean();
                const email = (buyer as any)?.email;
                const fullName = [ (buyer as any)?.firstName, (buyer as any)?.lastName ].filter(Boolean).join(" ");
                if (email) {
                  await sendAutoReleasedEmail(email, fullName || "", orderId);
                }
              } catch {}
            }
          }
        } catch {}
      };
      setInterval(runAutoRelease, 60 * 1000);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
