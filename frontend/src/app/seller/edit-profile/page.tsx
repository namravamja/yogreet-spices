"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { User, MapPin, Truck, Globe, Save } from "lucide-react";
import PageHero from "@/components/shared/PageHero";
import ConfirmationModal from "@/components/shared/ConfirmationModal";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Step1BasicInformation from "./components/step1-basic-information";
import Step2AddressInformation from "./components/step2-address-information";
import Step3ShippingLogistics from "./components/step3-shipping-logistics";
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

  // Step 2: Address Information
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

  // Step 3: Shipping & Logistics
  shippingType: string;
  serviceAreas: string[];
  returnPolicy: string;

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
    shippingType: "",
    serviceAreas: [],
    returnPolicy: "",
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
        const warehouseAddr = sellerData.warehouseAddress;
        const socialLinksData = sellerData.socialLinks;
        
        const loaded: SellerProfileData = {
          fullName: sellerData.fullName || "",
          companyName: sellerData.companyName || sellerData.storeName || "", // Backward compatibility
          email: sellerData.email || "",
          mobile: sellerData.mobile || "",
          businessType: sellerData.businessType || "",
          productCategories: Array.isArray(sellerData.productCategories) ? sellerData.productCategories : [],
          businessLogo: sellerData.businessLogo || "",
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
          warehouseAddress: warehouseAddr ? {
            sameAsBusiness: warehouseAddr.sameAsBusiness ?? true,
            street: warehouseAddr.street || "",
            city: warehouseAddr.city || "",
            state: warehouseAddr.state || "",
            country: warehouseAddr.country || "",
            pinCode: warehouseAddr.pinCode || "",
          } : {
            sameAsBusiness: true,
            street: "",
            city: "",
            state: "",
            country: "",
            pinCode: "",
          },
          shippingType: sellerData.shippingType || "",
          serviceAreas: Array.isArray(sellerData.serviceAreas) ? sellerData.serviceAreas : [],
          returnPolicy: sellerData.returnPolicy || "",
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

  const saveStep1Data = async (): Promise<boolean> => {
    try {
      if (!data.fullName?.trim()) {
        toast.error("Full name is required");
        return false;
      }
      if (!data.companyName?.trim()) {
        toast.error("Company name is required");
        return false;
      }
      if (!data.email?.trim()) {
        toast.error("Email is required");
        return false;
      }

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

  const saveStep2Data = async (): Promise<boolean> => {
    try {
      if (!data.businessAddress?.street?.trim()) {
        toast.error("Business address street is required");
        return false;
      }

      const payload: any = {
        businessAddress: data.businessAddress,
        warehouseAddress: data.warehouseAddress,
      };

      await updateSeller(payload).unwrap();

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
        shippingType: data.shippingType || "",
        serviceAreas: data.serviceAreas || [],
        returnPolicy: data.returnPolicy || "",
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
    <MapPin key="2" className="w-4 h-4 sm:w-6 sm:h-6" />, // Address Information
    <Truck key="3" className="w-4 h-4 sm:w-6 sm:h-6" />, // Shipping & Logistics
    <Globe key="4" className="w-4 h-4 sm:w-6 sm:h-6" />, // Social Media & Website
  ];

  const stepTitles = [
    "Basic Information",
    "Address Information",
    "Shipping & Logistics",
    "Social Media & Website",
  ];

  const handleSubmit = async () => {
    // Light validation: ensure essential fields are present
    if (!data.fullName?.trim()) return toast.error("Full name is required");
    if (!data.companyName?.trim()) return toast.error("Company name is required");
    if (!data.email?.trim()) return toast.error("Email is required");
    if (!data.mobile?.trim()) return toast.error("Mobile number is required");
    if (!data.businessType?.trim()) return toast.error("Business type is required");

    try {
      // Prepare FormData if there's a logo file
      const formData = new FormData();
      const hasLogoFile = uploadedFiles.businessLogo && uploadedFiles.businessLogo instanceof File;
      
      if (hasLogoFile) {
        formData.append("businessLogo", uploadedFiles.businessLogo as File);
      }

      // Add all other fields to FormData or JSON
      const payload: any = {
        fullName: data.fullName,
        companyName: data.companyName, // Merged from storeName and companyName
        email: data.email,
        mobile: data.mobile,
        businessType: data.businessType,
        productCategories: data.productCategories,
        shippingType: data.shippingType,
        serviceAreas: data.serviceAreas,
        returnPolicy: data.returnPolicy,
        businessAddress: data.businessAddress,
        warehouseAddress: data.warehouseAddress,
        socialLinks: data.socialLinks,
      };

      // Only add logo URL if there's no file (existing logo)
      if (!hasLogoFile && data.businessLogo) {
        payload.businessLogo = data.businessLogo;
      }

      // Use FormData if there's a file, otherwise use JSON
      if (hasLogoFile) {
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
        description="Update your seller profile information in 4 simple steps."
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
            <Step1BasicInformation data={data} updateData={updateData} setUploadedFiles={handleSetUploadedFiles} isLoading={isUpdating} />
          )}
          {step === 2 && (
            <Step2AddressInformation data={data} updateData={updateData} isLoading={isUpdating} />
          )}
          {step === 3 && (
            <Step3ShippingLogistics data={data} updateData={updateData} isLoading={isUpdating} />
          )}
          {step === 4 && (
            <Step4SocialMediaWebsite data={data} updateData={updateData} isLoading={isUpdating} />
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
                {isUpdating ? "Saving..." : "Save Profile"}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

