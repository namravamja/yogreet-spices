"use client"

import { useState, useEffect } from "react"

export function TopSpicesSection() {
  const [isHovered, setIsHovered] = useState(false)
  const spices = [
    {
      name: "Turmeric Powder",
      origin: "Telangana, India",
      image: "/turmeric-powder-spice.jpg",
    },
    {
      name: "Cumin Seeds",
      origin: "Gujarat, India",
      image: "/cumin-seeds-spice.jpg",
    },
    {
      name: "Red Chili Powder",
      origin: "Andhra Pradesh, India",
      image: "/red-chili-powder-spice.jpg",
    },
    {
      name: "Coriander Powder",
      origin: "Rajasthan, India",
      image: "/coriander-powder-spice.jpg",
    },
    {
      name: "Cardamom Pods",
      origin: "Kerala, India",
      image: "/cardamom-pods-spice.jpg",
    },
    {
      name: "Cloves",
      origin: "Kerala, India",
      image: "/cloves-whole-spice.jpg",
    },
  ]

  // Duplicate spices for infinite scroll effect
  const duplicatedSpices = [...spices, ...spices]

  return (
    <section className="bg-yogreet-light-gray py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-poppins font-semibold text-yogreet-charcoal mb-4">
            Top Exported Spices
          </h2>
          <p className="text-yogreet-charcoal font-inter text-base max-w-2xl mx-auto">
            Discover the most sought-after Indian spices from verified sellers worldwide.
          </p>
        </div>
      </div>

      {/* Infinite horizontal scrolling carousel - Full width */}
      <div 
        className="overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
          <div 
            className="flex gap-6"
            style={{
              animation: 'scroll 30s linear infinite',
              animationPlayState: isHovered ? 'paused' : 'running',
              width: 'calc(200% + 2rem)' // Double width for seamless loop
            }}
          >
            {duplicatedSpices.map((spice, index) => (
              <div key={index} className="shrink-0 w-80 bg-white overflow-hidden hover:shadow-lg transition-shadow rounded-xs">
                <div className="relative aspect-square bg-gray-200 overflow-hidden">
                  <img
                    src={spice.image || "/placeholder.svg"}
                    alt={spice.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-poppins font-semibold text-yogreet-charcoal text-base mb-2">{spice.name}</h3>
                  <p className="text-yogreet-charcoal font-inter text-sm mb-3">{spice.origin}</p>
                  <button className="w-full px-4 py-2 bg-yogreet-red text-white font-manrope font-medium hover:opacity-90 transition-opacity cursor-pointer">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
    </section>
  )
}
