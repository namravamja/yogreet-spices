"use client"

import { useState, useMemo } from "react"
import { Navbar, Footer } from "@/components/layout"
import { ExploreFilterBar, ExploreSpiceCard, ExplorePagination, type FilterState } from "@/components/explore"
import { CategoryFilterBar } from "@/components/explore/category-filter-bar"
import { useGetProductsQuery } from "@/services/api"
import PageHero from "@/components/shared/PageHero"
import { PLACEHOLDER_SVG_URL } from "@/constants/static-images"

const ITEMS_PER_PAGE = 40

// Transform database product to explore card format
function transformProduct(product: any) {
  // Calculate average rating from reviews
  const reviews = product.Review || []
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length
    : 0

  // Get seller name
  const sellerName = product.seller?.companyName || product.seller?.fullName || "Unknown Seller"
  
  // Get seller ID
  const sellerId = product.seller?.id || null

  // Get seller profile picture
  const sellerProfilePicture = product.seller?.profilePicture || product.seller?.avatar || null

  // Get seller location
  const sellerLocation = product.seller?.businessAddress
    ? `${product.seller.businessAddress.city || ""}, ${product.seller.businessAddress.country || ""}`.trim().replace(/^,\s*/, "").replace(/,\s*$/, "")
    : "Unknown Location"

  // Get product images - always return an array
  const images = product.productImages && product.productImages.length > 0
    ? product.productImages
    : [PLACEHOLDER_SVG_URL]

  // Get small package price and weight
  const smallPrice = parseFloat(product.smallPrice || "0")
  const smallWeight = parseFloat(product.smallWeight || "1") // Default to 1 kg if not specified
  
  // Calculate price per kg from small package
  const pricePerKg = smallWeight > 0 ? smallPrice / smallWeight : smallPrice
  
  // Get min quantity (available stock)
  const minQuantity = parseFloat(product.availableStock || "0")

  // Use category as origin for now (or you can add origin field to Product model)
  const origin = product.category || "Unknown Origin"

  return {
    id: product.id,
    name: product.productName,
    seller: sellerName,
    sellerId,
    sellerProfilePicture,
    price: pricePerKg, // Price per kg from small package
    smallPrice, // Keep small price for display
    smallWeight, // Keep small weight for display
    minQuantity,
    origin,
    sellerLocation, // Include seller location for filtering
    images,
    rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
    reviews: reviews.length,
    description: product.shortDescription || product.description || null,
  }
}

export default function ExplorePage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<FilterState>({
    category: "all",
    priceRange: "all",
    location: "all",
    country: "all",
    seller: "all",
    sortBy: "relevance",
  })

  // Fetch products from API
  const { data, isLoading, error } = useGetProductsQuery()

  // Transform products
  const products = useMemo(() => {
    if (!data?.products) return []
    return data.products.map(transformProduct)
  }, [data])

  // Get unique sellers and locations from products
  const uniqueSellers = useMemo(() => {
    return Array.from(new Set(products.map(p => p.seller))).sort()
  }, [products])

  const uniqueLocations = useMemo(() => {
    return Array.from(new Set(products.map(p => (p as any).sellerLocation || p.origin))).sort()
  }, [products])

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      // Seller filter
      if (filters.seller !== "all" && product.seller !== filters.seller) {
        return false
      }
      // Location filter (using sellerLocation if available, otherwise origin)
      if (filters.location !== "all") {
        const location = (product as any).sellerLocation || product.origin
        if (location !== filters.location) {
          return false
        }
      }
      // Category filter
      if (filters.category !== "all") {
        const productCategory = product.origin?.toLowerCase() || product.name?.toLowerCase() || ""
        const filterCategory = filters.category.toLowerCase()
        
        // Check if product name or origin contains the category
        if (!productCategory.includes(filterCategory) && !product.name?.toLowerCase().includes(filterCategory)) {
          return false
        }
      }
      // Price range filter
      if (filters.priceRange !== "all") {
        const [min, max] = filters.priceRange.split("-").map(v => 
          v.includes("+") ? Infinity : parseFloat(v.replace("$", "").replace("/kg", ""))
        )
        if (product.price < min || (max !== Infinity && product.price > max)) {
          return false
        }
      }
      return true
    })

    // Sort products
    if (filters.sortBy === "price-low") {
      filtered.sort((a, b) => a.price - b.price)
    } else if (filters.sortBy === "price-high") {
      filtered.sort((a, b) => b.price - a.price)
    } else if (filters.sortBy === "popular") {
      filtered.sort((a, b) => b.reviews - a.reviews)
    } else if (filters.sortBy === "newest") {
      // If you have createdAt, you can sort by it
      // For now, keep original order (which is already sorted by createdAt desc from backend)
    }

    return filtered
  }, [products, filters])

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }


  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <PageHero
        title="Explore Spices from Verified Indian Sellers"
        subtitle="Browse Authentic Spices"
        description=""
        breadcrumb={{
          items: [
            { label: "Home", href: "/" },
            { label: "Explore Spices", isActive: true }
          ]
        }}
      />
      <CategoryFilterBar
        selectedCategory={filters.category}
        onCategoryChange={(category) => handleFilterChange({ ...filters, category })}
      />
      <ExploreFilterBar 
        onFilterChange={handleFilterChange} 
        sellers={uniqueSellers}
        locations={uniqueLocations}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-lg text-yogreet-charcoal text-opacity-70 mb-4">
              Loading products...
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-lg text-yogreet-charcoal text-opacity-70 mb-4">
              Error loading products. Please try again later.
            </p>
          </div>
        ) : paginatedProducts.length > 0 ? (
          <>
            {/* Spice Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 mb-12">
              {paginatedProducts.map((product) => (
                <ExploreSpiceCard 
                  key={product.id} 
                  {...product} 
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

    </main>
  )
}
