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
  const [barcodeLoading, setBarcodeLoading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputEl = e.currentTarget;
    const files = inputEl.files;
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

      if (inputEl) inputEl.value = "";
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
      {/* Product Images */}
      <div>
        <h3 className="text-sm font-medium text-yogreet-charcoal mb-2">Product Images</h3>
        <label
          htmlFor="productImages"
          className={`inline-flex items-center gap-2 cursor-pointer rounded-xs border border-dashed border-stone-400 p-4 text-stone-600 hover:border-yogreet-sage hover:text-yogreet-sage transition-colors font-inter ${
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

      {/* Barcode Image */}
      <div>
        <h3 className="text-sm font-medium text-yogreet-charcoal mb-2">Product Barcode (Admin-only)</h3>
        <label
          htmlFor="barcodeImage"
          className={`inline-flex items-center gap-2 cursor-pointer rounded-xs border border-dashed border-stone-400 p-4 text-stone-600 hover:border-yogreet-sage hover:text-yogreet-sage transition-colors font-inter ${
            barcodeLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <Upload className="w-6 h-6" />
          <span>{barcodeLoading ? "Uploading..." : "Upload product barcode (admin-only)"}</span>
          <input
            id="barcodeImage"
            type="file"
            accept="image/*"
            disabled={barcodeLoading}
            onChange={async (e) => {
              const inputEl = e.currentTarget;
              const file = inputEl.files?.[0];
              if (!file) return;
              setBarcodeLoading(true);
              try {
                const base64 = await new Promise<string>((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    if (typeof reader.result === "string") resolve(reader.result);
                    else reject(new Error("File reading error"));
                  };
                  reader.onerror = () => reject(new Error("File reading failed"));
                  reader.readAsDataURL(file);
                });
                handleInputChange("barcodeImage", base64);
                if (inputEl) inputEl.value = "";
              } catch (err) {
                console.error("Barcode upload error:", err);
              } finally {
                setBarcodeLoading(false);
              }
            }}
            className="hidden"
          />
        </label>
        {productData.barcodeImage ? (
          <div className="mt-3 relative w-40 h-40 border border-stone-300 rounded-xs overflow-hidden bg-white">
            <Image
              src={productData.barcodeImage}
              alt="Product barcode"
              fill
              className="object-contain p-1"
              sizes="160px"
              unoptimized
            />
            <button
              type="button"
              aria-label="Remove barcode"
              onClick={() => handleInputChange("barcodeImage", "")}
              className="absolute top-1 right-1 bg-white rounded-full p-1 text-stone-600 hover:text-red-600 shadow-sm transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <p className="text-xs mt-1 text-stone-500 font-inter">
            Required: clear photo of the product barcode. Visible only to admin.
          </p>
        )}
      </div>

      {/* Image Previews */}
      {productData.productImages.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
          {productData.productImages.map((imgSrc, index) => (
            <div
              key={`${imgSrc}-${index}`}
              className="relative aspect-square rounded-xs overflow-hidden border border-stone-300 bg-white"
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
    </div>
  );
}
