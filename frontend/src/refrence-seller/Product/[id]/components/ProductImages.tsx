import React from "react";
import { Package, Upload, X } from "lucide-react";
import { ProductData } from "./types";

interface ProductImagesProps {
  product: ProductData;
  editedProduct: ProductData;
  isEditing: boolean;
  selectedImageIndex: number;
  setSelectedImageIndex: (index: number) => void;
  previewImages: string[];
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
}

const ProductImages: React.FC<ProductImagesProps> = ({
  product,
  isEditing,
  selectedImageIndex,
  setSelectedImageIndex,
  previewImages,
  handleImageUpload,
  removeImage,
}) => {
  return (
    <div className="bg-white shadow-sm border border-gray-200 p-4 sm:p-6 h-full">
      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
        <Package className="w-5 h-5 mr-2 text-terracotta-600" />
        Product Images
      </h3>

      {isEditing ? (
        <div className="space-y-4">
          <div className="aspect-square relative bg-gray-100 overflow-hidden">
            {previewImages.length > 0 ? (
              <img
                src={previewImages[selectedImageIndex] || "/Profile.jpg"}
                alt="Product preview"
                className="object-contain w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Package className="w-16 h-16 mx-auto mb-2" />
                  <p>No image</p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-4 gap-2">
            {previewImages.map((image, index) => (
              <div key={index} className="relative group">
                <button
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-square relative bg-gray-100 overflow-hidden border-2 transition-colors w-full ${
                    selectedImageIndex === index
                      ? "border-terracotta-500"
                      : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <img
                    src={image || "/Profile.jpg"}
                    alt={`Product image ${index + 1}`}
                    className="object-cover w-full h-full"
                  />
                </button>
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            <div className="aspect-square w-full border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-terracotta-400 transition-colors">
              <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                <Upload className="w-6 h-6 text-gray-400 mb-1" />
                <span className="text-xs text-gray-600 text-center">Add</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="aspect-square relative bg-gray-100 overflow-hidden">
            <img
              src={
                product.productImages[selectedImageIndex] || "/Profile.jpg"
              }
              alt="Product"
              className="object-contain w-full h-full"
            />
          </div>

          {product.productImages.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-square relative bg-gray-100 overflow-hidden border-2 transition-colors ${
                    selectedImageIndex === index
                      ? "border-terracotta-500"
                      : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <img
                    src={image || "/Profile.jpg"}
                    alt={`Product image ${index + 1}`}
                    className="object-cover w-full h-full"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductImages;
