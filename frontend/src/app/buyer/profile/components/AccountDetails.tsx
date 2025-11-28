"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { User, Edit, Upload, Camera } from "lucide-react";
import { useRouter } from "next/navigation";

// Helper function to format date for display
const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  } catch (error) {
    console.error("Error formatting date for display:", error);
    return "";
  }
};

interface BuyerData {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: string;
  }

interface AccountDetailsProps {
  buyerData?: BuyerData;
  onEdit?: () => void;
  updateData?: (updates: any) => void;
  setUploadedFiles?: (files: Record<string, File | File[]>) => void;
  isLoading?: boolean;
  isEditing?: boolean;
}

export default function AccountDetails({
  buyerData,
  onEdit,
  updateData,
  setUploadedFiles,
  isLoading = false,
  isEditing = false,
}: AccountDetailsProps) {
  const router = useRouter();
  
  // Display mode - show data with Edit button
  if (!isEditing) {
    const displayData = buyerData || {};
    const isComplete = 
      displayData?.firstName?.trim() &&
      displayData?.lastName?.trim() &&
      displayData?.email?.trim();
    
    const buttonText = isComplete ? "Edit" : "Upload";
    const ButtonIcon = isComplete ? Edit : Upload;

    return (
      <div className="bg-white border border-stone-200 shadow-sm">
        <div className="p-6 border-b border-stone-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-manrope font-medium text-yogreet-charcoal flex items-center">
              <User className="w-5 h-5 mr-2 text-yogreet-sage" />
              Account Details
            </h2>
            <button
              onClick={() => (onEdit ? onEdit() : router.push("/buyer/profile"))}
              className="px-3 py-1.5 border border-yogreet-sage text-yogreet-sage rounded-md hover:bg-yogreet-sage/10 transition-colors cursor-pointer text-sm font-manrope flex items-center gap-1.5"
            >
              <ButtonIcon className="w-4 h-4" />
              {buttonText}
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Profile Photo */}
          <div className="flex items-center space-x-6">
            <div className="relative w-20 h-20 bg-stone-200 rounded-full flex items-center justify-center overflow-hidden">
              {displayData.avatar ? (
                <img
                  src={displayData.avatar}
                  alt={`${displayData.firstName || ""} ${displayData.lastName || ""}`}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="text-lg font-medium text-stone-600">
                  {displayData.firstName?.[0] || ""}
                  {displayData.lastName?.[0] || ""}
                </span>
              )}
            </div>
          </div>

          {/* Basic Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-manrope font-medium text-stone-700 mb-1">
                First Name *
              </label>
              <p className={`py-2 font-inter ${displayData.firstName ? "text-stone-600" : "text-red-500"}`}>
                {displayData.firstName || "not provided"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-manrope font-medium text-stone-700 mb-1">
                Last Name *
              </label>
              <p className={`py-2 font-inter ${displayData.lastName ? "text-stone-600" : "text-red-500"}`}>
                {displayData.lastName || "not provided"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-manrope font-medium text-stone-700 mb-1">
                Email Address *
              </label>
              <p className={`py-2 font-inter ${displayData.email ? "text-stone-600" : "text-red-500"}`}>
                {displayData.email || "not provided"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-manrope font-medium text-stone-700 mb-1">
                Phone Number
              </label>
              <p className={`py-2 font-inter ${displayData.phone ? "text-stone-600" : "text-stone-500"}`}>
                {displayData.phone || "not provided"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-manrope font-medium text-stone-700 mb-1">
                Date of Birth
              </label>
              <p className={`py-2 font-inter ${displayData.dateOfBirth ? "text-stone-600" : "text-stone-500"}`}>
                {displayData.dateOfBirth ? formatDateForDisplay(displayData.dateOfBirth) : "not provided"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-manrope font-medium text-stone-700 mb-1">
                Gender
              </label>
              <p className={`py-2 font-inter ${displayData.gender ? "text-stone-600" : "text-stone-500"}`}>
                {displayData.gender || "not provided"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Edit mode - form for Sheet
  const [formData, setFormData] = useState({
    firstName: buyerData?.firstName || "",
    lastName: buyerData?.lastName || "",
    phone: buyerData?.phone || "",
    dateOfBirth: buyerData?.dateOfBirth ? formatDateForDisplay(buyerData.dateOfBirth) : "",
    gender: buyerData?.gender || "",
  });
  
  const [avatarPreview, setAvatarPreview] = useState<string | null>(buyerData?.avatar || null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);

  useEffect(() => {
    if (buyerData) {
      setFormData({
        firstName: buyerData.firstName || "",
        lastName: buyerData.lastName || "",
        phone: buyerData.phone || "",
        dateOfBirth: buyerData.dateOfBirth ? formatDateForDisplay(buyerData.dateOfBirth) : "",
        gender: buyerData.gender || "",
      });
      setAvatarPreview(buyerData.avatar || null);
    }
  }, [buyerData]);

  const handleChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    if (updateData) {
      updateData(newData);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        return;
      }
      if (!file.type.startsWith("image/")) {
        return;
      }
      setOriginalFile(file);
      if (setUploadedFiles) {
        setUploadedFiles({ avatar: file });
      }
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  return (
    <div className="space-y-6">
        {/* Profile Photo */}
      <div>
        <label className="block text-sm font-manrope font-medium text-stone-700 mb-2">
          Profile Photo
        </label>
        <div className="flex items-center space-x-6">
          <div className="relative w-20 h-20 bg-stone-200 rounded-full flex items-center justify-center overflow-hidden">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span className="text-lg font-medium text-stone-600">
                {formData.firstName?.[0] || ""}
                {formData.lastName?.[0] || ""}
              </span>
            )}
          </div>
            <div>
              <label
                htmlFor="avatar-upload"
                className="border border-stone-300 text-stone-700 hover:bg-stone-50 px-3 py-1 text-sm font-medium transition-colors cursor-pointer inline-flex items-center hover:opacity-80"
              >
                <Camera className="w-4 h-4 mr-2" />
                Change Photo
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <p className="text-xs text-stone-500 mt-1">
                Max size: 5MB. Formats: JPG, PNG, GIF
              </p>
            </div>
        </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-stone-700 mb-1"
            >
              First Name *
            </label>
            <input
              id="firstName"
              type="text"
              value={formData.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-yogreet-sage focus:border-transparent disabled:bg-stone-50 disabled:text-stone-500 transition-colors"
              placeholder="Enter your first name"
            />
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-stone-700 mb-1"
            >
              Last Name *
            </label>
            <input
              id="lastName"
              type="text"
              value={formData.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-yogreet-sage focus:border-transparent disabled:bg-stone-50 disabled:text-stone-500 transition-colors"
              placeholder="Enter your last name"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-stone-700 mb-1"
            >
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              value={formData.phone || ""}
            onChange={(e) => handleChange("phone", e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-yogreet-sage focus:border-transparent disabled:bg-stone-50 disabled:text-stone-500 transition-colors"
              placeholder="Enter your phone number"
            />
          </div>

          <div>
            <label
              htmlFor="dateOfBirth"
              className="block text-sm font-medium text-stone-700 mb-1"
            >
              Date of Birth
            </label>
            <input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth || ""}
            onChange={(e) => handleChange("dateOfBirth", e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-yogreet-sage focus:border-transparent disabled:bg-stone-50 disabled:text-stone-500 transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="gender"
              className="block text-sm font-medium text-stone-700 mb-1"
            >
              Gender
            </label>
            <select
              id="gender"
              value={formData.gender || ""}
            onChange={(e) => handleChange("gender", e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-yogreet-sage focus:border-transparent disabled:bg-stone-50 disabled:text-stone-500 transition-colors"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>
      </div>
    </div>
  );
}
