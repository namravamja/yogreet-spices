"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useGetTopSellersQuery } from "@/services/api/publicApi"
import { Star, Store, Package } from "lucide-react"
import Image from "next/image"
import { PLACEHOLDER_JPG_URL } from "@/constants/static-images"

export function TopSpicesSection() {
  const [isHovered, setIsHovered] = useState(false)
  const router = useRouter()
  const { data: sellers = [], isLoading } = useGetTopSellersQuery(12)

  const handleCardClick = (sellerId: string) => {
    router.push(`/buyer/seller/${sellerId}`)
  }

  const handleViewDetailsClick = (e: React.MouseEvent, sellerId: string) => {
    e.stopPropagation()
    router.push(`/buyer/seller/${sellerId}`)
  }

  // Duplicate sellers for infinite scroll effect
  const duplicatedSellers = sellers.length > 0 ? [...sellers, ...sellers] : []

  if (isLoading) {
    return (
      <section className="bg-yogreet-light-gray py-12 sm:py-14 md:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-poppins font-semibold text-yogreet-charcoal mb-4">
              Our Top Sellers
            </h2>
            <p className="text-yogreet-charcoal font-inter text-base max-w-2xl mx-auto">
              Discover trusted spice exporters from India with verified credentials and quality products.
            </p>
          </div>
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yogreet-red mx-auto mb-4"></div>
              <p className="text-stone-600 font-inter">Loading top sellers...</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (sellers.length === 0) {
    return (
      <section className="bg-yogreet-light-gray py-12 sm:py-14 md:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-poppins font-semibold text-yogreet-charcoal mb-4">
              Our Top Sellers
            </h2>
            <p className="text-yogreet-charcoal font-inter text-base max-w-2xl mx-auto">
              Discover trusted spice exporters from India with verified credentials and quality products.
            </p>
          </div>
          <div className="text-center py-16">
            <Store className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <p className="text-stone-600 font-inter">No sellers available at the moment.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-yogreet-light-gray py-12 sm:py-14 md:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-poppins font-semibold text-yogreet-charcoal mb-3 sm:mb-4 leading-tight px-2 sm:px-0">
            Our Top Sellers
          </h2>
          <p className="text-yogreet-charcoal font-inter text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4 sm:px-6 md:px-0">
            Discover trusted spice exporters from India with verified credentials and quality products.
          </p>
        </div>
      </div>

      {/* Infinite horizontal scrolling carousel - Full width */}
      <div 
        className="overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
          <div 
            className="flex gap-6"
            style={{
              animation: 'scroll 30s linear infinite',
              animationPlayState: isHovered ? 'paused' : 'running',
              width: 'calc(200% + 2rem)' // Double width for seamless loop
            }}
          >
            {duplicatedSellers.map((seller, index) => (
              <div 
                key={`${seller.id}-${index}`} 
                onClick={() => handleCardClick(seller.id)}
                className="shrink-0 w-80 bg-white overflow-hidden hover:shadow-lg transition-shadow rounded-xs cursor-pointer"
              >
                <div className="relative aspect-square bg-gray-200 overflow-hidden">
                  {seller.logo ? (
                    <Image
                      src={seller.logo}
                      alt={seller.name}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = PLACEHOLDER_JPG_URL;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-stone-200">
                      <Store className="w-16 h-16 text-stone-400" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-poppins font-semibold text-yogreet-charcoal text-base mb-2 line-clamp-1">
                    {seller.name}
                  </h3>
                  <p className="text-yogreet-charcoal font-inter text-sm mb-3 line-clamp-1">
                    {seller.location}
                  </p>
                  
                  {/* Rating and Stats */}
                  <div className="flex items-center gap-4 mb-3">
                    {seller.averageRating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium text-yogreet-charcoal font-manrope">
                          {seller.averageRating.toFixed(1)}
                        </span>
                        {seller.totalReviews > 0 && (
                          <span className="text-xs text-stone-500 font-inter">
                            ({seller.totalReviews})
                          </span>
                        )}
                      </div>
                    )}
                    {seller.totalProducts > 0 && (
                      <div className="flex items-center gap-1">
                        <Package className="w-4 h-4 text-stone-500" />
                        <span className="text-sm text-stone-600 font-inter">
                          {seller.totalProducts} {seller.totalProducts === 1 ? 'Product' : 'Products'}
                        </span>
                      </div>
                    )}
                  </div>

                  {seller.about && (
                    <p className="text-yogreet-charcoal font-inter text-xs mb-3 line-clamp-2">
                      {seller.about}
                    </p>
                  )}

                  <button 
                    onClick={(e) => handleViewDetailsClick(e, seller.id)}
                    className="w-full px-4 py-2 bg-yogreet-red text-white font-manrope font-medium hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
    </section>
  )
}
