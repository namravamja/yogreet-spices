"use client";

interface ProfileData {
  // Step 1: Seller Account & Business Basics
  fullName: string;
  storeName: string;
  email: string;
  mobile: string;
  businessType: string;
  businessRegistrationNumber: string;
  productCategories: string[];
  businessLogo: string;

  // Step 2: Address, Banking & Tax Details
  businessAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
  };
  warehouseAddress: {
    sameAsBusiness: boolean;
    street: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
  };
  bankAccountName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
  gstNumber: string;
  panNumber: string;

  // Step 3: Preferences, Logistics & Agreement
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
}

interface ProfileProgressProps {
  profileData: ProfileData;
}

export default function ProfileProgress({ profileData }: ProfileProgressProps) {
  const calculateProgress = () => {
    try {
      let completed = 0;
      const total = 23; // Total required fields across all steps

      // Step 1: Seller Account & Business Basics (9 fields)
      if (profileData?.fullName?.trim()) completed++;
      if (profileData?.storeName?.trim()) completed++;
      if (profileData?.email?.trim()) completed++;
      if (profileData?.mobile?.trim()) completed++;
      if (profileData?.businessType?.trim()) completed++;
      if (profileData?.businessRegistrationNumber?.trim()) completed++;
      if (
        Array.isArray(profileData?.productCategories) &&
        profileData.productCategories.length > 0
      )
        completed++;

      // Step 2: Address, Banking & Tax Details (11 fields)
      if (profileData?.businessAddress?.street?.trim()) completed++;
      if (profileData?.businessAddress?.city?.trim()) completed++;
      if (profileData?.businessAddress?.state?.trim()) completed++;
      if (profileData?.businessAddress?.country?.trim()) completed++;
      if (profileData?.businessAddress?.pinCode?.trim()) completed++;
      if (profileData?.bankAccountName?.trim()) completed++;
      if (profileData?.bankName?.trim()) completed++;
      if (profileData?.accountNumber?.trim()) completed++;
      if (profileData?.ifscCode?.trim()) completed++;
      if (profileData?.gstNumber?.trim()) completed++;
      if (profileData?.panNumber?.trim()) completed++;

      // Step 3: Preferences, Logistics & Agreement (5 fields)
      if (profileData?.shippingType?.trim()) completed++;
      if (
        Array.isArray(profileData?.serviceAreas) &&
        profileData.serviceAreas.length > 0
      )
        completed++;
      if (profileData?.inventoryVolume?.trim()) completed++;
      if (profileData?.returnPolicy?.trim()) completed++;
      if (profileData?.termsAgreed) completed++;

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
      if (!profileData?.storeName?.trim())
        missing.push("• Add your store name");
      if (!profileData?.email?.trim()) missing.push("• Add your email address");
      if (!profileData?.mobile?.trim())
        missing.push("• Add your mobile number");
      if (!profileData?.businessType?.trim())
        missing.push("• Select business type");
      if (!profileData?.businessRegistrationNumber?.trim())
        missing.push("• Add business registration number");
      if (
        !Array.isArray(profileData?.productCategories) ||
        profileData.productCategories.length === 0
      )
        missing.push("• Add product categories");

      // Step 2 missing fields
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
      if (!profileData?.bankAccountName?.trim())
        missing.push("• Add bank account name");
      if (!profileData?.bankName?.trim()) missing.push("• Add bank name");
      if (!profileData?.accountNumber?.trim())
        missing.push("• Add account number");
      if (!profileData?.ifscCode?.trim()) missing.push("• Add IFSC code");
      if (!profileData?.gstNumber?.trim()) missing.push("• Add GST number");
      if (!profileData?.panNumber?.trim()) missing.push("• Add PAN number");

      // Step 3 missing fields
      if (!profileData?.shippingType?.trim())
        missing.push("• Select shipping type");
      if (
        !Array.isArray(profileData?.serviceAreas) ||
        profileData.serviceAreas.length === 0
      )
        missing.push("• Add service areas");
      if (!profileData?.inventoryVolume?.trim())
        missing.push("• Add inventory volume");
      if (!profileData?.returnPolicy?.trim())
        missing.push("• Add return policy");
      if (!profileData?.termsAgreed)
        missing.push("• Agree to terms and conditions");

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
            <h2 className="text-lg font-medium text-stone-900">
              Profile Completion
            </h2>
            <p className="text-sm text-stone-600">{getProgressText()}</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-stone-900">
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
          <div className="mt-4 text-sm text-stone-600">
            <p>
              Complete your seller profile to start selling on our platform:
            </p>
            <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
              {getMissingFields().map((field, index) => (
                <div key={index}>{field}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


