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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2 font-manrope">
              Selling Price <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-stone-500 text-sm font-inter">₹</span>
              </div>
              <input
                type="number"
                min="0"
                step="0.01"
                value={productData.sellingPrice}
                onChange={(e) =>
                  handleInputChange("sellingPrice", e.target.value)
                }
                className="w-full pl-7 pr-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage font-inter"
                required
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2 font-manrope">
              MRP / Original Price <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-stone-500 text-sm font-inter">₹</span>
              </div>
              <input
                type="number"
                min="0"
                step="0.01"
                value={productData.mrp}
                onChange={(e) => handleInputChange("mrp", e.target.value)}
                className="w-full pl-7 pr-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage font-inter"
                required
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2 font-manrope">
              Available Stock <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={productData.availableStock}
              onChange={(e) =>
                handleInputChange("availableStock", e.target.value)
              }
              className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage font-inter"
              required
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2 font-manrope">
              SKU Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={productData.skuCode}
              onChange={(e) => handleInputChange("skuCode", e.target.value)}
              className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage font-inter"
              placeholder="e.g., PROD-12345"
              required
            />
            <p className="mt-1 text-xs text-stone-500 font-inter">
              Unique identifier for your product
            </p>
          </div>
        </div>

        <div className="bg-stone-50 p-4 sm:p-6 rounded-md">
          <h3 className="text-base font-medium text-stone-900 mb-3 font-manrope">
            Pricing Information
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-stone-600 font-inter">Selling Price:</span>
              <span className="text-sm font-medium font-manrope">
                ₹{productData.sellingPrice || "0.00"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-stone-600 font-inter">MRP:</span>
              <span className="text-sm font-medium font-manrope">
                ₹{productData.mrp || "0.00"}
              </span>
            </div>

            <div className="flex justify-between border-t border-stone-200 pt-3">
              <span className="text-sm text-stone-600 font-inter">Discount:</span>
              <span className="text-sm font-medium text-green-600 font-manrope">
                {productData.sellingPrice && productData.mrp
                  ? `${Math.round(
                      ((Number(productData.mrp) -
                        Number(productData.sellingPrice)) /
                        Number(productData.mrp)) *
                        100
                    )}%`
                  : "0%"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

