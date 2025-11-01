"use client"

import { useState } from "react"
import { Navbar, Footer } from "@/components/layout"
import { ExploreHeader, ExploreFilterBar, ExploreSpiceCard, ExplorePagination, type FilterState, type ExploreSpiceCardProps } from "@/components/explore"
import BuyBulkModal from "@/components/buyer/BuyBulkModal"
import RequestSampleModal from "@/components/buyer/RequestSampleModal"

// Mock data for spices
const MOCK_SPICES = [
  {
    id: "1",
    name: "Premium Turmeric Powder",
    seller: "Golden Spice Co.",
    price: 45,
    minQuantity: 100,
    origin: "Telangana, India",
    image: "/turmeric-powder-spice.jpg",
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
    rating: 4.8,
    reviews: 203,
    description: "Freshly ground black pepper with sharp, peppery flavor. Premium quality from Kerala.",
    processingMethod: "Freshly ground",
    qualityGrade: "Premium Grade A",
    sellerRating: 4.9,
    sellerLocation: "Kochi, India",
  },
]

const ITEMS_PER_PAGE = 40

export default function ExplorePage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [showSampleModal, setShowSampleModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [filters, setFilters] = useState<FilterState>({
    category: "all",
    priceRange: "all",
    location: "all",
    country: "all",
    seller: "all",
    sortBy: "relevance",
  })

  // Get unique sellers from MOCK_SPICES
  const uniqueSellers = Array.from(new Set(MOCK_SPICES.map(spice => spice.seller))).sort()
  
  // Get unique locations from MOCK_SPICES (using sellerLocation)
  const uniqueLocations = Array.from(new Set(MOCK_SPICES.map(spice => spice.sellerLocation))).sort()

  // Filter and sort spices
  const filteredSpices = MOCK_SPICES.filter((spice) => {
    // Seller filter
    if (filters.seller !== "all" && spice.seller !== filters.seller) {
      return false
    }
    // Location filter
    if (filters.location !== "all" && spice.sellerLocation !== filters.location) {
      return false
    }
    // Add other filter conditions here if needed
    return true
  })

  // Sort spices
  if (filters.sortBy === "price-low") {
    filteredSpices.sort((a, b) => a.price - b.price)
  } else if (filters.sortBy === "price-high") {
    filteredSpices.sort((a, b) => b.price - a.price)
  } else if (filters.sortBy === "popular") {
    filteredSpices.sort((a, b) => b.reviews - a.reviews)
  }

  const totalPages = Math.ceil(filteredSpices.length / ITEMS_PER_PAGE)
  const paginatedSpices = filteredSpices.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  const handleBulkOrder = (spice: any) => {
    setSelectedProduct(spice)
    setShowBulkModal(true)
  }

  const handleRequestSample = (spice: any) => {
    setSelectedProduct(spice)
    setShowSampleModal(true)
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <ExploreHeader />
      <ExploreFilterBar 
        onFilterChange={handleFilterChange} 
        sellers={uniqueSellers}
        locations={uniqueLocations}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {paginatedSpices.length > 0 ? (
          <>
            {/* Spice Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              {paginatedSpices.map((spice) => (
                <ExploreSpiceCard 
                  key={spice.id} 
                  {...spice} 
                  onBulkOrder={() => handleBulkOrder(spice)}
                  onRequestSample={() => handleRequestSample(spice)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <ExplorePagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-yogreet-charcoal text-opacity-70 mb-4">
              No spices found for your selected filters.
            </p>
            <p className="text-yogreet-charcoal text-opacity-60">
              Try adjusting your criteria or explore other categories.
            </p>
          </div>
        )}
      </div>

      <Footer />

      {/* Buy Bulk Modal */}
      {selectedProduct && (
        <BuyBulkModal
          isOpen={showBulkModal}
          onClose={() => setShowBulkModal(false)}
          product={{
            name: selectedProduct.name,
            price: selectedProduct.price,
            minQuantity: selectedProduct.minQuantity,
            origin: selectedProduct.origin,
            image: selectedProduct.image,
          }}
        />
      )}

      {/* Request Sample Modal */}
      {selectedProduct && (
        <RequestSampleModal
          isOpen={showSampleModal}
          onClose={() => setShowSampleModal(false)}
          product={{
            name: selectedProduct.name,
            price: selectedProduct.price,
            minQuantity: selectedProduct.minQuantity,
            origin: selectedProduct.origin,
            image: selectedProduct.image,
          }}
        />
      )}
    </main>
  )
}
