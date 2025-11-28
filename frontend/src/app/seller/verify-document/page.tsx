"use client";

import { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { Check, FileText, MapPin, Settings, Save, Truck } from "lucide-react";
import PageHero from "@/components/shared/PageHero";
import ConfirmationModal from "@/components/shared/ConfirmationModal";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Step1BusinessIdentity from "./components/step1-business-identity";
import Step2ExportEligibility from "./components/step2-export-eligibility";
import Step3FoodSafetyCompliance from "./components/step3-food-safety-compliance";
import Step4ShippingLogistics from "./components/step4-shipping-logistics";
import Step4ExportDocsShipment from "./components/step4-export-docs-shipment";
import { useGetSellerVerificationQuery, useUpdateSellerVerificationMutation, useGetSellerQuery } from "@/services/api/sellerApi";
import { useAuth } from "@/hooks/useAuth";
// documentCompletion is calculated on backend, no need to import calculateDocumentCompletion

type CacheResponse<T> = { source: "cache" | "api"; data: T };

interface SellerVerificationData {
  // Step 1: Business Identity Verification
  panNumber: string;
  gstNumber: string;
  ownerIdDocument?: string;
  incorporationCertificate?: string;
  msmeUdyamCertificate?: string;
  businessAddressProof?: string;
  aadharNumber?: string;

  // Step 2: Export Eligibility Verification
  iecCode: string;
  iecCertificate?: string;
  apedaRegistrationNumber: string;
  apedaCertificate?: string;
  spicesBoardRegistrationNumber: string;
  spicesBoardCertificate?: string;
  tradeLicense?: string;
  bankAccountHolderName: string; // Merged from bankAccountName and bankAccountHolderName
  bankAccountNumber: string; // Merged from accountNumber and bankAccountNumber
  bankIfscCode: string; // Merged from ifscCode and bankIfscCode
  bankProofDocument?: string;

  // Step 3: Food & Safety Compliance
  fssaiLicenseNumber: string;
  fssaiCertificate?: string;

  // Step 4: Shipping & Logistics
  shippingType: string;
  serviceAreas: string[];
  returnPolicy: string;

  // Step 5: Export Documentation & Shipment Capability
  certificateOfOriginCapability: boolean;
  phytosanitaryCertificateCapability: boolean;
  packagingCompliance: boolean;
  fumigationCertificateCapability: boolean;
  exportLogisticsPrepared: boolean;

  profileProgress?: number;
}

function SellerVerifyDocumentPageContent() {
  const [step, setStep] = useState(1);
  const formRef = useRef<HTMLDivElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | File[]>>({});
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  
  // Handle verification status from email verification redirect
  useEffect(() => {
    const verified = searchParams?.get("verified");
    const alreadyVerified = searchParams?.get("alreadyVerified");
    const error = searchParams?.get("error");
    
    if (verified === "true") {
      if (alreadyVerified === "true") {
        toast.success("Your email is already verified! Please complete your document verification.");
      } else {
        toast.success("Email verified successfully! Please complete your document verification.");
      }
      // Clean URL by removing query params
      if (typeof window !== "undefined") {
        window.history.replaceState({}, "", window.location.pathname);
      }
    } else if (error) {
      toast.error(decodeURIComponent(error));
      // Clean URL by removing query params
      if (typeof window !== "undefined") {
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, [searchParams]);

  const { isAuthenticated } = useAuth("seller");
  // Fetch both seller profile and verification data to get all available fields
  const { data: rawSellerData } = useGetSellerQuery(undefined, {
    skip: !isAuthenticated,
  });
  const { data: rawVerificationData, isLoading, isError: fetchError, refetch } = useGetSellerVerificationQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [updateSellerVerification, { isLoading: isUpdating }] = useUpdateSellerVerificationMutation();
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingAndNext, setIsSavingAndNext] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Combine seller profile and verification data
  const sellerData = useMemo(() => {
    const profileData = rawSellerData && typeof rawSellerData === "object" && "source" in rawSellerData && "data" in rawSellerData
      ? (rawSellerData as CacheResponse<any>).data
      : rawSellerData;
    
    const verificationData = rawVerificationData && typeof rawVerificationData === "object" && "source" in rawVerificationData && "data" in rawVerificationData
      ? (rawVerificationData as CacheResponse<any>).data
      : rawVerificationData;
    
    // Merge profile and verification data, prioritizing verification data for overlapping fields
    return { ...profileData, ...verificationData };
  }, [rawSellerData, rawVerificationData]);

  const [data, setData] = useState<SellerVerificationData>({
    // Step 1: Business Identity Verification
    panNumber: "",
    gstNumber: "",
    ownerIdDocument: "",
    incorporationCertificate: "",
    msmeUdyamCertificate: "",
    businessAddressProof: "",
    aadharNumber: "",
    // Step 2: Export Eligibility Verification
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
    // Step 3: Food & Safety Compliance
    fssaiLicenseNumber: "",
    fssaiCertificate: "",
    // Step 4: Shipping & Logistics
    shippingType: "",
    serviceAreas: [],
    returnPolicy: "",
    // Step 5: Export Documentation & Shipment Capability
    certificateOfOriginCapability: false,
    phytosanitaryCertificateCapability: false,
    packagingCompliance: false,
    fumigationCertificateCapability: false,
    exportLogisticsPrepared: false,
    profileProgress: 0,
  });

  const [originalData, setOriginalData] = useState<SellerVerificationData | null>(null);

  // Utils for change detection
  const arraysEqual = (a?: any[], b?: any[]) => {
    const aa = Array.isArray(a) ? a : [];
    const bb = Array.isArray(b) ? b : [];
    if (aa.length !== bb.length) return false;
    for (let i = 0; i < aa.length; i++) {
      if (aa[i] !== bb[i]) return false;
    }
    return true;
  };

  const hasChangesForStep = (currentStep: number): boolean => {
    if (!originalData) return true;
    if (currentStep === 1) {
      return !(
        (data.panNumber || "") === (originalData.panNumber || "") &&
        (data.gstNumber || "") === (originalData.gstNumber || "") &&
        (data.ownerIdDocument || "") === (originalData.ownerIdDocument || "") &&
        (data.incorporationCertificate || "") === (originalData.incorporationCertificate || "") &&
        (data.msmeUdyamCertificate || "") === (originalData.msmeUdyamCertificate || "") &&
        (data.businessAddressProof || "") === (originalData.businessAddressProof || "") &&
        (data.aadharNumber || "") === (originalData.aadharNumber || "")
      );
    }
    if (currentStep === 2) {
      return !(
        (data.iecCode || "") === (originalData.iecCode || "") &&
        (data.apedaRegistrationNumber || "") === (originalData.apedaRegistrationNumber || "") &&
        (data.spicesBoardRegistrationNumber || "") === (originalData.spicesBoardRegistrationNumber || "") &&
        (data.bankAccountHolderName || "") === (originalData.bankAccountHolderName || "") &&
        (data.bankAccountNumber || "") === (originalData.bankAccountNumber || "") &&
        (data.bankIfscCode || "") === (originalData.bankIfscCode || "") &&
        // Document URL fields diffs
        (data.iecCertificate || "") === (originalData.iecCertificate || "") &&
        (data.apedaCertificate || "") === (originalData.apedaCertificate || "") &&
        (data.spicesBoardCertificate || "") === (originalData.spicesBoardCertificate || "") &&
        (data.tradeLicense || "") === (originalData.tradeLicense || "") &&
        (data.bankProofDocument || "") === (originalData.bankProofDocument || "")
      );
    }
    if (currentStep === 3) {
      return !(
        (data.fssaiLicenseNumber || "") === (originalData.fssaiLicenseNumber || "") &&
        // Document URL fields diffs
        (data.fssaiCertificate || "") === (originalData.fssaiCertificate || "")
      );
    }
    if (currentStep === 4) {
      return !(
        (data.shippingType || "") === (originalData.shippingType || "") &&
        arraysEqual(data.serviceAreas, originalData.serviceAreas) &&
        (data.returnPolicy || "") === (originalData.returnPolicy || "")
      );
    }
    if (currentStep === 5) {
      return !(
        data.certificateOfOriginCapability === originalData.certificateOfOriginCapability &&
        data.phytosanitaryCertificateCapability === originalData.phytosanitaryCertificateCapability &&
        data.packagingCompliance === originalData.packagingCompliance &&
        data.fumigationCertificateCapability === originalData.fumigationCertificateCapability &&
        data.exportLogisticsPrepared === originalData.exportLogisticsPrepared
      );
    }
    return true;
  };

  // URL sync: /seller/verify-document/[1-5]
  useEffect(() => {
    if (!pathname) return;
    const parts = pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    const n = Number(last);
    if (!Number.isNaN(n) && n >= 1 && n <= 5) setStep(n);
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

  // Load data (if available) - combines profile and verification data - only load once when data first becomes available
  useEffect(() => {
    if (sellerData && !originalData) {
      try {
        const loaded: SellerVerificationData = {
          // Step 1: Business Identity Verification
          panNumber: sellerData.panNumber || "",
          gstNumber: sellerData.gstNumber || "",
          ownerIdDocument: sellerData.ownerIdDocument || "",
          incorporationCertificate: sellerData.incorporationCertificate || "",
          msmeUdyamCertificate: sellerData.msmeUdyamCertificate || "",
          businessAddressProof: sellerData.businessAddressProof || "",
          aadharNumber: sellerData.aadharNumber || "",
          // Step 2: Export Eligibility Verification
          iecCode: sellerData.iecCode || "",
          iecCertificate: sellerData.iecCertificate || "",
          apedaRegistrationNumber: sellerData.apedaRegistrationNumber || "",
          apedaCertificate: sellerData.apedaCertificate || "",
          spicesBoardRegistrationNumber: sellerData.spicesBoardRegistrationNumber || "",
          spicesBoardCertificate: sellerData.spicesBoardCertificate || "",
          tradeLicense: sellerData.tradeLicense || "",
          bankAccountHolderName: sellerData.bankAccountHolderName || (sellerData as any).bankAccountName || "", // Merged from bankAccountName and bankAccountHolderName
          bankAccountNumber: sellerData.bankAccountNumber || (sellerData as any).accountNumber || "", // Merged from accountNumber and bankAccountNumber
          bankIfscCode: sellerData.bankIfscCode || (sellerData as any).ifscCode || "", // Merged from ifscCode and bankIfscCode
          bankProofDocument: sellerData.bankProofDocument || "",
          // Step 3: Food & Safety Compliance
          fssaiLicenseNumber: sellerData.fssaiLicenseNumber || "",
          fssaiCertificate: sellerData.fssaiCertificate || "",
          // Step 4: Shipping & Logistics
          shippingType: sellerData.shippingType || "",
          serviceAreas: Array.isArray(sellerData.serviceAreas) ? sellerData.serviceAreas : [],
          returnPolicy: sellerData.returnPolicy || "",
          // Step 5: Export Documentation & Shipment Capability
          certificateOfOriginCapability: sellerData.certificateOfOriginCapability === true || sellerData.certificateOfOriginCapability === "true",
          phytosanitaryCertificateCapability: sellerData.phytosanitaryCertificateCapability === true || sellerData.phytosanitaryCertificateCapability === "true",
          packagingCompliance: sellerData.packagingCompliance === true || sellerData.packagingCompliance === "true",
          fumigationCertificateCapability: sellerData.fumigationCertificateCapability === true || sellerData.fumigationCertificateCapability === "true",
          exportLogisticsPrepared: sellerData.exportLogisticsPrepared === true || sellerData.exportLogisticsPrepared === "true",
          profileProgress: 0,
        };
        setData(loaded);
        setOriginalData(loaded);
      } catch (err) {
        console.error("Error loading seller verification data:", err);
        toast.error("Failed to load data. Please refresh the page.");
      }
    }
  }, [sellerData, originalData]);

  const updateData = (updates: Partial<SellerVerificationData>) => {
    try {
      setData((prev) => ({ ...prev, ...updates }));
    } catch (error) {
      console.error("Failed to update data:", error);
      toast.error("Failed to update data");
    }
  };

  const saveStep1Data = async (): Promise<boolean> => {
    try {
      const formData = new FormData();
      const step1Files: string[] = [];
      
      // Append files for step 1
      if (uploadedFiles.incorporationCertificate) {
        formData.append("incorporationCertificate", uploadedFiles.incorporationCertificate as File);
        step1Files.push("incorporationCertificate");
      }
      if (uploadedFiles.msmeUdyamCertificate) {
        formData.append("msmeUdyamCertificate", uploadedFiles.msmeUdyamCertificate as File);
        step1Files.push("msmeUdyamCertificate");
      }
      if (uploadedFiles.businessAddressProof) {
        formData.append("businessAddressProof", uploadedFiles.businessAddressProof as File);
        step1Files.push("businessAddressProof");
      }
      if (uploadedFiles.ownerIdDocument) {
        formData.append("ownerIdDocument", uploadedFiles.ownerIdDocument as File);
        step1Files.push("ownerIdDocument");
      }

      // Prepare step 1 payload
      const payload: any = {
        panNumber: data.panNumber || "",
        gstNumber: data.gstNumber || "",
        aadharNumber: data.aadharNumber || "",
        // Always include document URL fields, so clearing "" persists removal (when no new file)
        incorporationCertificate: data.incorporationCertificate || "",
        msmeUdyamCertificate: data.msmeUdyamCertificate || "",
        businessAddressProof: data.businessAddressProof || "",
        ownerIdDocument: data.ownerIdDocument || "",
      };

      // documentCompletion is calculated on backend automatically

      // If a file is being uploaded for any of these, the uploaded file will override the URL on backend

      if (step1Files.length > 0) {
        Object.keys(payload).forEach(key => {
          const value = payload[key];
          if (value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
        });
        await updateSellerVerification(formData).unwrap();
      } else {
        await updateSellerVerification(payload).unwrap();
      }

      toast.success("Step 1 data saved successfully!");
      return true;
    } catch (err: any) {
      console.error("Failed to save Step 1 data:", err);
      toast.error(err?.data?.error || err?.data?.message || "Failed to save Step 1 data");
      return false;
    }
  };

  const saveStep2Data = async (): Promise<boolean> => {
    try {
      const formData = new FormData();
      const step2Files: string[] = [];
      
      // Append files for step 2
      if (uploadedFiles.iecCertificate) {
        formData.append("iecCertificate", uploadedFiles.iecCertificate as File);
        step2Files.push("iecCertificate");
      }
      if (uploadedFiles.apedaCertificate) {
        formData.append("apedaCertificate", uploadedFiles.apedaCertificate as File);
        step2Files.push("apedaCertificate");
      }
      if (uploadedFiles.spicesBoardCertificate) {
        formData.append("spicesBoardCertificate", uploadedFiles.spicesBoardCertificate as File);
        step2Files.push("spicesBoardCertificate");
      }
      if (uploadedFiles.tradeLicense) {
        formData.append("tradeLicense", uploadedFiles.tradeLicense as File);
        step2Files.push("tradeLicense");
      }
      if (uploadedFiles.bankProofDocument) {
        formData.append("bankProofDocument", uploadedFiles.bankProofDocument as File);
        step2Files.push("bankProofDocument");
      }

      // Prepare step 2 payload
      const payload: any = {
        iecCode: data.iecCode,
        apedaRegistrationNumber: data.apedaRegistrationNumber || "",
        spicesBoardRegistrationNumber: data.spicesBoardRegistrationNumber || "",
        bankAccountHolderName: data.bankAccountHolderName,
        bankAccountNumber: data.bankAccountNumber,
        bankIfscCode: data.bankIfscCode,
        // Always include document URL fields so "" clears on backend when no new file
        iecCertificate: data.iecCertificate || "",
        apedaCertificate: data.apedaCertificate || "",
        spicesBoardCertificate: data.spicesBoardCertificate || "",
        tradeLicense: data.tradeLicense || "",
        bankProofDocument: data.bankProofDocument || "",
      };

      // documentCompletion is calculated on backend automatically

      if (step2Files.length > 0) {
        Object.keys(payload).forEach(key => {
          const value = payload[key];
          if (value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
        });
        await updateSellerVerification(formData).unwrap();
      } else {
        await updateSellerVerification(payload).unwrap();
      }

      toast.success("Step 2 data saved successfully!");
      return true;
    } catch (err: any) {
      console.error("Failed to save Step 2 data:", err);
      toast.error(err?.data?.error || err?.data?.message || "Failed to save Step 2 data");
      return false;
    }
  };

  const saveStep3Data = async (): Promise<boolean> => {
    try {
      const formData = new FormData();
      const step3Files: string[] = [];
      
      // Append files for step 3
      if (uploadedFiles.fssaiCertificate) {
        formData.append("fssaiCertificate", uploadedFiles.fssaiCertificate as File);
        step3Files.push("fssaiCertificate");
      }

      // Prepare step 3 payload
      const payload: any = {
        fssaiLicenseNumber: data.fssaiLicenseNumber,
        // Always include document URL fields so "" clears on backend when no new file
        fssaiCertificate: data.fssaiCertificate || "",
      };

      // documentCompletion is calculated on backend automatically

      if (step3Files.length > 0) {
        Object.keys(payload).forEach(key => {
          const value = payload[key];
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              formData.append(key, JSON.stringify(value));
            } else if (typeof value === 'boolean') {
              formData.append(key, String(value));
            } else {
              formData.append(key, String(value));
            }
          }
        });
        await updateSellerVerification(formData).unwrap();
      } else {
        await updateSellerVerification(payload).unwrap();
      }

      toast.success("Step 3 data saved successfully!");
      return true;
    } catch (err: any) {
      console.error("Failed to save Step 3 data:", err);
      toast.error(err?.data?.error || err?.data?.message || "Failed to save Step 3 data");
      return false;
    }
  };

  const saveStep4Data = async (): Promise<boolean> => {
    try {
      const payload: any = {
        shippingType: data.shippingType,
        serviceAreas: data.serviceAreas,
        returnPolicy: data.returnPolicy,
      };
      // documentCompletion is calculated on backend automatically
      await updateSellerVerification(payload).unwrap();
      toast.success("Step 4 data saved successfully!");
      return true;
    } catch (err: any) {
      console.error("Failed to save Step 4 data:", err);
      toast.error(err?.data?.error || err?.data?.message || "Failed to save Step 4 data");
      return false;
    }
  };

  const saveStep5Data = async (): Promise<boolean> => {
    try {
      const payload: any = {
        certificateOfOriginCapability: data.certificateOfOriginCapability,
        phytosanitaryCertificateCapability: data.phytosanitaryCertificateCapability,
        packagingCompliance: data.packagingCompliance,
        fumigationCertificateCapability: data.fumigationCertificateCapability,
        exportLogisticsPrepared: data.exportLogisticsPrepared,
      };
      // documentCompletion is calculated on backend automatically
      await updateSellerVerification(payload).unwrap();
      toast.success("Step 5 data saved successfully!");
      return true;
    } catch (err: any) {
      console.error("Failed to save Step 5 data:", err);
      toast.error(err?.data?.error || err?.data?.message || "Failed to save Step 5 data");
      return false;
    }
  };

  const handleSave = async () => {
    let saved = false;
    if (step === 1) {
      saved = await saveStep1Data();
    } else if (step === 2) {
      saved = await saveStep2Data();
    } else if (step === 3) {
      saved = await saveStep3Data();
    } else if (step === 4) {
      saved = await saveStep4Data();
    } else if (step === 5) {
      saved = await saveStep5Data();
    }
    return saved;
  };

  const handleSaveAndNext = async () => {
    if (step >= 5) return;
    // If there are uploads or data changes, save first; otherwise just go next
    const hasUploads = Object.keys(uploadedFiles).length > 0;
    const changed = hasChangesForStep(step);
    if (hasUploads || changed) {
      const saved = await handleSave();
      if (!saved) return;
    }
    const next = step + 1;
    setStep(next);
    router.push(`/seller/verify-document/${next}`);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const nextStep = () => {
    if (step < 5) {
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
    <Truck key="4" className="w-4 h-4 sm:w-6 sm:h-6" />, // Shipping & Logistics
    <Check key="5" className="w-4 h-4 sm:w-6 sm:h-6" />, // Export Docs & Shipment
  ];

  const stepTitles = [
    "Business Identity Verification",
    "Export Eligibility Verification",
    "Food & Safety Compliance",
    "Shipping & Logistics",
    "Export Documentation & Shipment Capability",
  ];

  const handleSubmit = async () => {
    try {
      // Prepare FormData if there are uploaded files
      const formData = new FormData();
      const hasFiles = Object.keys(uploadedFiles).length > 0;

      // Append all uploaded files
      Object.keys(uploadedFiles).forEach(key => {
        const file = uploadedFiles[key];
        if (file instanceof File) {
          formData.append(key, file);
        } else if (Array.isArray(file) && file.length > 0) {
          file.forEach(f => formData.append(key, f));
        }
      });

      // Prepare verification payload
      const payload: any = {
        // Step 1: Business Identity Verification
        panNumber: data.panNumber,
        gstNumber: data.gstNumber,
        aadharNumber: data.aadharNumber || "",
        // Step 2: Export Eligibility Verification
        iecCode: data.iecCode,
        apedaRegistrationNumber: data.apedaRegistrationNumber,
        spicesBoardRegistrationNumber: data.spicesBoardRegistrationNumber,
        tradeLicense: data.tradeLicense,
        bankAccountHolderName: data.bankAccountHolderName || (data as any).bankAccountName, // Merged fields
        bankAccountNumber: data.bankAccountNumber || (data as any).accountNumber, // Merged fields
        bankIfscCode: data.bankIfscCode || (data as any).ifscCode, // Merged fields
        fssaiLicenseNumber: data.fssaiLicenseNumber,
        certificateOfOriginCapability: data.certificateOfOriginCapability || false,
        phytosanitaryCertificateCapability: data.phytosanitaryCertificateCapability || false,
        packagingCompliance: data.packagingCompliance || false,
        fumigationCertificateCapability: data.fumigationCertificateCapability || false,
        exportLogisticsPrepared: data.exportLogisticsPrepared || false,
        // Shipping moved here
        shippingType: data.shippingType || "",
        serviceAreas: data.serviceAreas || [],
        returnPolicy: data.returnPolicy || "",
        verificationStatus: "pending",
      };

      // documentCompletion is calculated on backend automatically

      // Add certificate URLs if they exist in data (from previous uploads)
      if (data.incorporationCertificate && !uploadedFiles.incorporationCertificate) {
        payload.incorporationCertificate = data.incorporationCertificate;
      }
      if (data.msmeUdyamCertificate && !uploadedFiles.msmeUdyamCertificate) {
        payload.msmeUdyamCertificate = data.msmeUdyamCertificate;
      }
      if (data.businessAddressProof && !uploadedFiles.businessAddressProof) {
        payload.businessAddressProof = data.businessAddressProof;
      }
      if (data.ownerIdDocument && !uploadedFiles.ownerIdDocument) {
        payload.ownerIdDocument = data.ownerIdDocument;
      }
      if (data.iecCertificate && !uploadedFiles.iecCertificate) {
        payload.iecCertificate = data.iecCertificate;
      }
      if (data.apedaCertificate && !uploadedFiles.apedaCertificate) {
        payload.apedaCertificate = data.apedaCertificate;
      }
      if (data.spicesBoardCertificate && !uploadedFiles.spicesBoardCertificate) {
        payload.spicesBoardCertificate = data.spicesBoardCertificate;
      }
      if (data.tradeLicense && !uploadedFiles.tradeLicense) {
        payload.tradeLicense = data.tradeLicense;
      }
      if (data.bankProofDocument && !uploadedFiles.bankProofDocument) {
        payload.bankProofDocument = data.bankProofDocument;
      }
      if (data.fssaiCertificate && !uploadedFiles.fssaiCertificate) {
        payload.fssaiCertificate = data.fssaiCertificate;
      }

      // Use FormData if there are files, otherwise use JSON
      if (hasFiles) {
        Object.keys(payload).forEach(key => {
          const value = payload[key];
          if (value !== undefined && value !== null) {
            if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
              formData.append(key, JSON.stringify(value));
            } else if (Array.isArray(value)) {
              formData.append(key, JSON.stringify(value));
            } else if (typeof value === 'boolean') {
              formData.append(key, String(value));
            } else {
              formData.append(key, String(value));
            }
          }
        });
        await updateSellerVerification(formData).unwrap();
      } else {
        await updateSellerVerification(payload).unwrap();
      }

      toast.success("Submitted for verification!");
      router.push("/seller/documents");
    } catch (err: any) {
      console.error("Submit failed:", err);
      toast.error(err?.data?.error || err?.data?.message || "Failed to submit. Please try again.");
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
                style={{ width: `${((step - 1) / 4) * 100}%` }}
              ></div>
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setStep(i);
                  router.push(`/seller/verify-document/${i}`);
                  setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
                }}
                className={`flex flex-col items-center relative z-10 cursor-pointer focus:outline-none ${
                  i <= step ? "text-yogreet-sage" : "text-stone-400"
                }`}
                aria-label={`Go to ${stepTitles[i - 1]}`}
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
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-stone-200 p-4 sm:p-6 md:p-8 shadow-sm rounded-md">
          {step === 1 && (
            <Step1BusinessIdentity data={data as any} updateData={updateData} setUploadedFiles={handleSetUploadedFiles} isLoading={isUpdating} />
          )}
          {step === 2 && (
            <Step2ExportEligibility data={data} updateData={updateData} setUploadedFiles={handleSetUploadedFiles} isLoading={isUpdating} />
          )}
          {step === 3 && (
            <Step3FoodSafetyCompliance data={data} updateData={updateData} setUploadedFiles={handleSetUploadedFiles} isLoading={isUpdating} />
          )}
          {step === 4 && (
            <Step4ShippingLogistics
              data={data}
              updateData={updateData}
            />
          )}
          {step === 5 && (
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
            {step < 5 ? (
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  onClick={async () => {
                    try {
                      setIsSaving(true);
                      await handleSave();
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  disabled={isUpdating || isSaving || isSavingAndNext || isSubmitting}
                  className="px-6 py-2 border border-yogreet-sage text-yogreet-sage cursor-pointer rounded-md hover:bg-yogreet-sage/10 transition-colors w-full sm:w-auto disabled:opacity-50"
                >
                  <Save className="w-4 h-4 inline mr-2" />
                  {isSaving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={async () => {
                    try {
                      setIsSavingAndNext(true);
                      await handleSaveAndNext();
                    } finally {
                      setIsSavingAndNext(false);
                    }
                  }}
                  disabled={isUpdating || isSaving || isSavingAndNext || isSubmitting}
                  className="px-6 py-2 bg-yogreet-sage text-white cursor-pointer rounded-md hover:bg-yogreet-sage/90 transition-colors w-full sm:w-auto disabled:opacity-50"
                >
                  {isSavingAndNext ? "Saving..." : "Save and Next"}
                </button>
              </div>
            ) : (
              <button
                onClick={async () => {
                  try {
                    setIsSubmitting(true);
                    await handleSubmit();
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                disabled={isUpdating || isSaving || isSavingAndNext || isSubmitting}
                className="px-6 py-2 bg-yogreet-sage text-white rounded-md hover:bg-yogreet-sage/90 transition-colors flex items-center justify-center sm:justify-start w-full sm:w-auto disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting || isUpdating ? "Submitting..." : "Go to Documents"}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function SellerVerifyDocumentPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-white">
        <PageHero 
          title="Verify Document" 
          subtitle="Complete your verification"
          description=""
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">Loading...</div>
        </div>
      </main>
    }>
      <SellerVerifyDocumentPageContent />
    </Suspense>
  );
}


