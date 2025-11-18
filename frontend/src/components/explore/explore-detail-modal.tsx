"use client"

import { FiX, FiMapPin, FiStar } from "react-icons/fi"
import Image from "next/image"

interface ExploreDetailModalProps {
  isOpen: boolean
  spice: {
    id: string
    name: string
    seller: string
    price: number
    minQuantity: number
    origin: string
    image: string
    rating: number
    reviews: number
    description: string
    processingMethod: string
    qualityGrade: string
    sellerRating: number
    sellerLocation: string
  } | null
  onClose: () => void
}

export function ExploreDetailModal({ isOpen, spice, onClose }: ExploreDetailModalProps) {
  if (!isOpen || !spice) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-2xl font-poppins font-semibold text-yogreet-charcoal">{spice.name}</h2>
          <button onClick={onClose} className="text-yogreet-charcoal hover:text-yogreet-red transition cursor-pointer">
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Image */}
            <div className="relative h-80 bg-yogreet-light-gray overflow-hidden">
              <Image src={spice.image || "/placeholder.svg"} alt={spice.name} fill className="object-cover" />
            </div>

            {/* Details */}
            <div>
              {/* Seller Info */}
              <div className="mb-6">
                <p className="text-sm text-yogreet-charcoal text-opacity-60 mb-2">Seller</p>
                <p className="font-poppins font-semibold text-yogreet-charcoal mb-2">{spice.seller}</p>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(spice.sellerRating) ? "fill-yogreet-red text-yogreet-red" : "text-gray-300 fill-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-yogreet-charcoal text-opacity-60">{spice.sellerRating}/5</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-yogreet-charcoal text-opacity-70">
                  <FiMapPin className="w-4 h-4" />
                  <span>{spice.sellerLocation}</span>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <p className="text-3xl font-poppins font-semibold text-yogreet-red mb-2">${spice.price}/kg</p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button className="flex-1 bg-yogreet-red text-white py-3 font-manrope font-medium transition-all hover:shadow-lg">
                  Buy in Bulk
                </button>
              </div>
            </div>
          </div>

          {/* Description & Details */}
          <div className="space-y-6">
            <div>
              <h3 className="font-poppins font-semibold text-yogreet-charcoal mb-2">About This Spice</h3>
              <p className="text-yogreet-charcoal text-opacity-70">{spice.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-yogreet-charcoal text-opacity-60 mb-1">Processing Method</p>
                <p className="font-medium text-yogreet-charcoal">{spice.processingMethod}</p>
              </div>
              <div>
                <p className="text-sm text-yogreet-charcoal text-opacity-60 mb-1">Quality Grade</p>
                <p className="font-medium text-yogreet-charcoal">{spice.qualityGrade}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
