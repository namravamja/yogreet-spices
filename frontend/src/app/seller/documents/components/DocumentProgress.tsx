"use client";

interface SellerDocumentsData {
  // Step 1: Business Identity
  companyName?: string | null;
  businessType?: string | null;
  fullName?: string | null;
  ownerFullName?: string | null;
  panNumber?: string | null;
  gstNumber?: string | null;
  ownerIdDocument?: string | null;
  incorporationCertificate?: string | null;
  msmeUdyamCertificate?: string | null;
  businessAddressProof?: string | null;

  // Step 2: Export Eligibility
  iecCode?: string | null;
  iecCertificate?: string | null;
  tradeLicense?: string | null;
  apedaRegistrationNumber?: string | null;
  apedaCertificate?: string | null;
  spicesBoardRegistrationNumber?: string | null;
  spicesBoardCertificate?: string | null;
  bankAccountHolderName?: string | null;
  bankAccountNumber?: string | null;
  bankIfscCode?: string | null;
  bankProofDocument?: string | null;

  // Step 3: Food & Safety
  fssaiLicenseNumber?: string | null;
  fssaiCertificate?: string | null;

  // Step 4: Shipping & Logistics
  shippingType?: string | null;
  serviceAreas?: string[] | null;
  returnPolicy?: string | null;

  // Step 5: Export Documentation & Shipment Capability
  certificateOfOriginCapability?: boolean | null;
  phytosanitaryCertificateCapability?: boolean | null;
  packagingCompliance?: boolean | null;
  fumigationCertificateCapability?: boolean | null;
  exportLogisticsPrepared?: boolean | null;
}

interface DocumentProgressProps {
  data: SellerDocumentsData;
}

export default function DocumentProgress({ data }: DocumentProgressProps) {
  const calculateProgress = () => {
    try {
      let completed = 0;
      const total = 27; // Updated total after removing companyName, businessType, and fullName/ownerFullName (6+11+2+3+5)

      // Step 1: Business Identity (6 fields)
      if (data?.panNumber?.trim()) completed++;
      if (data?.gstNumber?.trim()) completed++;
      if (data?.ownerIdDocument) completed++;
      if (data?.incorporationCertificate) completed++;
      if (data?.msmeUdyamCertificate) completed++;
      if (data?.businessAddressProof) completed++;

      // Step 2: Export Eligibility (11 fields)
      if (data?.iecCode?.trim()) completed++;
      if (data?.iecCertificate) completed++;
      if (data?.tradeLicense) completed++;
      if (data?.apedaRegistrationNumber?.trim()) completed++;
      if (data?.apedaCertificate) completed++;
      if (data?.spicesBoardRegistrationNumber?.trim()) completed++;
      if (data?.spicesBoardCertificate) completed++;
      if (data?.bankAccountHolderName?.trim()) completed++;
      if (data?.bankAccountNumber?.trim()) completed++;
      if (data?.bankIfscCode?.trim()) completed++;
      if (data?.bankProofDocument) completed++;

      // Step 3: Food & Safety (2 fields)
      if (data?.fssaiLicenseNumber?.trim()) completed++;
      if (data?.fssaiCertificate) completed++;

      // Step 4: Shipping & Logistics (3 fields)
      if (data?.shippingType?.trim()) completed++;
      if (Array.isArray(data?.serviceAreas) && data.serviceAreas.length > 0) completed++;
      if (data?.returnPolicy?.trim()) completed++;

      // Step 5: Export Documentation & Shipment Capability (5 fields)
      if (data?.certificateOfOriginCapability) completed++;
      if (data?.phytosanitaryCertificateCapability) completed++;
      if (data?.packagingCompliance) completed++;
      if (data?.fumigationCertificateCapability) completed++;
      if (data?.exportLogisticsPrepared) completed++;

      return Math.round((completed / total) * 100);
    } catch {
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

      // Step 5: Export Documentation & Shipment Capability
      if (!data?.certificateOfOriginCapability) missing.push("• Enable certificate of origin capability");
      if (!data?.phytosanitaryCertificateCapability) missing.push("• Enable phytosanitary certificate capability");
      if (!data?.packagingCompliance) missing.push("• Enable packaging compliance");
      if (!data?.fumigationCertificateCapability) missing.push("• Enable fumigation certificate capability");
      if (!data?.exportLogisticsPrepared) missing.push("• Enable export logistics prepared");

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


