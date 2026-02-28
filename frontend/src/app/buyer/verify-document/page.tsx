"use client";

import { useState, useRef, useEffect, useMemo, Suspense } from "react";
import { Save, Check, FileText, MapPin, Settings } from "lucide-react";
import Step1BusinessBasics from "./components/step1-basic-company-verification";
import Step2AddressBanking from "./components/step2-importer-verification";
import Step3PreferencesLogistics from "./components/step3-tax-financial-legitimacy";
import Step4Summary from "./components/step4-ownership-identity";
import PageHero from "@/components/shared/PageHero";
import ConfirmationModal from "@/components/shared/ConfirmationModal";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { getCookie, removeCookie } from "@/utils/cookies";
import { useAutoVerifyMutation, useSaveVerificationStep1Mutation, useUploadVerificationStep1DocsMutation, useGetBuyerQuery } from "@/services/api/buyerApi";
 
// NOTE: Reference MakeProfile uses API hooks and auth; for buyer verification we stub them
type Noop = (...args: any[]) => Promise<{ unwrap: () => Promise<void> }>;

interface CacheResponse<T> {
  source: "cache" | "api";
  data: T;
}

interface ProfileData {
  fullName: string;
  storeName: string;
  email: string;
  mobile: string;
  businessType: string;
  businessRegistrationNumber: string;
  productCategories: string[];
  businessLogo: string;
    // Step 1: Basic Company Verification Fields
    company_registration_certificate?: string;
    company_registration_number?: string;
    company_name?: string;
    date_of_incorporation?: string;
    ssm_company_profile_document?: string;
    
    business_trade_license_document?: string;
    business_license_number?: string;
    business_license_issuing_authority?: string;
    business_license_expiry_date?: string;

    // Step 2: Importer Verification Fields
    import_license_document?: string;
    import_license_number?: string;
    issuing_authority?: string; // (MOA/MAQIS)
    import_license_expiry_date?: string;
    food_safety_certificate_document?: string;
    food_safety_authority?: string; // (MOH/Other)
    food_safety_certificate_number?: string;
    food_safety_license_expiry_date?: string;

    // Step 3: Tax & Financial Legitimacy Fields
    tax_registration_certificate_document?: string;
    tax_registration_number?: string; // TIN/SST
    tax_registration_authority?: string; // LHDN Malaysia
    bank_letter_or_statement_document?: string;
    bank_name?: string;
    account_holder_name?: string;

    // Step 4: Ownership & Identity Verification Fields
    director_id_document?: string; // NRIC/Passport
    business_address_proof_document?: string;
    business_address?: string;
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
  documents: {
    gstCertificate?: string;
    panCard?: string;
    businessLicense?: string;
    canceledCheque?: string;
  };
  bankAccountName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
  gstNumber: string;
  panNumber: string;
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
  profileProgress?: number;
}

function VerfiyDocumentContent() {
  const [step, setStep] = useState(1);
  const formRef = useRef<HTMLDivElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [autoVerify, { isLoading: isAutoVerifying }] = useAutoVerifyMutation();
  const [saveStep1Details] = useSaveVerificationStep1Mutation();
  const [uploadStep1Docs] = useUploadVerificationStep1DocsMutation();
  
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
  }, [searchParams, pathname]);

  // Buyer API data
  const { data: buyerApiData, isLoading: isBuyerLoading, refetch: refetchBuyer } = useGetBuyerQuery(undefined as any);
  const isLoading = isBuyerLoading;
  const isUpdating = false;
  const isUpdatingBusinessAddress = false;
  const isUpdatingWarehouseAddress = false;
  const isUpdatingDocuments = false;
  const isUpdatingSocialLinks = false;

  const refetch = () => {};
  const rawArtistData: any = buyerApiData ?? null;
  const fetchError: any = null;

  const updateArtist = (payload: any) => ({
    unwrap: async () => {
      await new Promise((r) => setTimeout(r, 50));
    },
  });
  const updateBusinessAddress = (payload: any) => ({
    unwrap: async () => {
      await new Promise((r) => setTimeout(r, 50));
    },
  });
  const updateWarehouseAddress = (payload: any) => ({
    unwrap: async () => {
      await new Promise((r) => setTimeout(r, 50));
    },
  });
  const updateDocuments = (payload: any) => ({
    unwrap: async () => {
      await new Promise((r) => setTimeout(r, 50));
    },
  });
  const updateSocialLinks = (payload: any) => ({
    unwrap: async () => {
      await new Promise((r) => setTimeout(r, 50));
    },
  });

  const artistData = useMemo(() => {
    if (!rawArtistData) return null;
    if (
      rawArtistData &&
      typeof rawArtistData === "object" &&
      "source" in rawArtistData &&
      "data" in rawArtistData
    ) {
      const cacheResponse = rawArtistData as CacheResponse<any>;
      return cacheResponse.data;
    }
    return rawArtistData;
  }, [rawArtistData]);

  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: "",
    storeName: "",
    email: "",
    mobile: "",
    businessType: "",
    businessRegistrationNumber: "",
    productCategories: [],
    businessLogo: "",
    company_registration_certificate: "",
    company_registration_number: "",
    company_name: "",
    date_of_incorporation: "",
    ssm_company_profile_document: "",
    
    business_trade_license_document: "",
    business_license_number: "",
    business_license_issuing_authority: "",
    business_license_expiry_date: "",
    import_license_document: "",
    import_license_number: "",
    issuing_authority: "",
    import_license_expiry_date: "",
    food_safety_certificate_document: "",
    food_safety_authority: "",
    food_safety_certificate_number: "",
    food_safety_license_expiry_date: "",
    tax_registration_certificate_document: "",
    tax_registration_number: "",
    tax_registration_authority: "",
    bank_letter_or_statement_document: "",
    bank_name: "",
    account_holder_name: "",
    director_id_document: "",
    business_address_proof_document: "",
    business_address: "",
    businessAddress: {
      street: "",
      city: "",
      state: "",
      country: "",
      pinCode: "",
    },
    warehouseAddress: {
      sameAsBusiness: true,
      street: "",
      city: "",
      state: "",
      country: "",
      pinCode: "",
    },
    bankAccountName: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    upiId: "",
    gstNumber: "",
    panNumber: "",
    documents: {
      gstCertificate: "",
      panCard: "",
      businessLicense: "",
      canceledCheque: "",
    },
    shippingType: "",
    inventoryVolume: "",
    supportContact: "",
    workingHours: "",
    serviceAreas: [],
    returnPolicy: "",
    socialLinks: {
      website: "",
      instagram: "",
      facebook: "",
      twitter: "",
    },
    termsAgreed: false,
    digitalSignature: "",
    profileProgress: 0,
  });

  const [originalData, setOriginalData] = useState<ProfileData | null>(null);

  // Sync step from URL segment if present (/buyer/verify-document/[1-4])
  useEffect(() => {
    if (!pathname) return;
    const parts = pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    const n = Number(last);
    if (!Number.isNaN(n) && n >= 1 && n <= 4) {
      setStep(n);
    }
  }, [pathname]);

  // One-time soft prompt after signup
  useEffect(() => {
    try {
      const flag = typeof window !== "undefined" && getCookie("yg_just_signed_up");
      if (flag === "1") {
        setShowSignupPrompt(true);
        removeCookie("yg_just_signed_up");
      }
    } catch {}
  }, []);

  // Load any locally saved verification data if API data is not available
  useEffect(() => {
    if (artistData) return;
    try {
      if (typeof window !== "undefined") {
        const raw = window.localStorage.getItem("yg_buyer_verify_original");
        if (raw) {
          const parsed = JSON.parse(raw);
          setOriginalData(parsed);
          setProfileData((prev) => ({ ...prev, ...parsed }));
        }
      }
    } catch {}
  }, [artistData]);

  // Persist working data locally for resilience
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("yg_buyer_verify_profile", JSON.stringify(profileData));
      }
    } catch {}
  }, [profileData]);

  useEffect(() => {
    if (artistData) {
      try {
        const loadedData = {
          // Map buyer fields into the underscore fields used by this form
          company_registration_certificate: artistData.companyRegistrationCertificate || "",
          company_registration_number: artistData.companyRegistrationNumber || "",
          company_name: artistData.companyName || "",
          date_of_incorporation: artistData.dateOfIncorporation ? new Date(artistData.dateOfIncorporation).toISOString().slice(0, 10) : "",
          ssm_company_profile_document: artistData.ssmCompanyProfileDocument || "",
          business_trade_license_document: artistData.businessTradeLicenseDocument || "",
          business_license_number: artistData.businessLicenseNumber || "",
          business_license_issuing_authority: artistData.businessLicenseIssuingAuthority || "",
          business_license_expiry_date: artistData.businessLicenseExpiryDate ? new Date(artistData.businessLicenseExpiryDate).toISOString().slice(0, 10) : "",
          businessAddress: {
            street: artistData.businessAddress?.street || "",
            city: artistData.businessAddress?.city || "",
            state: artistData.businessAddress?.state || "",
            country: artistData.businessAddress?.country || "",
            pinCode: artistData.businessAddress?.pinCode || "",
          },
          warehouseAddress: {
            sameAsBusiness: artistData.warehouseAddress?.sameAsBusiness ?? true,
            street: artistData.warehouseAddress?.street || "",
            city: artistData.warehouseAddress?.city || "",
            state: artistData.warehouseAddress?.state || "",
            country: artistData.warehouseAddress?.country || "",
            pinCode: artistData.warehouseAddress?.pinCode || "",
          },
          documents: {
            gstCertificate: artistData.documents?.gstCertificate || "",
            panCard: artistData.documents?.panCard || "",
            businessLicense: artistData.documents?.businessLicense || "",
            canceledCheque: artistData.documents?.canceledCheque || "",
          },
          bankAccountName: artistData.bankAccountName || "",
          bankName: artistData.bankName || "",
          accountNumber: artistData.accountNumber || "",
          ifscCode: artistData.ifscCode || "",
          upiId: artistData.upiId || "",
          gstNumber: artistData.gstNumber || "",
          panNumber: artistData.panNumber || "",
          shippingType: artistData.shippingType || "",
          inventoryVolume: artistData.inventoryVolume || "",
          supportContact: artistData.supportContact || "",
          workingHours: artistData.workingHours || "",
          serviceAreas: Array.isArray(artistData.serviceAreas)
            ? artistData.serviceAreas
            : [],
          returnPolicy: artistData.returnPolicy || "",
          socialLinks: {
            website: artistData.socialLinks?.website || "",
            instagram: artistData.socialLinks?.instagram || "",
            facebook: artistData.socialLinks?.facebook || "",
            twitter: artistData.socialLinks?.twitter || "",
          },
          termsAgreed: Boolean(artistData.termsAgreed),
          digitalSignature: artistData.digitalSignature || "",
          profileProgress: artistData.profileProgress || 0,
        };

        setProfileData(loadedData as any);
        setOriginalData(loadedData as any);
      } catch (err) {
        console.error("Error loading artist data:", err);
        toast.error("Failed to load profile data. Please refresh the page.");
      }
    }
  }, [artistData]);

  const hasDataChanged = (currentData: any, originalData: any): boolean => {
    return JSON.stringify(currentData) !== JSON.stringify(originalData);
  };

  const getChangedFields = (currentData: any, originalData: any): any => {
    const changes: any = {};
    for (const key in currentData) {
      if (
        typeof currentData[key] === "object" &&
        currentData[key] !== null &&
        !Array.isArray(currentData[key])
      ) {
        const nestedChanges = getChangedFields(
          currentData[key],
          originalData?.[key] || {}
        );
        if (Object.keys(nestedChanges).length > 0) {
          changes[key] = nestedChanges;
        }
      } else if (
        JSON.stringify(currentData[key]) !== JSON.stringify(originalData?.[key])
      ) {
        changes[key] = currentData[key];
      }
    }
    return changes;
  };

  const validateStep = (stepNumber: number): boolean => {
    return true;
  };

  const updateProfileData = (updates: Partial<ProfileData>) => {
    try {
      setProfileData((prev) => ({ ...prev, ...updates }));
    } catch (error) {
      console.error("Failed to update profile data:", error);
      toast.error("Failed to update profile data");
    }
  };

  const updateNestedField = (
    parent: keyof ProfileData,
    field: string,
    value: any
  ) => {
    try {
      const updates = {
        [parent]: {
          ...(profileData[parent] as Record<string, any>),
          [field]: value,
        } as any,
      };
      setProfileData((prev) => ({
        ...prev,
        ...updates,
      }));
    } catch (error) {
      console.error(`Failed to update ${parent}.${field}:`, error);
      toast.error(`Failed to update ${field}`);
    }
  };

  const addToArray = (field: keyof ProfileData, value: string) => {
    if (!value?.trim()) {
      toast.error("Please enter a valid value");
      return;
    }
    try {
      const currentArray = profileData[field] as string[];
      if (currentArray.includes(value.trim())) {
        toast.error("This item already exists");
        return;
      }
      const updates = {
        [field]: [...currentArray, value.trim()],
      };
      setProfileData((prev) => ({
        ...prev,
        ...updates,
      }));
      toast.success("Item added successfully");
    } catch (error) {
      console.error("Failed to add item:", error);
      toast.error("Failed to add item");
    }
  };

  const removeFromArray = (field: keyof ProfileData, index: number) => {
    try {
      const updates = {
        [field]: (profileData[field] as string[]).filter((_, i) => i !== index),
      };
      setProfileData((prev) => ({
        ...prev,
        ...updates,
      }));
      toast.success("Item removed successfully");
    } catch (error) {
      console.error("Failed to remove item:", error);
      toast.error("Failed to remove item");
    }
  };

  const prepareDataForSubmission = (data: ProfileData) => {
    try {
      const calculateProgress = () => {
        try {
          let completed = 0;
          const total = 23;
          if (data?.fullName?.trim()) completed++;
          if (data?.storeName?.trim()) completed++;
          if (data?.email?.trim()) completed++;
          if (data?.mobile?.trim()) completed++;
          if (data?.businessType?.trim()) completed++;
          if (data?.businessRegistrationNumber?.trim()) completed++;
          if (Array.isArray(data?.productCategories) && data.productCategories.length > 0) completed++;
          if (data?.businessAddress?.street?.trim()) completed++;
          if (data?.businessAddress?.city?.trim()) completed++;
          if (data?.businessAddress?.state?.trim()) completed++;
          if (data?.businessAddress?.country?.trim()) completed++;
          if (data?.businessAddress?.pinCode?.trim()) completed++;
          if (data?.bankAccountName?.trim()) completed++;
          if (data?.bankName?.trim()) completed++;
          if (data?.accountNumber?.trim()) completed++;
          if (data?.ifscCode?.trim()) completed++;
          if (data?.gstNumber?.trim()) completed++;
          if (data?.panNumber?.trim()) completed++;
          if (data?.shippingType?.trim()) completed++;
          if (Array.isArray(data?.serviceAreas) && data.serviceAreas.length > 0) completed++;
          if (data?.inventoryVolume?.trim()) completed++;
          if (data?.returnPolicy?.trim()) completed++;
          if (data?.termsAgreed) completed++;
          return Math.round((completed / total) * 100);
        } catch (error) {
          console.error("Error calculating progress:", error);
          return 0;
        }
      };
      const profileProgress = calculateProgress();
      return {
        ...data,
        profileProgress,
        termsAgreed: Boolean(data.termsAgreed),
        warehouseAddress: {
          ...data.warehouseAddress,
          sameAsBusiness: Boolean(data.warehouseAddress.sameAsBusiness),
        },
        productCategories: Array.isArray(data.productCategories)
          ? data.productCategories
          : [],
        serviceAreas: Array.isArray(data.serviceAreas) ? data.serviceAreas : [],
        businessLogo: data.businessLogo || "",
        upiId: data.upiId || "",
        gstNumber: data.gstNumber || "",
        workingHours: data.workingHours || "",
        returnPolicy: data.returnPolicy || "",
      };
    } catch (error) {
      console.error("Error preparing data for submission:", error);
      throw new Error("Failed to prepare data for submission");
    }
  };

  const handleSubmit = async () => {
    try {
      prepareDataForSubmission(profileData);
      await autoVerify(undefined as any).unwrap();
      toast.success("Verification approved automatically");
      router.push("/");
    } catch (e: any) {
      toast.error(e?.data?.message || "Failed to auto-verify");
    }
  };

  const scrollToTop = () => {
    formRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const saveStep1Data = async (): Promise<boolean> => {
    try {
      if (!validateStep(1)) return false;
      const step1Data = {
        company_registration_certificate: profileData.company_registration_certificate,
        company_registration_number: profileData.company_registration_number,
        company_name: profileData.company_name,
        date_of_incorporation: profileData.date_of_incorporation,
        ssm_company_profile_document: profileData.ssm_company_profile_document,
        business_trade_license_document: profileData.business_trade_license_document,
        business_license_number: profileData.business_license_number,
        business_license_issuing_authority: profileData.business_license_issuing_authority,
        business_license_expiry_date: profileData.business_license_expiry_date,
      };
      const originalStep1Data = {
        company_registration_certificate: originalData?.company_registration_certificate || "",
        company_registration_number: originalData?.company_registration_number || "",
        company_name: originalData?.company_name || "",
        date_of_incorporation: originalData?.date_of_incorporation || "",
        ssm_company_profile_document: originalData?.ssm_company_profile_document || "",
        business_trade_license_document: originalData?.business_trade_license_document || "",
        business_license_number: originalData?.business_license_number || "",
        business_license_issuing_authority: originalData?.business_license_issuing_authority || "",
        business_license_expiry_date: originalData?.business_license_expiry_date || "",
      };
      const calculateProgress = () => {
        try {
          let completed = 0;
          const total = 23;
          if (profileData?.company_registration_certificate?.trim()) completed++;
          if (profileData?.company_registration_number?.trim()) completed++;
          if (profileData?.company_name?.trim()) completed++;
          if (profileData?.date_of_incorporation?.trim()) completed++;
          if (profileData?.ssm_company_profile_document?.trim()) completed++;
          if (profileData?.business_trade_license_document?.trim()) completed++;
          if (profileData?.business_license_number?.trim()) completed++;
          if (profileData?.business_license_issuing_authority?.trim()) completed++;
          if (profileData?.business_license_expiry_date?.trim()) completed++;
          return Math.round((completed / total) * 100);
        } catch (error) {
          console.error("Error calculating progress:", error);
          return 0;
        }
      };
      const profileProgress = calculateProgress();
      (step1Data as any).profileProgress = profileProgress;

      const changedFields = getChangedFields(step1Data, originalStep1Data);
      if (Object.keys(changedFields).length > 0) {
        await saveStep1Details(changedFields).unwrap();
      }
      const docFiles = {
        company_registration_certificate: uploadedFiles["company_registration_certificate"],
        ssm_company_profile_document: uploadedFiles["ssm_company_profile_document"],
        business_trade_license_document: uploadedFiles["business_trade_license_document"],
      } as Record<string, File | undefined>;
      const hasDocFiles = Object.values(docFiles).some(Boolean);
      if (hasDocFiles) {
        const formData = new FormData();
        Object.entries(docFiles).forEach(([key, file]) => {
          if (file) formData.append(key, file);
        });
        const uploaded = await uploadStep1Docs(formData).unwrap();
        const updates: Partial<ProfileData> = {};
        if (uploaded.companyRegistrationCertificate) updates.company_registration_certificate = uploaded.companyRegistrationCertificate;
        if (uploaded.ssmCompanyProfileDocument) updates.ssm_company_profile_document = uploaded.ssmCompanyProfileDocument;
        if (uploaded.businessTradeLicenseDocument) updates.business_trade_license_document = uploaded.businessTradeLicenseDocument;
        if (Object.keys(updates).length) {
          setProfileData((prev) => ({ ...prev, ...updates }));
        }
      }

      setOriginalData((prev) => {
        const next = prev ? { ...prev, ...step1Data } : ({ ...step1Data } as any);
        try {
          if (typeof window !== "undefined") {
            window.localStorage.setItem("yg_buyer_verify_original", JSON.stringify(next));
          }
        } catch {}
        return next;
      });
      refetchBuyer();
      if (Object.keys(changedFields).length === 0 && !hasDocFiles) {
        toast.success("No changes detected in Step 1");
      } else {
        toast.success("Step 1 data saved successfully!");
      }
      refetch();
      return true;
    } catch (err: any) {
      console.error("Failed to save Step 1 data:", err);
      toast.error(err?.data?.message || "Failed to save Step 1 data");
      return false;
    }
  };

  const saveStep2Data = async (): Promise<boolean> => {
    try {
      if (!validateStep(2)) return false;
      let hasChanges = false;
      const originalBusinessAddress = originalData?.businessAddress || {
        street: "",
        city: "",
        state: "",
        country: "",
        pinCode: "",
      };
      const originalWarehouseAddress = originalData?.warehouseAddress || {
        sameAsBusiness: true,
        street: "",
        city: "",
        state: "",
        country: "",
        pinCode: "",
      };
      if (
        hasDataChanged(
          profileData.businessAddress,
          originalBusinessAddress
        )
      ) {
        try {
          await updateBusinessAddress(profileData.businessAddress).unwrap();
          toast.success("Business address saved!");
          hasChanges = true;
        } catch (err: any) {
          console.error("Failed to save business address:", err);
          toast.error("Failed to save business address");
          return false;
        }
      }
      if (
        hasDataChanged(
          profileData.warehouseAddress,
          originalWarehouseAddress
        )
      ) {
        try {
          await updateWarehouseAddress(profileData.warehouseAddress).unwrap();
          toast.success("Warehouse address saved!");
          hasChanges = true;
        } catch (err: any) {
          console.error("Failed to save warehouse address:", err);
          toast.error("Failed to save warehouse address");
          return false;
        }
      }
      const documentFiles = {
        "gst-upload": uploadedFiles["gst-upload"],
        "pan-upload": uploadedFiles["pan-upload"],
        "license-upload": uploadedFiles["license-upload"],
        "cheque-upload": uploadedFiles["cheque-upload"],
      } as Record<string, File | undefined>;
      const hasDocumentFiles = Object.values(documentFiles).some((file) => file);
      if (hasDocumentFiles) {
        try {
          const formData = new FormData();
          Object.entries(documentFiles).forEach(([key, file]) => {
            if (file) {
              const fieldMapping: Record<string, string> = {
                "gst-upload": "gstCertificate",
                "pan-upload": "panCard",
                "license-upload": "businessLicense",
                "cheque-upload": "canceledCheque",
              };
              formData.append(fieldMapping[key], file);
            }
          });
          await updateDocuments(formData).unwrap();
          toast.success("Documents uploaded!");
          hasChanges = true;
        } catch (err: any) {
          console.error("Failed to save documents:", err);
          toast.error("Failed to save documents");
          return false;
        }
      }
      const bankingData = {
        bankAccountName: profileData.bankAccountName,
        bankName: profileData.bankName,
        accountNumber: profileData.accountNumber,
        ifscCode: profileData.ifscCode,
        upiId: profileData.upiId,
        gstNumber: profileData.gstNumber,
        panNumber: profileData.panNumber,
      };
      const originalBankingData = {
        bankAccountName: originalData?.bankAccountName || "",
        bankName: originalData?.bankName || "",
        accountNumber: originalData?.accountNumber || "",
        ifscCode: originalData?.ifscCode || "",
        upiId: originalData?.upiId || "",
        gstNumber: originalData?.gstNumber || "",
        panNumber: originalData?.panNumber || "",
      };
      const calculateProgress = () => {
        try {
          let completed = 0;
          const total = 23;
          if (profileData?.fullName?.trim()) completed++;
          if (profileData?.storeName?.trim()) completed++;
          if (profileData?.email?.trim()) completed++;
          if (profileData?.mobile?.trim()) completed++;
          if (profileData?.businessType?.trim()) completed++;
          if (profileData?.businessRegistrationNumber?.trim()) completed++;
          if (Array.isArray(profileData?.productCategories) && profileData.productCategories.length > 0) completed++;
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
          if (profileData?.shippingType?.trim()) completed++;
          if (Array.isArray(profileData?.serviceAreas) && profileData.serviceAreas.length > 0) completed++;
          if (profileData?.inventoryVolume?.trim()) completed++;
          if (profileData?.returnPolicy?.trim()) completed++;
          if (profileData?.termsAgreed) completed++;
          return Math.round((completed / total) * 100);
        } catch (error) {
          console.error("Error calculating progress:", error);
          return 0;
        }
      };
      const profileProgress = calculateProgress();
      if (hasDataChanged(bankingData, originalBankingData)) {
        try {
          const changedFields = getChangedFields(
            bankingData,
            originalBankingData
          );
          (changedFields as any).profileProgress = profileProgress;
          await updateArtist(changedFields).unwrap();
          toast.success("Banking details saved!");
          hasChanges = true;
        } catch (err: any) {
          console.error("Failed to save banking details:", err);
          toast.error("Failed to save banking details");
          return false;
        }
      }
      if (!hasChanges) {
        toast.success("No changes detected in Step 2");
      } else {
        setOriginalData((prev) => {
          const next = prev
            ? {
                ...prev,
                businessAddress: profileData.businessAddress,
                warehouseAddress: profileData.warehouseAddress,
                ...bankingData,
                profileProgress: profileProgress,
              }
            : ({
                businessAddress: profileData.businessAddress,
                warehouseAddress: profileData.warehouseAddress,
                ...bankingData,
                profileProgress: profileProgress,
              } as any);
          try {
            if (typeof window !== "undefined") {
              window.localStorage.setItem("yg_buyer_verify_original", JSON.stringify(next));
            }
          } catch {}
          return next;
        });
        toast.success("Step 2 data saved successfully!");
      }
      refetch();
      return true;
    } catch (err: any) {
      console.error("Failed to save Step 2 data:", err);
      toast.error("Failed to save Step 2 data");
      return false;
    }
  };

  const saveStep3Data = async (): Promise<boolean> => {
    try {
      if (!validateStep(3)) return false;
      let hasChanges = false;
      const originalSocialLinks = originalData?.socialLinks || {
        website: "",
        instagram: "",
        facebook: "",
        twitter: "",
      };
      if (hasDataChanged(profileData.socialLinks, originalSocialLinks)) {
        try {
          await updateSocialLinks(profileData.socialLinks).unwrap();
          toast.success("Social links saved!");
          hasChanges = true;
        } catch (err: any) {
          console.error("Failed to save social links:", err);
          toast.error("Failed to save social links");
          return false;
        }
      }
      const preferencesData: {
        shippingType: string;
        inventoryVolume: string;
        supportContact: string;
        workingHours: string;
        serviceAreas: string[];
        returnPolicy: string;
        termsAgreed: boolean;
        digitalSignature?: string;
        profileProgress?: number;
      } = {
        shippingType: profileData.shippingType,
        inventoryVolume: profileData.inventoryVolume,
        supportContact: profileData.supportContact,
        workingHours: profileData.workingHours,
        serviceAreas: profileData.serviceAreas,
        returnPolicy: profileData.returnPolicy,
        termsAgreed: profileData.termsAgreed,
        digitalSignature: profileData.digitalSignature,
      };
      const originalPreferencesData = {
        shippingType: originalData?.shippingType || "",
        inventoryVolume: originalData?.inventoryVolume || "",
        supportContact: originalData?.supportContact || "",
        workingHours: originalData?.workingHours || "",
        serviceAreas: originalData?.serviceAreas || [],
        returnPolicy: originalData?.returnPolicy || "",
        termsAgreed: originalData?.termsAgreed || false,
        digitalSignature: originalData?.digitalSignature || "",
      };
      const calculateProgress = () => {
        try {
          let completed = 0;
          const total = 23;
          if (profileData?.fullName?.trim()) completed++;
          if (profileData?.storeName?.trim()) completed++;
          if (profileData?.email?.trim()) completed++;
          if (profileData?.mobile?.trim()) completed++;
          if (profileData?.businessType?.trim()) completed++;
          if (profileData?.businessRegistrationNumber?.trim()) completed++;
          if (Array.isArray(profileData?.productCategories) && profileData.productCategories.length > 0) completed++;
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
          if (profileData?.shippingType?.trim()) completed++;
          if (Array.isArray(profileData?.serviceAreas) && profileData.serviceAreas.length > 0) completed++;
          if (profileData?.inventoryVolume?.trim()) completed++;
          if (profileData?.returnPolicy?.trim()) completed++;
          if (profileData?.termsAgreed) completed++;
          return Math.round((completed / total) * 100);
        } catch (error) {
          console.error("Error calculating progress:", error);
          return 0;
        }
      };
      const profileProgress = calculateProgress();
      const hasDigitalSignatureFile = uploadedFiles.digitalSignature;
      if (
        hasDataChanged(preferencesData, originalPreferencesData) ||
        hasDigitalSignatureFile
      ) {
        try {
          const dataToUpdate = {
            ...preferencesData,
            profileProgress: profileProgress,
          } as any;
          if (hasDigitalSignatureFile) {
            delete dataToUpdate.digitalSignature;
          }
          await updateArtist(dataToUpdate).unwrap();
          if (hasDigitalSignatureFile) {
            const fileFormData = new FormData();
            fileFormData.append("digitalSignature", hasDigitalSignatureFile);
            await updateArtist(fileFormData).unwrap();
          }
          toast.success("Preferences saved!");
          hasChanges = true;
        } catch (err: any) {
          console.error("Failed to save preferences:", err);
          toast.error("Failed to save preferences");
          return false;
        }
      }
      if (!hasChanges) {
        toast.success("No changes detected in Step 3");
      } else {
        setOriginalData((prev) => {
          const next = prev
            ? {
                ...prev,
                socialLinks: profileData.socialLinks,
                ...preferencesData,
                profileProgress: profileProgress,
              }
            : ({
                socialLinks: profileData.socialLinks,
                ...preferencesData,
                profileProgress: profileProgress,
              } as any);
          try {
            if (typeof window !== "undefined") {
              window.localStorage.setItem("yg_buyer_verify_original", JSON.stringify(next));
            }
          } catch {}
          return next;
        });
        toast.success("Step 3 data saved successfully!");
      }
      refetch();
      return true;
    } catch (err: any) {
      console.error("Failed to save Step 3 data:", err);
      toast.error("Failed to save Step 3 data");
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
      router.push(`/buyer/verify-document/${next}`);
      setTimeout(() => scrollToTop(), 100);
    }
  };

  const nextStep = async () => {
    // Testing mode: allow moving to next step without validation or save
    if (step < 4) {
      const next = step + 1;
      setStep(next);
      router.push(`/buyer/verify-document/${next}`);
      setTimeout(() => scrollToTop(), 100);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      const prev = step - 1;
      setStep(prev);
      router.push(`/buyer/verify-document/${prev}`);
      setTimeout(() => scrollToTop(), 100);
    }
  };

  const stepIcons = [
    <FileText key="1" className="w-4 h-4 sm:w-6 sm:h-6" />,
    <MapPin key="2" className="w-4 h-4 sm:w-6 sm:h-6" />,
    <Settings key="3" className="w-4 h-4 sm:w-6 sm:h-6" />,
    <Check key="4" className="w-4 h-4 sm:w-6 sm:h-6" />,
  ];

  const stepTitles = [
    "Basic Company Verification",
    "Importer Verification",
    "Tax & Financial Legitimacy",
    "Ownership & Identity Verification",
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-stone-600">Loading profile data...</div>
        </div>
      </div>
    );
  }

  // No auth gate for buyer verification version

  if (fetchError) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-lg text-red-600">Error loading profile data</div>
          <button
            onClick={() => {
              refetch();
              toast.error("Please refresh the page or contact support.");
            }}
            className="px-4 py-2 bg-terracotta-600 text-white rounded-md hover:bg-terracotta-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const handleSetUploadedFiles = (
    files:
      | Record<string, File>
      | ((prev: Record<string, File>) => Record<string, File>)
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
        title="Verify your documents"
        showActions={false}
      >
        <p className="text-sm text-stone-700">
          Please upload and verify all required documents to start ordering products.
        </p>
      </ConfirmationModal>
      <PageHero
        title="Verify Company Documents"
        subtitle=""
        description="Upload required documents to complete your buyer verification."
        showBackButton={false}
        breadcrumb={{
          items: [
            { label: "Home", href: "/buyer/profile" },
            { label: "Verify Documents", isActive: true },
          ],
        }}
      />
      <div ref={formRef} className="container mx-auto max-w-7xl px-4 sm:px-6 pt-0 pb-6 sm:pb-8">

      <div className="mb-6 sm:mb-10">
        <div className="flex justify-between items-center relative">
          <div className="absolute top-4 sm:top-6 left-0 right-0 h-0.5 bg-stone-200 z-0">
            <div
              className="h-full bg-yogreet-purple transition-all duration-300"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            ></div>
          </div>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`flex flex-col items-center relative z-10 ${
                i <= step ? "text-yogreet-purple" : "text-stone-400"
              }`}
            >
              <div
                className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-1 sm:mb-2 bg-white ${
                  i <= step
                    ? "text-yogreet-purple border-2 border-yogreet-purple"
                    : "text-stone-400 border-2 border-stone-300"
                }`}
              >
                {stepIcons[i - 1]}
              </div>
              <div
                className={`text-xs font-medium text-center ${
                  i <= step ? "text-yogreet-purple" : "text-stone-400"
                } hidden xs:block`}
              >
                Step {i}
              </div>
              <div
                className={`text-xs sm:text-sm font-medium text-center mt-1 ${
                  i <= step ? "text-yogreet-purple" : "text-stone-400"
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
          <Step1BusinessBasics
            data={profileData}
            updateData={updateProfileData}
            setUploadedFiles={handleSetUploadedFiles}
            isLoading={isUpdating}
          />
        )}
              {step === 2 && (
          <Step2AddressBanking
            data={profileData}
            updateData={updateProfileData}
            setUploadedFiles={handleSetUploadedFiles}
            isLoading={
              isUpdatingBusinessAddress ||
              isUpdatingWarehouseAddress ||
              isUpdating ||
              isUpdatingDocuments
            }
          />
        )}
              {step === 3 && (
          <Step3PreferencesLogistics
            data={profileData}
            updateData={updateProfileData}
            setUploadedFiles={handleSetUploadedFiles}
            isLoading={isUpdatingSocialLinks || isUpdating}
          />
        )}
        {step === 4 && (
          <Step4Summary
            data={profileData}
            updateData={updateProfileData}
            setUploadedFiles={setUploadedFiles}
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
                className="px-6 py-2 border border-yogreet-purple text-yogreet-purple cursor-pointer rounded-md hover:bg-yogreet-purple/10 transition-colors w-full sm:w-auto disabled:opacity-50"
              >
                <Save className="w-4 h-4 inline mr-2" />
                Save
              </button>
              <button
                onClick={handleSaveAndNext}
                disabled={isUpdating}
                className="px-6 py-2 bg-yogreet-purple text-white cursor-pointer rounded-md hover:bg-yogreet-purple/90 transition-colors w-full sm:w-auto disabled:opacity-50"
              >
                Save and Next
              </button>
            </div>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isUpdating}
              className="px-6 py-2 bg-yogreet-purple text-white rounded-md hover:bg-yogreet-purple/90 transition-colors flex items-center justify-center sm:justify-start w-full sm:w-auto disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {isUpdating ? "Submitting..." : "Submit Profile"}
            </button>
          )}
        </div>
      </div>
      </div>
    </main>
  );
}

export default function VerfiyDocument() {
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
      <VerfiyDocumentContent />
    </Suspense>
  );
}
