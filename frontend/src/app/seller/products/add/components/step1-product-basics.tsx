"use client";

import type { ProductData } from "../page";

interface Step1Props {
  productData: ProductData;
  handleInputChange: (field: string, value: any) => void;
}

// Category options with sub-categories
const categoryOptions = [
  { value: "Powders", subCategories: ["Turmeric", "Chili Powder", "Coriander", "Cumin", "Garam Masala", "Other"] },
  { value: "Whole Spices", subCategories: ["Cardamom", "Black Pepper", "Cloves", "Cinnamon", "Bay Leaves", "Other"] },
  { value: "Ground Spices", subCategories: ["Turmeric", "Coriander", "Cumin", "Red Chili", "Other"] },
  { value: "Blended Spices", subCategories: ["Garam Masala", "Curry Powder", "Biryani Masala", "Other"] },
  { value: "Other", subCategories: [] },
];

const typeOfSpiceOptions = [
  "Turmeric",
  "Chili Powder",
  "Coriander",
  "Garam Masala",
  "Cumin",
  "Black Pepper",
  "Cardamom",
  "Cloves",
  "Cinnamon",
  "Fenugreek",
  "Mustard Seeds",
  "Fennel Seeds",
  "Other",
];

const formOptions = [
  "Whole",
  "Powder",
  "Ground",
  "Blended",
];

export default function Step1ProductBasics({
  productData,
  handleInputChange,
}: Step1Props) {
  const selectedCategory = categoryOptions.find(cat => cat.value === productData.category);
  const availableSubCategories = selectedCategory?.subCategories || [];

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
            onChange={(e) => {
              handleInputChange("category", e.target.value);
              // Reset sub-category when category changes
              handleInputChange("subCategory", "");
            }}
            className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage font-inter cursor-pointer"
            required
          >
            <option value="" disabled>
              Select category
            </option>
            {categoryOptions.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.value}
              </option>
            ))}
          </select>
        </div>

        {availableSubCategories.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2 font-manrope">
              Sub-category
            </label>
            <select
              value={productData.subCategory}
              onChange={(e) => handleInputChange("subCategory", e.target.value)}
              className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage font-inter cursor-pointer"
            >
              <option value="">Select sub-category (optional)</option>
              {availableSubCategories.map((subCat) => (
                <option key={subCat} value={subCat}>
                  {subCat}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2 font-manrope">
            Type of Spice
          </label>
          <select
            value={productData.typeOfSpice}
            onChange={(e) => handleInputChange("typeOfSpice", e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage font-inter cursor-pointer"
          >
            <option value="">Select type of spice (optional)</option>
            {typeOfSpiceOptions.map((spice) => (
              <option key={spice} value={spice}>
                {spice}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2 font-manrope">
            Form
          </label>
          <select
            value={productData.form}
            onChange={(e) => handleInputChange("form", e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage font-inter cursor-pointer"
          >
            <option value="">Select form (optional)</option>
            {formOptions.map((form) => (
              <option key={form} value={form}>
                {form}
              </option>
            ))}
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
