"use client";

interface ProfileData {
  // Step 1: Seller Account & Business Basics
  fullName?: string | null;
  companyName?: string | null;
  email?: string;
  mobile?: string | null;
  businessType?: string | null;
  productCategories?: string[] | null;
  businessLogo?: string | null;
  // Step 2: About & Store Photos
  about?: string | null;
  storePhotos?: string[] | null;

  // Step 2: Address, Banking & Tax Details
  businessAddress?: {
    street?: string;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    pinCode?: string | null;
  } | null;
  warehouseAddress?: {
    sameAsBusiness?: boolean | null;
    street?: string;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    pinCode?: string | null;
  } | null;
  bankAccountName?: string | null;
  bankName?: string | null;
  accountNumber?: string | null;
  ifscCode?: string | null;
  upiId?: string | null;
  gstNumber?: string | null;
  panNumber?: string | null;

  // Step 3: Preferences, Logistics & Agreement
  shippingType?: string | null;
  serviceAreas?: string[] | null;
  returnPolicy?: string | null;
  socialLinks?: {
    website?: string | null;
    instagram?: string | null;
    facebook?: string | null;
    twitter?: string | null;
  } | null;
}

interface ProfileProgressProps {
  profileData: ProfileData;
}

export default function ProfileProgress({ profileData }: ProfileProgressProps) {
  const calculateProgress = () => {
    try {
      let completed = 0;
      const total = 13; // Basic (6) + About & Photos (2) + Address (5)

      // Step 1: Seller Account & Business Basics (6 fields)
      if (profileData?.fullName?.trim()) completed++;
      if (profileData?.companyName?.trim()) completed++;
      if (profileData?.email?.trim()) completed++;
      if (profileData?.mobile?.trim()) completed++;
      if (profileData?.businessType?.trim()) completed++;
      if (
        Array.isArray(profileData?.productCategories) &&
        profileData.productCategories.length > 0
      )
        completed++;

      // Step 2: About & Store Photos (2 fields)
      if (profileData?.about?.trim()) completed++;
      if (
        Array.isArray(profileData?.storePhotos) &&
        profileData.storePhotos.length > 0
      )
        completed++;

      // Step 2: Address Details only (5 fields) - Banking & Tax excluded
      if (profileData?.businessAddress?.street?.trim()) completed++;
      if (profileData?.businessAddress?.city?.trim()) completed++;
      if (profileData?.businessAddress?.state?.trim()) completed++;
      if (profileData?.businessAddress?.country?.trim()) completed++;
      if (profileData?.businessAddress?.pinCode?.trim()) completed++;
      // Shipping & Logistics excluded from progress

      return Math.round((completed / total) * 100);
    } catch (error) {
      console.error("Error calculating progress:", error);
      return 0;
    }
  };

  const progress = calculateProgress();

  const getProgressColor = () => {
    if (progress >= 80) return "bg-yogreet-sage";
    if (progress >= 50) return "bg-yogreet-red";
    return "bg-yellow-500";
  };

  const getProgressText = () => {
    if (progress === 100) return "Profile Complete!";
    if (progress >= 80) return "Almost Complete";
    if (progress >= 50) return "Good Progress";
    return "Getting Started";
  };

  const getMissingFields = () => {
    try {
      const missing = [];

      // Step 1 missing fields
      if (!profileData?.fullName?.trim()) missing.push("• Add your full name");
      if (!profileData?.companyName?.trim())
        missing.push("• Add your company name");
      if (!profileData?.email?.trim()) missing.push("• Add your email address");
      if (!profileData?.mobile?.trim())
        missing.push("• Add your mobile number");
      if (!profileData?.businessType?.trim())
        missing.push("• Select business type");
      if (
        !Array.isArray(profileData?.productCategories) ||
        profileData.productCategories.length === 0
      )
        missing.push("• Add product categories");

      // About & Store Photos missing fields
      if (!profileData?.about?.trim())
        missing.push("• Add your About description");
      if (
        !Array.isArray(profileData?.storePhotos) ||
        profileData.storePhotos.length === 0
      )
        missing.push("• Add store photos");

      // Step 2 missing fields (Address only)
      if (!profileData?.businessAddress?.street?.trim())
        missing.push("• Add business street address");
      if (!profileData?.businessAddress?.city?.trim())
        missing.push("• Add business city");
      if (!profileData?.businessAddress?.state?.trim())
        missing.push("• Add business state");
      if (!profileData?.businessAddress?.country?.trim())
        missing.push("• Add business country");
      if (!profileData?.businessAddress?.pinCode?.trim())
        missing.push("• Add business pin code");
      // Banking & Tax and Shipping & Logistics missing prompts removed

      return missing;
    } catch (error) {
      console.error("Error getting missing fields:", error);
      return ["• Error calculating missing fields"];
    }
  };

  return (
    <div className="bg-white border border-stone-200 shadow-sm mb-8">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-manrope font-medium text-yogreet-charcoal">
              Profile Completion
            </h2>
            <p className="text-sm text-stone-600 font-inter">{getProgressText()}</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-yogreet-charcoal font-poppins">
              {progress}%
            </span>
          </div>
        </div>

        <div className="w-full bg-stone-200 h-3">
          <div
            className={`h-3 transition-all duration-500 ${getProgressColor()}`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {progress < 100 && (
          <div className="mt-4 text-sm text-stone-600 font-inter">
            <p>
              Complete your seller profile to start selling on our platform:
            </p>
            <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
              {getMissingFields().map((field, index) => (
                <div key={index} className="font-inter">{field}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

