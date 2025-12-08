import { Order } from "../../models/Order";
import { OrderItem } from "../../models/OrderItem";
import { Cart } from "../../models/Cart";
import { Product } from "../../models/Product";
import mongoose from "mongoose";

export interface OrderItemInput {
  productId: string;
  quantity: number;
}

export interface CreateOrderData {
  shippingAddressId: string;
  paymentMethod: string;
  orderItems?: OrderItemInput[]; // Optional: for direct order creation (Buy Now)
}

export const createOrder = async (buyerId: string, data: CreateOrderData) => {
  let subtotal = 0;
  const orderItemsData: any[] = [];

  // If orderItems are provided (Buy Now flow), use them directly
  if (data.orderItems && data.orderItems.length > 0) {
    for (const itemInput of data.orderItems) {
      // Fetch product to get pricing and seller info
      const product = await Product.findById(itemInput.productId).lean();
      
      if (!product) {
        throw new Error(`Product ${itemInput.productId} not found`);
      }

      // Calculate price per kg
      const sampleWeight = parseFloat((product as any)?.sampleWeight || "0");
      const smallWeight = parseFloat((product as any)?.smallWeight || "0");
      const mediumWeight = parseFloat((product as any)?.mediumWeight || "0");
      const largeWeight = parseFloat((product as any)?.largeWeight || "0");
      
      const samplePrice = parseFloat((product as any)?.samplePrice || "0");
      const smallPrice = parseFloat((product as any)?.smallPrice || "0");
      const mediumPrice = parseFloat((product as any)?.mediumPrice || "0");
      const largePrice = parseFloat((product as any)?.largePrice || "0");
      
      let pricePerKg = 0;
      if (smallWeight > 0 && smallPrice > 0) {
        pricePerKg = smallPrice / smallWeight;
      } else if (sampleWeight > 0 && samplePrice > 0) {
        pricePerKg = samplePrice / sampleWeight;
      } else if (mediumWeight > 0 && mediumPrice > 0) {
        pricePerKg = mediumPrice / mediumWeight;
      } else if (largeWeight > 0 && largePrice > 0) {
        pricePerKg = largePrice / largeWeight;
      }

      const quantity = itemInput.quantity || 0;
      const itemTotal = pricePerKg * quantity;
      subtotal += itemTotal;

      orderItemsData.push({
        productId: product._id,
        quantity: quantity,
        priceAtPurchase: pricePerKg,
        sellerId: (product as any).sellerId || (product as any).seller?._id,
      });
    }
  } else {
    // Otherwise, get items from cart (normal flow)
    const cartItems = await Cart.find({ buyerId: new mongoose.Types.ObjectId(buyerId) })
      .populate("productId")
      .lean();

    if (!cartItems || cartItems.length === 0) {
      throw new Error("Cart is empty");
    }

    for (const cartItem of cartItems) {
      const product = cartItem.productId as any;
      
      // Calculate price per kg
      const sampleWeight = parseFloat(product?.sampleWeight || "0");
      const smallWeight = parseFloat(product?.smallWeight || "0");
      const mediumWeight = parseFloat(product?.mediumWeight || "0");
      const largeWeight = parseFloat(product?.largeWeight || "0");
      
      const samplePrice = parseFloat(product?.samplePrice || "0");
      const smallPrice = parseFloat(product?.smallPrice || "0");
      const mediumPrice = parseFloat(product?.mediumPrice || "0");
      const largePrice = parseFloat(product?.largePrice || "0");
      
      let pricePerKg = 0;
      if (smallWeight > 0 && smallPrice > 0) {
        pricePerKg = smallPrice / smallWeight;
      } else if (sampleWeight > 0 && samplePrice > 0) {
        pricePerKg = samplePrice / sampleWeight;
      } else if (mediumWeight > 0 && mediumPrice > 0) {
        pricePerKg = mediumPrice / mediumWeight;
      } else if (largeWeight > 0 && largePrice > 0) {
        pricePerKg = largePrice / largeWeight;
      }

      const quantity = cartItem.quantity || 0;
      const itemTotal = pricePerKg * quantity;
      subtotal += itemTotal;

      orderItemsData.push({
        productId: product._id,
        quantity: quantity,
        priceAtPurchase: pricePerKg,
        sellerId: product.sellerId || product.seller?._id,
      });
    }
  }

  if (orderItemsData.length === 0) {
    throw new Error("No items to order");
  }

  // Calculate shipping (free if subtotal >= 100, otherwise $15)
  const shippingCost = subtotal >= 100 ? 0 : 15;
  const taxAmount = subtotal * 0.08;
  const totalAmount = subtotal + shippingCost + taxAmount;

  // Create order
  const order = await Order.create({
    buyerId: new mongoose.Types.ObjectId(buyerId),
    totalAmount: totalAmount,
    subtotal: subtotal,
    shippingCost: shippingCost,
    taxAmount: taxAmount,
    status: "pending",
    shippingAddressId: new mongoose.Types.ObjectId(data.shippingAddressId),
    paymentMethod: data.paymentMethod,
    paymentStatus: "unpaid",
    placedAt: new Date(),
  });

  // Create order items
  const orderItems = await Promise.all(
    orderItemsData.map((itemData) =>
      OrderItem.create({
        orderId: order._id,
        productId: itemData.productId,
        quantity: itemData.quantity,
        priceAtPurchase: itemData.priceAtPurchase,
        sellerId: itemData.sellerId,
      })
    )
  );

  // Clear cart after order creation (only if order was created from cart)
  if (!data.orderItems || data.orderItems.length === 0) {
    await Cart.deleteMany({ buyerId: new mongoose.Types.ObjectId(buyerId) });
  }

  // Populate order with details
  const populatedOrder = await Order.findById(order._id)
    .populate({
      path: "buyerId",
      select: "fullName email",
    })
    .populate({
      path: "shippingAddressId",
    })
    .lean();

  return {
    ...populatedOrder,
    id: order._id.toString(),
    orderItems: orderItems.map((item) => ({
      ...item.toObject(),
      id: item._id.toString(),
    })),
  };
};

export const getBuyerOrders = async (buyerId: string) => {
  const orders = await Order.find({ buyerId: new mongoose.Types.ObjectId(buyerId) })
    .populate({
      path: "shippingAddressId",
    })
    .sort({ placedAt: -1 })
    .lean();

  // Get order items for each order
  const ordersWithItems = await Promise.all(
    orders.map(async (order) => {
      const orderItems = await OrderItem.find({
        orderId: order._id,
      })
        .populate({
          path: "productId",
          select: "productName productImages category",
        })
        .populate({
          path: "sellerId",
          select: "fullName companyName",
        })
        .lean();

      return {
        ...order,
        id: order._id.toString(),
        orderItems: orderItems.map((item: any) => ({
          id: item._id.toString(),
          productId: item.productId?._id?.toString() || item.productId?.toString(),
          quantity: item.quantity,
          priceAtPurchase: item.priceAtPurchase,
          product: item.productId ? {
            id: item.productId._id.toString(),
            productName: item.productId.productName,
            productImages: item.productId.productImages || [],
            category: item.productId.category,
          } : null,
          seller: item.sellerId ? {
            id: item.sellerId._id.toString(),
            fullName: item.sellerId.fullName,
            companyName: item.sellerId.companyName || item.sellerId.fullName,
          } : null,
        })),
      };
    })
  );

  return ordersWithItems;
};

export const getOrderById = async (buyerId: string, orderId: string) => {
  if (!orderId) throw new Error("Invalid order ID");

  const order = await Order.findById(orderId)
    .populate({ path: "shippingAddressId" })
    .lean();

  if (!order) throw new Error("Order not found");

  // Ensure the requesting buyer owns this order
  if (order.buyerId?.toString() !== buyerId) {
    throw new Error("Forbidden: access to this order is denied");
  }

  const orderItems = await OrderItem.find({ orderId: order._id })
    .populate({ path: "productId", select: "productName productImages category" })
    .populate({ path: "sellerId", select: "fullName companyName" })
    .lean();

  return {
    ...order,
    id: order._id.toString(),
    orderItems: orderItems.map((item: any) => ({
      id: item._id.toString(),
      productId: item.productId?._id?.toString() || item.productId?.toString(),
      quantity: item.quantity,
      priceAtPurchase: item.priceAtPurchase,
      product: item.productId
        ? {
            id: item.productId._id.toString(),
            productName: item.productId.productName,
            productImages: item.productId.productImages || [],
            category: item.productId.category,
          }
        : null,
      seller: item.sellerId
        ? {
            id: item.sellerId._id.toString(),
            fullName: item.sellerId.fullName,
            companyName: item.sellerId.companyName || item.sellerId.fullName,
          }
        : null,
    })),
  };
};

