"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { motion, useScroll } from "framer-motion"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { FiStar, FiMapPin, FiArrowLeft, FiCheck, FiX, FiUser, FiChevronLeft, FiChevronRight, FiChevronDown, FiInfo, FiSearch, FiThumbsUp, FiThumbsDown, FiRepeat } from "react-icons/fi"
import { Navbar, Footer } from "@/components/layout"
import BuyBulkModal from "@/components/buyer/BuyBulkModal"
import { useGetProductsQuery } from "@/services/api"
import PageHero from "@/components/shared/PageHero"

// Transform database product to detail page format
function transformProductForDetail(product: any) {
  const reviews = product.Review || []
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length
    : 0

  const sellerName = product.seller?.companyName || product.seller?.fullName || "Unknown Seller"
  const sellerId = product.seller?.id || null
  const sellerProfilePicture = product.seller?.profilePicture || product.seller?.avatar || null
  const sellerLocation = product.seller?.businessAddress
    ? `${product.seller.businessAddress.city || ""}, ${product.seller.businessAddress.country || ""}`.trim().replace(/^,\s*/, "").replace(/,\s*$/, "")
    : "Unknown Location"
  const sellerAboutStore = product.seller?.aboutStore || null
  const sellerBusinessType = product.seller?.businessType || null
  const sellerBusinessLogo = product.seller?.businessLogo || null
  const sellerCreatedAt = product.seller?.createdAt || null

  // Get product images - always return an array
  const images = product.productImages && product.productImages.length > 0
    ? product.productImages
    : ["/placeholder.svg"]

  // Get package pricing
  const smallPrice = parseFloat(product.smallPrice || "0")
  const smallWeight = parseFloat(product.smallWeight || "1")
  const mediumPrice = parseFloat(product.mediumPrice || "0")
  const mediumWeight = parseFloat(product.mediumWeight || "1")
  const largePrice = parseFloat(product.largePrice || "0")
  const largeWeight = parseFloat(product.largeWeight || "1")

  // Calculate price per kg for each package
  const smallPricePerKg = smallWeight > 0 ? smallPrice / smallWeight : smallPrice
  const mediumPricePerKg = mediumWeight > 0 ? mediumPrice / mediumWeight : mediumPrice
  const largePricePerKg = largeWeight > 0 ? largePrice / largeWeight : largePrice

  // Use small package price as default/fallback
  const price = smallPricePerKg

  const minQuantity = parseFloat(product.availableStock || "0")
  const origin = product.category || "Unknown Origin"

  return {
    id: product.id,
    name: product.productName,
    seller: sellerName,
    sellerId,
    sellerProfilePicture,
    price, // Default price (small package price per kg)
    // Package pricing
    smallPrice,
    smallWeight,
    smallPricePerKg,
    mediumPrice,
    mediumWeight,
    mediumPricePerKg,
    largePrice,
    largeWeight,
    largePricePerKg,
    minQuantity,
    origin,
    images,
    rating: Math.round(averageRating * 10) / 10,
    reviews: reviews.length,
    description: product.shortDescription || product.description || product.productName,
    processingMethod: product.processingMethod || "Standard processing",
    qualityGrade: product.qualityGrade || "Standard Grade",
    sellerRating: 4.8, // You can calculate this from seller reviews if available
    sellerLocation,
    sellerAboutStore,
    sellerBusinessType,
    sellerBusinessLogo,
    sellerCreatedAt,
    reviewsList: reviews.map((review: any) => ({
      id: review.id,
      userId: review.buyerId || review.id,
      userName: review.buyer?.fullName || "Anonymous",
      rating: review.rating,
      comment: review.comment || "",
      date: review.createdAt ? new Date(review.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      verified: review.verified || false,
    })),
  }
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data, isLoading, error } = useGetProductsQuery()
  const [product, setProduct] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedPackage, setSelectedPackage] = useState<"small" | "medium" | "large">("small")
  const [showWhatsIncluded, setShowWhatsIncluded] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: "",
    userName: "",
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("most-relevant")

  // Transform products and find the matching one
  const products = useMemo(() => {
    if (!data?.products) return []
    return data.products.map(transformProductForDetail)
  }, [data])

  useEffect(() => {
    const productId = params.id as string
    const foundProduct = products.find((p) => p.id === productId || p.id.toString() === productId)
    
    if (foundProduct) {
      setProduct(foundProduct)
      setReviews(foundProduct.reviewsList || [])
      setCurrentImageIndex(0) // Reset to first image when product changes
    }
  }, [params.id, products])

  // Ensure we always have at least one image
  const productImages = product?.images && product.images.length > 0 
    ? product.images 
    : ["/placeholder.svg"]
  
  const hasMultipleImages = productImages.length > 1
  const currentImage = productImages[currentImageIndex] || productImages[0]

  const handlePreviousImage = () => {
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1))
    }
  }

  const handleNextImage = () => {
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1))
    }
  }

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newReview.comment.trim() || !newReview.userName.trim()) return

    const review = {
      id: Date.now().toString(),
      userId: `user${Date.now()}`,
      userName: newReview.userName,
      rating: newReview.rating,
      comment: newReview.comment,
      date: new Date().toISOString().split('T')[0],
      verified: false,
    }

    setReviews([review, ...reviews])
    setNewReview({ rating: 5, comment: "", userName: "" })
    setShowReviewForm(false)
  }

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0

  // Calculate rating distribution
  const ratingDistribution = useMemo(() => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach((review) => {
      const rating = Math.round(review.rating)
      if (rating >= 1 && rating <= 5) {
        distribution[rating as keyof typeof distribution]++
      }
    })
    return distribution
  }, [reviews])

  // Filter and sort reviews
  const filteredReviews = useMemo(() => {
    let filtered = reviews.filter((review) => {
      if (!searchQuery) return true
      const query = searchQuery.toLowerCase()
      return (
        review.userName.toLowerCase().includes(query) ||
        review.comment.toLowerCase().includes(query)
      )
    })

    // Sort reviews
    switch (sortBy) {
      case "most-relevant":
        // Keep original order (most relevant first)
        break
      case "newest":
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        break
      case "oldest":
        filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        break
      case "highest-rating":
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case "lowest-rating":
        filtered.sort((a, b) => a.rating - b.rating)
        break
    }

    return filtered
  }, [reviews, searchQuery, sortBy])

  // Scroll detection using framer-motion
  const { scrollY } = useScroll()
  const [isFixed, setIsFixed] = useState(false)
  const reviewsSectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const navbarHeight = 96 // h-24 = 96px
    const offset = 20
    const scrollThreshold = navbarHeight + offset // 116px

    const unsubscribe = scrollY.on("change", (latest) => {
      const shouldBeFixed = latest > scrollThreshold
      
      // Check if footer is approaching using ref
      if (reviewsSectionRef.current && shouldBeFixed) {
        const reviewsSection = reviewsSectionRef.current
        const reviewsSectionBottom = reviewsSection.getBoundingClientRect().bottom
        const viewportHeight = window.innerHeight
        
        // Remove fixed if reviews section (which is before footer) is near bottom
        // This prevents overlap with footer
        if (reviewsSectionBottom < viewportHeight + 200) {
          setIsFixed(false)
          return
        }
      }
      
      setIsFixed(shouldBeFixed)
    })

    return () => unsubscribe()
  }, [scrollY])

  const loading = isLoading || (!product && !error)

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200  w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-200 "></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200  w-3/4"></div>
                <div className="h-4 bg-gray-200  w-1/2"></div>
                <div className="h-4 bg-gray-200  w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-yogreet-charcoal mb-4">Product Not Found</h1>
            <p className="text-yogreet-warm-gray mb-6">The product you're looking for doesn't exist.</p>
            <button
              onClick={() => router.back()}
              className="px-6 py-2 bg-yogreet-red text-white font-medium  hover:opacity-80 transition-opacity cursor-pointer"
            >
              Go Back
            </button>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      {/* PageHero with Breadcrumb */}
      <PageHero
        title=""
        subtitle=""
        description=""
        breadcrumb={{
          items: [
            { label: "Home", href: "/" },
            { label: "Explore Spices", href: "/explore" },
            { label: product?.name || "Product", isActive: true }
          ]
        }}
      />

      {/* Product Detail */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[4fr_2fr] gap-20">
          {/* Left Side - Product Title, Seller Info & Image */}
          <div className="space-y-4 lg:pr-0 lg:max-w-[calc((min(100vw-64px,1280px)-5rem)*4/6)]">
            {/* Product Title */}
            <h1 className="text-2xl md:text-3xl font-poppins font-semibold text-yogreet-charcoal">
              {product.name}
            </h1>

            {/* Seller Information */}
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
              {product.sellerProfilePicture ? (
                <Link href={product.sellerId ? `/buyer/seller/${product.sellerId}` : "#"} onClick={(e) => !product.sellerId && e.preventDefault()}>
                  <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 cursor-pointer">
                    <Image
                      src={product.sellerProfilePicture}
                      alt={product.seller}
                      fill
                      className="object-cover rounded-full"
                      sizes="48px"
                    />
                  </div>
                </Link>
              ) : (
                <div className="w-12 h-12 rounded-full bg-yogreet-sage shrink-0 flex items-center justify-center">
                  <span className="text-white text-lg font-semibold">{product.seller.charAt(0).toUpperCase()}</span>
                </div>
              )}
              <div className="flex-1">
                {product.sellerId ? (
                  <Link 
                    href={`/buyer/seller/${product.sellerId}`}
                    className="text-base font-semibold text-yogreet-charcoal hover:underline cursor-pointer"
                  >
                    {product.seller}
                  </Link>
                ) : (
                  <p className="text-base font-semibold text-yogreet-charcoal">{product.seller}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`w-3 h-3 ${i < Math.floor(product.sellerRating) ? "fill-yogreet-gold text-yogreet-gold" : "text-gray-300 fill-gray-300"}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-yogreet-charcoal">{product.sellerRating}</span>
                  <span className="text-sm text-yogreet-warm-gray">({product.reviews} reviews)</span>
                </div>
              </div>
            </div>

            {/* Main Product Image */}
            <div className="relative w-full h-96 md:h-[500px] bg-yogreet-light-gray overflow-hidden">
              <Image
                src={currentImage}
                alt={product.name}
                fill
                className="object-cover"
              />
              
              {/* Navigation Arrows */}
              {hasMultipleImages && (
                <>
                  {/* Previous Button */}
                  <button
                    onClick={handlePreviousImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 p-2 shadow-sm hover:bg-gray-50 transition-colors cursor-pointer"
                    aria-label="Previous image"
                  >
                    <FiChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  
                  {/* Next Button */}
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 p-2 shadow-sm hover:bg-gray-50 transition-colors cursor-pointer"
                    aria-label="Next image"
                  >
                    <FiChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                  
                  {/* Image Counter */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 text-sm">
                    {currentImageIndex + 1} / {productImages.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {hasMultipleImages && (
              <div className="flex gap-2 overflow-x-auto">
                {productImages.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative w-20 h-20 overflow-hidden shrink-0 border-2 transition-all ${
                      idx === currentImageIndex ? "border-yogreet-red" : "border-transparent"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="space-y-3 pt-4">
              <h3 className="text-xl font-semibold text-yogreet-charcoal">About This Product</h3>
              <p className="text-yogreet-warm-gray leading-relaxed">{product.description}</p>
            </div>

            {/* Product Details */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <h3 className="text-xl font-semibold text-yogreet-charcoal">Product Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-yogreet-warm-gray">Origin</span>
                  <div className="flex items-center gap-1">
                    <FiMapPin className="w-4 h-4 text-yogreet-sage" />
                    <span className="text-yogreet-charcoal">{product.origin}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-yogreet-warm-gray">Processing Method</span>
                  <span className="text-yogreet-charcoal">{product.processingMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yogreet-warm-gray">Quality Grade</span>
                  <span className="text-yogreet-charcoal">{product.qualityGrade}</span>
                </div>
              </div>
            </div>

            {/* Get to Know Section */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h2 className="text-2xl md:text-3xl font-poppins font-bold text-yogreet-charcoal mb-6">
                Get to know {product.seller}
              </h2>
              
              <div className="bg-white border border-gray-200 p-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6 pb-6 border-b border-gray-200">
                  {/* Profile Picture / Business Logo */}
                  <div className="relative w-20 h-20 rounded-full overflow-hidden shrink-0">
                    {product.sellerBusinessLogo ? (
                      <Image
                        src={product.sellerBusinessLogo}
                        alt={product.seller}
                        fill
                        className="object-cover rounded-full"
                        sizes="80px"
                      />
                    ) : product.sellerProfilePicture ? (
                      <Image
                        src={product.sellerProfilePicture}
                        alt={product.seller}
                        fill
                        className="object-cover rounded-full"
                        sizes="80px"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-yogreet-sage flex items-center justify-center">
                        <span className="text-white text-2xl font-semibold">
                          {product.seller.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Name and Info */}
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl md:text-2xl font-poppins font-bold text-yogreet-charcoal">
                        {product.seller}
                      </h3>
                    </div>
                    
                    <p className="text-sm text-yogreet-warm-gray mb-3">
                      {product.sellerBusinessType || "Spice Seller"} | Premium Quality Spices
                    </p>

                    {/* Rating and Level */}
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <FiStar
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(product.sellerRating)
                                  ? "fill-yogreet-gold text-yogreet-gold"
                                  : "text-gray-300 fill-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-base font-semibold text-yogreet-charcoal">
                          {product.sellerRating.toFixed(1)}
                        </span>
                        <span className="text-xs text-yogreet-warm-gray">
                          ({product.reviews} reviews)
                        </span>
                      </div>
                    </div>

                    {/* Contact Button */}
                    <button
                      className="mt-4 px-5 py-2 border-2 border-yogreet-charcoal text-yogreet-charcoal font-medium hover:bg-yogreet-charcoal hover:text-white transition-colors cursor-pointer text-sm"
                    >
                      Contact me
                    </button>
                  </div>
                </div>

                {/* Information Section */}
                <div className="bg-yogreet-light-gray p-5 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Left Column */}
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-yogreet-warm-gray mb-1">From</p>
                        <p className="text-sm font-semibold text-yogreet-charcoal">
                          {product.sellerLocation || "India"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-yogreet-warm-gray mb-1">Avg. response time</p>
                        <p className="text-sm font-semibold text-yogreet-charcoal">1 hour</p>
                      </div>
                      <div>
                        <p className="text-xs text-yogreet-warm-gray mb-1">Languages</p>
                        <p className="text-sm font-semibold text-yogreet-charcoal">English, Hindi</p>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-yogreet-warm-gray mb-1">Member since</p>
                        <p className="text-sm font-semibold text-yogreet-charcoal">
                          {product.sellerCreatedAt 
                            ? new Date(product.sellerCreatedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-yogreet-warm-gray mb-1">Last delivery</p>
                        <p className="text-sm font-semibold text-yogreet-charcoal">about 2 hours</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* About Section */}
                <div>
                  <h4 className="text-lg font-semibold text-yogreet-charcoal mb-3">About</h4>
                  <div className="text-sm text-yogreet-warm-gray leading-relaxed space-y-2">
                    {product.sellerAboutStore ? (
                      <p className="whitespace-pre-line">{product.sellerAboutStore}</p>
                    ) : (
                      <>
                        <p>
                          Hello Spice Lovers,
                        </p>
                        <p>
                          I'm {product.seller}, a verified spice seller with years of experience in providing premium quality spices directly from India. I specialize in sourcing and exporting authentic Indian spices that meet international quality standards.
                        </p>
                        <p>
                          Whether you're looking for bulk orders or premium quality spices, I'm committed to delivering the finest products that elevate your culinary experiences. My spices are carefully selected, processed, and packaged to maintain their freshness and flavor.
                        </p>
                        <p>
                          Ready to explore premium Indian spices? Let's discuss your requirements in detail.
                        </p>
                        <p>
                          Regards,<br />
                          {product.seller}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Reviews Section */}
            <div ref={reviewsSectionRef} className="mt-6 pt-6 border-t border-gray-200">
              <h2 className="text-xl font-bold text-yogreet-charcoal mb-1">Reviews</h2>
              <p className="text-xs text-yogreet-warm-gray mb-4">{reviews.length} reviews for this product</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 items-center">
                {/* Left Side - Main Reviews Content */}
                <div className="flex flex-col justify-center">
                  {/* Star Rating Distribution */}
                  <div className="space-y-4">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = ratingDistribution[stars as keyof typeof ratingDistribution]
                      const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                      return (
                        <div key={stars} className="flex items-center gap-3">
                          <span className="text-sm text-yogreet-charcoal w-12 shrink-0 whitespace-nowrap">{stars} Stars</span>
                          <div className="flex-1 h-3 bg-gray-200 relative overflow-hidden rounded-full min-w-0">
                            <div
                              className={`h-full rounded-full ${count > 0 ? "bg-yogreet-charcoal" : "bg-gray-200"}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-yogreet-warm-gray w-5 shrink-0 text-right whitespace-nowrap">({count})</span>
                        </div>
                      )
                    })}
                  </div>

                  {/* Review Form */}
                  {showReviewForm && (
                    <div className="bg-white p-4 mb-4 border border-gray-200">
                      <h3 className="text-sm font-semibold text-yogreet-charcoal mb-3">Write Your Review</h3>
                      <form onSubmit={handleReviewSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-yogreet-charcoal mb-2">Your Name</label>
                          <input
                            type="text"
                            value={newReview.userName}
                            onChange={(e) => setNewReview({ ...newReview, userName: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-yogreet-red"
                            placeholder="Enter your name"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-yogreet-charcoal mb-2">Rating</label>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setNewReview({ ...newReview, rating: i + 1 })}
                                className="focus:outline-none cursor-pointer"
                              >
                                <FiStar
                                  className={`w-6 h-6 ${i < newReview.rating ? "fill-yogreet-gold text-yogreet-gold" : "text-gray-300 fill-gray-300"}`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-yogreet-charcoal mb-2">Your Review</label>
                          <textarea
                            value={newReview.comment}
                            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-yogreet-red h-24 resize-none"
                            placeholder="Share your experience with this product..."
                            required
                          />
                        </div>

                        <div className="flex gap-4">
                          <button
                            type="submit"
                            className="px-6 py-2 bg-yogreet-red text-white font-medium hover:opacity-80 transition-opacity cursor-pointer"
                          >
                            Submit Review
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowReviewForm(false)}
                            className="px-6 py-2 border border-gray-300 text-yogreet-charcoal font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Reviews List */}
                  <div className="space-y-4">
                    {filteredReviews.map((review) => (
                        <div key={review.id} className="bg-white p-4 border border-gray-200">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="relative w-8 h-8 shrink-0">
                              <div className="w-8 h-8 bg-yogreet-sage flex items-center justify-center">
                                <FiUser className="w-4 h-4 text-white" />
                              </div>
                              {review.verified && (
                                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white flex items-center justify-center">
                                  <FiCheck className="w-2 h-2 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <h4 className="text-sm font-semibold text-yogreet-charcoal">{review.userName}</h4>
                                {review.verified && (
                                  <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 flex items-center gap-0.5">
                                    <FiRepeat className="w-2.5 h-2.5" />
                                    Repeat Client
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <span className="text-[10px] text-yogreet-warm-gray">🇺🇸 United States</span>
                              </div>
                              <div className="flex items-center gap-1.5 mb-2">
                                <div className="flex items-center gap-0.5">
                                  {[...Array(5)].map((_, i) => (
                                    <FiStar
                                      key={i}
                                      className={`w-3 h-3 ${i < review.rating ? "fill-yogreet-charcoal text-yogreet-charcoal" : "text-gray-300 fill-gray-300"}`}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs font-semibold text-yogreet-charcoal">{review.rating}</span>
                                <span className="text-[10px] text-yogreet-warm-gray">•</span>
                                <span className="text-[10px] text-yogreet-warm-gray">{review.date}</span>
                              </div>
                              <p className="text-xs text-yogreet-charcoal leading-relaxed mb-3">{review.comment}</p>
                              
                              {/* Price and Duration */}
                              <div className="flex gap-4 mb-3 text-xs">
                                <div>
                                  <span className="text-yogreet-warm-gray">Price: </span>
                                  <span className="text-black font-medium">
                                    {product.smallPricePerKg && product.largePricePerKg
                                      ? `$${product.smallPricePerKg.toFixed(2)}-$${product.largePricePerKg.toFixed(2)}`
                                      : product.price
                                      ? `From $${product.price.toFixed(2)}`
                                      : "N/A"}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-yogreet-warm-gray">Duration: </span>
                                  <span className="text-yogreet-charcoal font-medium">1 week</span>
                                </div>
                              </div>

                              {/* Seller Response (Collapsible) */}
                              <div className="mb-3">
                                <button className="flex items-center gap-1.5 text-xs text-yogreet-charcoal hover:text-yogreet-red transition-colors cursor-pointer">
                                  <span>Seller's Response</span>
                                  <FiChevronDown className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Helpful Feedback */}
                              <div className="flex items-center gap-3 pt-3 border-t border-gray-200">
                                <span className="text-xs text-yogreet-warm-gray">Helpful?</span>
                                <button className="flex items-center gap-1 text-xs text-yogreet-charcoal hover:text-yogreet-red transition-colors cursor-pointer">
                                  <FiThumbsUp className="w-3 h-3" />
                                  <span>Yes</span>
                                </button>
                                <button className="flex items-center gap-1 text-xs text-yogreet-charcoal hover:text-yogreet-red transition-colors cursor-pointer">
                                  <FiThumbsDown className="w-3 h-3" />
                                  <span>No</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Right Side - Rating Breakdown */}
                <div>
                  <div className="bg-white p-4 border border-gray-200">
                    {/* Overall Rating */}
                    <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(averageRating) ? "fill-yogreet-charcoal text-yogreet-charcoal" : "text-gray-300 fill-gray-300"}`}
                          />
                        ))}
                      </div>
                      <span className="text-lg font-bold text-yogreet-charcoal">{averageRating.toFixed(1)}</span>
                    </div>
                    
                    <h3 className="text-sm font-semibold text-yogreet-charcoal mb-3">Rating Breakdown</h3>
                    <div className="space-y-2">
                      {["Seller communication level", "Quality of delivery", "Value of delivery"].map((label) => (
                        <div key={label} className="flex items-center justify-between">
                          <span className="text-xs text-yogreet-charcoal">{label}</span>
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <FiStar
                                key={i}
                                className="w-3 h-3 fill-yogreet-charcoal text-yogreet-charcoal"
                              />
                            ))}
                            <span className="text-xs font-semibold text-yogreet-charcoal ml-1">5</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Empty State - Centered below grid */}
              {filteredReviews.length === 0 && (
                <div className="text-center mt-15 py-16 text-yogreet-warm-gray border border-black/20">
                  No reviews available
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Pricing Packages */}
          <div className="relative">
            {/* Placeholder to maintain grid width when fixed */}
            {isFixed && (
              <div className="lg:w-[calc((min(100vw-64px,1280px)-5rem)*2/6)] lg:max-w-[400px] h-fit invisible" aria-hidden="true">
                <div className="border border-gray-200 overflow-hidden">
                  <div className="p-6 bg-white">
                    <div className="h-8 bg-gray-200  mb-4"></div>
                    <div className="h-4 bg-gray-200  mb-2"></div>
                    <div className="h-4 bg-gray-200  mb-4"></div>
                    <div className="h-10 bg-gray-200 "></div>
                  </div>
                </div>
              </div>
            )}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`lg:w-[calc((min(100vw-64px,1280px)-5rem)*2/6)] lg:max-w-[400px] h-fit z-10 ${
                isFixed 
                  ? 'lg:fixed lg:top-[116px] lg:right-[max(2rem,calc((100vw-1280px)/2+2rem))]' 
                  : 'lg:sticky lg:top-[116px]'
              }`}
            >
            <div className="border border-gray-200 overflow-hidden">
              {/* Package Tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setSelectedPackage("small")}
                  className={`flex flex-col flex-1 py-3 cursor-pointer px-4 text-sm font-medium transition-colors ${
                    selectedPackage === "small"
                      ? "bg-white text-yogreet-charcoal border-b-2 border-yogreet-red"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span>Small</span>
                  {product.smallWeight && (
                    <span className="text-xs opacity-75">{product.smallWeight}kg</span>
                  )}
                </button>
                <button
                  onClick={() => setSelectedPackage("medium")}
                  className={`flex flex-col flex-1 cursor-pointer py-3 px-4 text-sm font-medium transition-colors ${
                    selectedPackage === "medium"
                      ? "bg-white text-yogreet-charcoal border-b-2 border-yogreet-red"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span>Medium</span>
                  {product.mediumWeight && (
                    <span className="text-xs opacity-75">{product.mediumWeight}kg</span>
                  )}
                </button>
                <button
                  onClick={() => setSelectedPackage("large")}
                  className={`flex flex-col flex-1 cursor-pointer py-3 px-4 text-sm font-medium transition-colors ${
                    selectedPackage === "large"
                      ? "bg-white text-yogreet-charcoal border-b-2 border-yogreet-red"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span>Large</span>
                  {product.largeWeight && (
                    <span className="text-xs opacity-75">{product.largeWeight}kg</span>
                  )}
                </button>
              </div>

              {/* Package Content */}
              <div className="p-6 bg-white">
                {/* Package Name */}
                <h3 className="text-lg font-semibold text-yogreet-charcoal mb-2">
                  {selectedPackage === "small" && "Small Package"}
                  {selectedPackage === "medium" && "Medium Package"}
                  {selectedPackage === "large" && "Large Package"}
                </h3>

                {/* Price */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl font-bold text-black">
                      ${selectedPackage === "small" 
                        ? product.smallPricePerKg?.toFixed(2) || product.price.toFixed(2)
                        : selectedPackage === "medium"
                        ? product.mediumPricePerKg?.toFixed(2) || "0.00"
                        : product.largePricePerKg?.toFixed(2) || "0.00"}/kg
                    </span>
                    <FiInfo className="w-4 h-4 text-gray-400" />
                  </div>
                  {selectedPackage === "small" && product.smallPrice && product.smallWeight && (
                    <p className="text-sm text-yogreet-warm-gray">
                      ${product.smallPrice.toFixed(2)} for {product.smallWeight}kg
                    </p>
                  )}
                  {selectedPackage === "medium" && product.mediumPrice && product.mediumWeight && (
                    <p className="text-sm text-yogreet-warm-gray">
                      ${product.mediumPrice.toFixed(2)} for {product.mediumWeight}kg
                    </p>
                  )}
                  {selectedPackage === "large" && product.largePrice && product.largeWeight && (
                    <p className="text-sm text-yogreet-warm-gray">
                      ${product.largePrice.toFixed(2)} for {product.largeWeight}kg
                    </p>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-yogreet-warm-gray mb-4">
                  {selectedPackage === "small" && "Small spice purchase with standard quality and packaging."}
                  {selectedPackage === "medium" && "Medium spice purchase with premium quality, better packaging, and faster shipping."}
                  {selectedPackage === "large" && "Large spice purchase with highest quality, premium packaging, priority shipping, and quality certificate."}
                </p>

                {/* Delivery & Revisions */}
                <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-yogreet-charcoal">
                    <span>⏱</span>
                    <span>{selectedPackage === "small" ? "7-day" : selectedPackage === "medium" ? "5-day" : "3-day"} delivery</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-yogreet-charcoal">
                    <span>🔄</span>
                    <span>Unlimited revisions</span>
                  </div>
                </div>

                {/* What's Included */}
                <div className="mb-4">
                  <button
                    onClick={() => setShowWhatsIncluded(!showWhatsIncluded)}
                    className="flex items-center justify-between w-full text-sm font-medium text-yogreet-charcoal cursor-pointer"
                  >
                    <span>What's Included</span>
                    <FiChevronDown className={`w-4 h-4 transition-transform ${showWhatsIncluded ? "rotate-180" : ""}`} />
                  </button>
                  {showWhatsIncluded && (
                    <div className="mt-2 space-y-2 text-sm text-yogreet-warm-gray">
                      <div className="flex items-center gap-2">
                        <FiCheck className="w-4 h-4 text-yogreet-sage" />
                        <span>Premium quality spices</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiCheck className="w-4 h-4 text-yogreet-sage" />
                        <span>Secure packaging</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiCheck className="w-4 h-4 text-yogreet-sage" />
                        <span>Quality certificate</span>
                      </div>
                      {selectedPackage !== "small" && (
                        <>
                          <div className="flex items-center gap-2">
                            <FiCheck className="w-4 h-4 text-yogreet-sage" />
                            <span>Priority shipping</span>
                          </div>
                          {selectedPackage === "large" && (
                            <div className="flex items-center gap-2">
                              <FiCheck className="w-4 h-4 text-yogreet-sage" />
                              <span>Bulk discount</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={() => setShowBulkModal(true)}
                    className="w-full bg-yogreet-charcoal text-white py-3 font-medium hover:bg-yogreet-charcoal/90 transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    Continue
                    <FiArrowLeft className="w-4 h-4 rotate-180" />
                  </button>
                  <button
                    className="w-full border-2 border-gray-300 text-yogreet-charcoal py-3 font-medium hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    Contact me
                    <FiChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Buy Bulk Modal */}
      {product && (
        <BuyBulkModal
          isOpen={showBulkModal}
          onClose={() => setShowBulkModal(false)}
          product={{
            id: product.id.toString(),
            name: product.name,
            price: selectedPackage === "small" 
              ? product.smallPricePerKg || product.price
              : selectedPackage === "medium"
              ? product.mediumPricePerKg || 0
              : product.largePricePerKg || 0,
            minQuantity: product.minQuantity,
            origin: product.origin,
            image: currentImage,
          }}
        />
      )}

    </main>
  )
}
