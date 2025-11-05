"use client";

import type { ProductData } from "../page";

interface Step1Props {
  productData: ProductData;
  handleInputChange: (field: string, value: any) => void;
}

export default function Step1ProductBasics({
  productData,
  handleInputChange,
}: Step1Props) {
  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-light text-stone-900 mb-4 sm:mb-6 font-poppins">
        Product Basics
      </h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2 font-manrope">
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={productData.productName}
            onChange={(e) => handleInputChange("productName", e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage font-inter"
            required
            placeholder="Enter product name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2 font-manrope">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            value={productData.category}
            onChange={(e) => handleInputChange("category", e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage font-inter cursor-pointer"
            required
          >
            <option value="" disabled>
              Select category
            </option>
            <option value="Turmeric">Turmeric</option>
            <option value="Cardamom">Cardamom</option>
            <option value="Black Pepper">Black Pepper</option>
            <option value="Cumin">Cumin</option>
            <option value="Coriander">Coriander</option>
            <option value="Red Chili Powder">Red Chili Powder</option>
            <option value="Fenugreek">Fenugreek</option>
            <option value="Cloves">Cloves</option>
            <option value="Cinnamon">Cinnamon</option>
            <option value="Nutmeg">Nutmeg</option>
            <option value="Bay Leaves">Bay Leaves</option>
            <option value="Star Anise">Star Anise</option>
            <option value="Spice Blends">Spice Blends</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2 font-manrope">
            Short Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={productData.shortDescription}
            onChange={(e) =>
              handleInputChange("shortDescription", e.target.value)
            }
            rows={4}
            className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage font-inter"
            required
            placeholder="Describe your product..."
          />
          <p className="mt-1 text-xs text-stone-500 font-inter">
            Brief description of your product (100-150 characters recommended)
          </p>
        </div>
      </div>
    </div>
  );
}

