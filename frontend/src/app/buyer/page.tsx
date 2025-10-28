"use client"

import { BuyerSidebar } from "@/components/buyer"
import { FilterSidebar, SpiceCard } from "@/components/shared"
import { useState } from "react"

export default function BuyerDashboard() {
  const [spices] = useState([
    {
      id: "1",
      name: "Premium Turmeric Powder",
      seller: "Golden Spice Co.",
      image: "/turmeric-powder-spice.jpg",
      pricePerKg: 12.5,
      minOrder: 50,
      rating: 4.8,
      reviews: 234,
      inStock: true,
    },
    {
      id: "2",
      name: "Organic Cumin Seeds",
      seller: "Spice Masters",
      image: "/cumin-seeds-spice.jpg",
      pricePerKg: 8.75,
      minOrder: 100,
      rating: 4.6,
      reviews: 156,
      inStock: true,
    },
    {
      id: "3",
      name: "Red Chili Powder",
      seller: "Chili Exports Ltd",
      image: "/red-chili-powder-spice.jpg",
      pricePerKg: 6.5,
      minOrder: 75,
      rating: 4.7,
      reviews: 189,
      inStock: false,
    },
    {
      id: "4",
      name: "Coriander Powder",
      seller: "Aromatic Spices",
      image: "/coriander-powder-spice.jpg",
      pricePerKg: 7.25,
      minOrder: 60,
      rating: 4.5,
      reviews: 142,
      inStock: true,
    },
    {
      id: "5",
      name: "Cardamom Pods",
      seller: "Premium Exports",
      image: "/cardamom-pods-spice.jpg",
      pricePerKg: 18.0,
      minOrder: 25,
      rating: 4.9,
      reviews: 267,
      inStock: true,
    },
    {
      id: "6",
      name: "Cloves Whole",
      seller: "Spice Traders",
      image: "/cloves-whole-spice.jpg",
      pricePerKg: 15.5,
      minOrder: 30,
      rating: 4.7,
      reviews: 198,
      inStock: true,
    },
    {
      id: "7",
      name: "Fenugreek Seeds",
      seller: "Natural Spices",
      image: "/fenugreek-seeds-spice.jpg",
      pricePerKg: 5.75,
      minOrder: 100,
      rating: 4.4,
      reviews: 87,
      inStock: true,
    },
    {
      id: "8",
      name: "Asafoetida Powder",
      seller: "Exotic Spices Co.",
      image: "/asafoetida-powder-spice.jpg",
      pricePerKg: 22.0,
      minOrder: 10,
      rating: 4.8,
      reviews: 145,
      inStock: true,
    },
  ])

  return (
    <div className="flex min-h-screen bg-[#F7F7F7]">
      <BuyerSidebar />

      <div className="flex-1">
        {/* Header */}
        <div className="bg-white border-b border-[#F7F7F7] px-8 py-6 sticky top-0 z-40">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="heading-md mb-1">Browse Premium Spices</h1>
              <p className="text-[#222222] font-inter text-sm">Discover quality spices from verified sellers</p>
            </div>
            <div className="flex gap-2">
              <select className="px-4 py-2 border border-[#F7F7F7] font-inter text-sm text-[#222222] focus:outline-none focus:border-[#C63C3C]">
                <option>Sort by: Relevance</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Rating: High to Low</option>
                <option>Newest</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex">
          <FilterSidebar />

          {/* Spices Grid */}
          <div className="flex-1 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {spices.map((spice) => (
                <SpiceCard key={spice.id} {...spice} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
