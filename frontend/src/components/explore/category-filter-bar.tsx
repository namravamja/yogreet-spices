"use client"

import { useRef, useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { TURMERIC_POWDER_SPICE_URL, CUMIN_SEEDS_SPICE_URL, RED_CHILI_POWDER_SPICE_URL, CORIANDER_POWDER_SPICE_URL, CARDAMOM_PODS_SPICE_URL, CLOVES_WHOLE_SPICE_URL, FENUGREEK_SEEDS_SPICE_URL, ASAFOETIDA_POWDER_SPICE_URL } from "@/constants/static-images"

interface CategoryFilterBarProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

const spiceCategories = [
  { id: "all", name: "All Spices", image: null },
  { id: "turmeric", name: "Turmeric", image: TURMERIC_POWDER_SPICE_URL },
  { id: "cumin", name: "Cumin", image: CUMIN_SEEDS_SPICE_URL },
  { id: "chili", name: "Chili", image: RED_CHILI_POWDER_SPICE_URL },
  { id: "coriander", name: "Coriander", image: CORIANDER_POWDER_SPICE_URL },
  { id: "cardamom", name: "Cardamom", image: CARDAMOM_PODS_SPICE_URL },
  { id: "cloves", name: "Cloves", image: CLOVES_WHOLE_SPICE_URL },
  { id: "fenugreek", name: "Fenugreek", image: FENUGREEK_SEEDS_SPICE_URL },
  { id: "asafoetida", name: "Asafoetida", image: ASAFOETIDA_POWDER_SPICE_URL },
  { id: "pepper", name: "Pepper", image: null },
  { id: "cinnamon", name: "Cinnamon", image: null },
  { id: "nutmeg", name: "Nutmeg", image: null },
]

export function CategoryFilterBar({ selectedCategory, onCategoryChange }: CategoryFilterBarProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setShowLeftArrow(scrollLeft > 0)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScrollButtons()
    const handleResize = () => checkScrollButtons()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300
      const currentScroll = scrollContainerRef.current.scrollLeft
      const newScroll = direction === "left" 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount
      
      scrollContainerRef.current.scrollTo({
        left: newScroll,
        behavior: "smooth"
      })
      
      setTimeout(checkScrollButtons, 300)
    }
  }

  return (
    <div className="bg-white border-gray-200 relative">
      <div className="max-w-7xl mx-auto py-2">
        <div className="relative flex items-center">
          {/* Left Arrow */}
          {showLeftArrow && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 z-10 bg-white border border-gray-200 rounded-full p-1.5 shadow-sm hover:bg-gray-50 transition-colors cursor-pointer -translate-x-1/2"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4 text-gray-400" />
            </button>
          )}

          {/* Scrollable Category List */}
          <div
            ref={scrollContainerRef}
            onScroll={checkScrollButtons}
            className="flex gap-2.5 overflow-x-auto scrollbar-hide w-full"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {spiceCategories.map((category) => {
              const isSelected = selectedCategory === category.id
              
              return (
                <button
                  key={category.id}
                  onClick={() => onCategoryChange(category.id)}
                  className={`shrink-0 flex items-center gap-4 px-4 py-3 rounded-full font-inter text-lg font-medium transition-all cursor-pointer whitespace-nowrap border ${
                    isSelected
                      ? "bg-white border-gray-300 shadow-sm hover:shadow"
                      : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                  }`}
                >
                  {/* Image Container */}
                  {category.image ? (
                    <div className="w-13 h-13 rounded-full overflow-hidden shrink-0 relative">
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  ) : (
                    <div className="w-13 h-13 rounded-full bg-gray-200 shrink-0 flex items-center justify-center">
                      <span className="text-gray-500 text-xs font-medium">All</span>
                    </div>
                  )}
                  
                  {/* Category Name */}
                  <span className={`${
                    isSelected ? "text-yogreet-charcoal font-semibold" : "text-yogreet-charcoal"
                  }`}>
                    {category.name}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Right Arrow */}
          {showRightArrow && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 z-10 bg-white border border-gray-200 rounded-full p-1.5 shadow-sm hover:bg-gray-50 transition-colors cursor-pointer translate-x-1/2"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}

