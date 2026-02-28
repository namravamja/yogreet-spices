"use client"

import { useState } from "react"
import { formatCurrency } from "@/utils/currency"

export function FilterSidebar() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [priceRange, setPriceRange] = useState([0, 50])

  const categories = ["Turmeric", "Cumin", "Chili", "Coriander", "Cardamom", "Cloves", "Fenugreek", "Asafoetida"]

  return (
    <aside className="w-64 bg-white border-r border-yogreet-light-gray p-6 h-fit sticky top-20">
      <h3 className="font-poppins font-semibold text-yogreet-charcoal mb-4">Filters</h3>

      {/* Category Filter */}
      <div className="mb-6">
        <h4 className="font-manrope font-medium text-yogreet-charcoal text-sm mb-3">Category</h4>
        <div className="space-y-2">
          {categories.map((category) => (
            <label key={category} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCategory === category}
                onChange={() => setSelectedCategory(selectedCategory === category ? null : category)}
                className="w-4 h-4 border-yogreet-red text-yogreet-red"
              />
              <span className="text-yogreet-charcoal font-inter text-sm">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="mb-6">
        <h4 className="font-manrope font-medium text-yogreet-charcoal text-sm mb-3">Price Range</h4>
        <div className="space-y-3">
          <input
            type="range"
            min="0"
            max="50"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], Number.parseInt(e.target.value)])}
            className="w-full"
          />
          <div className="flex justify-between text-yogreet-charcoal font-inter text-sm">
            <span>{formatCurrency(priceRange[0], "INR")}</span>
            <span>{formatCurrency(priceRange[1], "INR")}</span>
          </div>
        </div>
      </div>

      {/* Country Filter */}
      <div className="mb-6">
        <h4 className="font-manrope font-medium text-yogreet-charcoal text-sm mb-3">Country</h4>
        <select className="w-full px-3 py-2 border border-yogreet-light-gray font-inter text-sm text-yogreet-charcoal focus:outline-none focus:border-yogreet-red">
          <option>All Countries</option>
          <option>India</option>
          <option>Other</option>
        </select>
      </div>

      {/* Stock Status */}
      <div>
        <h4 className="font-manrope font-medium text-yogreet-charcoal text-sm mb-3">Stock Status</h4>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="w-4 h-4 border-yogreet-red text-yogreet-red" />
          <span className="text-yogreet-charcoal font-inter text-sm">In Stock Only</span>
        </label>
      </div>
    </aside>
  )
}
