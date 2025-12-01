"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { FiStar, FiChevronLeft, FiChevronRight } from "react-icons/fi"
import { PLACEHOLDER_SVG_URL } from "@/constants/static-images"

export interface ExploreSpiceCardProps {
  id: string
  name: string
  seller: string
  sellerId?: string
  sellerProfilePicture?: string
  price: number
  smallPrice?: number
  smallWeight?: number
  minQuantity: number
  origin: string
  images: string[]
  rating: number
  reviews: number
  description?: string
}

export function ExploreSpiceCard({
  id,
  name,
  seller,
  sellerId,
  sellerProfilePicture,
  price,
  smallPrice,
  smallWeight,
  minQuantity,
  origin,
  images,
  rating,
  reviews,
  description,
}: ExploreSpiceCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [direction, setDirection] = useState<"left" | "right">("right")
  const router = useRouter()

  // Ensure we always have at least one image
  const productImages = images && images.length > 0 ? images : [PLACEHOLDER_SVG_URL]
  const hasMultipleImages = productImages.length > 1
  const currentImage = productImages[currentImageIndex] || productImages[0]

  // Reset image index when product changes
  useEffect(() => {
    setCurrentImageIndex(0)
  }, [id])

  const handleCardClick = () => {
    router.push(`/explore/${id}`)
  }

  const handlePreviousImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (hasMultipleImages) {
      setDirection("right") // Previous image slides in from right
      setCurrentImageIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1))
    }
  }

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (hasMultipleImages) {
      setDirection("left") // Next image slides in from left
      setCurrentImageIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1))
    }
  }

  // Animation variants for slide transitions
  const slideVariants = {
    enter: (direction: "left" | "right") => ({
      x: direction === "left" ? "100%" : "-100%",
    }),
    center: {
      x: 0,
    },
    exit: (direction: "left" | "right") => ({
      x: direction === "left" ? "-100%" : "100%",
    }),
  }

  return (
    <div
      className="bg-white border border-yogreet-light-gray overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-gray-400 rounded-xs mx-auto w-full"
      style={{ maxWidth: '320px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div 
        className="relative w-full h-48 bg-yogreet-light-gray overflow-hidden cursor-pointer"
        onClick={handleCardClick}
      >
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentImageIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 400, damping: 40, duration: 0.5 },
            }}
            className="absolute inset-0"
          >
            <Image 
              src={productImages[currentImageIndex]} 
              alt={`${name} - Image ${currentImageIndex + 1}`} 
              fill 
              className={`object-cover transition-transform duration-300 ${
                isHovered ? "scale-110" : "scale-100"
              }`} 
            />
          </motion.div>
        </AnimatePresence>
        
        {/* Navigation Arrows */}
        {hasMultipleImages && (
          <>
            {/* Previous Button */}
            <button
              onClick={handlePreviousImage}
              className={`absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:bg-gray-50 transition-all duration-300 cursor-pointer ${
                isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 pointer-events-none"
              }`}
              aria-label="Previous image"
            >
              <FiChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            
            {/* Next Button */}
            <button
              onClick={handleNextImage}
              className={`absolute right-1 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:bg-gray-50 transition-all duration-300 cursor-pointer ${
                isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 pointer-events-none"
              }`}
              aria-label="Next image"
            >
              <FiChevronRight className="w-4 h-4 text-gray-600" />
            </button>
            
            {/* Image Counter */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-black/50 text-white px-2 py-0.5 rounded-full text-xs">
              {currentImageIndex + 1} / {productImages.length}
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Seller Info and Reviews Row */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          {/* Seller Info */}
          {sellerId ? (
            <Link 
              href={`/buyer/seller/${sellerId}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer flex-1 min-w-0"
            >
              {sellerProfilePicture ? (
                <div className="relative w-6 h-6 rounded-full overflow-hidden shrink-0">
                  <Image
                    src={sellerProfilePicture}
                    alt={seller}
                    fill
                    className="object-cover"
                    sizes="24px"
                  />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-yogreet-sage shrink-0 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">{seller.charAt(0).toUpperCase()}</span>
                </div>
              )}
              <p className="text-sm text-yogreet-warm-gray hover:underline truncate">by {seller}</p>
            </Link>
          ) : (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {sellerProfilePicture ? (
                <div className="relative w-6 h-6 rounded-full overflow-hidden shrink-0">
                  <Image
                    src={sellerProfilePicture}
                    alt={seller}
                    fill
                    className="object-cover"
                    sizes="24px"
                  />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-yogreet-sage shrink-0 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">{seller.charAt(0).toUpperCase()}</span>
                </div>
              )}
              <p className="text-sm text-yogreet-warm-gray truncate">by {seller}</p>
            </div>
          )}

          {/* Reviews */}
          <div className="flex items-center gap-1 shrink-0">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  className={`w-3 h-3 ${i < Math.floor(rating) ? "fill-yogreet-gold text-yogreet-gold" : "text-gray-300 fill-gray-300"}`}
                />
              ))}
            </div>
            <span className="text-sm text-yogreet-warm-gray">({reviews})</span>
          </div>
        </div>

        {/* Description */}
        {description && (
          <p className="text-sm text-yogreet-warm-gray mb-1.5 line-clamp-2 font-inter">
            {description}
          </p>
        )}

        {/* Price */}
        <div className="mb-2">
          <p className="text-base font-poppins font-semibold text-black">
            From ${price.toFixed(2)}/kg
          </p>
          {smallPrice && smallWeight && (
            <p className="text-xs text-yogreet-warm-gray font-inter mt-0.5">
              ${smallPrice.toFixed(2)} for {smallWeight}kg
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
