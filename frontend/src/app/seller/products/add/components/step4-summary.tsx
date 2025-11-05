"use client";

import { Check } from "lucide-react";
import Image from "next/image";
import type { ProductData } from "../page";

interface Step4Props {
  productData: ProductData;
}

export default function Step4Summary({ productData }: Step4Props) {
  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-light text-stone-900 mb-4 sm:mb-6 font-poppins">
        Product Summary
      </h2>

      <div className="space-y-6">
        {/* Product Preview */}
        <div className="bg-white border border-stone-200 rounded-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Product Image */}
            <div className="p-4 flex justify-center items-center bg-stone-50">
              {productData.productImages.length > 0 ? (
                <div className="relative aspect-square w-full max-w-[240px]">
                  <Image
                    src={productData.productImages[0] || "/placeholder.jpg"}
                    alt={productData.productName}
                    width={240}
                    height={240}
                    className="object-contain w-full h-full"
                  />
                </div>
              ) : (
                <div className="aspect-square w-full max-w-[240px] bg-stone-100 flex items-center justify-center text-stone-400 font-inter">
                  No image
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="md:col-span-2 p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-medium text-stone-900 mb-2 font-manrope">
                {productData.productName || "Product Name"}
              </h3>

              <div className="flex items-baseline mb-4">
                <span className="text-xl font-bold text-yogreet-sage mr-2 font-poppins">
                  ₹{productData.sellingPrice || "0.00"}
                </span>
                {Number(productData.mrp) > Number(productData.sellingPrice) && (
                  <>
                    <span className="text-sm text-stone-500 line-through mr-2 font-inter">
                      ₹{productData.mrp}
                    </span>
                    <span className="text-sm text-green-600 font-inter">
                      {Math.round(
                        ((Number(productData.mrp) -
                          Number(productData.sellingPrice)) /
                          Number(productData.mrp)) *
                          100
                      )}
                      % off
                    </span>
                  </>
                )}
              </div>

              <p className="text-sm text-stone-600 mb-4 font-inter">
                {productData.shortDescription || "Product description"}
              </p>

              <div className="grid grid-cols-2 gap-4 text-sm font-inter">
                <div>
                  <span className="text-stone-500">Category:</span>
                  <span className="ml-2 text-stone-700">
                    {productData.category || "Not specified"}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500">SKU:</span>
                  <span className="ml-2 text-stone-700">
                    {productData.skuCode || "Not specified"}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500">Stock:</span>
                  <span className="ml-2 text-stone-700">
                    {productData.availableStock || "0"} units
                  </span>
                </div>
                <div>
                  <span className="text-stone-500">Delivery:</span>
                  <span className="ml-2 text-stone-700">
                    {productData.deliveryTimeEstimate || "Not specified"}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500">Weight:</span>
                  <span className="ml-2 text-stone-700">
                    {productData.weight || "0"} kg
                  </span>
                </div>
                <div>
                  <span className="text-stone-500">Dimensions:</span>
                  <span className="ml-2 text-stone-700">
                    {productData.length || "0"} × {productData.width || "0"} ×{" "}
                    {productData.height || "0"} cm
                  </span>
                </div>
                <div>
                  <span className="text-stone-500">Shipping Cost:</span>
                  <span className="ml-2 text-stone-700">
                    ₹{productData.shippingCost || "0.00"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Images */}
        {productData.productImages.length > 1 && (
          <div>
            <h3 className="text-base font-medium text-stone-900 mb-3 font-manrope">
              Additional Images
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {productData.productImages.slice(1).map((image, index) => (
                <div
                  key={index}
                  className="aspect-square border border-stone-200 rounded-md overflow-hidden"
                >
                  <Image
                    src={image || "/placeholder.jpg"}
                    alt={`Product image ${index + 2}`}
                    width={100}
                    height={100}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Confirmation Message */}
        <div className="mt-6 p-4 bg-yogreet-sage/10 border border-yogreet-sage/20 rounded-md">
          <div className="flex items-center">
            <Check className="w-5 h-5 text-yogreet-sage mr-2" />
            <p className="text-sm text-yogreet-charcoal font-inter">
              Your product is ready to be published. Please review all
              information for accuracy before proceeding.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

