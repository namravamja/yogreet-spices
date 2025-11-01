"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { FiStar, FiMapPin } from "react-icons/fi"

export interface ExploreSpiceCardProps {
  id: string
  name: string
  seller: string
  price: number
  minQuantity: number
  origin: string
  image: string
  rating: number
  reviews: number
  onBulkOrder?: () => void
  onRequestSample?: () => void
}

export function ExploreSpiceCard({
  id,
  name,
  seller,
  price,
  minQuantity,
  origin,
  image,
  rating,
  reviews,
  onBulkOrder,
  onRequestSample,
}: ExploreSpiceCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const router = useRouter()

  const handleCardClick = () => {
    router.push(`/explore/${id}`)
  }

  return (
    <div
      className="bg-white border border-yogreet-light-gray overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-gray-400 cursor-pointer rounded-xs"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-yogreet-light-gray overflow-hidden">
        <Image 
          src={image || "/placeholder.svg"} 
          alt={name} 
          fill 
          className={`object-cover transition-transform duration-300 ${
            isHovered ? "scale-110" : "scale-100"
          }`} 
        />
        {/* View Detail Overlay - appears on hover */}
        <div 
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 flex items-center justify-center ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
          onClick={(e) => {
            e.stopPropagation()
            handleCardClick()
          }}
        >
          <button
            className="px-6 py-2 bg-white text-yogreet-charcoal font-poppins font-semibold text-sm rounded-xs hover:bg-yogreet-red hover:text-white transition-colors cursor-pointer shadow-lg"
            onClick={(e) => {
              e.stopPropagation()
              handleCardClick()
            }}
          >
            View Detail
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-2">
        <h3 className="font-poppins font-semibold text-yogreet-charcoal text-sm mb-1 line-clamp-2">{name}</h3>

        {/* Seller Info */}
        <p className="text-xs text-yogreet-warm-gray mb-1">by {seller}</p>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-1">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <FiStar
                key={i}
                className={`w-2.5 h-2.5 ${i < Math.floor(rating) ? "fill-yogreet-gold text-yogreet-gold" : "text-yogreet-light-gray"}`}
              />
            ))}
          </div>
          <span className="text-xs text-yogreet-warm-gray">({reviews})</span>
        </div>

        {/* Origin */}
        <div className="flex items-center gap-1 mb-1 text-xs text-yogreet-warm-gray">
          <FiMapPin className="w-2.5 h-2.5 text-yogreet-sage" />
          <span>{origin}</span>
        </div>

        {/* Price & Quantity */}
        <div className="mb-2 pb-2 border-b border-yogreet-light-gray">
          <p className="text-sm font-poppins font-semibold text-yogreet-red mb-0.5">${price}/kg</p>
          <p className="text-xs text-yogreet-warm-gray">Min. {minQuantity} kg</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-1">
          <button
            className={`flex-1 bg-yogreet-red text-white py-1.5 font-manrope font-medium text-xs transition-all hover:opacity-80 cursor-pointer ${
              isHovered ? "shadow-md" : ""
            }`}
            onClick={(e) => {
              e.stopPropagation()
              onBulkOrder?.()
            }}
          >
            Buy in Bulk
          </button>
          <button
            className={`flex-1 border-2 border-yogreet-sage text-yogreet-sage py-1.5 font-manrope font-medium text-xs transition-all hover:bg-yogreet-sage hover:text-white cursor-pointer ${
              isHovered ? "shadow-md" : ""
            }`}
            onClick={(e) => {
              e.stopPropagation()
              onRequestSample?.()
            }}
          >
            Request Sample
          </button>
        </div>
      </div>
    </div>
  )
}
