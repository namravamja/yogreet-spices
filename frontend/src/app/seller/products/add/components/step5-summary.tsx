"use client";

import { Check } from "lucide-react";
import Image from "next/image";
import type { ProductData } from "../page";

interface Step5Props {
  productData: ProductData;
}

export default function Step5Summary({ productData }: Step5Props) {
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

              <p className="text-sm text-stone-600 mb-4 font-inter">
                {productData.shortDescription || "Product description"}
              </p>

              <div className="space-y-4">
                <div>
                  <span className="text-stone-500 text-sm font-inter">Category:</span>
                  <span className="ml-2 text-stone-700 text-sm font-inter">
                    {productData.category || "Not specified"}
                    {productData.subCategory && ` → ${productData.subCategory}`}
                  </span>
                </div>

                {productData.typeOfSpice && (
                  <div>
                    <span className="text-stone-500 text-sm font-inter">Type of Spice:</span>
                    <span className="ml-2 text-stone-700 text-sm font-inter">
                      {productData.typeOfSpice}
                    </span>
                  </div>
                )}

                {productData.form && (
                  <div>
                    <span className="text-stone-500 text-sm font-inter">Form:</span>
                    <span className="ml-2 text-stone-700 text-sm font-inter">
                      {productData.form}
                    </span>
                  </div>
                )}

                {/* About Product Fields */}
                {(productData.purityLevel || productData.originSource || productData.processingMethod || productData.shelfLife || productData.manufacturingDate || productData.expiryDate) && (
                  <div className="pt-2 border-t border-stone-200">
                    <h4 className="text-sm font-medium text-stone-900 mb-2 font-manrope">About Product:</h4>
                    <div className="space-y-2">
                      {productData.purityLevel && (
                        <div>
                          <span className="text-stone-500 text-sm font-inter">Purity Level:</span>
                          <span className="ml-2 text-stone-700 text-sm font-inter">
                            {productData.purityLevel}
                          </span>
                        </div>
                      )}
                      {productData.originSource && (
                        <div>
                          <span className="text-stone-500 text-sm font-inter">Origin / Source:</span>
                          <span className="ml-2 text-stone-700 text-sm font-inter">
                            {productData.originSource}
                          </span>
                        </div>
                      )}
                      {productData.processingMethod && (
                        <div>
                          <span className="text-stone-500 text-sm font-inter">Processing Method:</span>
                          <span className="ml-2 text-stone-700 text-sm font-inter">
                            {productData.processingMethod}
                          </span>
                        </div>
                      )}
                      {productData.shelfLife && (
                        <div>
                          <span className="text-stone-500 text-sm font-inter">Shelf Life:</span>
                          <span className="ml-2 text-stone-700 text-sm font-inter">
                            {productData.shelfLife}
                          </span>
                        </div>
                      )}
                      {productData.manufacturingDate && (
                        <div>
                          <span className="text-stone-500 text-sm font-inter">Manufacturing Date:</span>
                          <span className="ml-2 text-stone-700 text-sm font-inter">
                            {new Date(productData.manufacturingDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {productData.expiryDate && (
                        <div>
                          <span className="text-stone-500 text-sm font-inter">Expiry Date:</span>
                          <span className="ml-2 text-stone-700 text-sm font-inter">
                            {new Date(productData.expiryDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Package Pricing */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-stone-900 font-manrope">Package Pricing:</h4>
                  <div className="space-y-3">
                    {productData.samplePrice && productData.sampleWeight && (
                      <div className="border-b border-stone-100 pb-3">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-stone-600 text-sm font-inter font-medium">Order Sample:</span>
                          <span className="text-stone-700 text-sm font-manrope">
                            ₹{productData.samplePrice} ({productData.sampleWeight} kg)
                          </span>
                        </div>
                        {productData.sampleDescription && (
                          <p className="text-stone-500 text-xs font-inter mt-1">
                            {productData.sampleDescription}
                          </p>
                        )}
                      </div>
                    )}
                    {productData.smallPrice && productData.smallWeight && (
                      <div className="border-b border-stone-100 pb-3">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-stone-600 text-sm font-inter font-medium">Small:</span>
                      <span className="text-stone-700 text-sm font-manrope">
                            ₹{productData.smallPrice} ({productData.smallWeight} kg)
                      </span>
                    </div>
                        {productData.smallDescription && (
                          <p className="text-stone-500 text-xs font-inter mt-1">
                            {productData.smallDescription}
                          </p>
                        )}
                      </div>
                    )}
                    {productData.mediumPrice && productData.mediumWeight && (
                      <div className="border-b border-stone-100 pb-3">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-stone-600 text-sm font-inter font-medium">Medium:</span>
                      <span className="text-stone-700 text-sm font-manrope">
                            ₹{productData.mediumPrice} ({productData.mediumWeight} kg)
                      </span>
                    </div>
                        {productData.mediumDescription && (
                          <p className="text-stone-500 text-xs font-inter mt-1">
                            {productData.mediumDescription}
                          </p>
                        )}
                      </div>
                    )}
                    {productData.largePrice && productData.largeWeight && (
                      <div className="border-b border-stone-100 pb-3">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-stone-600 text-sm font-inter font-medium">Large:</span>
                      <span className="text-stone-700 text-sm font-manrope">
                            ₹{productData.largePrice} ({productData.largeWeight} kg)
                      </span>
                    </div>
                        {productData.largeDescription && (
                          <p className="text-stone-500 text-xs font-inter mt-1">
                            {productData.largeDescription}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-stone-500 text-sm font-inter">Shipping Cost:</span>
                  <span className="ml-2 text-stone-700 text-sm font-inter">
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

