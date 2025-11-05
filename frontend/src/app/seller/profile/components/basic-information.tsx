"use client";

import Image from "next/image";
import { User } from "lucide-react";

interface SellerData {
  fullName?: string | null;
  storeName?: string | null;
  email?: string;
  mobile?: string | null;
  businessType?: string | null;
  productCategories?: string[] | null;
  businessLogo?: string | null;
}

interface BasicInformationProps {
  sellerData: SellerData;
}

export default function BasicInformation({
  sellerData,
}: BasicInformationProps) {
  return (
    <div className="bg-white border border-stone-200 shadow-sm">
      <div className="p-6 border-b border-stone-200">
        <h2 className="text-xl font-manrope font-medium text-yogreet-charcoal flex items-center">
          <User className="w-5 h-5 mr-2 text-yogreet-sage" />
          Basic Information
        </h2>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Profile Image */}
          <div className="flex flex-col items-center lg:items-start">
            <div className="relative w-20 h-20 bg-stone-200 rounded-full flex items-center justify-center overflow-hidden">
              <Image
                src={sellerData.businessLogo || "/placeholder-logo.png"}
                alt={sellerData.fullName || "Seller"}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Basic Details */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-manrope font-medium text-stone-700 mb-1">
                Full Name *
              </label>
              <p className="text-stone-600 py-2 font-inter">
                {sellerData.fullName || "not provided"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-manrope font-medium text-stone-700 mb-1">
                Store Name *
              </label>
              <p className="text-stone-600 py-2 font-inter">
                {sellerData.storeName || "not provided"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-manrope font-medium text-stone-700 mb-1">
                Email Address *
              </label>
              <p className="text-stone-600 py-2 font-inter">
                {sellerData.email || "not provided"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-manrope font-medium text-stone-700 mb-1">
                Mobile Number *
              </label>
              <p className="text-stone-600 py-2 font-inter">
                {sellerData.mobile || "not provided"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-manrope font-medium text-stone-700 mb-1">
                Business Type *
              </label>
              <p className="text-stone-600 py-2 font-inter">
                {sellerData.businessType || "not provided"}
              </p>
            </div>
          </div>
        </div>

        {/* Product Categories */}
        <div className="pt-6 border-t border-stone-200">
          <label className="block text-sm font-manrope font-medium text-stone-700 mb-3">
            Product Categories
          </label>
          <div className="flex flex-wrap gap-2">
            {(sellerData.productCategories || []).length > 0 ? (
              (sellerData.productCategories || []).map((category, index) => (
                <span
                  key={index}
                  className="bg-yogreet-sage/10 text-yogreet-sage px-3 py-1 rounded-full text-sm font-inter"
                >
                  {category || "not provided"}
                </span>
              ))
            ) : (
              <span className="text-stone-500 italic font-inter">
                No categories specified
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

