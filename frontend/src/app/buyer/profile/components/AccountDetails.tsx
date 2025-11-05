"use client";

import type React from "react";
import { useState, useEffect, useRef, useMemo } from "react";
import { User, Edit, Save, X, Camera, Check } from "lucide-react";
import { toast } from "react-hot-toast";
import ConfirmationModal from "@/components/shared/ConfirmationModal";
import { useGetBuyerQuery, useUpdateBuyerMutation } from "@/services/api/buyerApi";

// Helper functions for date handling
const formatDateForAPI = (dateString: string): string | null => {
  if (!dateString) return null;

  try {
    let date: Date;

    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split("-").map(Number);
      date = new Date(year, month - 1, day, 0, 0, 0, 0);
      const utcDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
      return utcDate.toISOString();
    } else {
      date = new Date(dateString);
    }

    if (isNaN(date.getTime())) {
      console.error("Invalid date format:", dateString);
      return null;
    }

    return date.toISOString();
  } catch (error) {
    console.error("Error formatting date:", error);
    return null;
  }
};

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

const validateDateOfBirth = (
  dateString: string
): { isValid: boolean; message?: string } => {
  if (!dateString) {
    return { isValid: true };
  }

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return { isValid: false, message: "Invalid date format" };
    }

    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();

    if (date > today) {
      return {
        isValid: false,
        message: "Date of birth cannot be in the future",
      };
    }

    if (age > 150) {
      return { isValid: false, message: "Please enter a valid date of birth" };
    }

    const monthDiff = today.getMonth() - date.getMonth();
    const actualAge =
      monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())
        ? age - 1
        : age;
    if (actualAge < 13) {
      return { isValid: false, message: "You must be at least 13 years old" };
    }

    return { isValid: true };
  } catch (error) {
    return { isValid: false, message: "Invalid date format" };
  }
};

export default function AccountDetails() {
  const { data: buyerData, isLoading: isFetching, isError, error: fetchError, refetch } = useGetBuyerQuery(undefined);
  const [updateBuyer, { isLoading: isUpdating }] = useUpdateBuyerMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  
  // Initialize formData from API data
  const [formData, setFormData] = useState({
    id: "",
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    avatar: "",
    dateOfBirth: "",
    gender: "",
  });
  
  const [originalData, setOriginalData] = useState(formData);

  // Update formData when buyerData changes
  useEffect(() => {
    if (buyerData) {
      const initialData = {
        id: buyerData.id || "",
        email: buyerData.email || "",
        firstName: buyerData.firstName || "",
        lastName: buyerData.lastName || "",
        phone: buyerData.phone || "",
        avatar: buyerData.avatar || "",
        dateOfBirth: buyerData.dateOfBirth ? formatDateForDisplay(buyerData.dateOfBirth) : "",
        gender: buyerData.gender || "",
      };
      setFormData(initialData);
      setOriginalData(initialData);
    }
  }, [buyerData]);

  // Image cropping states
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [croppedImageFile, setCroppedImageFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Check if form has changes
  const hasChanges = () => {
    return (
      JSON.stringify(formData) !== JSON.stringify(originalData) ||
      croppedImageFile !== null
    );
  };

  const handleSave = async () => {
    try {
      // Prepare update data
      const updateData: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        gender: formData.gender,
      };

      // Add date of birth if provided
      if (formData.dateOfBirth) {
        const dateOfBirth = formatDateForAPI(formData.dateOfBirth);
        if (dateOfBirth) {
          updateData.dateOfBirth = dateOfBirth;
        }
      }

      // Handle avatar upload if there's a new image
      let finalData: any = updateData;
      if (croppedImageFile) {
        const formDataUpload = new FormData();
        Object.keys(updateData).forEach(key => {
          if (updateData[key] !== null && updateData[key] !== undefined) {
            formDataUpload.append(key, updateData[key]);
          }
        });
        formDataUpload.append("avatar", croppedImageFile);
        finalData = formDataUpload;
      }

      await updateBuyer(finalData).unwrap();
      
      // Reset states
      setIsEditing(false);
      setOriginalFile(null);
      setCroppedImageFile(null);
      setAvatarPreview(null);
      setOriginalData(formData);
      setShowSaveConfirm(false);
      
      // Refetch to get updated data
      await refetch();
      
      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error("=== SAVE ERROR ===", error);
      let errorMessage = "Failed to update profile. Please try again.";
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.data?.error) {
        errorMessage = error.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
      setShowSaveConfirm(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges()) {
      setShowCancelConfirm(true);
    } else {
      performCancel();
    }
  };

  const performCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
    setOriginalFile(null);
    setCroppedImageFile(null);
    setAvatarPreview(null);
    setShowCancelConfirm(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      setOriginalFile(file);
      setCroppedImageFile(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      
      toast.success("Image selected successfully!");
    }
  };

  const handleRetry = () => {
    refetch();
  };

  useEffect(() => {
    return () => {
      // Clean up any created object URLs to prevent memory leaks
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  // Error state
  if (isError && !buyerData) {
    return (
      <div className="bg-white border border-stone-200 shadow-sm">
        <div className="p-6 border-b border-stone-200">
          <h2 className="text-xl font-medium text-yogreet-charcoal flex items-center">
            <User className="w-5 h-5 mr-2 text-yogreet-purple" />
            Account Details
          </h2>
        </div>
        <div className="p-6">
          <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
            <div className="text-red-600 mb-4">
              <p className="font-medium">Failed to load account details</p>
              <p className="text-sm mt-1">
                {fetchError && "status" in fetchError
                  ? `Error ${fetchError.status}: ${
                      typeof fetchError.data === "object" &&
                      fetchError.data &&
                      "message" in fetchError.data
                        ? (fetchError.data as { message: string }).message
                        : "Unknown error"
                    }`
                  : "Network error occurred"}
              </p>
            </div>
            <button
              onClick={handleRetry}
              className="bg-terracotta-500 hover:bg-terracotta-600 text-white px-4 py-2 font-medium transition-colors hover:opacity-80 cursor-pointer"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isFetching && !buyerData) {
    return (
      <div className="bg-white border border-stone-200 shadow-sm">
        <div className="p-6 border-b border-stone-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-medium text-stone-900 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Account Details
            </h2>
            <div className="w-24 h-10 bg-stone-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center space-x-6 mb-6">
            <div className="w-20 h-20 bg-stone-200 rounded animate-pulse"></div>
            <div className="w-32 h-8 bg-stone-200 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index}>
                <div className="w-24 h-4 bg-stone-200 rounded animate-pulse mb-2"></div>
                <div className="w-full h-10 bg-stone-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-stone-200 shadow-sm">
      <div className="p-6 border-b border-stone-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-medium text-yogreet-charcoal flex items-center">
            <User className="w-5 h-5 mr-2 text-yogreet-purple" />
            Account Details
          </h2>
          <button
            onClick={() => {
              if (isEditing) {
                if (hasChanges()) {
                  setShowSaveConfirm(true);
                } else {
                  setIsEditing(false);
                }
              } else {
                setIsEditing(true);
              }
            }}
            disabled={isUpdating}
            className="border border-stone-300 text-stone-700 hover:bg-stone-50 px-4 py-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80 cursor-pointer"
          >
            {isUpdating ? (
              <>
                <div className="w-4 h-4 mr-2 inline-block animate-spin rounded-full border-2 border-stone-300 border-t-stone-700"></div>
                Saving...
              </>
            ) : isEditing ? (
              <>
                <Save className="w-4 h-4 mr-2 inline" />
                Save Changes
              </>
            ) : (
              <>
                <Edit className="w-4 h-4 mr-2 inline" />
                Edit Profile
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <ConfirmationModal
          isOpen={showSaveConfirm}
          onClose={() => setShowSaveConfirm(false)}
          title="Confirm Changes"
          onConfirm={handleSave}
          confirmText={isUpdating ? "Saving..." : "Save Changes"}
          cancelText="Cancel"
          isLoading={isUpdating}
        >
          <p className="text-stone-600">
            Are you sure you want to save these changes to your profile?
          </p>
        </ConfirmationModal>

        <ConfirmationModal
          isOpen={showCancelConfirm}
          onClose={() => setShowCancelConfirm(false)}
          title="Discard Changes"
          onConfirm={performCancel}
          confirmText="Discard Changes"
          cancelText="Keep Editing"
          confirmVariant="danger"
        >
          <p className="text-stone-600">
            You have unsaved changes. Are you sure you want to discard them?
          </p>
        </ConfirmationModal>

        {/* Profile Photo */}
        <div className="flex items-center space-x-6">
          <div className="relative w-20 h-20 bg-stone-200 rounded-full flex items-center justify-center overflow-hidden">
            {avatarPreview ? (
              <img
                src={avatarPreview || "/Profile.jpg"}
                alt={`${formData.firstName} ${formData.lastName}`}
                className="w-full h-full object-cover"
              />
            ) : formData.avatar ? (
              <img
                src={formData.avatar}
                alt={`${formData.firstName} ${formData.lastName}`}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span className="text-lg font-medium text-stone-600">
                {formData.firstName?.[0] || ""}
                {formData.lastName?.[0] || ""}
              </span>
            )}
          </div>

          {isEditing && (
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
              {croppedImageFile && (
                <p className="text-xs text-green-600 mt-1">
                  ✓ Image ready to upload (
                  {Math.round(croppedImageFile.size / 1024)}KB)
                </p>
              )}
            </div>
          )}
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
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, firstName: e.target.value }))
              }
              disabled={!isEditing || isUpdating}
              className="w-full px-3 py-2 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-terracotta-500 focus:border-transparent disabled:bg-stone-50 disabled:text-stone-500 transition-colors"
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
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, lastName: e.target.value }))
              }
              disabled={!isEditing || isUpdating}
              className="w-full px-3 py-2 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-terracotta-500 focus:border-transparent disabled:bg-stone-50 disabled:text-stone-500 transition-colors"
              placeholder="Enter your last name"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-stone-700 mb-1"
            >
              Email Address *
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              disabled={true} // Email should not be editable
              className="w-full px-3 py-2 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-terracotta-500 focus:border-transparent disabled:bg-stone-50 disabled:text-stone-500 transition-colors"
              placeholder="Enter your email address"
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
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              disabled={!isEditing || isUpdating}
              className="w-full px-3 py-2 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-terracotta-500 focus:border-transparent disabled:bg-stone-50 disabled:text-stone-500 transition-colors"
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
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  dateOfBirth: e.target.value,
                }))
              }
              disabled={!isEditing || isUpdating}
              className="w-full px-3 py-2 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-terracotta-500 focus:border-transparent disabled:bg-stone-50 disabled:text-stone-500 transition-colors"
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
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, gender: e.target.value }))
              }
              disabled={!isEditing || isUpdating}
              className="w-full px-3 py-2 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-terracotta-500 focus:border-transparent disabled:bg-stone-50 disabled:text-stone-500 transition-colors"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>
        </div>

        {isEditing && (
          <div className="flex space-x-2 pt-4 border-t border-stone-200">
            <button
              onClick={handleCancel}
              disabled={isUpdating}
              className="border border-stone-300 text-stone-700 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 font-medium transition-colors hover:opacity-80 cursor-pointer"
            >
              <X className="w-4 h-4 mr-2 inline" />
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
