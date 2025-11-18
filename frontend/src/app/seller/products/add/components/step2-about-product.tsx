"use client";

import type { ProductData } from "../page";

interface Step2Props {
  productData: ProductData;
  handleInputChange: (field: string, value: any) => void;
}

const purityLevelOptions = [
  "100% pure, no added color",
  "100% pure",
  "Organic certified",
  "Premium grade",
  "Standard grade",
  "Other",
];

const processingMethodOptions = [
  "Sun-dried",
  "Cold-ground",
  "Hand-pounded",
  "Machine-ground",
  "Air-dried",
  "Roasted",
  "Other",
];

export default function Step2AboutProduct({
  productData,
  handleInputChange,
}: Step2Props) {
  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-light text-stone-900 mb-4 sm:mb-6 font-poppins">
        About Product
      </h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2 font-manrope">
            Purity Level
          </label>
          <select
            value={productData.purityLevel}
            onChange={(e) => handleInputChange("purityLevel", e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage font-inter cursor-pointer"
          >
            <option value="">Select purity level (optional)</option>
            {purityLevelOptions.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2 font-manrope">
            Origin / Source
          </label>
          <input
            type="text"
            value={productData.originSource}
            onChange={(e) => handleInputChange("originSource", e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage font-inter"
            placeholder="e.g., Kerala pepper, Rajasthan red chili"
          />
          <p className="mt-1 text-xs text-stone-500 font-inter">
            Specify the region or source of the spice
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2 font-manrope">
            Processing Method
          </label>
          <select
            value={productData.processingMethod}
            onChange={(e) => handleInputChange("processingMethod", e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage font-inter cursor-pointer"
          >
            <option value="">Select processing method (optional)</option>
            {processingMethodOptions.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2 font-manrope">
            Shelf Life
          </label>
          <input
            type="text"
            value={productData.shelfLife}
            onChange={(e) => handleInputChange("shelfLife", e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage font-inter"
            placeholder="e.g., 12 months, 18 months"
          />
          <p className="mt-1 text-xs text-stone-500 font-inter">
            Enter the shelf life duration
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2 font-manrope">
              Manufacturing Date (MFD)
            </label>
            <input
              type="date"
              value={productData.manufacturingDate}
              onChange={(e) => handleInputChange("manufacturingDate", e.target.value)}
              className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage font-inter"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2 font-manrope">
              Expiry Date / Best Before
            </label>
            <input
              type="date"
              value={productData.expiryDate}
              onChange={(e) => handleInputChange("expiryDate", e.target.value)}
              className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage font-inter"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

