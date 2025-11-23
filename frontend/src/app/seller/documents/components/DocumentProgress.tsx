"use client";

interface DocumentProgressProps {
  documentCompletion: number;
  data?: any; // Optional data for missing fields check
}

export default function DocumentProgress({ documentCompletion, data }: DocumentProgressProps) {
  const progress = documentCompletion || 0;

  const getProgressColor = () => {
    if (progress >= 80) return "bg-yogreet-sage";
    if (progress >= 50) return "bg-yogreet-red";
    return "bg-yellow-500";
  };

  const getProgressText = () => {
    if (progress === 100) return "Documents Complete!";
    if (progress >= 80) return "Almost Complete";
    if (progress >= 50) return "Good Progress";
    return "Getting Started";
  };

  const getMissingFields = () => {
    try {
      const missing: string[] = [];

      // Step 1: Business Identity
      if (!data?.panNumber?.trim()) missing.push("• Add PAN number");
      if (!data?.gstNumber?.trim()) missing.push("• Add GST number");
      if (!data?.aadharNumber?.trim()) missing.push("• Add Aadhaar number");
      if (!data?.ownerIdDocument) missing.push("• Upload owner ID document");
      if (!data?.incorporationCertificate) missing.push("• Upload incorporation certificate");
      if (!data?.msmeUdyamCertificate) missing.push("• Upload MSME/Udyam certificate");
      if (!data?.businessAddressProof) missing.push("• Upload business address proof");

      // Step 2: Export Eligibility
      if (!data?.iecCode?.trim()) missing.push("• Add IEC code");
      if (!data?.iecCertificate) missing.push("• Upload IEC certificate");
      if (!data?.tradeLicense) missing.push("• Upload trade license");
      if (!data?.apedaRegistrationNumber?.trim()) missing.push("• Add APEDA registration number");
      if (!data?.apedaCertificate) missing.push("• Upload APEDA certificate");
      if (!data?.spicesBoardRegistrationNumber?.trim()) missing.push("• Add Spices Board registration number");
      if (!data?.spicesBoardCertificate) missing.push("• Upload Spices Board certificate");
      if (!data?.bankAccountHolderName?.trim()) missing.push("• Add bank account holder name");
      if (!data?.bankAccountNumber?.trim()) missing.push("• Add bank account number");
      if (!data?.bankIfscCode?.trim()) missing.push("• Add bank IFSC code");
      if (!data?.bankProofDocument) missing.push("• Upload bank proof document");

      // Step 3: Food & Safety
      if (!data?.fssaiLicenseNumber?.trim()) missing.push("• Add FSSAI license number");
      if (!data?.fssaiCertificate) missing.push("• Upload FSSAI certificate");

      // Step 4: Shipping & Logistics
      if (!data?.shippingType?.trim()) missing.push("• Select shipping type");
      if (!Array.isArray(data?.serviceAreas) || data.serviceAreas.length === 0) missing.push("• Add service areas");
      if (!data?.returnPolicy?.trim()) missing.push("• Add return policy");

      return missing;
    } catch {
      return ["• Error calculating missing fields"];
    }
  };

  return (
    <div className="bg-white border border-stone-200 shadow-sm mb-8">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-manrope font-medium text-yogreet-charcoal">
              Documents Completion
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
            <p>Complete your documents to enable exports:</p>
            <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
              {getMissingFields().map((field, index) => (
                <div key={index} className="font-inter text-red-600">{field}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


