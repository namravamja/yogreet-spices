"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Package,
  Calendar,
  MapPin,
  CreditCard,
  Download,
  Printer,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import PageHero from "@/components/shared/PageHero";

// Mock order data - replace with actual API call
const mockOrder = {
  id: "ORD-001-2024",
  status: "delivered",
  paymentStatus: "paid",
  placedAt: "2024-01-15T10:30:00Z",
  deliveredAt: "2024-01-20T14:30:00Z",
  totalAmount: 1250,
  shippingCost: 50,
  taxAmount: 100,
  paymentMethod: "Credit Card",
  estimatedDelivery: "2024-01-20T00:00:00Z",
  updatedAt: "2024-01-18T14:20:00Z",
  shippingAddress: {
    firstName: "John",
    lastName: "Doe",
    addressLine1: "123 Main Street",
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "400001",
    country: "India",
    phone: "+91 98765 43210",
  },
  orderItems: [
    {
      id: "item-1",
      productId: "prod-1",
      quantity: 2,
      priceAtPurchase: 500,
      product: {
        productName: "Premium Turmeric Powder",
        productImages: ["/Profile.jpg"],
        category: "Spices",
        description: "High-quality organic turmeric powder",
      },
      artist: {
        storeName: "Spice Master",
        fullName: "John Doe",
        email: "john@spicemaster.com",
        phone: "+91 98765 43210",
      },
    },
    {
      id: "item-2",
      productId: "prod-2",
      quantity: 1,
      priceAtPurchase: 250,
      product: {
        productName: "Organic Cumin Seeds",
        productImages: ["/Profile.jpg"],
        category: "Spices",
        description: "Fresh organic cumin seeds",
      },
      artist: {
        storeName: "Organic Spices Co",
        fullName: "Jane Smith",
        email: "jane@organicspices.com",
        phone: "+91 98765 43211",
      },
    },
  ],
  tracking: {
    carrier: "BlueDart",
    trackingNumber: "BD123456789",
    status: "delivered",
    updates: [
      {
        status: "order_placed",
        message: "Order placed successfully",
        timestamp: "2024-01-15T10:30:00Z",
      },
      {
        status: "confirmed",
        message: "Order confirmed by seller",
        timestamp: "2024-01-15T14:20:00Z",
      },
      {
        status: "processing",
        message: "Order is being prepared",
        timestamp: "2024-01-16T09:15:00Z",
      },
      {
        status: "shipped",
        message: "Order shipped via BlueDart",
        timestamp: "2024-01-17T16:45:00Z",
      },
      {
        status: "delivered",
        message: "Order delivered successfully",
        timestamp: "2024-01-20T14:30:00Z",
      },
    ],
  },
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const paymentStatusColors: Record<string, string> = {
  unpaid: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "delivered":
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    case "shipped":
      return <Truck className="w-5 h-5 text-orange-600" />;
    case "processing":
      return <Clock className="w-5 h-5 text-purple-600" />;
    case "cancelled":
      return <AlertCircle className="w-5 h-5 text-red-600" />;
    default:
      return <Clock className="w-5 h-5 text-yellow-600" />;
  }
};

export default function OrderDetailsPage({ params }: { params: { orderId: string } }) {
  const [isLoading] = useState(false);
  const [error] = useState(null);

  // Use mock data for now
  const order = mockOrder;

  if (isLoading) {
    return (
      <main className="pt-10 pb-20">
        <div className="container mx-auto px-2 max-w-7xl">
          <div className="animate-pulse">
            <div className="h-8 bg-stone-200 rounded w-48 mb-8"></div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white border border-stone-200 p-6">
                  <div className="h-6 bg-stone-200 rounded w-32 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-stone-200 rounded w-full"></div>
                    <div className="h-4 bg-stone-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="pt-10 pb-20">
        <div className="container mx-auto px-2 max-w-7xl">
          <div className="text-center py-16">
            <h1 className="text-3xl font-light text-yogreet-charcoal mb-4">
              Error loading order
            </h1>
            <p className="text-stone-600 mb-8">Please try again later.</p>
            <Link href="/buyer/orders">
              <button className="bg-yogreet-red hover:bg-yogreet-red/90 text-white px-6 py-3 font-medium transition-colors cursor-pointer">
                Back to Orders
              </button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="pt-10 pb-20">
        <div className="container mx-auto px-2 max-w-7xl">
          <div className="text-center py-16">
            <Package className="w-24 h-24 mx-auto text-stone-300 mb-6" />
            <h1 className="text-3xl font-light text-yogreet-charcoal mb-4">
              Order not found
            </h1>
            <p className="text-stone-600 mb-8">
              The order you're looking for doesn't exist.
            </p>
            <Link href="/buyer/orders">
              <button className="bg-yogreet-red hover:bg-yogreet-red/90 text-white px-6 py-3 font-medium transition-colors cursor-pointer">
                Back to Orders
              </button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pb-20">
      <PageHero
        title="Order Details"
        subtitle=""
        description="Track your spice order progress, view delivery details, and manage your purchase history."
        breadcrumb={{
          items: [
            { label: "Home", href: "/" },
            { label: "My Orders", href: "/buyer/orders" },
            { label: "Order Details", isActive: true }
          ]
        }}
      />
      
      <div className="container mx-auto px-2 max-w-7xl">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <div className="bg-white border border-stone-200 shadow-sm">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-medium text-yogreet-charcoal flex items-center">
                    <Package className="w-5 h-5 mr-2 text-yogreet-red" />
                    Order Status
                  </h2>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(order.status)}
                    <span
                      className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                        statusColors[order.status?.toLowerCase()] ||
                        "bg-stone-100 text-stone-800"
                      }`}
                    >
                      {order.status
                        ? order.status.charAt(0).toUpperCase() +
                          order.status.slice(1).toLowerCase()
                        : "Unknown"}
                    </span>
                  </div>
                </div>
                
                {/* Tracking Timeline */}
                <div className="space-y-4">
                  {order.tracking?.updates?.map((update: any, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="shrink-0 w-6 h-6 bg-yogreet-red rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-yogreet-charcoal">
                          {update.message}
                        </p>
                        <p className="text-xs text-stone-500">
                          {new Date(update.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {order.tracking?.trackingNumber && (
                  <div className="mt-4 p-4 bg-stone-50 rounded-lg">
                    <p className="text-sm text-stone-600">
                      <strong>Tracking Number:</strong> {order.tracking.trackingNumber}
                    </p>
                    <p className="text-sm text-stone-600">
                      <strong>Carrier:</strong> {order.tracking.carrier}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white border border-stone-200 shadow-sm">
              <div className="p-6">
                <h2 className="text-xl font-medium text-yogreet-charcoal mb-4">
                  Order Items
                </h2>
                <div className="space-y-4">
                  {order.orderItems?.map((item: any) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border border-stone-200 rounded-lg">
                      <div className="relative w-20 h-20 shrink-0">
                        <Image
                          src={item.product?.productImages?.[0] || "/Profile.jpg"}
                          alt={item.product?.productName || "Product"}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <div className="flex-1">
                        <Link href={`/Products/${item.productId}`}>
                          <h4 className="font-medium text-yogreet-charcoal hover:text-yogreet-red transition-colors">
                            {item.product?.productName || "Unknown Product"}
                          </h4>
                        </Link>
                        <p className="text-sm text-stone-500">
                          By {item.artist?.storeName || item.artist?.fullName || "Unknown Artist"}
                        </p>
                        <p className="text-sm text-stone-600">
                          {item.product?.description}
                        </p>
                        <p className="text-sm text-stone-600">
                          Qty: {item.quantity} × ₹{item.priceAtPurchase}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-yogreet-charcoal">
                          ₹{item.quantity * item.priceAtPurchase}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white border border-stone-200 shadow-sm">
              <div className="p-6">
                <h3 className="text-lg font-medium text-yogreet-charcoal mb-4">
                  Order Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-stone-600">Subtotal:</span>
                    <span className="text-yogreet-charcoal">
                      ₹{order.totalAmount - (order.shippingCost || 0) - (order.taxAmount || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">Shipping:</span>
                    <span className="text-yogreet-charcoal">₹{order.shippingCost || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">Tax:</span>
                    <span className="text-yogreet-charcoal">₹{order.taxAmount || 0}</span>
                  </div>
                  <hr className="border-stone-200 my-2" />
                  <div className="flex justify-between text-lg font-medium">
                    <span className="text-yogreet-charcoal">Total:</span>
                    <span className="text-yogreet-red">₹{order.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white border border-stone-200 shadow-sm">
              <div className="p-6">
                <h3 className="text-lg font-medium text-yogreet-charcoal mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-yogreet-red" />
                  Payment
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-stone-600">Method:</span>
                    <span className="text-yogreet-charcoal">{order.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">Status:</span>
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        paymentStatusColors[order.paymentStatus?.toLowerCase()] ||
                        "bg-stone-100 text-stone-800"
                      }`}
                    >
                      {order.paymentStatus
                        ? order.paymentStatus.charAt(0).toUpperCase() +
                          order.paymentStatus.slice(1).toLowerCase()
                        : "Unknown"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white border border-stone-200 shadow-sm">
              <div className="p-6">
                <h3 className="text-lg font-medium text-yogreet-charcoal mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-yogreet-red" />
                  Shipping Address
                </h3>
                <div className="text-sm text-stone-600">
                  <p className="font-medium text-yogreet-charcoal">
                    {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                  </p>
                  <p>{order.shippingAddress?.addressLine1}</p>
                  <p>
                    {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}
                  </p>
                  <p>{order.shippingAddress?.country}</p>
                  <p className="mt-2">{order.shippingAddress?.phone}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white border border-stone-200 shadow-sm">
              <div className="p-6">
                <h3 className="text-lg font-medium text-yogreet-charcoal mb-4">
                  Actions
                </h3>
                <div className="space-y-2">
                  <button className="w-full bg-yogreet-red hover:bg-yogreet-red/90 text-white px-4 py-2 text-sm font-medium transition-colors cursor-pointer rounded flex items-center justify-center">
                    <Download className="w-4 h-4 mr-2" />
                    Download Invoice
                  </button>
                  <button className="w-full border border-stone-300 text-stone-700 hover:bg-stone-50 px-4 py-2 text-sm font-medium transition-colors cursor-pointer rounded flex items-center justify-center">
                    <Printer className="w-4 h-4 mr-2" />
                    Print Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
