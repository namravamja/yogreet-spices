"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { useRequestSampleMutation } from "@/services/api/buyerApi";
import toast from "react-hot-toast";

interface RequestSampleModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    price: number;
    minQuantity: number;
    origin: string;
    image: string;
  };
}

export default function RequestSampleModal({ isOpen, onClose, product }: RequestSampleModalProps) {
  const [requestSample, { isLoading }] = useRequestSampleMutation();
  const [formData, setFormData] = useState({
    // Sample Weight Selection (in grams)
    weight: 50,
    purpose: "",
    message: "",
    selectedWeightOption: "50",
  });

  const handleWeightChange = (weight: number) => {
    setFormData(prev => ({
      ...prev,
      weight
    }));
  };

  const handleWeightOptionSelect = (option: string) => {
    let weight = 50;
    
    if (option === "50") {
      weight = 50;
    } else if (option === "100") {
      weight = 100;
    } else if (option === "250") {
      weight = 250;
    }
    
    setFormData(prev => ({
      ...prev,
      selectedWeightOption: option,
      weight
    }));
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.purpose) {
      toast.error("Please select a purpose for the sample request");
      return;
    }

    try {
      await requestSample({
        productId: product.id,
        quantity: formData.weight,
        purpose: formData.purpose,
        notes: formData.message || undefined,
      }).unwrap();
      
      toast.success("Sample request submitted successfully! You will be notified once it's processed.");
      onClose();
      // Reset form
      setFormData({
        weight: 50,
        purpose: "",
        message: "",
        selectedWeightOption: "50",
      });
    } catch (error: any) {
      const errorMessage = error?.data?.error || error?.message || "Failed to submit sample request";
      toast.error(errorMessage);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 w-full h-full bg-black/60 backdrop-blur-none flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-yogreet-charcoal">Request Sample</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-yogreet-charcoal mb-4">Product Information</h3>
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

              <div className="space-y-3">
                {/* Sample Weight Selection */}
                <div>
                  <label className="block text-sm font-medium text-yogreet-charcoal mb-3">
                    Sample Weight
                  </label>
                  
                  {/* Weight Options in One Line */}
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => handleWeightOptionSelect("50")}
                      className={`px-3 py-1 border-2 rounded-xs text-center transition-colors cursor-pointer ${
                        formData.selectedWeightOption === "50"
                          ? "border-yogreet-sage bg-yogreet-sage/10 text-yogreet-sage"
                          : "border-gray-300 hover:border-yogreet-sage/50"
                      }`}
                    >
                      <div className="font-semibold text-sm">50 g</div>
                    </button>
                    
                    <button
                      onClick={() => handleWeightOptionSelect("100")}
                      className={`px-3 py-1 border-2 rounded-xs text-center transition-colors cursor-pointer ${
                        formData.selectedWeightOption === "100"
                          ? "border-yogreet-sage bg-yogreet-sage/10 text-yogreet-sage"
                          : "border-gray-300 hover:border-yogreet-sage/50"
                      }`}
                    >
                      <div className="font-semibold text-sm">100 g</div>
                    </button>
                    
                    <button
                      onClick={() => handleWeightOptionSelect("250")}
                      className={`px-3 py-1 border-2 rounded-xs text-center transition-colors cursor-pointer ${
                        formData.selectedWeightOption === "250"
                          ? "border-yogreet-sage bg-yogreet-sage/10 text-yogreet-sage"
                          : "border-gray-300 hover:border-yogreet-sage/50"
                      }`}
                    >
                      <div className="font-semibold text-sm">250 g</div>
                    </button>

                    <button
                      onClick={() => handleWeightOptionSelect("custom")}
                      className={`px-3 py-1 border-2 rounded-xs text-center transition-colors cursor-pointer ${
                        formData.selectedWeightOption === "custom"
                          ? "border-yogreet-sage bg-yogreet-sage/10 text-yogreet-sage"
                          : "border-gray-300 hover:border-yogreet-sage/50"
                      }`}
                    >
                      <div className="font-semibold text-sm">Custom</div>
                      <div className="text-xs text-gray-600">Max 500g</div>
                    </button>
                  </div>

                  {/* Custom Weight Input */}
                  {formData.selectedWeightOption === "custom" && (
                    <div className="mt-4">
                      <input
                        type="number"
                        min={50}
                        max={500}
                        step="10"
                        value={formData.weight}
                        onChange={(e) => {
                          const weight = Math.min(500, Math.max(50, Number(e.target.value) || 50));
                          handleWeightChange(weight);
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:outline-none focus:border-yogreet-sage"
                        placeholder="Enter weight (50-500 g)"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Maximum sample weight: 500 g
                      </p>
                    </div>
                  )}
                </div>

                {/* Purpose Selection */}
                <div>
                  <label className="block text-sm font-medium text-yogreet-charcoal mb-2">
                    Purpose of Sample
                  </label>
                  <select
                    value={formData.purpose}
                    onChange={(e) => handleInputChange("purpose", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:outline-none focus:border-yogreet-sage"
                  >
                    <option value="">Select purpose...</option>
                    <option value="quality-check">Quality Check</option>
                    <option value="testing">Product Testing</option>
                    <option value="evaluation">Evaluation</option>
                    <option value="trial">Trial Order</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Message/Notes */}
                <div>
                  <label className="block text-sm font-medium text-yogreet-charcoal mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:outline-none focus:border-yogreet-sage resize-none"
                    placeholder="Add any specific requirements or notes..."
                  />
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Sample requests are subject to approval. You will be notified via email once your request is processed.
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
            className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer rounded-xs"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!formData.purpose || isLoading}
            className="px-6 py-2 bg-yogreet-sage text-white hover:bg-yogreet-sage/90 transition-colors cursor-pointer rounded-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </div>
    </div>
  );
}

