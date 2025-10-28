"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { FiStar, FiMapPin } from "react-icons/fi"

interface ExploreSpiceCardProps {
  id: string
  name: string
  seller: string
  price: number
  minQuantity: number
  origin: string
  image: string
  sampleAvailable: boolean
  rating: number
  reviews: number
}

export function ExploreSpiceCard({
  id,
  name,
  seller,
  price,
  minQuantity,
  origin,
  image,
  sampleAvailable,
  rating,
  reviews,
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
        <Image src={image || "/placeholder.svg"} alt={name} fill className="object-cover" />
        {sampleAvailable && (
          <div className="absolute top-3 right-3 bg-yogreet-sage text-white px-3 py-1 text-xs font-medium rounded">
            Sample Available
          </div>
        )}
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
            className={`flex-1 bg-yogreet-red text-white py-1.5 font-manrope font-medium text-xs transition-all hover:opacity-80 ${
              isHovered ? "shadow-md" : ""
            }`}
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            Buy in Bulk
          </button>
          <button
            className={`flex-1 border-2 border-yogreet-sage text-yogreet-sage py-1.5 font-manrope font-medium text-xs transition-all hover:bg-yogreet-sage hover:text-white ${
              isHovered ? "shadow-md" : ""
            }`}
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            Request Sample
          </button>
        </div>
      </div>
    </div>
  )
}
