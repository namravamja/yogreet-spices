"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

interface BuyBulkModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    name: string;
    price: number;
    minQuantity: number;
    origin: string;
    image: string;
  };
}

export default function BuyBulkModal({ isOpen, onClose, product }: BuyBulkModalProps) {
  const [formData, setFormData] = useState({
    // Weight Selection
    weight: product.minQuantity,
    unit: "kg",
    totalPrice: product.price * product.minQuantity,
    selectedWeightOption: "custom",
  });

  const handleWeightChange = (weight: number) => {
    const totalPrice = weight * product.price;
    setFormData(prev => ({
      ...prev,
      weight,
      totalPrice
    }));
  };

  const handleWeightOptionSelect = (option: string) => {
    let weight = product.minQuantity;
    
    if (option === "10") {
      weight = 10;
    } else if (option === "50") {
      weight = 50;
    } else if (option === "100") {
      weight = 100;
    }
    
    const totalPrice = weight * product.price;
    setFormData(prev => ({
      ...prev,
      selectedWeightOption: option,
      weight,
      totalPrice
    }));
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };


  const handleSubmit = () => {
    // Handle form submission
    console.log("Bulk order submitted:", formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 w-full h-full bg-black/60 backdrop-blur-none flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-yogreet-charcoal">Buy in Bulk</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>


        {/* Content */}
        <div className="p-6">
          {/* Weight Selection */}
          <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-yogreet-charcoal mb-4">Select Order Weight</h3>
                <div className="bg-yogreet-light-gray p-4 rounded-lg mb-4">
                  <div className="flex items-center gap-4">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <h4 className="font-medium text-yogreet-charcoal">{product.name}</h4>
                      <p className="text-sm text-gray-600">Origin: {product.origin}</p>
                      <p className="text-sm text-gray-600">Price: ${product.price}/kg</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-yogreet-charcoal mb-3">
                      Select Weight
                    </label>
                    
                    {/* All Weight Options in One Line */}
                    <div className="flex gap-3 flex-wrap">
                      <button
                        onClick={() => handleWeightOptionSelect("10")}
                        className={`px-4 py-2 border-2 rounded-xs text-center transition-colors cursor-pointer ${
                          formData.selectedWeightOption === "10"
                            ? "border-yogreet-red bg-yogreet-red/10 text-yogreet-red"
                            : "border-gray-300 hover:border-yogreet-red/50"
                        }`}
                      >
                        <div className="font-semibold text-sm">10 kg</div>
                        <div className="text-xs text-gray-600">${(10 * product.price).toFixed(2)}</div>
                      </button>
                      
                      <button
                        onClick={() => handleWeightOptionSelect("50")}
                        className={`px-4 py-2 border-2 rounded-xs text-center transition-colors cursor-pointer ${
                          formData.selectedWeightOption === "50"
                            ? "border-yogreet-red bg-yogreet-red/10 text-yogreet-red"
                            : "border-gray-300 hover:border-yogreet-red/50"
                        }`}
                      >
                        <div className="font-semibold text-sm">50 kg</div>
                        <div className="text-xs text-gray-600">${(50 * product.price).toFixed(2)}</div>
                      </button>
                      
                      <button
                        onClick={() => handleWeightOptionSelect("100")}
                        className={`px-4 py-2 border-2 rounded-xs text-center transition-colors cursor-pointer ${
                          formData.selectedWeightOption === "100"
                            ? "border-yogreet-red bg-yogreet-red/10 text-yogreet-red"
                            : "border-gray-300 hover:border-yogreet-red/50"
                        }`}
                      >
                        <div className="font-semibold text-sm">100 kg</div>
                        <div className="text-xs text-gray-600">${(100 * product.price).toFixed(2)}</div>
                      </button>

                      <button
                        onClick={() => handleWeightOptionSelect("custom")}
                        className={`px-4 py-2 border-2 rounded-xs text-center transition-colors cursor-pointer ${
                          formData.selectedWeightOption === "custom"
                            ? "border-yogreet-red bg-yogreet-red/10 text-yogreet-red"
                            : "border-gray-300 hover:border-yogreet-red/50"
                        }`}
                      >
                        <div className="font-semibold text-sm">Custom</div>
                        <div className="text-xs text-gray-600">Enter quantity</div>
                      </button>
                    </div>

                    {/* Custom Weight Input */}
                    {formData.selectedWeightOption === "custom" && (
                      <div className="mt-4">
                        <input
                          type="number"
                          min={product.minQuantity}
                          value={formData.weight}
                          onChange={(e) => {
                            handleWeightChange(Number(e.target.value));
                            setFormData(prev => ({ ...prev, selectedWeightOption: "custom" }));
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:outline-none focus:border-yogreet-red"
                          placeholder={`Minimum: ${product.minQuantity} kg`}
                        />
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500 mt-2">
                      Minimum order: {product.minQuantity} kg
                    </p>
                  </div>

                  <div className="bg-yogreet-light-gray p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-yogreet-charcoal">Total Price:</span>
                      <span className="text-2xl font-bold text-yogreet-red">
                        ${formData.totalPrice.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {formData.weight} kg × ${product.price}/kg
                    </p>
                  </div>
                </div>
              </div>
            </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end items-center p-6 border-t border-gray-200 gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-yogreet-red text-white hover:bg-yogreet-red/90 transition-colors cursor-pointer"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
