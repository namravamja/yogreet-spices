"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Edit, User } from "lucide-react";
import BasicInformation from "./components/basic-information";
import AddressInformation from "./components/address-information";
import SocialMediaLinks from "./components/social-media-links";
import ProfileProgress from "./components/ProfileProgress";
import AboutStore from "./components/about-store";
import ReviewsSection from "./components/reviews-section";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { X } from "lucide-react";
import Step1BasicInformation from "../edit-profile/components/step1-basic-information";
import Step2AboutStore from "../edit-profile/components/step2-about-store";
import Step2AddressInformation from "../edit-profile/components/step2-address-information";
import Step3ShippingLogistics from "../edit-profile/components/step3-shipping-logistics";
import Step4SocialMediaWebsite from "../edit-profile/components/step4-social-media-website";
import { useUpdateSellerMutation } from "@/services/api/sellerApi";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useGetSellerQuery } from "@/services/api/sellerApi";

export default function SellerProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth("seller");
  const { data: sellerData, isLoading: isDataLoading, isError, error, refetch } = useGetSellerQuery(undefined);
  const [updateSeller, { isLoading: isSaving }] = useUpdateSellerMutation();
  const [editor, setEditor] = React.useState<null | "basic" | "about" | "address" | "shipping" | "social">(null);
  const [localData, setLocalData] = React.useState<any>({});
  const [uploadedFiles, setUploadedFiles] = React.useState<Record<string, File | File[]>>({});

  const handleEditProfile = () => {
    router.push("/seller/edit-profile");
  };

  const isLoading = isAuthLoading || isDataLoading;

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen gradient-to-br from-stone-50 via-white to-stone-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yogreet-sage mx-auto mb-4"></div>
              <p className="text-stone-600 font-inter">Loading profile data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated || isError) {
    return (
      <div className="min-h-screen gradient-to-br from-stone-50 via-white to-stone-50">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center py-16">
            <User className="w-24 h-24 mx-auto text-stone-300 mb-6" />
            <h1 className="text-3xl font-poppins font-light text-yogreet-charcoal mb-4">
              {isError ? "Error Loading Profile" : "Login Required"}
            </h1>
            <p className="text-stone-600 mb-8 font-inter">
              {isError 
                ? error && "status" in error
                  ? `Error ${error.status}: ${typeof error.data === "object" && error.data && "error" in error.data ? error.data.error : "Failed to load profile"}`
                  : "Failed to load seller profile. Please try again."
                : "Please login to view your seller profile."}
            </p>
            <div className="flex gap-4 justify-center">
              {isError && (
                <button
                  onClick={() => refetch()}
                  className="bg-yogreet-sage hover:bg-yogreet-sage/90 text-white px-6 py-3 font-manrope font-medium transition-colors cursor-pointer rounded-md"
                >
                  Retry
                </button>
              )}
              {!isAuthenticated && (
                <button
                  onClick={() => router.push('/')}
                  className="bg-yogreet-sage hover:bg-yogreet-sage/90 text-white px-6 py-3 font-manrope font-medium transition-colors cursor-pointer rounded-md"
                >
                  Go to Login
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle no data state (data is null but no error)
  if (!sellerData) {
    return (
      <div className="min-h-screen gradient-to-br from-stone-50 via-white to-stone-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <User className="w-24 h-24 mx-auto text-stone-300 mb-6" />
              <p className="text-stone-600 mb-4 font-inter text-lg">No profile data found</p>
              <button
                onClick={handleEditProfile}
                className="bg-yogreet-sage hover:bg-yogreet-sage/90 text-white px-6 py-3 font-manrope font-medium transition-colors cursor-pointer rounded-md"
              >
                Create Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const openEditor = (type: typeof editor) => {
    setLocalData(sellerData);
    setUploadedFiles({});
    setEditor(type);
  };

  const updateData = (updates: any) => {
    setLocalData((prev: any) => ({ ...prev, ...updates }));
  };

  const handleSave = async () => {
    try {
      const hasLogoFile = uploadedFiles.businessLogo && uploadedFiles.businessLogo instanceof File;
      const hasStorePhotosFiles = Array.isArray(uploadedFiles.storePhotos) && (uploadedFiles.storePhotos as File[]).length > 0;
      if (hasLogoFile || hasStorePhotosFiles) {
        const formData = new FormData();
        if (hasLogoFile) formData.append("businessLogo", uploadedFiles.businessLogo as File);
        if (hasStorePhotosFiles) (uploadedFiles.storePhotos as File[]).forEach((f) => formData.append("storePhotos", f));
        // add JSON fields snapshot
        const payload: any = {};
        if (editor === "basic") {
          Object.assign(payload, {
            fullName: localData.fullName || "",
            companyName: localData.companyName || "",
            email: localData.email || "",
            mobile: localData.mobile || "",
            businessType: localData.businessType || "",
            productCategories: localData.productCategories || [],
            businessLogo: localData.businessLogo || "",
          });
        } else if (editor === "about") {
          Object.assign(payload, {
            about: localData.about || "",
            storePhotos: Array.isArray(localData.storePhotos) ? localData.storePhotos : [],
          });
        } else if (editor === "address") {
          Object.assign(payload, {
            businessAddress: localData.businessAddress,
          });
        } else if (editor === "shipping") {
          Object.assign(payload, {
            shippingType: localData.shippingType || "",
            serviceAreas: localData.serviceAreas || [],
            returnPolicy: localData.returnPolicy || "",
          });
        } else if (editor === "social") {
          Object.assign(payload, { socialLinks: localData.socialLinks || {} });
        }
        Object.entries(payload).forEach(([k, v]) => {
          if (v === undefined || v === null) return;
          if (typeof v === "object") formData.append(k, JSON.stringify(v));
          else formData.append(k, String(v));
        });
        await updateSeller(formData).unwrap();
      } else {
        // JSON path
        let payload: any = {};
        if (editor === "basic") {
          payload = {
            fullName: localData.fullName || "",
            companyName: localData.companyName || "",
            email: localData.email || "",
            mobile: localData.mobile || "",
            businessType: localData.businessType || "",
            productCategories: localData.productCategories || [],
            businessLogo: localData.businessLogo || "",
          };
        } else if (editor === "about") {
          payload = {
            about: localData.about || "",
            storePhotos: Array.isArray(localData.storePhotos) ? localData.storePhotos : [],
          };
        } else if (editor === "address") {
          payload = {
            businessAddress: localData.businessAddress,
          };
        } else if (editor === "shipping") {
          payload = {
            shippingType: localData.shippingType || "",
            serviceAreas: localData.serviceAreas || [],
            returnPolicy: localData.returnPolicy || "",
          };
        } else if (editor === "social") {
          payload = { socialLinks: localData.socialLinks || {} };
        }
        await updateSeller(payload).unwrap();
      }
      toast.success("Saved successfully");
      setEditor(null);
      refetch();
    } catch (e: any) {
      toast.error(e?.data?.error || "Failed to save");
    }
  };

  return (
    <div className="min-h-screen gradient-to-br from-stone-50 via-white to-stone-50">
      <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8 max-w-4/5">
        {/* Header */}
        <div className="mb-6">
          
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-sm md:text-base font-manrope text-stone-600">
                  <span className="text-xl">&gt;</span> Home / seller / profile
                </h1>
              </div>
          </div>
        </div>

        {/* Two-column layout: left larger, right smaller */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Main content (larger) */}
          <div className="lg:col-span-2 space-y-6">
            <BasicInformation sellerData={sellerData as any} onEdit={() => openEditor("basic")} />
            <AboutStore sellerData={sellerData as any} onEdit={() => openEditor("about")} />
            <ReviewsSection reviews={(sellerData as any)?.Review} />
          </div>
          {/* Right - Sidebar (smaller) */}
          <div className="lg:col-span-1 space-y-6">
            <ProfileProgress profileData={sellerData as any} />
            <AddressInformation sellerData={sellerData as any} onEdit={() => openEditor("address")} />
            <SocialMediaLinks sellerData={sellerData as any} onEdit={() => openEditor("social")} />
          </div>
        </div>
      </div>
      <Sheet open={!!editor} onOpenChange={(o) => !o && setEditor(null)}>
         <SheetContent side="right" className="sm:max-w-lg md:max-w-xl">
           <SheetHeader className="px-10 py-5 border-b border-stone-200">
             <div className="flex items-center justify-between gap-4">
               <SheetTitle>
                 {editor === "basic" && "Edit Basic Information"}
                 {editor === "about" && "Edit About & Store Photos"}
                 {editor === "address" && "Edit Address Information"}
                 {editor === "shipping" && "Edit Shipping & Logistics"}
                 {editor === "social" && "Edit Social Media & Website"}
               </SheetTitle>
               <SheetClose
                 aria-label="Close editor"
                 className="inline-flex items-center gap-2 rounded-md border border-stone-300 px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
               >
                 <X className="w-4 h-4" />
                 Close
               </SheetClose>
             </div>
           </SheetHeader>
          <div className="px-10 py-6 overflow-y-auto space-y-8">
            {editor === "basic" && (
              <Step1BasicInformation
                data={localData}
                updateData={updateData}
                setUploadedFiles={setUploadedFiles}
                isLoading={isSaving}
              />
            )}
            {editor === "about" && (
              <Step2AboutStore
                data={{ about: localData.about || "", storePhotos: localData.storePhotos || [] }}
                updateData={updateData}
                setUploadedFiles={setUploadedFiles}
                isLoading={isSaving}
              />
            )}
            {editor === "address" && (
              <Step2AddressInformation data={localData} updateData={updateData} isLoading={isSaving} />
            )}
            {editor === "shipping" && (
              <Step3ShippingLogistics data={localData} updateData={updateData} isLoading={isSaving} />
            )}
            {editor === "social" && (
              <Step4SocialMediaWebsite data={localData} updateData={updateData} isLoading={isSaving} />
            )}
          </div>
          <div className="px-10 py-5 border-t border-stone-200 flex flex-col sm:flex-row justify-end gap-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-yogreet-sage text-white rounded-md hover:bg-yogreet-sage/90 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => setEditor(null)}
              className="px-4 py-2 border border-stone-300 text-stone-700 rounded-md hover:bg-stone-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

