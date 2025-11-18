"use client";

import type { ProductData } from "../page";

interface Step2Props {
  productData: ProductData;
  handleInputChange: (field: string, value: any) => void;
}

export default function Step2PriceInventory({
  productData,
  handleInputChange,
}: Step2Props) {
  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-light text-stone-900 mb-4 sm:mb-6 font-poppins">
        Price & Inventory
      </h2>

      <div className="space-y-6">
        {/* Small Package */}
        <div className="border border-stone-200 rounded-md p-4 sm:p-6">
          <h3 className="text-base font-medium text-stone-900 mb-4 font-manrope">
            Small Package
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2 font-manrope">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-stone-500 text-sm font-inter">₹</span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={productData.smallPrice || ""}
                  onChange={(e) =>
                    handleInputChange("smallPrice", e.target.value)
                  }
                  className="w-full pl-7 pr-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage font-inter"
                  required
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2 font-manrope">
                Weight (kg) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={productData.smallWeight || ""}
                  onChange={(e) =>
                    handleInputChange("smallWeight", e.target.value)
                  }
                  className="w-full px-4 py-3 pr-12 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage font-inter"
                  required
                  placeholder="0.00"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-stone-500 text-sm font-inter">kg</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Medium Package */}
        <div className="border border-stone-200 rounded-md p-4 sm:p-6">
          <h3 className="text-base font-medium text-stone-900 mb-4 font-manrope">
            Medium Package
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2 font-manrope">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-stone-500 text-sm font-inter">₹</span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={productData.mediumPrice || ""}
                  onChange={(e) =>
                    handleInputChange("mediumPrice", e.target.value)
                  }
                  className="w-full pl-7 pr-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage font-inter"
                  required
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2 font-manrope">
                Weight (kg) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={productData.mediumWeight || ""}
                  onChange={(e) =>
                    handleInputChange("mediumWeight", e.target.value)
                  }
                  className="w-full px-4 py-3 pr-12 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage font-inter"
                  required
                  placeholder="0.00"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-stone-500 text-sm font-inter">kg</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Large Package */}
        <div className="border border-stone-200 rounded-md p-4 sm:p-6">
          <h3 className="text-base font-medium text-stone-900 mb-4 font-manrope">
            Large Package
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2 font-manrope">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-stone-500 text-sm font-inter">₹</span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={productData.largePrice || ""}
                  onChange={(e) =>
                    handleInputChange("largePrice", e.target.value)
                  }
                  className="w-full pl-7 pr-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage font-inter"
                  required
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2 font-manrope">
                Weight (kg) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={productData.largeWeight || ""}
                  onChange={(e) =>
                    handleInputChange("largeWeight", e.target.value)
                  }
                  className="w-full px-4 py-3 pr-12 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage font-inter"
                  required
                  placeholder="0.00"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-stone-500 text-sm font-inter">kg</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Cost */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2 font-manrope">
              Shipping Cost (₹) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-stone-500 text-sm font-inter">₹</span>
              </div>
              <input
                type="number"
                min="0"
                step="0.01"
                value={productData.shippingCost}
                onChange={(e) =>
                  handleInputChange("shippingCost", e.target.value)
                }
                className="w-full pl-7 pr-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage font-inter"
                required
                placeholder="0.00"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

