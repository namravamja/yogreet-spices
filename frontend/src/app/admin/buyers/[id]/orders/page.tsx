"use client"

import { use } from "react"
import { useGetBuyerByIdQuery, useGetBuyerOrdersByIdQuery } from "@/services/api/adminApi"
import { FiArrowLeft, FiShoppingCart, FiPackage, FiMapPin, FiCalendar, FiCreditCard, FiUser } from "react-icons/fi"
import Image from "next/image"
import Link from "next/link"

export default function BuyerOrdersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: buyer, isLoading: buyerLoading } = useGetBuyerByIdQuery(id)
  const { data: orders, isLoading: ordersLoading } = useGetBuyerOrdersByIdQuery(id)

  const isLoading = buyerLoading || ordersLoading

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-700"
      case "shipped":
        return "bg-blue-100 text-blue-700"
      case "confirmed":
        return "bg-yellow-100 text-yellow-700"
      case "pending":
        return "bg-gray-100 text-gray-700"
      case "cancelled":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700"
      case "pending":
        return "bg-yellow-100 text-yellow-700"
      case "failed":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-stone-50 via-white to-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 w-1/4 rounded"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const buyerName = buyer?.firstName && buyer?.lastName 
    ? `${buyer.firstName} ${buyer.lastName}` 
    : buyer?.firstName || buyer?.lastName || "Buyer"

  return (
    <div className="min-h-screen bg-linear-to-br from-stone-50 via-white to-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/buyers"
            className="inline-flex items-center gap-2 text-yogreet-warm-gray hover:text-yogreet-charcoal mb-4 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Buyers
          </Link>
          
          <div className="flex items-center gap-4 mb-2">
            {buyer?.avatar ? (
              <div className="relative w-12 h-12 rounded-full overflow-hidden">
                <Image
                  src={buyer.avatar}
                  alt={buyerName}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-yogreet-sage flex items-center justify-center">
                <span className="text-white font-poppins font-bold">
                  {buyerName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-poppins font-semibold text-yogreet-charcoal">
                {buyerName}&apos;s Orders
              </h1>
              <p className="text-yogreet-warm-gray font-inter text-sm">
                {orders?.length || 0} {(orders?.length || 0) === 1 ? "order" : "orders"} found
              </p>
            </div>
          </div>
        </div>

        {/* Buyer Info Card */}
        {buyer && (
          <div className="bg-white border border-yogreet-light-gray rounded-lg p-6 mb-6 shadow-sm">
            <h3 className="text-sm font-semibold text-yogreet-charcoal mb-4 flex items-center gap-2">
              <FiUser className="w-4 h-4" />
              Buyer Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-yogreet-warm-gray">Email</p>
                <p className="font-medium text-yogreet-charcoal">{buyer.email}</p>
              </div>
              {buyer.phone && (
                <div>
                  <p className="text-yogreet-warm-gray">Phone</p>
                  <p className="font-medium text-yogreet-charcoal">{buyer.phone}</p>
                </div>
              )}
              <div>
                <p className="text-yogreet-warm-gray">Total Orders</p>
                <p className="font-medium text-yogreet-charcoal">{buyer._count?.orders || 0}</p>
              </div>
              <div>
                <p className="text-yogreet-warm-gray">Joined</p>
                <p className="font-medium text-yogreet-charcoal">
                  {new Date(buyer.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Orders List */}
        {!orders || orders.length === 0 ? (
          <div className="bg-white border border-yogreet-light-gray p-12 text-center shadow-sm rounded-lg">
            <FiShoppingCart className="w-12 h-12 text-yogreet-warm-gray mx-auto mb-4" />
            <p className="text-yogreet-warm-gray font-inter">No orders found for this buyer</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => (
              <div
                key={order.id}
                className="bg-white border border-yogreet-light-gray rounded-lg overflow-hidden shadow-sm"
              >
                {/* Order Header */}
                <div className="bg-yogreet-light-gray/30 px-6 py-4 border-b border-yogreet-light-gray">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-xs text-yogreet-warm-gray uppercase tracking-wide">Order ID</p>
                        <p className="font-mono text-sm font-medium text-yogreet-charcoal">{order.id}</p>
                      </div>
                      <div className="hidden sm:block w-px h-8 bg-yogreet-light-gray"></div>
                      <div className="flex items-center gap-2">
                        <FiCalendar className="w-4 h-4 text-yogreet-warm-gray" />
                        <span className="text-sm text-yogreet-charcoal">
                          {new Date(order.placedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded capitalize ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded capitalize ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Content */}
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Shipping Address */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-yogreet-charcoal flex items-center gap-2">
                        <FiMapPin className="w-4 h-4" />
                        Shipping Address
                      </h4>
                      {order.shippingAddress ? (
                        <div className="text-sm text-yogreet-warm-gray">
                          <p>{order.shippingAddress.street}</p>
                          <p>
                            {[order.shippingAddress.city, order.shippingAddress.state]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                          <p>
                            {[order.shippingAddress.country, order.shippingAddress.pinCode]
                              .filter(Boolean)
                              .join(" - ")}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-yogreet-warm-gray">No address</p>
                      )}
                    </div>

                    {/* Payment Info */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-yogreet-charcoal flex items-center gap-2">
                        <FiCreditCard className="w-4 h-4" />
                        Payment Details
                      </h4>
                      <div className="text-sm text-yogreet-warm-gray">
                        <p>
                          <span className="text-yogreet-charcoal">Method:</span>{" "}
                          {order.paymentMethod || "N/A"}
                        </p>
                        <p>
                          <span className="text-yogreet-charcoal">Gateway:</span>{" "}
                          {order.gateway || "N/A"}
                        </p>
                        <p>
                          <span className="text-yogreet-charcoal">Currency:</span>{" "}
                          {order.currency || "INR"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mt-6 pt-6 border-t border-yogreet-light-gray">
                    <h4 className="text-sm font-semibold text-yogreet-charcoal mb-4 flex items-center gap-2">
                      <FiPackage className="w-4 h-4" />
                      Order Items ({order.orderItems?.length || 0})
                    </h4>
                    <div className="space-y-3">
                      {order.orderItems?.map((item: any) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 p-3 bg-yogreet-light-gray/20 rounded-lg"
                        >
                          <div className="relative w-16 h-16 shrink-0 rounded overflow-hidden bg-gray-100">
                            {item.product?.productImages?.[0] ? (
                              <Image
                                src={item.product.productImages[0]}
                                alt={item.product?.productName || "Product"}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FiPackage className="w-6 h-6 text-yogreet-warm-gray" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-yogreet-charcoal truncate">
                              {item.product?.productName || "Unknown Product"}
                            </p>
                            <p className="text-sm text-yogreet-warm-gray">
                              Qty: {item.quantity} × ₹{item.priceAtPurchase?.toLocaleString() || "0"}
                            </p>
                            {item.seller && (
                              <p className="text-xs text-yogreet-sage">
                                Seller: {item.seller.companyName || item.seller.fullName}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-yogreet-charcoal">
                              ₹{((item.quantity || 0) * (item.priceAtPurchase || 0)).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Total */}
                  <div className="mt-4 pt-4 border-t border-yogreet-light-gray flex justify-end">
                    <div className="text-right">
                      <div className="flex items-center gap-4 text-sm text-yogreet-warm-gray mb-1">
                        <span>Subtotal:</span>
                        <span>₹{order.subtotal?.toLocaleString() || "0"}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-yogreet-warm-gray mb-1">
                        <span>Shipping:</span>
                        <span>₹{order.shippingCost?.toLocaleString() || "0"}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-yogreet-warm-gray mb-2">
                        <span>Tax:</span>
                        <span>₹{order.taxAmount?.toLocaleString() || "0"}</span>
                      </div>
                      <div className="flex items-center gap-4 text-lg font-semibold text-yogreet-charcoal">
                        <span>Total:</span>
                        <span>₹{order.totalAmount?.toLocaleString() || "0"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
