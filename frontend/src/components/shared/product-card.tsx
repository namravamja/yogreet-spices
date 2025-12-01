import { PLACEHOLDER_SVG_URL } from "@/constants/static-images"

export interface ProductCardProps {
  id: string
  name: string
  image: string
  pricePerKg: number
  quantity: number
}

export function ProductCard({ name, image, pricePerKg, quantity }: ProductCardProps) {
  return (
    <div className="bg-white overflow-hidden border border-yogreet-light-gray hover:shadow-lg hover:border-gray-100 transition-all duration-300 rounded-xs">
      <div className="aspect-square bg-yogreet-light-gray overflow-hidden">
        <img src={image || PLACEHOLDER_SVG_URL} alt={name} className="w-full h-full object-cover" />
      </div>
      <div className="p-3">
        <h3 className="font-poppins font-semibold text-yogreet-charcoal mb-1 line-clamp-2 text-xs">{name}</h3>
        <div className="space-y-1 mb-2">
          <div className="flex justify-between items-center">
            <span className="text-yogreet-warm-gray font-inter text-xs">Price per kg</span>
            <span className="font-poppins font-semibold text-black text-xs">${pricePerKg}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-yogreet-warm-gray font-inter text-xs">Available Qty</span>
            <span className="font-inter text-xs text-yogreet-charcoal">{quantity} kg</span>
          </div>
        </div>
        <div className="flex gap-1">
          <button className="flex-1 px-2 py-1.5 border border-yogreet-sage text-yogreet-sage font-manrope font-medium text-xs hover:bg-yogreet-sage hover:text-white transition-all duration-300">
            Edit
          </button>
          <button className="flex-1 px-2 py-1.5 bg-yogreet-red text-white font-manrope font-medium text-xs hover:bg-yogreet-orange transition-colors duration-300">
            View
          </button>
        </div>
      </div>
    </div>
  )
}
