import React from "react";
import { Truck } from "lucide-react";
import { ProductData } from "./types";

interface ShippingInformationProps {
  product: ProductData;
  editedProduct: ProductData;
  isEditing: boolean;
  handleInputChange: (field: string, value: any) => void;
}

const ShippingInformation: React.FC<ShippingInformationProps> = ({
  product,
  editedProduct,
  isEditing,
  handleInputChange,
}) => {
  return (
    <div className="bg-white shadow-sm border border-gray-200 p-4 sm:p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
        <Truck className="w-5 h-5 mr-2 text-terracotta-600" />
        Shipping
      </h3>
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weight (kg)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={editedProduct.weight}
              onChange={(e) => handleInputChange("weight", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dimensions (cm)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                min="0"
                step="0.1"
                value={editedProduct.length}
                onChange={(e) => handleInputChange("length", e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                placeholder="L"
              />
              <input
                type="number"
                min="0"
                step="0.1"
                value={editedProduct.width}
                onChange={(e) => handleInputChange("width", e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                placeholder="W"
              />
              <input
                type="number"
                min="0"
                step="0.1"
                value={editedProduct.height}
                onChange={(e) => handleInputChange("height", e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                placeholder="H"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shipping Cost
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 text-sm">₹</span>
              </div>
              <input
                type="number"
                min="0"
                step="0.01"
                value={editedProduct.shippingCost}
                onChange={(e) =>
                  handleInputChange("shippingCost", e.target.value)
                }
                className="w-full pl-8 pr-4 py-3 border border-gray-300 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Time
            </label>
            <input
              type="text"
              value={editedProduct.deliveryTimeEstimate}
              onChange={(e) =>
                handleInputChange("deliveryTimeEstimate", e.target.value)
              }
              className="w-full px-4 py-3 border border-gray-300 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
              placeholder="e.g., 3-5 business days"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Weight</span>
            <span className="font-medium text-gray-900">
              {product.weight} kg
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Dimensions</span>
            <span className="font-medium text-gray-900">
              {product.length} × {product.width} × {product.height} cm
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Shipping Cost</span>
            <span className="font-medium text-gray-900">
              ₹{Number.parseFloat(product.shippingCost).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Delivery</span>
            <span className="font-medium text-gray-900">
              {product.deliveryTimeEstimate}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShippingInformation;
