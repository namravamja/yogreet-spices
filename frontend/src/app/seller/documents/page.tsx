"use client";

import { useRouter } from "next/navigation";
import { Edit, FileText, User, X } from "lucide-react";
import BusinessIdentityVerification from "./components/business-identity-verification";
import ExportEligibilityVerification from "./components/export-eligibility-verification";
import FoodSafetyCompliance from "./components/food-safety-compliance";
import ShippingLogistics from "./components/shipping-logistics";
import ExportDocumentationShipmentCapability from "./components/export-documentation-shipment-capability";
import DocumentProgress from "./components/DocumentProgress";
import VerificationStatusMessage from "./components/VerificationStatusMessage";
import Step1BusinessIdentity from "../verify-document/components/step1-business-identity";
import Step2ExportEligibility from "../verify-document/components/step2-export-eligibility";
import Step3FoodSafetyCompliance from "../verify-document/components/step3-food-safety-compliance";
import Step4ExportDocsShipment from "../verify-document/components/step4-export-docs-shipment";
import Step4ShippingLogistics from "../verify-document/components/step4-shipping-logistics";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { useGetSellerQuery } from "@/services/api/sellerApi";
import { useUpdateSellerVerificationMutation } from "@/services/api/sellerApi";
import React from "react";

export default function SellerDocumentsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth("seller");
  const { data: sellerData, isLoading: isDataLoading, isError, error, refetch } = useGetSellerQuery(undefined);
  const [updateSellerVerification, { isLoading: isSaving }] = useUpdateSellerVerificationMutation();
  const [editor, setEditor] = React.useState<null | "identity" | "eligibility" | "safety" | "shipment" | "shipping">(null);
  const [localData, setLocalData] = React.useState<any>({});
  const [uploadedFiles, setUploadedFiles] = React.useState<Record<string, File | File[]>>({});

  // Get document completion from API response
  const documentProgress = sellerData?.documentCompletion || 0;
  
  const isVerified = documentProgress === 100;

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
      // Determine if we need FormData (any files uploaded)
      const hasFiles = Object.keys(uploadedFiles).length > 0;
      const payload: any = {};
      if (editor === "identity") {
        Object.assign(payload, {
          companyName: localData.companyName || "",
          businessType: localData.businessType || "",
          panNumber: localData.panNumber || "",
          gstNumber: localData.gstNumber || "",
          aadharNumber: localData.aadharNumber || "",
          fullName: localData.fullName || localData.ownerFullName || "",
          ownerFullName: localData.fullName || localData.ownerFullName || "",
          incorporationCertificate: localData.incorporationCertificate || "",
          msmeUdyamCertificate: localData.msmeUdyamCertificate || "",
          businessAddressProof: localData.businessAddressProof || "",
          ownerIdDocument: localData.ownerIdDocument || "",
        });
      } else if (editor === "eligibility") {
        Object.assign(payload, {
          iecCode: localData.iecCode || "",
          apedaRegistrationNumber: localData.apedaRegistrationNumber || "",
          spicesBoardRegistrationNumber: localData.spicesBoardRegistrationNumber || "",
          bankAccountHolderName: localData.bankAccountHolderName || "",
          bankAccountNumber: localData.bankAccountNumber || "",
          bankIfscCode: localData.bankIfscCode || "",
          iecCertificate: localData.iecCertificate || "",
          apedaCertificate: localData.apedaCertificate || "",
          spicesBoardCertificate: localData.spicesBoardCertificate || "",
          tradeLicense: localData.tradeLicense || "",
          bankProofDocument: localData.bankProofDocument || "",
        });
      } else if (editor === "safety") {
        Object.assign(payload, {
          fssaiLicenseNumber: localData.fssaiLicenseNumber || "",
          fssaiCertificate: localData.fssaiCertificate || "",
        });
      } else if (editor === "shipment") {
        Object.assign(payload, {
          certificateOfOriginCapability: !!localData.certificateOfOriginCapability,
          phytosanitaryCertificateCapability: !!localData.phytosanitaryCertificateCapability,
          packagingCompliance: !!localData.packagingCompliance,
          fumigationCertificateCapability: !!localData.fumigationCertificateCapability,
          exportLogisticsPrepared: !!localData.exportLogisticsPrepared,
        });
      } else if (editor === "shipping") {
        Object.assign(payload, {
          shippingType: localData.shippingType || "",
          serviceAreas: Array.isArray(localData.serviceAreas) ? localData.serviceAreas : [],
          returnPolicy: localData.returnPolicy || "",
        });
      }
      // Calculate document completion after merging localData with payload
      // documentCompletion is calculated on backend, no need to calculate or send it

      if (hasFiles) {
        const formData = new FormData();
        Object.entries(uploadedFiles).forEach(([key, val]) => {
          if (Array.isArray(val)) {
            (val as File[]).forEach((f) => formData.append(key, f));
          } else if (val instanceof File) {
            formData.append(key, val);
          }
        });
        Object.entries(payload).forEach(([k, v]) => {
          if (v === undefined || v === null) return;
          if (typeof v === "object") formData.append(k, JSON.stringify(v));
          else formData.append(k, String(v));
        });
        await updateSellerVerification(formData).unwrap();
      } else {
        await updateSellerVerification(payload).unwrap();
      }
      setEditor(null);
      refetch();
    } catch (e) {
      // no-op toast here; keep UI clean on documents page
    }
  };

  const isLoading = isAuthLoading || isDataLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-to-br from-stone-50 via-white to-stone-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yogreet-sage mx-auto mb-4"></div>
              <p className="text-stone-600 font-inter">Loading documents...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || isError) {
    return (
      <div className="min-h-screen gradient-to-br from-stone-50 via-white to-stone-50">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center py-16">
            <User className="w-24 h-24 mx-auto text-stone-300 mb-6" />
            <h1 className="text-3xl font-poppins font-light text-yogreet-charcoal mb-4">
              {isError ? "Error Loading Documents" : "Login Required"}
            </h1>
            <p className="text-stone-600 mb-8 font-inter">
              {isError 
                ? error && "status" in error
                  ? `Error ${error.status}: ${typeof error.data === "object" && error.data && "error" in error.data ? error.data.error : "Failed to load documents"}`
                  : "Failed to load seller documents. Please try again."
                : "Please login to view your seller documents."}
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

  if (!sellerData) {
    return (
      <div className="min-h-screen gradient-to-br from-stone-50 via-white to-stone-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <FileText className="w-24 h-24 mx-auto text-stone-300 mb-6" />
              <p className="text-stone-600 mb-4 font-inter text-lg">No documents found</p>
              <button
                onClick={() => router.push("/seller/edit-profile")}
                className="bg-yogreet-sage hover:bg-yogreet-sage/90 text-white px-6 py-3 font-manrope font-medium transition-colors cursor-pointer rounded-md"
              >
                Update Documents
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-to-br from-stone-50 via-white to-stone-50">
      <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8 max-w-4/5">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-sm md:text-base font-manrope text-stone-600">
                <span className="text-xl">&gt;</span> Home / seller / documents
              </h1>
            </div>
          </div>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Main content */}
          <div className="lg:col-span-2 space-y-6">
            <BusinessIdentityVerification sellerData={sellerData as any} onEdit={() => openEditor("identity")} />
            <ExportEligibilityVerification sellerData={sellerData as any} onEdit={() => openEditor("eligibility")} />
            <FoodSafetyCompliance sellerData={sellerData as any} onEdit={() => openEditor("safety")} />
            <ShippingLogistics sellerData={sellerData as any} onEdit={() => openEditor("shipping")} />
            <ExportDocumentationShipmentCapability sellerData={sellerData as any} onEdit={() => openEditor("shipment")} />
          </div>
          {/* Right - Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <DocumentProgress documentCompletion={documentProgress} data={sellerData as any} />
            <VerificationStatusMessage isVerified={isVerified} progress={documentProgress} />
          </div>
        </div>
      </div>
      <Sheet open={!!editor} onOpenChange={(o) => !o && setEditor(null)}>
        <SheetContent side="right" className="sm:max-w-lg md:max-w-xl">
          <SheetHeader className="px-10 py-5 border-b border-stone-200">
            <div className="flex items-center justify-between gap-4">
              <SheetTitle>
                {editor === "identity" && "Edit Business Identity"}
                {editor === "eligibility" && "Edit Export Eligibility"}
                {editor === "safety" && "Edit Food & Safety"}
                {editor === "shipment" && "Edit Export Docs & Shipment"}
                {editor === "shipping" && "Edit Shipping & Logistics"}
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
            {editor === "identity" && (
              <Step1BusinessIdentity
                data={localData as any}
                updateData={updateData}
                setUploadedFiles={setUploadedFiles}
                isLoading={isSaving}
              />
            )}
            {editor === "eligibility" && (
              <Step2ExportEligibility
                data={localData as any}
                updateData={updateData}
                setUploadedFiles={setUploadedFiles}
                isLoading={isSaving}
              />
            )}
            {editor === "safety" && (
              <Step3FoodSafetyCompliance
                data={localData as any}
                updateData={updateData}
                setUploadedFiles={setUploadedFiles}
                isLoading={isSaving}
              />
            )}
            {editor === "shipment" && (
              <Step4ExportDocsShipment
                data={localData as any}
                updateData={updateData}
              />
            )}
            {editor === "shipping" && (
              <Step4ShippingLogistics
                data={localData as any}
                updateData={updateData}
              />
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


