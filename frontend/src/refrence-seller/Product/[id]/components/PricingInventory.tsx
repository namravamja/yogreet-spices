import React from "react";
import { DollarSign } from "lucide-react";
import { ProductData } from "./types";

interface PricingInventoryProps {
  product: ProductData;
  editedProduct: ProductData;
  isEditing: boolean;
  handleInputChange: (field: string, value: any) => void;
}

const PricingInventory: React.FC<PricingInventoryProps> = ({
  product,
  editedProduct,
  isEditing,
  handleInputChange,
}) => {
  // Calculate discount percentage
  const calculateDiscount = () => {
    const mrp = Number.parseFloat(product.mrp);
    const sellingPrice = Number.parseFloat(product.sellingPrice);
    return Math.round(((mrp - sellingPrice) / mrp) * 100);
  };

  return (
    <div className="bg-white shadow-sm border border-gray-200 p-4 sm:p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
        <DollarSign className="w-5 h-5 mr-2 text-terracotta-600" />
        Pricing & Inventory
      </h3>
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selling Price
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 text-sm">₹</span>
              </div>
              <input
                type="number"
                min="0"
                step="0.01"
                value={editedProduct.sellingPrice}
                onChange={(e) =>
                  handleInputChange("sellingPrice", e.target.value)
                }
                className="w-full pl-8 pr-4 py-3 border border-gray-300 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              MRP / Original Price
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 text-sm">₹</span>
              </div>
              <input
                type="number"
                min="0"
                step="0.01"
                value={editedProduct.mrp}
                onChange={(e) => handleInputChange("mrp", e.target.value)}
                className="w-full pl-8 pr-4 py-3 border border-gray-300 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SKU Code
            </label>
            <input
              type="text"
              value={editedProduct.skuCode}
              onChange={(e) => handleInputChange("skuCode", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Stock
            </label>
            <input
              type="number"
              min="0"
              value={editedProduct.availableStock}
              onChange={(e) =>
                handleInputChange("availableStock", e.target.value)
              }
              className="w-full px-4 py-3 border border-gray-300 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center py-4 border-b border-gray-100">
            <p className="text-3xl font-bold text-terracotta-700 mb-1">
              ₹{Number.parseFloat(product.sellingPrice).toFixed(2)}
            </p>
            <p className="text-lg text-gray-500 line-through">
              ₹{Number.parseFloat(product.mrp).toFixed(2)}
            </p>
            <p className="text-sm text-green-700 font-medium">
              {calculateDiscount()}% off
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">SKU</span>
              <span className="font-medium text-gray-900">
                {product.skuCode}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Stock</span>
              <span
                className={`font-medium ${
                  Number.parseInt(product.availableStock) < 10
                    ? "text-red-600"
                    : "text-gray-900"
                }`}
              >
                {product.availableStock} units
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingInventory;
