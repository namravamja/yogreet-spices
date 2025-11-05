"use client";

import type React from "react";
// Define UploadedFile type locally
type UploadedFile = {
  file: File;
  preview: string;
  name: string;
};

import { Upload, X, Plus, FileImage } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";

interface ProfileData {
  shippingType: string;
  inventoryVolume: string;
  supportContact: string;
  workingHours: string;
  serviceAreas: string[];
  returnPolicy: string;
  socialLinks: {
    website: string;
    instagram: string;
    facebook: string;
    twitter: string;
  };
  termsAgreed: boolean;
  digitalSignature: string;
}

interface Step3Props {
  data: ProfileData;
  updateData: (updates: Partial<ProfileData>) => void;
  updateNestedField: (
    parent: keyof ProfileData,
    field: string,
    value: any
  ) => void;
  addToArray: (field: keyof ProfileData, value: string) => void;
  removeFromArray: (field: keyof ProfileData, index: number) => void;
  setUploadedFiles: (
    files:
      | Record<string, File>
      | ((prev: Record<string, File>) => Record<string, File>)
  ) => void;
  onSave?: () => Promise<boolean>;
  isLoading?: boolean;
}

export default function Step3PreferencesLogistics({
  data,
  updateData,
  updateNestedField,
  addToArray,
  removeFromArray,
  setUploadedFiles,
  onSave,
  isLoading = false,
}: Step3Props) {
  const [serviceAreaInput, setServiceAreaInput] = useState("");
  const [uploadedSignature, setUploadedSignature] =
    useState<UploadedFile | null>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);

  // Add state for existing signature preview
  const [existingSignaturePreview, setExistingSignaturePreview] = useState<
    string | null
  >(null);

  // Add useEffect to handle existing digital signature from database
  useEffect(() => {
    if (data.digitalSignature && !uploadedSignature) {
      // If there's a digital signature from database but no uploaded file
      setExistingSignaturePreview(data.digitalSignature);
    }
  }, [data.digitalSignature, uploadedSignature]);

  const handleInputChange = (field: keyof ProfileData, value: any) => {
    try {
      updateData({ [field]: value });
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      toast.error(`Failed to update ${field}`);
    }
  };

  const handleNestedFieldChange = (
    parent: keyof ProfileData,
    field: string,
    value: any
  ) => {
    try {
      updateNestedField(parent, field, value);
    } catch (error) {
      console.error(`Error updating ${parent}.${field}:`, error);
      toast.error(`Failed to update ${field}`);
    }
  };

  const handleAddServiceArea = () => {
    if (!serviceAreaInput.trim()) {
      toast.error("Please enter a service area");
      return;
    }

    try {
      addToArray("serviceAreas", serviceAreaInput.trim());
      setServiceAreaInput("");
    } catch (error) {
      console.error("Error adding service area:", error);
      toast.error("Failed to add service area");
    }
  };

  const handleRemoveServiceArea = (index: number) => {
    try {
      removeFromArray("serviceAreas", index);
    } catch (error) {
      console.error("Error removing service area:", error);
      toast.error("Failed to remove service area");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddServiceArea();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      // Validate file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size must be less than 2MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedSignature({
          file,
          preview: result,
          name: file.name,
        });
      };
      reader.readAsDataURL(file);

      // Store the file for upload
      setUploadedFiles((prev: Record<string, File>) => ({
        ...prev,
        digitalSignature: file,
      }));

      // Update the profile data field for digitalSignature
      updateData({ digitalSignature: file.name });

      toast.success(`Digital signature uploaded: ${file.name}`);
    } catch (error) {
      console.error("Error uploading signature:", error);
      toast.error("Failed to upload digital signature");
    }
  };

  const removeSignature = () => {
    try {
      setUploadedSignature(null);
      setExistingSignaturePreview(null); // Add this line
      if (signatureInputRef.current) {
        signatureInputRef.current.value = "";
      }

      // Remove from uploaded files and clear data field
      setUploadedFiles((prev: Record<string, File>) => {
        const newFiles = { ...prev };
        delete newFiles.digitalSignature;
        return newFiles;
      });

      updateData({ digitalSignature: "" });

      toast.success("Digital signature removed");
    } catch (error) {
      console.error("Error removing signature:", error);
      toast.error("Failed to remove digital signature");
    }
  };

  const triggerFileUpload = () => {
    signatureInputRef.current?.click();
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\D/g, ""));
  };

  const handleSupportContactChange = (value: string) => {
    handleInputChange("supportContact", value);

    // Only validate if it looks like an email
    if (value && value.includes("@")) {
      if (!validateEmail(value)) {
        toast.error("Please enter a valid email address");
      }
    }
    // Remove the phone validation from here - it will be handled at submit
  };

  const handleTermsChange = (checked: boolean) => {
    try {
      // Ensure we're storing a proper boolean value
      handleInputChange("termsAgreed", Boolean(checked));
      if (checked) {
        toast.success("Terms and conditions accepted");
      }
    } catch (error) {
      console.error("Error updating terms agreement:", error);
      toast.error("Failed to update terms agreement");
    }
  };

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-light text-stone-900 mb-4 sm:mb-6">
        Preferences, Logistics & Agreement
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Preferred Shipping Type <span className="text-red-500">*</span>
          </label>
          <select
            value={data?.shippingType || ""}
            onChange={(e) => handleInputChange("shippingType", e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
            required
          >
            <option value="">Select Shipping Type</option>
            <option value="Self">Self Fulfilled</option>
            <option value="Platform">Platform Fulfilled</option>
            <option value="Both">Both</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Estimated Inventory Volume <span className="text-red-500">*</span>
          </label>
          <select
            value={data?.inventoryVolume || ""}
            onChange={(e) =>
              handleInputChange("inventoryVolume", e.target.value)
            }
            className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
            required
          >
            <option value="">Select Volume</option>
            <option value="1-10">1-10 items</option>
            <option value="11-50">11-50 items</option>
            <option value="51-100">51-100 items</option>
            <option value="101-500">101-500 items</option>
            <option value="500+">500+ items</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Support Contact Info <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data?.supportContact || ""}
            onChange={(e) => handleSupportContactChange(e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
            placeholder="Email or phone number"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Working Hours (optional)
          </label>
          <input
            type="text"
            value={data?.workingHours || ""}
            onChange={(e) => handleInputChange("workingHours", e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
            placeholder="e.g., Mon-Fri: 9AM-5PM"
          />
        </div>
      </div>

      <div className="mb-6 sm:mb-8">
        <label className="block text-sm font-medium text-stone-700 mb-2">
          Service Areas <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {Array.isArray(data?.serviceAreas) &&
            data.serviceAreas.map((area, index) => (
              <span
                key={index}
                className="bg-sage-100 text-sage-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm flex items-center"
              >
                {area}
                <button
                  onClick={() => handleRemoveServiceArea(index)}
                  className="ml-1 sm:ml-2 text-sage-500 hover:text-sage-700"
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
            placeholder="Add a service area (e.g., Local, National, International, or specific regions)"
            value={serviceAreaInput}
            onChange={(e) => setServiceAreaInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-stone-300 rounded-md focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
          />
          <button
            onClick={handleAddServiceArea}
            type="button"
            className="sm:ml-2 bg-sage-600 text-white px-4 py-2 sm:py-3 rounded-md hover:bg-sage-700 transition-colors"
          >
            <Plus className="w-4 h-4 mx-auto" />
          </button>
        </div>
      </div>

      <div className="mb-8">
        <label className="block text-sm font-medium text-stone-700 mb-2">
          Return Handling Policy (optional)
        </label>
        <textarea
          value={data?.returnPolicy || ""}
          onChange={(e) => handleInputChange("returnPolicy", e.target.value)}
          rows={4}
          className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
          placeholder="Describe your return policy..."
        />
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-medium text-stone-900 mb-4">
          Social Media & Website Links (optional)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Website
            </label>
            <input
              type="url"
              value={data?.socialLinks?.website || ""}
              onChange={(e) =>
                handleNestedFieldChange(
                  "socialLinks",
                  "website",
                  e.target.value
                )
              }
              className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
              placeholder="https://your-website.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Instagram
            </label>
            <input
              type="text"
              value={data?.socialLinks?.instagram || ""}
              onChange={(e) =>
                handleNestedFieldChange(
                  "socialLinks",
                  "instagram",
                  e.target.value
                )
              }
              className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
              placeholder="@username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Facebook
            </label>
            <input
              type="text"
              value={data?.socialLinks?.facebook || ""}
              onChange={(e) =>
                handleNestedFieldChange(
                  "socialLinks",
                  "facebook",
                  e.target.value
                )
              }
              className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
              placeholder="Page name or URL"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Twitter
            </label>
            <input
              type="text"
              value={data?.socialLinks?.twitter || ""}
              onChange={(e) =>
                handleNestedFieldChange(
                  "socialLinks",
                  "twitter",
                  e.target.value
                )
              }
              className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
              placeholder="@username"
            />
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            checked={Boolean(data?.termsAgreed)}
            onChange={(e) => handleTermsChange(e.target.checked)}
            className="h-4 w-4 text-terracotta-600 focus:ring-terracotta-500 border-stone-300 rounded"
            required
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-stone-700">
            I agree to the{" "}
            <a
              href="#"
              className="text-terracotta-600 hover:text-terracotta-500"
            >
              Terms and Conditions
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="text-terracotta-600 hover:text-terracotta-500"
            >
              Seller Agreement
            </a>{" "}
            <span className="text-red-500">*</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">
          Digital Signature (optional)
        </label>

        {/* Hidden file input */}
        <input
          ref={signatureInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {uploadedSignature || existingSignaturePreview ? (
          <div className="mt-1 p-3 border-2 border-dashed border-stone-300 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {existingSignaturePreview && !uploadedSignature ? (
                  // Display existing signature from database
                  <>
                    <img
                      src={existingSignaturePreview || "/Profile.jpg"}
                      alt="Digital Signature"
                      className="w-16 h-16 object-cover rounded border"
                    />
                    <div>
                      <p className="text-sm font-medium text-stone-700">
                        Digital Signature (from database)
                      </p>
                      <p className="text-xs text-stone-500">
                        Existing signature
                      </p>
                    </div>
                  </>
                ) : (
                  // Display newly uploaded signature
                  <>
                    <FileImage className="w-8 h-8 text-terracotta-600" />
                    <div>
                      <p className="text-sm font-medium text-stone-700">
                        {uploadedSignature?.name}
                      </p>
                      <p className="text-xs text-stone-500">
                        {uploadedSignature
                          ? (uploadedSignature.file.size / 1024).toFixed(1) +
                            " KB"
                          : ""}
                      </p>
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={removeSignature}
                className="text-red-500 hover:text-red-700 p-1"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={triggerFileUpload}
            className="mt-1 flex justify-center px-3 sm:px-6 pt-3 sm:pt-5 pb-3 sm:pb-6 border-2 border-dashed border-stone-300 rounded-md hover:border-terracotta-400 transition-colors cursor-pointer"
          >
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-6 sm:h-8 w-6 sm:w-8 text-stone-400" />
              <div className="flex flex-col sm:flex-row text-sm text-stone-600 justify-center">
                <span className="font-medium text-terracotta-600 hover:text-terracotta-500">
                  Upload a file
                </span>
                <p className="sm:pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-stone-500">PNG, JPG up to 2MB</p>
            </div>
          </div>
        )}
      </div>
      {onSave && (
        <div className="mt-6 pt-4 border-t border-stone-200">
          <button
            onClick={onSave}
            disabled={isLoading}
            className="px-4 py-2 bg-sage-600 text-white rounded-md hover:bg-sage-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Saving..." : "Save Step 3 Data"}
          </button>
        </div>
      )}
    </div>
  );
}
