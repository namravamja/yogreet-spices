"use client";

import { useRef, useState, useEffect } from "react";
import { Upload, X } from "lucide-react";
import Image from "next/image";

interface SellerProfileDataStep1 {
  fullName: string;
  companyName: string; // Merged from storeName and companyName
  email: string;
  mobile: string;
  businessType: string;
  productCategories: string[];
  businessLogo?: string;
}

interface Step1Props {
  data: SellerProfileDataStep1 & Record<string, any>;
  updateData: (updates: Partial<SellerProfileDataStep1>) => void;
  setUploadedFiles: (
    files:
      | Record<string, File | File[]>
      | ((prev: Record<string, File | File[]>) => Record<string, File | File[]>)
  ) => void;
  isLoading?: boolean;
}

const PRODUCT_CATEGORIES = [
  "Turmeric",
  "Cardamom",
  "Black Pepper",
  "Red Chili",
  "Coriander",
  "Cumin",
  "Fenugreek",
  "Cloves",
  "Asafoetida",
  "Bay Leaves",
  "Fennel",
  "Mustard Seeds",
  "Curry Leaves",
  "Tamarind",
  "Ginger",
  "Garlic",
];

export default function Step1BasicInformation({ data, updateData, setUploadedFiles }: Step1Props) {
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [localFiles, setLocalFiles] = useState<Record<string, File | null>>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleChange = (field: keyof SellerProfileDataStep1, value: any) => {
    updateData({ [field]: value } as Partial<SellerProfileDataStep1>);
  };

  const handleCategoryToggle = (category: string) => {
    const currentCategories = data.productCategories || [];
    const updatedCategories = currentCategories.includes(category)
      ? currentCategories.filter((c) => c !== category)
      : [...currentCategories, category];
    updateData({ productCategories: updatedCategories });
  };

  // Generate preview URL for uploaded file
  useEffect(() => {
    const file = localFiles["businessLogo"];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [localFiles]);

  // Set preview from existing logo URL if no new file is uploaded
  useEffect(() => {
    if (!localFiles["businessLogo"] && data.businessLogo) {
      setPreviewUrl(data.businessLogo);
    }
  }, [data.businessLogo, localFiles]);

  const renderLogoUpload = () => {
    const file = localFiles["businessLogo"] || null;
    const hasExistingLogo = data.businessLogo && !file;
    
    return (
      <div>
        <label className="block text-sm font-manrope font-medium text-stone-700 mb-2">
          Business Logo
        </label>
        <input
          ref={(el) => {
            inputRefs.current["businessLogo"] = el;
          }}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0] || null;
            setLocalFiles((prev) => ({ ...prev, businessLogo: f }));
            if (f) setUploadedFiles((prev) => ({ ...(typeof prev === "function" ? {} : prev), businessLogo: f } as any));
          }}
        />
        
        {!previewUrl && !file && !hasExistingLogo ? (
          <div
            onClick={() => inputRefs.current["businessLogo"]?.click()}
            className="mt-1 flex items-center justify-center px-6 py-12 border-2 border-dashed border-stone-300 rounded-md hover:border-yogreet-sage/50 transition-colors cursor-pointer"
          >
            <div className="space-y-1 text-center flex flex-col items-center">
              <Upload className="w-8 h-8 text-yogreet-sage mb-2" />
              <div className="text-sm text-stone-600">
                <span className="font-medium text-yogreet-sage">Click to upload</span> or drag and drop
              </div>
              <p className="text-xs text-stone-500">JPG, PNG up to 10MB</p>
            </div>
          </div>
        ) : (
          <div className="mt-1 relative">
            <div className="border-2 border-stone-300 rounded-md p-4 bg-stone-50">
              <div className="flex items-start gap-4">
                {/* Logo Preview */}
                {previewUrl && (
                  <div className="relative w-24 h-24 shrink-0 border border-stone-300 rounded-md overflow-hidden bg-white">
                    <Image
                      src={previewUrl}
                      alt="Business Logo"
                      fill
                      className="object-contain"
                      unoptimized={previewUrl.startsWith('blob:') || previewUrl.startsWith('data:')}
                    />
                  </div>
                )}
                
                {/* File Info */}
                <div className="flex-1 min-w-0">
                  {file ? (
                    <>
                      <p className="text-sm font-medium text-stone-700 truncate">{file.name}</p>
                      <p className="text-xs text-stone-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                    </>
                  ) : hasExistingLogo ? (
                    <>
                      <p className="text-sm font-medium text-stone-700">Current Logo</p>
                      <p className="text-xs text-stone-500 mt-1">Click upload area to change</p>
                    </>
                  ) : null}
                </div>
                
                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => inputRefs.current["businessLogo"]?.click()}
                    className="px-3 py-1.5 text-sm border border-yogreet-sage text-yogreet-sage rounded-md hover:bg-yogreet-sage/10 transition-colors cursor-pointer"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors cursor-pointer flex items-center gap-1"
                    onClick={() => {
                      setLocalFiles((prev) => ({ ...prev, businessLogo: null }));
                      setUploadedFiles((prev) => {
                        const next = typeof prev === "function" ? (prev as any)({}) : { ...(prev as any) };
                        delete (next as any)["businessLogo"];
                        return next;
                      });
                      updateData({ businessLogo: "" });
                      setPreviewUrl(null);
                      if (inputRefs.current["businessLogo"]) inputRefs.current["businessLogo"]!.value = "";
                    }}
                  >
                    <X className="w-4 h-4" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-poppins font-light text-yogreet-charcoal mb-4 sm:mb-6">
        Basic Information
      </h2>

      {/* Logo Upload */}
      <div className="mb-6">
        {renderLogoUpload()}
      </div>

      {/* Full Name and Store Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-manrope font-medium text-stone-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.fullName || ""}
            onChange={(e) => handleChange("fullName", e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage font-inter"
          />
        </div>
        <div>
          <label className="block text-sm font-manrope font-medium text-stone-700 mb-2">
            Company Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.companyName || data.storeName || ""} // Backward compatibility
            onChange={(e) => handleChange("companyName", e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage font-inter"
          />
        </div>
      </div>

      {/* Email and Mobile */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-manrope font-medium text-stone-700 mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={data.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage font-inter"
          />
        </div>
        <div>
          <label className="block text-sm font-manrope font-medium text-stone-700 mb-2">
            Mobile Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={data.mobile || ""}
            onChange={(e) => handleChange("mobile", e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage font-inter"
          />
        </div>
      </div>

      {/* Business Type */}
      <div className="mt-6">
        <div>
          <label className="block text-sm font-manrope font-medium text-stone-700 mb-2">
            Business Type <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.businessType || ""}
            onChange={(e) => handleChange("businessType", e.target.value)}
            placeholder="e.g., Exporter, Manufacturer, Wholesaler"
            className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage font-inter"
          />
        </div>
      </div>

      {/* Product Categories */}
      <div className="mt-6">
        <label className="block text-sm font-manrope font-medium text-stone-700 mb-3">
          Product Categories <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {PRODUCT_CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => handleCategoryToggle(category)}
              className={`px-4 py-2 rounded-full text-sm font-inter transition-colors cursor-pointer ${
                data.productCategories?.includes(category)
                  ? "bg-yogreet-sage text-white"
                  : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        {data.productCategories && data.productCategories.length > 0 && (
          <p className="mt-2 text-xs text-stone-500 font-inter">
            {data.productCategories.length} categor{data.productCategories.length === 1 ? "y" : "ies"} selected
          </p>
        )}
      </div>
    </div>
  );
}

