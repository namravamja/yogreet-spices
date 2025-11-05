import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { errorHandler, notFound } from "./middleware/errorHandler";
import authRoutes from "./routes/common/auth.routes";
import buyerRoutes from "./routes/Buyer/buyer.routes";
import sellerRoutes from "./routes/Seller/seller.routes";
import productRoutes from "./routes/common/product.routes";

// Load .env variables
dotenv.config();

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

// Buyer routes
app.use("/api/buyer", buyerRoutes);

// Seller routes
app.use("/api/seller", sellerRoutes);

// 404 and error handlers
app.use(notFound);
app.use(errorHandler);

// Server start
const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(
        `🌐 Frontend URL: ${
          process.env.FRONTEND_URL || "http://localhost:3000"
        }`
      );
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;

