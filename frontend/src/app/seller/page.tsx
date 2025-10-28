"use client"

import { SellerSidebar } from "@/components/seller"
import { ProductCard } from "@/components/shared"
import { useState } from "react"

export default function SellerDashboard() {
  const [products] = useState([
    {
      id: "1",
      name: "Premium Turmeric Powder",
      image: "/turmeric-powder-spice.jpg",
      pricePerKg: 12.5,
      quantity: 500,
      sampleAvailable: true,
    },
    {
      id: "2",
      name: "Organic Cumin Seeds",
      image: "/cumin-seeds-spice.jpg",
      pricePerKg: 8.75,
      quantity: 750,
      sampleAvailable: true,
    },
    {
      id: "3",
      name: "Red Chili Powder",
      image: "/red-chili-powder-spice.jpg",
      pricePerKg: 6.5,
      quantity: 1200,
      sampleAvailable: false,
    },
    {
      id: "4",
      name: "Coriander Powder",
      image: "/coriander-powder-spice.jpg",
      pricePerKg: 7.25,
      quantity: 600,
      sampleAvailable: true,
    },
  ])

  const stats = [
    { label: "Total Products", value: "24", icon: "📦" },
    { label: "Active Orders", value: "12", icon: "📋" },
    { label: "Sample Requests", value: "8", icon: "🧪" },
    { label: "Total Revenue", value: "$45,230", icon: "💰" },
  ]

  return (
    <div className="flex min-h-screen bg-[#F7F7F7]">
      <SellerSidebar />

      <main className="flex-1">
        {/* Header */}
        <div className="bg-white border-b border-[#F7F7F7] px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="heading-md mb-1">Welcome back, Seller!</h1>
              <p className="text-[#222222] font-inter text-sm">Here's your business overview</p>
            </div>
            <button className="btn-primary">Add New Product</button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white p-6 border border-[#F7F7F7]">
                <div className="text-3xl mb-3">{stat.icon}</div>
                <p className="text-[#222222] font-inter text-sm mb-1">{stat.label}</p>
                <p className="font-poppins font-semibold text-[#222222] text-2xl">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Products Section */}
          <div>
            <div className="mb-6">
              <h2 className="heading-md mb-2">Your Products</h2>
              <p className="text-[#222222] font-inter text-sm">Manage and monitor your spice listings</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
