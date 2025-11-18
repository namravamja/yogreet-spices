 "use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { User, MapPin, Truck, Globe, Save, FileText } from "lucide-react";
import PageHero from "@/components/shared/PageHero";
import ConfirmationModal from "@/components/shared/ConfirmationModal";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Step1BasicInformation from "./components/step1-basic-information";
import Step2AboutStore from "./components/step2-about-store";
import Step2AddressInformation from "./components/step2-address-information";
import Step4SocialMediaWebsite from "./components/step4-social-media-website";
import { useGetSellerQuery, useUpdateSellerMutation } from "@/services/api/sellerApi";
import { useAuth } from "@/hooks/useAuth";

type CacheResponse<T> = { source: "cache" | "api"; data: T };

interface SellerProfileData {
  // Step 1: Basic Information
  fullName: string;
  companyName: string; // Merged from storeName and companyName
  email: string;
  mobile: string;
  businessType: string;
  productCategories: string[];
  businessLogo?: string;

  // Step 2: About & Store Photos
  about: string;
  storePhotos: string[];

  // Step 3: Address Information
  businessAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
  };

  // Step 4: Social Media & Website
  socialLinks: {
    website: string;
    instagram: string;
    facebook: string;
    twitter: string;
  };
}

export default function SellerEditProfilePage() {
  const [step, setStep] = useState(1);
  const formRef = useRef<HTMLDivElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | File[]>>({});
  const router = useRouter();
  const pathname = usePathname();
  const [isSavingOnly, setIsSavingOnly] = useState(false);
  const [isSavingAndNext, setIsSavingAndNext] = useState(false);

  const { isAuthenticated } = useAuth("seller");
  const { data: rawData, isLoading, isError: fetchError, refetch } = useGetSellerQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [updateSeller, { isLoading: isUpdating }] = useUpdateSellerMutation();

  const sellerData = useMemo(() => {
    if (!rawData) return null;
    if (rawData && typeof rawData === "object" && "source" in rawData && "data" in rawData) {
      const cacheResponse = rawData as CacheResponse<any>;
      return cacheResponse.data;
    }
    return rawData;
  }, [rawData]);

  const [data, setData] = useState<SellerProfileData>({
    fullName: "",
    companyName: "", // Merged from storeName and companyName
    email: "",
    mobile: "",
    businessType: "",
    productCategories: [],
    businessLogo: "",
    about: "",
    storePhotos: [],
    businessAddress: {
      street: "",
      city: "",
      state: "",
      country: "",
      pinCode: "",
    },
    socialLinks: {
      website: "",
      instagram: "",
      facebook: "",
      twitter: "",
    },
  });

  const [originalData, setOriginalData] = useState<SellerProfileData | null>(null);

  // URL sync: /seller/edit-profile/[1-4]
  useEffect(() => {
    if (!pathname) return;
    const parts = pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    const n = Number(last);
    if (!Number.isNaN(n) && n >= 1 && n <= 4) setStep(n);
  }, [pathname]);

  // Load data (if available) - only load once when data first becomes available
  useEffect(() => {
    if (sellerData && !originalData) {
      try {
        // Properly extract nested data
        const businessAddr = sellerData.businessAddress;
        const socialLinksData = sellerData.socialLinks;
        
        const loaded: SellerProfileData = {
          fullName: sellerData.fullName || "",
          companyName: sellerData.companyName || sellerData.storeName || "", // Backward compatibility
          email: sellerData.email || "",
          mobile: sellerData.mobile || "",
          businessType: sellerData.businessType || "",
          productCategories: Array.isArray(sellerData.productCategories) ? sellerData.productCategories : [],
          businessLogo: sellerData.businessLogo || "",
          about: sellerData.about || "",
          storePhotos: Array.isArray(sellerData.storePhotos) ? sellerData.storePhotos : [],
          businessAddress: businessAddr ? {
            street: businessAddr.street || "",
            city: businessAddr.city || "",
            state: businessAddr.state || "",
            country: businessAddr.country || "",
            pinCode: businessAddr.pinCode || "",
          } : {
            street: "",
            city: "",
            state: "",
            country: "",
            pinCode: "",
          },
          socialLinks: socialLinksData ? {
            website: socialLinksData.website || "",
            instagram: socialLinksData.instagram || "",
            facebook: socialLinksData.facebook || "",
            twitter: socialLinksData.twitter || "",
          } : {
            website: "",
            instagram: "",
            facebook: "",
            twitter: "",
          },
        };
        setData(loaded);
        setOriginalData(loaded);
      } catch (err) {
        console.error("Error loading seller profile data:", err);
        toast.error("Failed to load data. Please refresh the page.");
      }
    }
  }, [sellerData, originalData]);

  const updateData = (updates: Partial<SellerProfileData>) => {
    try {
      setData((prev) => ({ ...prev, ...updates }));
    } catch (error) {
      console.error("Failed to update data:", error);
      toast.error("Failed to update data");
    }
  };

  // Utility: deep compare helpers for step-specific fields
  const arraysEqual = (a?: any[], b?: any[]) => {
    const aa = Array.isArray(a) ? a : [];
    const bb = Array.isArray(b) ? b : [];
    if (aa.length !== bb.length) return false;
    for (let i = 0; i < aa.length; i++) {
      if (aa[i] !== bb[i]) return false;
    }
    return true;
  };

  const objectsEqual = (a?: Record<string, any>, b?: Record<string, any>, keys?: string[]) => {
    const ka = keys ?? Array.from(new Set([...(a ? Object.keys(a) : []), ...(b ? Object.keys(b) : [])]));
    for (const k of ka) {
      const av = a ? a[k] : undefined;
      const bv = b ? b[k] : undefined;
      if (Array.isArray(av) || Array.isArray(bv)) {
        if (!arraysEqual(av as any[], bv as any[])) return false;
      } else if (typeof av === "object" || typeof bv === "object") {
        if (!objectsEqual(av as any, bv as any)) return false;
      } else if (av !== bv) {
        return false;
      }
    }
    return true;
  };

  const hasChangesForStep = (currentStep: number): boolean => {
    if (!originalData) return true;
    if (currentStep === 1) {
      // Basic info or logo
      if (uploadedFiles.businessLogo && uploadedFiles.businessLogo instanceof File) return true;
      return !objectsEqual(
        {
          fullName: data.fullName,
          companyName: data.companyName,
          email: data.email,
          mobile: data.mobile,
          businessType: data.businessType,
          productCategories: data.productCategories,
          businessLogo: data.businessLogo,
        },
        {
          fullName: originalData.fullName,
          companyName: originalData.companyName,
          email: originalData.email,
          mobile: originalData.mobile,
          businessType: originalData.businessType,
          productCategories: originalData.productCategories,
          businessLogo: originalData.businessLogo,
        }
      );
    }
    if (currentStep === 2) {
      // About and store photos or new uploads selected
      if (uploadedFiles.storePhotos && Array.isArray(uploadedFiles.storePhotos) && uploadedFiles.storePhotos.length > 0) {
        return true;
      }
      return !objectsEqual(
        { about: data.about, storePhotos: data.storePhotos },
        { about: originalData.about, storePhotos: originalData.storePhotos }
      );
    }
    if (currentStep === 3) {
      // Address
      return !objectsEqual(
        data.businessAddress,
        originalData.businessAddress,
        ["street", "city", "state", "country", "pinCode"]
      );
    }
    if (currentStep === 4) {
      // Social links
      return !objectsEqual(data.socialLinks, originalData.socialLinks, ["website", "instagram", "facebook", "twitter"]);
    }
    return true;
  };

  const saveStep1Data = async (): Promise<boolean> => {
    try {
      const formData = new FormData();
      const hasLogoFile = uploadedFiles.businessLogo && uploadedFiles.businessLogo instanceof File;

      // Prepare step 1 payload
      const payload: any = {
        fullName: data.fullName,
        companyName: data.companyName,
        email: data.email,
        mobile: data.mobile || "",
        businessType: data.businessType || "",
        productCategories: data.productCategories || [],
      };

      // Add logo if file exists
      if (hasLogoFile) {
        formData.append("businessLogo", uploadedFiles.businessLogo as File);
      } else if (data.businessLogo) {
        payload.businessLogo = data.businessLogo;
      }

      // Use FormData if there's a logo file, otherwise use JSON
      if (hasLogoFile) {
        Object.keys(payload).forEach(key => {
          const value = payload[key];
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              formData.append(key, JSON.stringify(value));
            } else {
              formData.append(key, String(value));
            }
          }
        });
        await updateSeller(formData).unwrap();
      } else {
        await updateSeller(payload).unwrap();
      }

      toast.success("Step 1 data saved successfully!");
      return true;
    } catch (err: any) {
      console.error("Failed to save Step 1 data:", err);
      toast.error(err?.data?.error || err?.data?.message || "Failed to save Step 1 data");
      return false;
    }
  };

  // Step 2: About & Store Photos
  const saveStep2Data = async (): Promise<boolean> => {
    try {
      const hasStorePhotosFiles = Array.isArray(uploadedFiles.storePhotos) && (uploadedFiles.storePhotos as File[]).length > 0;
      const payload: any = {
        about: data.about || "",
        storePhotos: data.storePhotos || [],
      };
      if (hasStorePhotosFiles) {
        const formData = new FormData();
        formData.append("about", payload.about);
        // append existing URLs if any
        if (payload.storePhotos && payload.storePhotos.length) {
          formData.append("storePhotos", JSON.stringify(payload.storePhotos));
        }
        (uploadedFiles.storePhotos as File[]).forEach((file) => {
          formData.append("storePhotos", file);
        });
        await updateSeller(formData).unwrap();
      } else {
        await updateSeller(payload).unwrap();
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
      const payload: any = {
        businessAddress: data.businessAddress,
      };

      await updateSeller(payload).unwrap();

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
        socialLinks: data.socialLinks || {
          website: "",
          instagram: "",
          facebook: "",
          twitter: "",
        },
      };

      await updateSeller(payload).unwrap();

      toast.success("Step 4 data saved successfully!");
      return true;
    } catch (err: any) {
      console.error("Failed to save Step 4 data:", err);
      toast.error(err?.data?.error || err?.data?.message || "Failed to save Step 4 data");
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
    }
    return saved;
  };

  const handleSaveAndNext = async () => {
    // If no changes in this step, skip saving and go next
    const changed = hasChangesForStep(step);
    if (!changed && step < 4) {
      const next = step + 1;
      setStep(next);
      router.push(`/seller/edit-profile/${next}`);
      setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
      return;
    }
    const saved = await handleSave();
    if (saved && step < 4) {
      const next = step + 1;
      setStep(next);
      router.push(`/seller/edit-profile/${next}`);
      setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  };

  const nextStep = () => {
    if (step < 4) {
      const next = step + 1;
      setStep(next);
      router.push(`/seller/edit-profile/${next}`);
      setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      const prev = step - 1;
      setStep(prev);
      router.push(`/seller/edit-profile/${prev}`);
      setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  };

  const stepIcons = [
    <User key="1" className="w-4 h-4 sm:w-6 sm:h-6" />, // Basic Information
    <FileText key="2" className="w-4 h-4 sm:w-6 sm:h-6" />, // About & Store Photos
    <MapPin key="3" className="w-4 h-4 sm:w-6 sm:h-6" />, // Address Information
    <Globe key="4" className="w-4 h-4 sm:w-6 sm:h-6" />, // Social Media & Website
  ];

  const stepTitles = [
    "Basic Information",
    "About & Store Photos",
    "Address Information",
    "Social Media & Website",
  ];

  const handleSubmit = async () => {
    try {
      // Prepare FormData if there's a logo file
      const formData = new FormData();
      const hasLogoFile = uploadedFiles.businessLogo && uploadedFiles.businessLogo instanceof File;
      const hasStorePhotosFiles = Array.isArray(uploadedFiles.storePhotos) && (uploadedFiles.storePhotos as File[]).length > 0;
      
      if (hasLogoFile) {
        formData.append("businessLogo", uploadedFiles.businessLogo as File);
      }
      if (hasStorePhotosFiles) {
        (uploadedFiles.storePhotos as File[]).forEach((file) => {
          formData.append("storePhotos", file);
        });
      }

      // Add all other fields to FormData or JSON
      const payload: any = {
        fullName: data.fullName,
        companyName: data.companyName, // Merged from storeName and companyName
        email: data.email,
        mobile: data.mobile,
        businessType: data.businessType,
        productCategories: data.productCategories,
        about: data.about,
        storePhotos: data.storePhotos,
        businessAddress: data.businessAddress,
        socialLinks: data.socialLinks,
      };

      // Only add logo URL if there's no file (existing logo)
      if (!hasLogoFile && data.businessLogo) {
        payload.businessLogo = data.businessLogo;
      }

      // Use FormData if there's a file, otherwise use JSON
      if (hasLogoFile || hasStorePhotosFiles) {
        Object.keys(payload).forEach(key => {
          const value = payload[key];
          if (value !== undefined && value !== null) {
            if (typeof value === 'object' && !Array.isArray(value)) {
              formData.append(key, JSON.stringify(value));
            } else if (Array.isArray(value)) {
              formData.append(key, JSON.stringify(value));
            } else {
              formData.append(key, String(value));
            }
          }
        });
        await updateSeller(formData).unwrap();
      } else {
        await updateSeller(payload).unwrap();
      }

      toast.success("Profile updated successfully!");
      router.push("/seller/profile");
    } catch (err: any) {
      console.error("Submit failed:", err);
      toast.error(err?.data?.error || err?.data?.message || "Failed to update profile. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-to-br from-stone-50 via-white to-stone-50">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-stone-600 font-inter">Loading profile...</div>
          </div>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen gradient-to-br from-stone-50 via-white to-stone-50">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="text-lg text-red-600 font-inter">Error loading data</div>
            <button
              onClick={() => {
                refetch();
                toast.error("Please refresh the page or contact support.");
              }}
              className="px-4 py-2 bg-yogreet-sage text-white rounded-md hover:bg-yogreet-sage/90 transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
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
    <main className="min-h-screen gradient-to-br from-stone-50 via-white to-stone-50">
      <PageHero
        title="Edit Profile"
        subtitle=""
        description="Update your seller profile information in 5 simple steps."
        showBackButton={false}
        breadcrumb={{
          items: [
            { label: "Home", href: "/seller" },
            { label: "Profile", href: "/seller/profile" },
            { label: "Edit Profile", isActive: true },
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
              <button
                key={i}
                type="button"
                onClick={() => {
                  setStep(i);
                  router.push(`/seller/edit-profile/${i}`);
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
            <Step1BasicInformation data={data} updateData={updateData} setUploadedFiles={handleSetUploadedFiles} isLoading={isUpdating} />
          )}
          {step === 2 && (
            <Step2AboutStore
              data={{ about: data.about, storePhotos: data.storePhotos }}
              updateData={updateData}
              setUploadedFiles={handleSetUploadedFiles}
              isLoading={isUpdating}
            />
          )}
          {step === 3 && (
            <Step2AddressInformation data={data} updateData={updateData} isLoading={isUpdating} />
          )}
          {step === 4 && (
            <Step4SocialMediaWebsite data={data} updateData={updateData} isLoading={isUpdating} />
          )}

          <div className="flex flex-col sm:flex-row justify-between gap-3 mt-8 pt-6 border-t border-stone-200">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className="px-6 py-2 border border-stone-300 text-stone-700 rounded-md hover:bg-stone-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto cursor-pointer"
            >
              Previous
            </button>
            {step < 4 ? (
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  onClick={async () => {
                    try {
                      setIsSavingOnly(true);
                      await handleSave();
                    } finally {
                      setIsSavingOnly(false);
                    }
                  }}
                  disabled={isUpdating || isSavingOnly || isSavingAndNext}
                  className="px-6 py-2 border border-yogreet-sage text-yogreet-sage cursor-pointer rounded-md hover:bg-yogreet-sage/10 transition-colors w-full sm:w-auto disabled:opacity-50"
                >
                  {isSavingOnly ? "Saving..." : "Save"}
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
                  disabled={isUpdating || isSavingOnly || isSavingAndNext}
                  className="px-6 py-2 bg-yogreet-sage text-white cursor-pointer rounded-md hover:bg-yogreet-sage/90 transition-colors w-full sm:w-auto disabled:opacity-50"
                >
                  {isSavingAndNext ? "Saving..." : "Save and Next"}
                </button>
              </div>
            ) : (
              <button onClick={handleSubmit} disabled={isUpdating} className="px-6 py-2 bg-yogreet-sage text-white rounded-md hover:bg-yogreet-sage/90 transition-colors flex items-center justify-center sm:justify-start w-full sm:w-auto disabled:opacity-50 cursor-pointer">
                <Save className="w-4 h-4 mr-2" />
                {isUpdating ? "Saving..." : "Save Profile"}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

