import React from "react";
import { Tag, Calendar } from "lucide-react";
import { ProductData } from "./types";

interface ProductInformationProps {
  product: ProductData;
  editedProduct: ProductData;
  isEditing: boolean;
  handleInputChange: (field: string, value: any) => void;
  categories: string[];
}

const ProductInformation: React.FC<ProductInformationProps> = ({
  product,
  editedProduct,
  isEditing,
  handleInputChange,
  categories,
}) => {
  return (
    <div className="bg-white shadow-sm border border-gray-200 p-4 sm:p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
        <Tag className="w-5 h-5 mr-2 text-terracotta-600" />
        Product Information
      </h3>

      <div className="space-y-6">
        {/* Product Name */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          {isEditing ? (
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name
              </label>
              <input
                type="text"
                value={editedProduct.productName}
                onChange={(e) =>
                  handleInputChange("productName", e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-300 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
              />
            </div>
          ) : (
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-medium text-gray-900 mb-2">
                {product.productName}
              </h2>
            </div>
          )}
        </div>

        {/* Category */}
        {isEditing ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={editedProduct.category}
              onChange={(e) => handleInputChange("category", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
            <span className="flex items-center">
              <Tag className="w-4 h-4 mr-2" />
              {product.category}
            </span>
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Created {new Date(product.createdAt).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* Description */}
        <div>
          {isEditing ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={editedProduct.shortDescription}
                onChange={(e) =>
                  handleInputChange("shortDescription", e.target.value)
                }
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
              />
            </div>
          ) : (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Description
              </h4>
              <p className="text-gray-700 leading-relaxed">
                {product.shortDescription}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductInformation;
