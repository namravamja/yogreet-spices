"use client"

import { useState } from "react"
import { FiChevronDown } from "react-icons/fi"

interface FilterBarProps {
  onFilterChange: (filters: FilterState) => void
}

export interface FilterState {
  category: string
  priceRange: string
  availability: string
  country: string
  sampleAvailable: boolean
  sortBy: string
}

export function ExploreFilterBar({ onFilterChange }: FilterBarProps) {
  const [filters, setFilters] = useState<FilterState>({
    category: "all",
    priceRange: "all",
    availability: "all",
    country: "all",
    sampleAvailable: false,
    sortBy: "relevance",
  })

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  return (
    <div className="sticky top-24 bg-white border-b border-gray-200 z-40">
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

          {/* Availability Filter */}
          <div className="relative">
            <select
              value={filters.availability}
              onChange={(e) => handleFilterChange("availability", e.target.value)}
              className="appearance-none bg-yogreet-light-gray text-yogreet-charcoal px-4 py-3 text-sm font-medium cursor-pointer pr-8 border border-gray-200 hover:border-yogreet-red transition"
            >
              <option value="all">All Quantities</option>
              <option value="100-500">100 - 500 kg</option>
              <option value="500-1000">500 - 1000 kg</option>
              <option value="1000+">1000+ kg</option>
            </select>
            <FiChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none text-yogreet-charcoal" />
          </div>

          {/* Sample Available Toggle */}
          <label className="flex items-center gap-2 bg-yogreet-light-gray px-4 py-3 text-sm font-medium cursor-pointer border border-gray-200 hover:border-yogreet-red transition">
            <input
              type="checkbox"
              checked={filters.sampleAvailable}
              onChange={(e) => handleFilterChange("sampleAvailable", e.target.checked)}
              className="w-4 h-4 cursor-pointer"
            />
            <span className="text-yogreet-charcoal">Sample Available</span>
          </label>

          {/* Sort By */}
          <div className="ml-auto relative">
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
        </div>
      </div>
    </div>
  )
}
