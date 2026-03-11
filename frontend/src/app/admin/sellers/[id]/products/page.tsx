"use client"

import { use } from "react"
import { useGetSellerByIdQuery, useGetSellerProductsByIdQuery } from "@/services/api/adminApi"
import { FiArrowLeft, FiPackage, FiStar, FiCalendar, FiTag } from "react-icons/fi"
import Image from "next/image"
import Link from "next/link"

export default function SellerProductsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: seller, isLoading: sellerLoading } = useGetSellerByIdQuery(id)
  const { data: products, isLoading: productsLoading } = useGetSellerProductsByIdQuery(id)

  const isLoading = sellerLoading || productsLoading

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-stone-50 via-white to-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 w-1/4 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const getLowestPrice = (product: any) => {
    const prices = [
      product.samplePrice,
      product.smallPrice,
      product.mediumPrice,
      product.largePrice,
    ].filter(Boolean).map(Number)
    return prices.length > 0 ? Math.min(...prices) : 0
  }

  const getAverageRating = (reviews: any[]) => {
    if (!reviews || reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + (review.rating || 0), 0)
    return (sum / reviews.length).toFixed(1)
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-stone-50 via-white to-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/sellers"
            className="inline-flex items-center gap-2 text-yogreet-warm-gray hover:text-yogreet-charcoal mb-4 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Sellers
          </Link>
          
          <div className="flex items-center gap-4 mb-2">
            {seller?.businessLogo ? (
              <div className="relative w-12 h-12 rounded-full overflow-hidden">
                <Image
                  src={seller.businessLogo}
                  alt={seller.companyName || seller.fullName}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-yogreet-sage flex items-center justify-center">
                <span className="text-white font-poppins font-bold">
                  {(seller?.companyName || seller?.fullName || "S").charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-poppins font-semibold text-yogreet-charcoal">
                {seller?.companyName || seller?.fullName || "Seller"}&apos;s Products
              </h1>
              <p className="text-yogreet-warm-gray font-inter text-sm">
                {products?.length || 0} {(products?.length || 0) === 1 ? "product" : "products"} found
              </p>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {!products || products.length === 0 ? (
          <div className="bg-white border border-yogreet-light-gray p-12 text-center shadow-sm rounded-lg">
            <FiPackage className="w-12 h-12 text-yogreet-warm-gray mx-auto mb-4" />
            <p className="text-yogreet-warm-gray font-inter">No products found for this seller</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product: any) => (
              <div
                key={product.id}
                className="bg-white border border-yogreet-light-gray rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Product Image */}
                <div className="relative h-48 bg-gray-100">
                  {product.productImages && product.productImages.length > 0 ? (
                    <Image
                      src={product.productImages[0]}
                      alt={product.productName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FiPackage className="w-12 h-12 text-yogreet-warm-gray" />
                    </div>
                  )}
                  {product.activeDiscount && (
                    <div className="absolute top-2 right-2 bg-yogreet-red text-white text-xs font-medium px-2 py-1 rounded">
                      {product.activeDiscount.type === "percentage" 
                        ? `${product.activeDiscount.value}% OFF` 
                        : `₹${product.activeDiscount.value} OFF`}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="text-lg font-poppins font-semibold text-yogreet-charcoal mb-1 line-clamp-1">
                    {product.productName}
                  </h3>
                  
                  <p className="text-sm text-yogreet-warm-gray mb-2 line-clamp-2">
                    {product.shortDescription}
                  </p>

                  <div className="flex items-center gap-3 mb-3">
                    <span className="inline-flex items-center gap-1 text-xs bg-yogreet-light-gray/50 px-2 py-1 rounded">
                      <FiTag className="w-3 h-3" />
                      {product.category}
                    </span>
                    {product.subCategory && (
                      <span className="text-xs text-yogreet-warm-gray">
                        {product.subCategory}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <FiStar className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium text-yogreet-charcoal">
                        {getAverageRating(product.Review)}
                      </span>
                      <span className="text-xs text-yogreet-warm-gray">
                        ({product.Review?.length || 0})
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-poppins font-bold text-yogreet-charcoal">
                        ₹{getLowestPrice(product).toLocaleString()}
                      </p>
                      <p className="text-xs text-yogreet-warm-gray">Starting price</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-yogreet-light-gray flex items-center gap-2 text-xs text-yogreet-warm-gray">
                    <FiCalendar className="w-3 h-3" />
                    <span>Added: {new Date(product.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
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
