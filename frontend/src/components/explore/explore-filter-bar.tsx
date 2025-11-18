"use client"

import { useState } from "react"
import { FilterDropdown } from "./filter-dropdown"

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

  // Convert single values to arrays for dropdowns
  const priceRangeSelected = filters.priceRange !== "all" ? [filters.priceRange] : []
  const locationSelected = filters.location !== "all" ? [filters.location] : []
  const sellerSelected = filters.seller !== "all" ? [filters.seller] : []
  const sortBySelected = filters.sortBy !== "relevance" ? [filters.sortBy] : []

  // Prepare options with counts (mock counts for now, can be calculated from products)
  const priceRangeOptions = [
    { value: "0-50", label: "$0 - $50/kg", count: 1250 },
    { value: "50-100", label: "$50 - $100/kg", count: 890 },
    { value: "100-200", label: "$100 - $200/kg", count: 450 },
    { value: "200+", label: "$200+/kg", count: 120 },
  ]

  const locationOptions = locations.map((loc) => ({
    value: loc,
    label: loc,
    count: Math.floor(Math.random() * 500) + 50, // Mock count, replace with actual
  }))

  const sellerOptions = sellers.map((seller) => ({
    value: seller,
    label: seller,
    count: Math.floor(Math.random() * 300) + 20, // Mock count, replace with actual
  }))

  const sortByOptions = [
    { value: "relevance", label: "Relevance", count: undefined },
    { value: "price-low", label: "Price: Low to High", count: undefined },
    { value: "price-high", label: "Price: High to Low", count: undefined },
    { value: "newest", label: "Newest", count: undefined },
    { value: "popular", label: "Most Popular", count: undefined },
  ]

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
    return filters.priceRange !== "all" ||
      filters.location !== "all" ||
      filters.country !== "all" ||
      filters.seller !== "all" ||
      filters.sortBy !== "relevance"
  }

  const handlePriceRangeChange = (values: string[]) => {
    const newFilters = { ...filters, priceRange: values.length > 0 ? values[0] : "all" }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleLocationChange = (values: string[]) => {
    const newFilters = { ...filters, location: values.length > 0 ? values[0] : "all" }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleSellerChange = (values: string[]) => {
    const newFilters = { ...filters, seller: values.length > 0 ? values[0] : "all" }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleSortByChange = (values: string[]) => {
    const newFilters = { ...filters, sortBy: values.length > 0 ? values[0] : "relevance" }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  return (
    <div className="bg-white mt-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 border-t border-black/10">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Price Range Filter */}
          <FilterDropdown
            label="Price Range"
            options={priceRangeOptions}
            selectedValues={priceRangeSelected}
            onSelectionChange={handlePriceRangeChange}
            showCounts={true}
            maxVisible={4}
          />

          {/* Location Filter */}
          {locations.length > 0 && (
            <FilterDropdown
              label="Location"
              options={locationOptions}
              selectedValues={locationSelected}
              onSelectionChange={handleLocationChange}
              showCounts={true}
              maxVisible={4}
            />
          )}

          {/* Seller Filter */}
          {sellers.length > 0 && (
            <FilterDropdown
              label="Seller"
              options={sellerOptions}
              selectedValues={sellerSelected}
              onSelectionChange={handleSellerChange}
              showCounts={true}
              maxVisible={4}
            />
          )}

          {/* Sort By */}
          <FilterDropdown
            label="Sort By"
            options={sortByOptions}
            selectedValues={sortBySelected}
            onSelectionChange={handleSortByChange}
            showCounts={false}
            maxVisible={5}
          />

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
