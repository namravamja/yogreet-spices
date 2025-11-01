"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, FileText, MapPin, Settings, Save } from "lucide-react";
import PageHero from "@/components/shared/PageHero";
import ConfirmationModal from "@/components/shared/ConfirmationModal";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Step1BusinessIdentity from "./components/step1-business-identity";
import Step2ExportEligibility from "./components/step2-export-eligibility";
import Step3FoodSafetyCompliance from "./components/step3-food-safety-compliance";
import Step4ExportDocsShipment from "./components/step4-export-docs-shipment";

type CacheResponse<T> = { source: "cache" | "api"; data: T };

interface SellerVerificationData {
  // Step 1: Business Identity Verification
  companyName: string;
  businessType: string;
  incorporationCertificate?: string;
  msmeUdyamCertificate?: string;
  panNumber: string;
  gstNumber: string;
  businessAddress: string;
  businessAddressProof?: string;
  ownerFullName: string;
  ownerIdDocument?: string;
  ownerIdNumber: string;

  // Step 2: Export Eligibility Verification
  iecCode: string;
  iecCertificate?: string;
  apedaRegistrationNumber: string;
  apedaCertificate?: string;
  spicesBoardRegistrationNumber: string;
  spicesBoardCertificate?: string;
  tradeLicense?: string;
  bankAccountHolderName: string;
  bankAccountNumber: string;
  bankIfscCode: string;
  bankProofDocument?: string;

  // Step 3: Food & Safety Compliance
  fssaiLicenseNumber: string;
  fssaiCertificate?: string;
  foodQualityCertifications?: string[]; // multiple optional
  labTestingCapability: boolean;
  sampleLabTestCertificate?: string; // optional

  // Step 4: Export Documentation & Shipment Capability
  certificateOfOriginCapability: boolean;
  phytosanitaryCertificateCapability: boolean;
  packagingCompliance: boolean;
  fumigationCertificateCapability: boolean;
  exportLogisticsPrepared: boolean;

  profileProgress?: number;
}

export default function SellerVerifyDocumentPage() {
  const [step, setStep] = useState(1);
  const formRef = useRef<HTMLDivElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | File[]>>({});
  const router = useRouter();
  const pathname = usePathname();
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);

  // Stubbed API flags (align with buyer implementation pattern)
  const isLoading = false;
  const isUpdating = false;

  const refetch = () => {};
  const rawData: any = null;
  const fetchError: any = null;

  const updateSeller = (_payload: any) => ({
    unwrap: async () => {
      await new Promise((r) => setTimeout(r, 50));
    },
  });

  const sellerData = useMemo(() => {
    if (!rawData) return null;
    if (rawData && typeof rawData === "object" && "source" in rawData && "data" in rawData) {
      const cacheResponse = rawData as CacheResponse<any>;
      return cacheResponse.data;
    }
    return rawData;
  }, [rawData]);

  const [data, setData] = useState<SellerVerificationData>({
    companyName: "",
    businessType: "",
    incorporationCertificate: "",
    msmeUdyamCertificate: "",
    panNumber: "",
    gstNumber: "",
    businessAddress: "",
    businessAddressProof: "",
    ownerFullName: "",
    ownerIdDocument: "",
    ownerIdNumber: "",
    iecCode: "",
    iecCertificate: "",
    apedaRegistrationNumber: "",
    apedaCertificate: "",
    spicesBoardRegistrationNumber: "",
    spicesBoardCertificate: "",
    tradeLicense: "",
    bankAccountHolderName: "",
    bankAccountNumber: "",
    bankIfscCode: "",
    bankProofDocument: "",
    fssaiLicenseNumber: "",
    fssaiCertificate: "",
    foodQualityCertifications: [],
    labTestingCapability: false,
    sampleLabTestCertificate: "",
    certificateOfOriginCapability: false,
    phytosanitaryCertificateCapability: false,
    packagingCompliance: false,
    fumigationCertificateCapability: false,
    exportLogisticsPrepared: false,
    profileProgress: 0,
  });

  const [originalData, setOriginalData] = useState<SellerVerificationData | null>(null);

  // URL sync: /seller/verify-document/[1-4]
  useEffect(() => {
    if (!pathname) return;
    const parts = pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    const n = Number(last);
    if (!Number.isNaN(n) && n >= 1 && n <= 4) setStep(n);
  }, [pathname]);

  // After signup prompt
  useEffect(() => {
    try {
      const flag = typeof window !== "undefined" && localStorage.getItem("yg_just_signed_up");
      if (flag === "1") {
        setShowSignupPrompt(true);
        localStorage.removeItem("yg_just_signed_up");
      }
    } catch {}
  }, []);

  // Load data (if available)
  useEffect(() => {
    if (sellerData) {
      try {
        const loaded = { ...sellerData } as SellerVerificationData;
        setData(loaded);
        setOriginalData(loaded);
      } catch (err) {
        console.error("Error loading seller verification data:", err);
        toast.error("Failed to load data. Please refresh the page.");
      }
    }
  }, [sellerData]);

  const updateData = (updates: Partial<SellerVerificationData>) => {
    try {
      setData((prev) => ({ ...prev, ...updates }));
    } catch (error) {
      console.error("Failed to update data:", error);
      toast.error("Failed to update data");
    }
  };

  const nextStep = () => {
    if (step < 4) {
      const next = step + 1;
      setStep(next);
      router.push(`/seller/verify-document/${next}`);
      setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      const prev = step - 1;
      setStep(prev);
      router.push(`/seller/verify-document/${prev}`);
      setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  };

  const stepIcons = [
    <FileText key="1" className="w-4 h-4 sm:w-6 sm:h-6" />, // Business Identity
    <MapPin key="2" className="w-4 h-4 sm:w-6 sm:h-6" />, // Export Eligibility
    <Settings key="3" className="w-4 h-4 sm:w-6 sm:h-6" />, // Food & Safety
    <Check key="4" className="w-4 h-4 sm:w-6 sm:h-6" />, // Shipment Capability
  ];

  const stepTitles = [
    "Business Identity Verification",
    "Export Eligibility Verification",
    "Food & Safety Compliance",
    "Export Documentation & Shipment Capability",
  ];

  const handleSubmit = async () => {
    // Light validation: ensure essential fields are present across steps
    if (!data.companyName?.trim()) return toast.error("Company name is required");
    if (!data.businessType?.trim()) return toast.error("Business type is required");
    if (!data.panNumber?.trim()) return toast.error("PAN is required");
    if (!data.gstNumber?.trim()) return toast.error("GST is required");
    if (!data.ownerFullName?.trim()) return toast.error("Owner full name is required");
    if (!data.iecCode?.trim()) return toast.error("IEC code is required");
    if (!data.bankAccountHolderName?.trim()) return toast.error("Bank account holder name is required");
    if (!data.bankAccountNumber?.trim()) return toast.error("Bank account number is required");
    if (!data.bankIfscCode?.trim()) return toast.error("IFSC is required");

    try {
      await updateSeller({ ...data }).unwrap();
      toast.success("Submitted for verification!");
      router.push("/");
    } catch (err: any) {
      console.error("Submit failed:", err);
      toast.error("Failed to submit. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-stone-600">Loading seller verification...</div>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-lg text-red-600">Error loading data</div>
          <button
            onClick={() => {
              refetch();
              toast.error("Please refresh the page or contact support.");
            }}
            className="px-4 py-2 bg-yogreet-sage text-white rounded-md hover:bg-yogreet-sage/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const handleSetUploadedFiles = (
    files: Record<string, File | File[]> | ((prev: Record<string, File | File[]>) => Record<string, File | File[]>)
  ) => {
    if (typeof files === "function") {
      setUploadedFiles(files);
    } else {
      setUploadedFiles((prev) => ({ ...prev, ...files }));
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <ConfirmationModal
        isOpen={showSignupPrompt}
        onClose={() => setShowSignupPrompt(false)}
        title="Verify your seller documents"
        showActions={false}
      >
        <p className="text-sm text-stone-700">Please upload all required documents to start selling on Yogreet.</p>
      </ConfirmationModal>
      <PageHero
        title="Seller Verification"
        subtitle=""
        description="Complete the 4-step verification to start exporting."
        showBackButton={false}
        breadcrumb={{
          items: [
            { label: "Home", href: "/seller" },
            { label: "Verify Documents", isActive: true },
          ],
        }}
      />

      <div ref={formRef} className="container mx-auto max-w-7xl px-4 sm:px-6 pt-0 pb-6 sm:pb-8">
        <div className="mb-6 sm:mb-10">
          <div className="flex justify-between items-center relative isolate">
            <div className="absolute top-4 sm:top-6 left-0 right-0 h-0.5 bg-stone-200 z-0">
              <div
                className="h-full bg-yogreet-sage transition-all duration-300"
                style={{ width: `${((step - 1) / 3) * 100}%` }}
              ></div>
            </div>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`flex flex-col items-center relative z-10 ${
                  i <= step ? "text-yogreet-sage" : "text-stone-400"
                }`}
              >
                <div
                  className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-1 sm:mb-2 relative z-10 bg-white ${
                    i <= step
                      ? "text-yogreet-sage border-2 border-yogreet-sage"
                      : "text-stone-400 border-2 border-stone-300"
                  }`}
                >
                  {stepIcons[i - 1]}
                </div>
                <div
                  className={`text-xs font-medium text-center ${
                    i <= step ? "text-yogreet-sage" : "text-stone-400"
                  } hidden xs:block`}
                >
                  Step {i}
                </div>
                <div
                  className={`text-xs sm:text-sm font-medium text-center mt-1 ${
                    i <= step ? "text-yogreet-sage" : "text-stone-400"
                  } hidden md:block`}
                >
                  {stepTitles[i - 1]}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-stone-200 p-4 sm:p-6 md:p-8 shadow-sm rounded-md">
          {step === 1 && (
            <Step1BusinessIdentity data={data} updateData={updateData} setUploadedFiles={handleSetUploadedFiles} isLoading={isUpdating} />
          )}
          {step === 2 && (
            <Step2ExportEligibility data={data} updateData={updateData} setUploadedFiles={handleSetUploadedFiles} isLoading={isUpdating} />
          )}
          {step === 3 && (
            <Step3FoodSafetyCompliance data={data} updateData={updateData} setUploadedFiles={handleSetUploadedFiles} isLoading={isUpdating} />
          )}
          {step === 4 && (
            <Step4ExportDocsShipment
              data={data}
              updateData={updateData}
            />
          )}

          <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 mt-8 pt-6 border-t border-stone-200">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className="px-6 py-2 border border-stone-300 text-stone-700 rounded-md hover:bg-stone-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full cursor-pointer sm:w-auto"
            >
              Previous
            </button>
            {step < 4 ? (
              <button onClick={nextStep} className="px-6 py-2 bg-yogreet-sage text-white cursor-pointer rounded-md hover:bg-yogreet-sage/90 transition-colors w-full sm:w-auto">
                Next
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={isUpdating} className="px-6 py-2 bg-yogreet-sage text-white rounded-md hover:bg-yogreet-sage/90 transition-colors flex items-center justify-center sm:justify-start w-full sm:w-auto disabled:opacity-50">
                <Save className="w-4 h-4 mr-2" />
                {isUpdating ? "Submitting..." : "Submit for Review"}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}


