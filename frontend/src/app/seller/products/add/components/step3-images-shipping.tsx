"use client";

import { useState } from "react";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import type { ProductData } from "../page";

interface Step3Props {
  productData: ProductData;
  handleInputChange: (field: keyof ProductData, value: any) => void;
}

export default function Step3ImagesShipping({
  productData,
  handleInputChange,
}: Step3Props) {
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);

    try {
      const filesArray = Array.from(files);
      const base64Images: string[] = [];

      for (const file of filesArray) {
        if (productData.productImages.length + base64Images.length >= 10) break;

        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === "string") resolve(reader.result);
            else reject(new Error("File reading error"));
          };
          reader.onerror = () => reject(new Error("File reading failed"));
          reader.readAsDataURL(file);
        });

        base64Images.push(base64);
      }

      const updatedImages = [...productData.productImages, ...base64Images];
      handleInputChange("productImages", updatedImages);

      e.target.value = "";
    } catch (err) {
      console.error("Image upload error:", err);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    const updated = productData.productImages.filter((_, i) => i !== index);
    handleInputChange("productImages", updated);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Upload Button */}
      <div>
        <label
          htmlFor="productImages"
          className={`inline-flex items-center gap-2 cursor-pointer rounded-md border border-dashed border-stone-400 p-4 text-stone-600 hover:border-yogreet-sage hover:text-yogreet-sage transition-colors font-inter ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <Upload className="w-6 h-6" />
          <span>{loading ? "Uploading..." : "Upload product images"}</span>
          <input
            id="productImages"
            type="file"
            accept="image/*"
            multiple
            disabled={loading || productData.productImages.length >= 10}
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>
        <p className="text-xs mt-1 text-stone-500 font-inter">
          You can upload up to 10 images. Currently:{" "}
          {productData.productImages.length}/10
        </p>
      </div>

      {/* Image Previews */}
      {productData.productImages.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
          {productData.productImages.map((imgSrc, index) => (
            <div
              key={`${imgSrc}-${index}`}
              className="relative aspect-square rounded-md overflow-hidden border border-stone-300"
            >
              <Image
                src={imgSrc}
                alt={`Product Image ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 20vw"
                unoptimized
              />
              <button
                type="button"
                aria-label="Remove image"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-1 right-1 bg-white rounded-full p-1 text-stone-600 hover:text-red-600 shadow-sm transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Shipping Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2 font-manrope">
            Weight (kg) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            value={productData.weight}
            onChange={(e) => handleInputChange("weight", e.target.value)}
            placeholder="0.00"
            className="w-full border border-stone-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-yogreet-sage focus:outline-none focus:border-yogreet-sage font-inter"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2 font-manrope">
            Dimensions (L × W × H) cm <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.1"
              value={productData.length}
              onChange={(e) => handleInputChange("length", e.target.value)}
              placeholder="Length"
              className="border border-stone-300 rounded-md px-3 py-2 w-full focus:ring-1 focus:ring-yogreet-sage focus:outline-none focus:border-yogreet-sage font-inter"
              required
            />
            <input
              type="number"
              step="0.1"
              value={productData.width}
              onChange={(e) => handleInputChange("width", e.target.value)}
              placeholder="Width"
              className="border border-stone-300 rounded-md px-3 py-2 w-full focus:ring-1 focus:ring-yogreet-sage focus:outline-none focus:border-yogreet-sage font-inter"
              required
            />
            <input
              type="number"
              step="0.1"
              value={productData.height}
              onChange={(e) => handleInputChange("height", e.target.value)}
              placeholder="Height"
              className="border border-stone-300 rounded-md px-3 py-2 w-full focus:ring-1 focus:ring-yogreet-sage focus:outline-none focus:border-yogreet-sage font-inter"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2 font-manrope">
            Shipping Cost (₹) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            value={productData.shippingCost}
            onChange={(e) => handleInputChange("shippingCost", e.target.value)}
            placeholder="0.00"
            className="w-full border border-stone-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-yogreet-sage focus:outline-none focus:border-yogreet-sage font-inter"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2 font-manrope">
            Delivery Time Estimate <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={productData.deliveryTimeEstimate}
            onChange={(e) =>
              handleInputChange("deliveryTimeEstimate", e.target.value)
            }
            placeholder="e.g. 3-5 business days"
            className="w-full border border-stone-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-yogreet-sage focus:outline-none focus:border-yogreet-sage font-inter"
            required
          />
        </div>
      </div>
    </div>
  );
}

