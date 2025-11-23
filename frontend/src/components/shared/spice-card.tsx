"use client"

import { useState } from "react"
import { FiHeart, FiStar } from "react-icons/fi"

export interface SpiceCardProps {
  id: string
  name: string
  seller: string
  image: string
  pricePerKg: number
  minOrder: number
  rating: number
  reviews: number
  inStock: boolean
}

export function SpiceCard({ name, seller, image, pricePerKg, minOrder, rating, reviews, inStock }: SpiceCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)

  return (
    <div className="bg-white overflow-hidden border border-yogreet-light-gray hover:shadow-lg transition-shadow rounded-xs">
      <div className="relative aspect-square bg-yogreet-light-gray overflow-hidden">
        <img src={image || "/placeholder.svg"} alt={name} className="w-full h-full object-cover" />
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-3 right-3 w-8 h-8 bg-white flex items-center justify-center hover:bg-yogreet-light-gray transition-colors"
        >
          <FiHeart
            className={`w-5 h-5 ${isFavorite ? "fill-yogreet-red text-yogreet-red" : "text-yogreet-charcoal"}`}
          />
        </button>
        {!inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-manrope font-semibold">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-poppins font-semibold text-yogreet-charcoal mb-1 line-clamp-2 text-sm">{name}</h3>
        <p className="text-yogreet-charcoal font-inter text-xs mb-2 text-opacity-70">by {seller}</p>

        <div className="flex items-center gap-1 mb-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <FiStar
                key={i}
                className={`w-3 h-3 ${i < Math.floor(rating) ? "fill-yogreet-red text-yogreet-red" : "text-gray-300 fill-gray-300"}`}
              />
            ))}
          </div>
          <span className="text-yogreet-charcoal font-inter text-xs">({reviews})</span>
        </div>

        <div className="space-y-1 mb-3 pb-3 border-b border-yogreet-light-gray">
          <div className="flex justify-between items-center">
            <span className="text-yogreet-charcoal font-inter text-xs">Price</span>
            <span className="font-poppins font-semibold text-black">${pricePerKg}/kg</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-yogreet-charcoal font-inter text-xs">Min Order</span>
            <span className="font-inter text-xs text-yogreet-charcoal">{minOrder} kg</span>
          </div>
        </div>

            <div className="flex gap-2">
              <button
                disabled={!inStock}
                className="flex-1 px-3 py-2 bg-yogreet-red text-white font-manrope font-medium text-xs hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Add to Cart
              </button>
            </div>
      </div>
    </div>
  )
}
