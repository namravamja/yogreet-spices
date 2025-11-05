"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, FileText, MapPin, Settings, Save } from "lucide-react";
import PageHero from "@/components/shared/PageHero";
import ConfirmationModal from "@/components/shared/ConfirmationModal";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import Step1BusinessIdentity from "./components/step1-business-identity";
import Step2ExportEligibility from "./components/step2-export-eligibility";
import Step3FoodSafetyCompliance from "./components/step3-food-safety-compliance";
import Step4ExportDocsShipment from "./components/step4-export-docs-shipment";
import { useGetSellerVerificationQuery, useUpdateSellerVerificationMutation, useGetSellerQuery } from "@/services/api/sellerApi";
import { useAuth } from "@/hooks/useAuth";

type CacheResponse<T> = { source: "cache" | "api"; data: T };

interface SellerVerificationData {
  // Step 1: Business Identity Verification
  companyName: string; // Merged from storeName and companyName
  businessType: string;
  incorporationCertificate?: string;
  msmeUdyamCertificate?: string;
  panNumber: string;
  gstNumber: string;
  businessAddress: string;
  businessAddressProof?: string;
  fullName: string; // Merged from fullName and ownerFullName (used as ownerFullName in form)
  ownerFullName?: string; // For backward compatibility, derived from fullName
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
  bankAccountHolderName: string; // Merged from bankAccountName and bankAccountHolderName
  bankAccountNumber: string; // Merged from accountNumber and bankAccountNumber
  bankIfscCode: string; // Merged from ifscCode and bankIfscCode
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
    companyName: "",
    businessType: "",
    incorporationCertificate: "",
    msmeUdyamCertificate: "",
    panNumber: "",
    gstNumber: "",
    businessAddress: "",
    businessAddressProof: "",
    fullName: "", // Merged from fullName and ownerFullName
    ownerFullName: "", // Backward compatibility
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

  // Load data (if available) - combines profile and verification data - only load once when data first becomes available
  useEffect(() => {
    if (sellerData && !originalData) {
      try {
        // Get business address from seller profile if available (businessAddress is an object in profile)
        const businessAddressStr = typeof sellerData.businessAddress === 'string' 
          ? sellerData.businessAddress 
          : sellerData.businessAddress?.street 
            ? `${sellerData.businessAddress.street}, ${sellerData.businessAddress.city || ''}, ${sellerData.businessAddress.state || ''}, ${sellerData.businessAddress.country || ''} ${sellerData.businessAddress.pinCode || ''}`.trim()
            : "";
        
        const loaded: SellerVerificationData = {
          companyName: sellerData.companyName || "",
          businessType: sellerData.businessType || "",
          incorporationCertificate: sellerData.incorporationCertificate || "",
          msmeUdyamCertificate: sellerData.msmeUdyamCertificate || "",
          panNumber: sellerData.panNumber || "",
          gstNumber: sellerData.gstNumber || "",
          businessAddress: businessAddressStr,
          businessAddressProof: sellerData.businessAddressProof || "",
          fullName: sellerData.fullName || "", // Merged from fullName and ownerFullName
          ownerFullName: sellerData.fullName || "", // Backward compatibility alias
          ownerIdDocument: sellerData.ownerIdDocument || "",
          ownerIdNumber: sellerData.ownerIdNumber || "",
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
          fssaiLicenseNumber: sellerData.fssaiLicenseNumber || "",
          fssaiCertificate: sellerData.fssaiCertificate || "",
          foodQualityCertifications: Array.isArray(sellerData.foodQualityCertifications) ? sellerData.foodQualityCertifications : [],
          labTestingCapability: sellerData.labTestingCapability === true || sellerData.labTestingCapability === "true",
          sampleLabTestCertificate: sellerData.sampleLabTestCertificate || "",
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
      if (!data.companyName?.trim()) {
        toast.error("Company name is required");
        return false;
      }
      if (!data.businessType?.trim()) {
        toast.error("Business type is required");
        return false;
      }

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
        companyName: data.companyName,
        businessType: data.businessType,
        panNumber: data.panNumber || "",
        gstNumber: data.gstNumber || "",
        businessAddress: data.businessAddress || "",
        fullName: data.fullName || data.ownerFullName || "",
        ownerFullName: data.fullName || data.ownerFullName || "",
        ownerIdNumber: data.ownerIdNumber || "",
      };

      // Add existing certificate URLs if no new files
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
      if (!data.iecCode?.trim()) {
        toast.error("IEC code is required");
        return false;
      }
      if (!data.bankAccountHolderName?.trim()) {
        toast.error("Bank account holder name is required");
        return false;
      }
      if (!data.bankAccountNumber?.trim()) {
        toast.error("Bank account number is required");
        return false;
      }
      if (!data.bankIfscCode?.trim()) {
        toast.error("IFSC code is required");
        return false;
      }

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
      };

      // Add existing certificate URLs if no new files
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
      if (!data.fssaiLicenseNumber?.trim()) {
        toast.error("FSSAI license number is required");
        return false;
      }

      const formData = new FormData();
      const step3Files: string[] = [];
      
      // Append files for step 3
      if (uploadedFiles.fssaiCertificate) {
        formData.append("fssaiCertificate", uploadedFiles.fssaiCertificate as File);
        step3Files.push("fssaiCertificate");
      }
      if (uploadedFiles.sampleLabTestCertificate) {
        formData.append("sampleLabTestCertificate", uploadedFiles.sampleLabTestCertificate as File);
        step3Files.push("sampleLabTestCertificate");
      }

      // Prepare step 3 payload
      const payload: any = {
        fssaiLicenseNumber: data.fssaiLicenseNumber,
        foodQualityCertifications: Array.isArray(data.foodQualityCertifications) ? data.foodQualityCertifications : [],
        labTestingCapability: data.labTestingCapability || false,
      };

      // Add existing certificate URLs if no new files
      if (data.fssaiCertificate && !uploadedFiles.fssaiCertificate) {
        payload.fssaiCertificate = data.fssaiCertificate;
      }
      if (data.sampleLabTestCertificate && !uploadedFiles.sampleLabTestCertificate) {
        payload.sampleLabTestCertificate = data.sampleLabTestCertificate;
      }

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

  const handleSave = async () => {
    let saved = false;
    if (step === 1) {
      saved = await saveStep1Data();
    } else if (step === 2) {
      saved = await saveStep2Data();
    } else if (step === 3) {
      saved = await saveStep3Data();
    }
    return saved;
  };

  const handleSaveAndNext = async () => {
    const saved = await handleSave();
    if (saved && step < 4) {
      const next = step + 1;
      setStep(next);
      router.push(`/seller/verify-document/${next}`);
      setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
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
    if (!data.fullName?.trim() && !data.ownerFullName?.trim()) return toast.error("Owner full name is required");
    if (!data.iecCode?.trim()) return toast.error("IEC code is required");
    if (!data.bankAccountHolderName?.trim()) return toast.error("Bank account holder name is required");
    if (!data.bankAccountNumber?.trim()) return toast.error("Bank account number is required");
    if (!data.bankIfscCode?.trim()) return toast.error("IFSC is required");

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
        companyName: data.companyName,
        businessType: data.businessType,
        panNumber: data.panNumber,
        gstNumber: data.gstNumber,
        businessAddress: data.businessAddress,
        fullName: data.fullName || data.ownerFullName || "", // Merged from fullName and ownerFullName
        ownerFullName: data.fullName || data.ownerFullName, // Backward compatibility
        ownerIdNumber: data.ownerIdNumber,
        iecCode: data.iecCode,
        apedaRegistrationNumber: data.apedaRegistrationNumber,
        spicesBoardRegistrationNumber: data.spicesBoardRegistrationNumber,
        tradeLicense: data.tradeLicense,
        bankAccountHolderName: data.bankAccountHolderName || (data as any).bankAccountName, // Merged fields
        bankAccountNumber: data.bankAccountNumber || (data as any).accountNumber, // Merged fields
        bankIfscCode: data.bankIfscCode || (data as any).ifscCode, // Merged fields
        fssaiLicenseNumber: data.fssaiLicenseNumber,
        foodQualityCertifications: data.foodQualityCertifications || [],
        labTestingCapability: data.labTestingCapability || false,
        certificateOfOriginCapability: data.certificateOfOriginCapability || false,
        phytosanitaryCertificateCapability: data.phytosanitaryCertificateCapability || false,
        packagingCompliance: data.packagingCompliance || false,
        fumigationCertificateCapability: data.fumigationCertificateCapability || false,
        exportLogisticsPrepared: data.exportLogisticsPrepared || false,
        verificationStatus: "pending",
      };

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
      if (data.sampleLabTestCertificate && !uploadedFiles.sampleLabTestCertificate) {
        payload.sampleLabTestCertificate = data.sampleLabTestCertificate;
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
      router.push("/seller/profile");
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
            <Step1BusinessIdentity data={data as any} updateData={updateData} setUploadedFiles={handleSetUploadedFiles} isLoading={isUpdating} />
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
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  onClick={handleSave}
                  disabled={isUpdating}
                  className="px-6 py-2 border border-yogreet-sage text-yogreet-sage cursor-pointer rounded-md hover:bg-yogreet-sage/10 transition-colors w-full sm:w-auto disabled:opacity-50"
                >
                  <Save className="w-4 h-4 inline mr-2" />
                  Save
                </button>
                <button
                  onClick={handleSaveAndNext}
                  disabled={isUpdating}
                  className="px-6 py-2 bg-yogreet-sage text-white cursor-pointer rounded-md hover:bg-yogreet-sage/90 transition-colors w-full sm:w-auto disabled:opacity-50"
                >
                  Save and Next
                </button>
              </div>
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


