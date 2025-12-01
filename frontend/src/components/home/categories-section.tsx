"use client"

import { useRouter } from "next/navigation"
import { TURMERIC_POWDER_SPICE_URL, CUMIN_SEEDS_SPICE_URL, RED_CHILI_POWDER_SPICE_URL, CORIANDER_POWDER_SPICE_URL, CARDAMOM_PODS_SPICE_URL, CLOVES_WHOLE_SPICE_URL, FENUGREEK_SEEDS_SPICE_URL, ASAFOETIDA_POWDER_SPICE_URL, PLACEHOLDER_SVG_URL } from "@/constants/static-images"

export function CategoriesSection() {
  const router = useRouter()

  const categories = [
    {
      name: "Turmeric",
      image: TURMERIC_POWDER_SPICE_URL,
      count: "120+",
    },
    {
      name: "Cumin",
      image: CUMIN_SEEDS_SPICE_URL,
      count: "95+",
    },
    {
      name: "Chili",
      image: RED_CHILI_POWDER_SPICE_URL,
      count: "150+",
    },
    {
      name: "Coriander",
      image: CORIANDER_POWDER_SPICE_URL,
      count: "110+",
    },
    {
      name: "Cardamom",
      image: CARDAMOM_PODS_SPICE_URL,
      count: "80+",
    },
    {
      name: "Cloves",
      image: CLOVES_WHOLE_SPICE_URL,
      count: "75+",
    },
    {
      name: "Fenugreek",
      image: FENUGREEK_SEEDS_SPICE_URL,
      count: "60+",
    },
    {
      name: "Asafoetida",
      image: ASAFOETIDA_POWDER_SPICE_URL,
      count: "45+",
    },
  ]

  const handleCategoryClick = (categoryName: string) => {
    router.push(`/explore?category=${categoryName.toLowerCase()}`)
  }

  return (
    <section className="bg-white pt-4 md:pt-6 pb-8 md:pb-12">
      <div className="overflow-x-auto">
        <div className="flex flex-nowrap justify-center gap-3 md:gap-4">
          {categories.map((category, index) => (
            <div
              key={index}
              onClick={() => handleCategoryClick(category.name)}
              className="group relative shrink-0 w-28 h-32 md:w-36 md:h-36 bg-white border border-yogreet-light-gray rounded-md overflow-hidden cursor-pointer hover:shadow-lg hover:border-yogreet-red transition-all duration-300"
            >
              <div className="relative w-full h-full">
                <img
                  src={category.image || PLACEHOLDER_SVG_URL}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <h3 className="font-poppins font-semibold text-white text-xs md:text-sm mb-0.5">
                    {category.name}
                  </h3>
                  <p className="font-inter text-white/90 text-[10px] md:text-xs">
                    {category.count} Products
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

