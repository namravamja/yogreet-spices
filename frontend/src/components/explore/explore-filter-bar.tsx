"use client"

import { useState } from "react"
import { FiChevronDown } from "react-icons/fi"

interface FilterBarProps {
  onFilterChange: (filters: FilterState) => void
  sellers?: string[]
  locations?: string[]
  onClearFilters?: () => void
}

export interface FilterState {
  category: string
  priceRange: string
  location: string
  country: string
  seller: string
  sortBy: string
}

export function ExploreFilterBar({ onFilterChange, sellers = [], locations = [], onClearFilters }: FilterBarProps) {
  const [filters, setFilters] = useState<FilterState>({
    category: "all",
    priceRange: "all",
    location: "all",
    country: "all",
    seller: "all",
    sortBy: "relevance",
  })

  const handleClearFilters = () => {
    const clearedFilters: FilterState = {
      category: "all",
      priceRange: "all",
      location: "all",
      country: "all",
      seller: "all",
      sortBy: "relevance",
    }
    setFilters(clearedFilters)
    onFilterChange(clearedFilters)
    onClearFilters?.()
  }

  const hasActiveFilters = () => {
    return filters.category !== "all" ||
      filters.priceRange !== "all" ||
      filters.location !== "all" ||
      filters.country !== "all" ||
      filters.seller !== "all" ||
      filters.sortBy !== "relevance"
  }

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Category Filter */}
          <div className="relative">
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="appearance-none bg-yogreet-light-gray text-yogreet-charcoal px-4 py-3 text-sm font-medium cursor-pointer pr-8 border border-gray-200 hover:border-yogreet-red transition"
            >
              <option value="all">All Categories</option>
              <option value="whole">Whole Spices</option>
              <option value="ground">Ground Spices</option>
              <option value="blends">Spice Blends</option>
            </select>
            <FiChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none text-yogreet-charcoal" />
          </div>

          {/* Price Range Filter */}
          <div className="relative">
            <select
              value={filters.priceRange}
              onChange={(e) => handleFilterChange("priceRange", e.target.value)}
              className="appearance-none bg-yogreet-light-gray text-yogreet-charcoal px-4 py-3 text-sm font-medium cursor-pointer pr-8 border border-gray-200 hover:border-yogreet-red transition"
            >
              <option value="all">All Prices</option>
              <option value="0-50">$0 - $50/kg</option>
              <option value="50-100">$50 - $100/kg</option>
              <option value="100-200">$100 - $200/kg</option>
              <option value="200+">$200+/kg</option>
            </select>
            <FiChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none text-yogreet-charcoal" />
          </div>

          {/* Location Filter */}
          <div className="relative">
            <select
              value={filters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
              className="appearance-none bg-yogreet-light-gray text-yogreet-charcoal px-4 py-3 text-sm font-medium cursor-pointer pr-8 border border-gray-200 hover:border-yogreet-red transition"
            >
              <option value="all">All Locations</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
            <FiChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none text-yogreet-charcoal" />
          </div>

          {/* Seller Filter */}
          <div className="relative">
            <select
              value={filters.seller}
              onChange={(e) => handleFilterChange("seller", e.target.value)}
              className="appearance-none bg-yogreet-light-gray text-yogreet-charcoal px-4 py-3 text-sm font-medium cursor-pointer pr-8 border border-gray-200 hover:border-yogreet-red transition"
            >
              <option value="all">All Sellers</option>
              {sellers.map((seller) => (
                <option key={seller} value={seller}>
                  {seller}
                </option>
              ))}
            </select>
            <FiChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none text-yogreet-charcoal" />
          </div>

          {/* Sort By */}
          <div className="relative">
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
              className="appearance-none bg-yogreet-light-gray text-yogreet-charcoal px-4 py-3 text-sm font-medium cursor-pointer pr-8 border border-gray-200 hover:border-yogreet-red transition"
            >
              <option value="relevance">Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest</option>
              <option value="popular">Most Popular</option>
            </select>
            <FiChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none text-yogreet-charcoal" />
          </div>

          {/* Clear All Filters */}
          <div className="ml-auto">
            <button
              onClick={handleClearFilters}
              disabled={!hasActiveFilters()}
              className={`px-4 py-3 text-sm font-medium rounded-xs transition-colors ${
                hasActiveFilters()
                  ? "text-yogreet-red hover:text-yogreet-red/80 border border-yogreet-red/30 hover:bg-yogreet-red/5 cursor-pointer"
                  : "text-gray-400 border border-gray-200 bg-gray-50 cursor-not-allowed"
              }`}
            >
              Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
