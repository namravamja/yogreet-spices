"use client"

import { useRouter } from "next/navigation"

export function CategoriesSection() {
  const router = useRouter()

  const categories = [
    {
      name: "Turmeric",
      image: "/turmeric-powder-spice.jpg",
      count: "120+",
    },
    {
      name: "Cumin",
      image: "/cumin-seeds-spice.jpg",
      count: "95+",
    },
    {
      name: "Chili",
      image: "/red-chili-powder-spice.jpg",
      count: "150+",
    },
    {
      name: "Coriander",
      image: "/coriander-powder-spice.jpg",
      count: "110+",
    },
    {
      name: "Cardamom",
      image: "/cardamom-pods-spice.jpg",
      count: "80+",
    },
    {
      name: "Cloves",
      image: "/cloves-whole-spice.jpg",
      count: "75+",
    },
    {
      name: "Fenugreek",
      image: "/fenugreek-seeds-spice.jpg",
      count: "60+",
    },
    {
      name: "Asafoetida",
      image: "/asafoetida-powder-spice.jpg",
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
                  src={category.image || "/placeholder.svg"}
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

