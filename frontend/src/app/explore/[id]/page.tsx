"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { FiStar, FiMapPin, FiArrowLeft, FiCheck, FiX, FiUser } from "react-icons/fi"
import { Navbar, Footer } from "@/components/layout"

// Mock data - same as in explore page
const MOCK_SPICES = [
  {
    id: "1",
    name: "Premium Turmeric Powder",
    seller: "Golden Spice Co.",
    price: 45,
    minQuantity: 100,
    origin: "Telangana, India",
    image: "/turmeric-powder-spice.jpg",
    sampleAvailable: true,
    rating: 4.8,
    reviews: 234,
    description:
      "High-quality turmeric powder sourced from the finest farms in Telangana. Rich in curcumin and perfect for culinary and medicinal uses.",
    processingMethod: "Sun-dried and ground",
    qualityGrade: "Premium Grade A",
    sellerRating: 4.9,
    sellerLocation: "Hyderabad, India",
  },
  {
    id: "2",
    name: "Organic Cumin Seeds",
    seller: "Spice Masters Ltd.",
    price: 65,
    minQuantity: 50,
    origin: "Rajasthan, India",
    image: "/cumin-seeds-spice.jpg",
    sampleAvailable: true,
    rating: 4.7,
    reviews: 189,
    description: "Authentic organic cumin seeds with a warm, earthy flavor. Ideal for Indian cuisine and spice blends.",
    processingMethod: "Naturally dried",
    qualityGrade: "Organic Certified",
    sellerRating: 4.8,
    sellerLocation: "Jodhpur, India",
  },
  {
    id: "3",
    name: "Red Chili Powder",
    seller: "Chili Exports India",
    price: 35,
    minQuantity: 200,
    origin: "Andhra Pradesh, India",
    image: "/red-chili-powder-spice.jpg",
    sampleAvailable: false,
    rating: 4.6,
    reviews: 156,
    description: "Vibrant red chili powder with perfect heat and color. Made from premium red chilies.",
    processingMethod: "Dried and ground",
    qualityGrade: "Standard Grade",
    sellerRating: 4.7,
    sellerLocation: "Guntur, India",
  },
  {
    id: "4",
    name: "Coriander Powder",
    seller: "Aromatic Spices Co.",
    price: 42,
    minQuantity: 100,
    origin: "Madhya Pradesh, India",
    image: "/coriander-powder-spice.jpg",
    sampleAvailable: true,
    rating: 4.9,
    reviews: 267,
    description: "Fresh coriander powder with a citrusy aroma. Perfect for curries and spice blends.",
    processingMethod: "Freshly ground",
    qualityGrade: "Premium Grade A",
    sellerRating: 4.9,
    sellerLocation: "Indore, India",
  },
  {
    id: "5",
    name: "Cardamom Pods",
    seller: "Premium Spice Traders",
    price: 120,
    minQuantity: 25,
    origin: "Kerala, India",
    image: "/cardamom-pods-spice.jpg",
    sampleAvailable: true,
    rating: 4.8,
    reviews: 198,
    description: "Whole green cardamom pods with intense aromatic flavor. Premium quality from Kerala.",
    processingMethod: "Hand-picked and dried",
    qualityGrade: "Premium Grade A",
    sellerRating: 4.9,
    sellerLocation: "Kochi, India",
  },
  {
    id: "6",
    name: "Whole Cloves",
    seller: "Spice Essence Ltd.",
    price: 95,
    minQuantity: 50,
    origin: "Kerala, India",
    image: "/cloves-whole-spice.jpg",
    sampleAvailable: false,
    rating: 4.7,
    reviews: 142,
    description: "Aromatic whole cloves with strong flavor. Perfect for spice blends and traditional recipes.",
    processingMethod: "Sun-dried",
    qualityGrade: "Premium Grade",
    sellerRating: 4.8,
    sellerLocation: "Kochi, India",
  },
  {
    id: "7",
    name: "Fenugreek Seeds",
    seller: "Herb & Spice Co.",
    price: 38,
    minQuantity: 150,
    origin: "Rajasthan, India",
    image: "/fenugreek-seeds-spice.jpg",
    sampleAvailable: true,
    rating: 4.5,
    reviews: 87,
    description: "Whole fenugreek seeds with a slightly bitter taste. Used in Indian cooking and traditional medicine.",
    processingMethod: "Naturally dried",
    qualityGrade: "Standard Grade",
    sellerRating: 4.6,
    sellerLocation: "Jaipur, India",
  },
  {
    id: "8",
    name: "Asafoetida Powder",
    seller: "Exotic Spices International",
    price: 55,
    minQuantity: 100,
    origin: "Rajasthan, India",
    image: "/asafoetida-powder-spice.jpg",
    sampleAvailable: true,
    rating: 4.6,
    reviews: 112,
    description: "Pure asafoetida powder with strong pungent aroma. Essential for Indian vegetarian cooking.",
    processingMethod: "Processed and powdered",
    qualityGrade: "Premium Grade",
    sellerRating: 4.7,
    sellerLocation: "Jodhpur, India",
  },
  {
    id: "9",
    name: "Black Pepper Powder",
    seller: "Pepper Traders Co.",
    price: 52,
    minQuantity: 100,
    origin: "Kerala, India",
    image: "/turmeric-powder-spice.jpg",
    sampleAvailable: true,
    rating: 4.8,
    reviews: 203,
    description: "Freshly ground black pepper with sharp, peppery flavor. Premium quality from Kerala.",
    processingMethod: "Freshly ground",
    qualityGrade: "Premium Grade A",
    sellerRating: 4.9,
    sellerLocation: "Kochi, India",
  },
]

// Mock reviews data
const MOCK_REVIEWS = [
  {
    id: "1",
    userId: "user1",
    userName: "John Smith",
    rating: 5,
    comment: "Excellent quality turmeric powder. Very fresh and aromatic. Perfect for my cooking needs. Highly recommended!",
    date: "2024-01-15",
    verified: true,
  },
  {
    id: "2",
    userId: "user2",
    userName: "Sarah Johnson",
    rating: 4,
    comment: "Good quality product, arrived on time. The packaging was excellent. Will definitely order again.",
    date: "2024-01-10",
    verified: true,
  },
  {
    id: "3",
    userId: "user3",
    userName: "Mike Chen",
    rating: 5,
    comment: "Amazing turmeric powder! The color and aroma are perfect. Great value for money.",
    date: "2024-01-08",
    verified: false,
  },
  {
    id: "4",
    userId: "user4",
    userName: "Emily Davis",
    rating: 4,
    comment: "Very satisfied with the purchase. The quality is consistent and the seller is reliable.",
    date: "2024-01-05",
    verified: true,
  },
]

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState(MOCK_REVIEWS)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: "",
    userName: "",
  })

  useEffect(() => {
    const productId = params.id as string
    const foundProduct = MOCK_SPICES.find((spice) => spice.id === productId)
    
    if (foundProduct) {
      setProduct(foundProduct)
    }
    setLoading(false)
  }, [params.id])

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

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-200 rounded"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
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
              className="px-6 py-2 bg-yogreet-red text-white font-medium rounded hover:opacity-80 transition-opacity"
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
      
      {/* Breadcrumb */}
      <div className="bg-yogreet-light-gray py-4">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-yogreet-charcoal hover:text-yogreet-red transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Explore</span>
          </button>
        </div>
      </div>

      {/* Product Detail */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square bg-yogreet-light-gray rounded-lg overflow-hidden">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                width={600}
                height={600}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Sample Available Badge */}
            {product.sampleAvailable && (
              <div className="flex items-center gap-2 text-yogreet-teal">
                <FiCheck className="w-4 h-4" />
                <span className="text-sm font-medium">Sample Available</span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-poppins font-semibold text-yogreet-charcoal mb-2">{product.name}</h1>
              <p className="text-yogreet-warm-gray mb-4">by {product.seller}</p>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(product.rating) ? "fill-yogreet-gold text-yogreet-gold" : "text-yogreet-light-gray"}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-yogreet-warm-gray">({product.reviews} reviews)</span>
              </div>
            </div>

            {/* Price & Quantity */}
            <div className="bg-yogreet-light-gray p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-medium text-yogreet-charcoal">Price per kg</span>
                <span className="text-3xl font-poppins font-bold text-yogreet-red">${product.price}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-yogreet-charcoal">Minimum Quantity</span>
                <span className="text-lg font-semibold text-yogreet-charcoal">{product.minQuantity} kg</span>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-4">
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

            {/* Description */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-yogreet-charcoal">Description</h3>
              <p className="text-yogreet-warm-gray leading-relaxed">{product.description}</p>
            </div>

            {/* Seller Info */}
            <div className="bg-yogreet-light-gray p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-yogreet-charcoal mb-3">Seller Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-yogreet-warm-gray">Company</span>
                  <span className="text-yogreet-charcoal">{product.seller}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yogreet-warm-gray">Location</span>
                  <span className="text-yogreet-charcoal">{product.sellerLocation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yogreet-warm-gray">Rating</span>
                  <div className="flex items-center gap-1">
                    <FiStar className="w-4 h-4 fill-yogreet-gold text-yogreet-gold" />
                    <span className="text-yogreet-charcoal">{product.sellerRating}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button className="flex-1 bg-yogreet-red text-white py-3 font-manrope font-medium text-lg hover:opacity-80 transition-opacity">
                Buy in Bulk
              </button>
              <button className="flex-1 border-2 border-yogreet-sage text-yogreet-sage py-3 font-manrope font-medium text-lg hover:bg-yogreet-sage hover:text-white transition-all">
                Request Sample
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-yogreet-light-gray py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-yogreet-charcoal mb-4">Customer Reviews</h2>
            
            {/* Rating Summary */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(averageRating) ? "fill-yogreet-gold text-yogreet-gold" : "text-yogreet-light-gray"}`}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold text-yogreet-charcoal">{averageRating.toFixed(1)}</span>
              </div>
              <span className="text-yogreet-warm-gray">({reviews.length} reviews)</span>
            </div>

            {/* Add Review Button */}
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-6 py-2 bg-yogreet-red text-white font-medium rounded hover:opacity-80 transition-opacity"
            >
              {showReviewForm ? "Cancel" : "Write a Review"}
            </button>
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div className="bg-white p-6 rounded-lg mb-8">
              <h3 className="text-lg font-semibold text-yogreet-charcoal mb-4">Write Your Review</h3>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-yogreet-charcoal mb-2">Your Name</label>
                  <input
                    type="text"
                    value={newReview.userName}
                    onChange={(e) => setNewReview({ ...newReview, userName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-yogreet-red"
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
                        className="focus:outline-none"
                      >
                        <FiStar
                          className={`w-6 h-6 ${i < newReview.rating ? "fill-yogreet-gold text-yogreet-gold" : "text-yogreet-light-gray"}`}
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
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-yogreet-red h-24 resize-none"
                    placeholder="Share your experience with this product..."
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-yogreet-red text-white font-medium rounded hover:opacity-80 transition-opacity"
                  >
                    Submit Review
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="px-6 py-2 border border-gray-300 text-yogreet-charcoal font-medium rounded hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white p-6 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yogreet-sage rounded-full flex items-center justify-center">
                      <FiUser className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-yogreet-charcoal">{review.userName}</h4>
                        {review.verified && (
                          <span className="text-xs bg-yogreet-mint text-yogreet-teal px-2 py-1 rounded">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <FiStar
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? "fill-yogreet-gold text-yogreet-gold" : "text-yogreet-light-gray"}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-yogreet-warm-gray">{review.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-yogreet-charcoal leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
