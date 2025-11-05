"use client";

import type React from "react";

import { Upload, X, Plus } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";

interface ProfileData {
  fullName: string;
  storeName: string;
  email: string;
  mobile: string;
  businessType: string;
  businessRegistrationNumber: string;
  productCategories: string[];
  businessLogo: string;
}

interface Step1Props {
  data: ProfileData;
  updateData: (updates: Partial<ProfileData>) => void;
  addToArray: (field: keyof ProfileData, value: string) => void;
  removeFromArray: (field: keyof ProfileData, index: number) => void;
  setUploadedFiles: (files: Record<string, File>) => void;
  onSave?: () => Promise<boolean>;
  isLoading?: boolean; // Add this prop
}

export default function Step1BusinessBasics({
  data,
  updateData,
  addToArray,
  removeFromArray,
  setUploadedFiles,
  onSave,
  isLoading = false, // Add this prop with default
}: Step1Props) {
  const [categoryInput, setCategoryInput] = useState("");
  const [uploadedLogo, setUploadedLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(
    data.businessLogo || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add useEffect to handle existing logo from database
  useEffect(() => {
    if (data.businessLogo && !uploadedLogo && !logoPreview) {
      // If there's a business logo URL from database but no uploaded file or preview
      setLogoPreview(data.businessLogo);
    }
  }, [data.businessLogo, uploadedLogo, logoPreview]);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    try {
      updateData({ [field]: value });
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      toast.error(`Failed to update ${field}`);
    }
  };

  const handleAddCategory = () => {
    if (!categoryInput.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    try {
      addToArray("productCategories", categoryInput.trim());
      setCategoryInput("");
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Failed to add category");
    }
  };

  const handleRemoveCategory = (index: number) => {
    try {
      removeFromArray("productCategories", index);
    } catch (error) {
      console.error("Error removing category:", error);
      toast.error("Failed to remove category");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCategory();
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file (PNG, JPG, GIF)");
        return;
      }

      // Validate file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size must be less than 2MB");
        return;
      }

      setUploadedLogo(file);

      // Store the file for later upload
      setUploadedFiles({ businessLogo: file });

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
      };
      reader.readAsDataURL(file);

      toast.success(`Logo uploaded: ${file.name}`);
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Failed to upload logo");
    }
  };

  const removeLogo = () => {
    try {
      setUploadedLogo(null);
      setLogoPreview(null);
      updateData({ businessLogo: "" });
      setUploadedFiles({});
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      toast.success("Logo removed");
    } catch (error) {
      console.error("Error removing logo:", error);
      toast.error("Failed to remove logo");
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateMobile = (mobile: string) => {
    const mobileRegex = /^[0-9]{10}$/;
    return mobileRegex.test(mobile.replace(/\D/g, ""));
  };

  const handleEmailChange = (value: string) => {
    handleInputChange("email", value);
    if (value && !validateEmail(value)) {
      toast.error("Please enter a valid email address");
    }
  };

  const handleMobileChange = (value: string) => {
    // Remove non-numeric characters
    const numericValue = value.replace(/\D/g, "");
    handleInputChange("mobile", numericValue);
    if (numericValue && !validateMobile(numericValue)) {
      toast.error("Please enter a valid 10-digit mobile number");
    }
  };

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-light text-stone-900 mb-4 sm:mb-6">
        Seller Account & Business Basics
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Full Name / Business Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data?.fullName || ""}
            onChange={(e) => handleInputChange("fullName", e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
            placeholder="Enter your full name or business name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Store Name / Display Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data?.storeName || ""}
            onChange={(e) => handleInputChange("storeName", e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
            placeholder="Enter your store display name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={data?.email || ""}
            onChange={(e) => handleEmailChange(e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
            placeholder="Enter your email address"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Mobile Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={data?.mobile || ""}
            onChange={(e) => handleMobileChange(e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
            placeholder="Enter 10-digit mobile number"
            maxLength={10}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Business Type <span className="text-red-500">*</span>
          </label>
          <select
            value={data?.businessType || ""}
            onChange={(e) => handleInputChange("businessType", e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
            required
          >
            <option value="">Select Business Type</option>
            <option value="individual">Individual</option>
            <option value="company">Company</option>
            <option value="partnership">Partnership</option>
            <option value="llp">LLP</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Business Registration Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data?.businessRegistrationNumber || ""}
            onChange={(e) =>
              handleInputChange("businessRegistrationNumber", e.target.value)
            }
            className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
            placeholder="Enter registration number"
            required
          />
        </div>
      </div>

      <div className="mt-4 sm:mt-6">
        <label className="block text-sm font-medium text-stone-700 mb-2">
          Product Categories You Will Sell{" "}
          <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {Array.isArray(data?.productCategories) &&
            data.productCategories.map((category, index) => (
              <span
                key={index}
                className="bg-terracotta-100 text-terracotta-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm flex items-center"
              >
                {category}
                <button
                  onClick={() => handleRemoveCategory(index)}
                  className="ml-1 sm:ml-2 text-terracotta-500 hover:text-terracotta-700"
                  type="button"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <input
            type="text"
            placeholder="Add a category (e.g., Handicrafts, Textiles, Jewelry)"
            value={categoryInput}
            onChange={(e) => setCategoryInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-stone-300 rounded-md focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
          />
          <button
            onClick={handleAddCategory}
            type="button"
            className="sm:ml-2 bg-terracotta-600 text-white px-4 py-2 sm:py-3 rounded-md hover:bg-terracotta-700 transition-colors"
          >
            <Plus className="w-4 h-4 mx-auto" />
          </button>
        </div>
      </div>

      <div className="mt-4 sm:mt-6">
        <label className="block text-sm font-medium text-stone-700 mb-2">
          Upload Business Logo (optional)
        </label>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleLogoUpload}
          className="hidden"
        />

        {logoPreview ? (
          <div className="mt-2 p-4 border-2 border-dashed border-stone-300 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img
                  src={logoPreview || "/Profile.jpg"}
                  alt="Logo preview"
                  className="w-16 h-16 object-cover rounded-md border"
                />
                <div>
                  <p className="text-sm font-medium text-stone-700">
                    {uploadedLogo?.name || "Business Logo"}
                  </p>
                  <p className="text-xs text-stone-500">
                    {uploadedLogo
                      ? `${(uploadedLogo.size / 1024).toFixed(1)} KB`
                      : ""}
                  </p>
                </div>
              </div>
              <button
                onClick={removeLogo}
                className="text-red-500 hover:text-red-700 p-1"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={triggerFileUpload}
            className="mt-2 flex justify-center px-4 sm:px-6 pt-4 sm:pt-5 pb-4 sm:pb-6 border-2 border-dashed border-stone-300 rounded-md hover:border-terracotta-400 transition-colors cursor-pointer"
          >
            <div className="space-y-1 sm:space-y-2 text-center">
              <div className="mx-auto h-16 sm:h-20 w-16 sm:w-20 text-stone-400">
                <Upload className="mx-auto h-8 sm:h-12 w-8 sm:w-12" />
              </div>
              <div className="flex flex-col sm:flex-row text-sm text-stone-600 justify-center">
                <span className="font-medium text-terracotta-600 hover:text-terracotta-500">
                  Upload a photo
                </span>
                <p className="sm:pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-stone-500">PNG, JPG, GIF up to 2MB</p>
            </div>
          </div>
        )}
      </div>

      {/* Add save button at the end */}
      {onSave && (
        <div className="mt-6 pt-4 border-t border-stone-200">
          <button
            onClick={onSave}
            disabled={isLoading}
            className="px-4 py-2 bg-sage-600 text-white rounded-md hover:bg-sage-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Saving..." : "Save Step 1 Data"}
          </button>
        </div>
      )}
    </div>
  );
}
