"use client";

import { PackageCheck, Truck, FileText, Edit, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

interface ExportDocumentationShipmentCapabilityProps {
  sellerData: any;
  onEdit?: () => void;
}

export default function ExportDocumentationShipmentCapability({
  sellerData,
  onEdit,
}: ExportDocumentationShipmentCapabilityProps) {
  const router = useRouter();
  
  // Check if all required fields are complete (Step 5: 5 boolean fields)
  const isComplete = 
    sellerData?.certificateOfOriginCapability === true &&
    sellerData?.phytosanitaryCertificateCapability === true &&
    sellerData?.packagingCompliance === true &&
    sellerData?.fumigationCertificateCapability === true &&
    sellerData?.exportLogisticsPrepared === true;
  
  const buttonText = isComplete ? "Edit" : "Upload";
  const ButtonIcon = isComplete ? Edit : Upload;
  
  return (
    <div className="bg-white border border-stone-200 shadow-sm">
      <div className="p-6 border-b border-stone-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-manrope font-medium text-yogreet-charcoal flex items-center">
            <PackageCheck className="w-5 h-5 mr-2 text-yogreet-sage" />
            Export Documentation &amp; Shipment Capability
          </h2>
          <button
            onClick={() => (onEdit ? onEdit() : router.push("/seller/verify-document/5"))}
            className="px-3 py-1.5 border border-yogreet-sage text-yogreet-sage rounded-md hover:bg-yogreet-sage/10 transition-colors cursor-pointer text-sm font-manrope flex items-center gap-1.5"
          >
            <ButtonIcon className="w-4 h-4" />
            {buttonText}
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          <h3 className="text-sm font-manrope font-medium text-stone-700 flex items-center mb-4">
            <FileText className="w-4 h-4 mr-2 text-yogreet-sage" />
            Export Documentation &amp; Shipment Capabilities
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-stone-200">
              <label className="text-sm font-manrope font-medium text-stone-700">
                Certificate of Origin Capability
              </label>
              <span className={`px-3 py-1 rounded-full text-xs font-inter ${
                sellerData?.certificateOfOriginCapability 
                  ? "bg-green-100 text-green-700" 
                  : "bg-red-100 text-red-700"
              }`}>
                {sellerData?.certificateOfOriginCapability ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-stone-200">
              <label className="text-sm font-manrope font-medium text-stone-700">
                Phytosanitary Certificate Capability
              </label>
              <span className={`px-3 py-1 rounded-full text-xs font-inter ${
                sellerData?.phytosanitaryCertificateCapability 
                  ? "bg-green-100 text-green-700" 
                  : "bg-red-100 text-red-700"
              }`}>
                {sellerData?.phytosanitaryCertificateCapability ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-stone-200">
              <label className="text-sm font-manrope font-medium text-stone-700">
                Packaging Compliance
              </label>
              <span className={`px-3 py-1 rounded-full text-xs font-inter ${
                sellerData?.packagingCompliance 
                  ? "bg-green-100 text-green-700" 
                  : "bg-red-100 text-red-700"
              }`}>
                {sellerData?.packagingCompliance ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-stone-200">
              <label className="text-sm font-manrope font-medium text-stone-700">
                Fumigation Certificate Capability
              </label>
              <span className={`px-3 py-1 rounded-full text-xs font-inter ${
                sellerData?.fumigationCertificateCapability 
                  ? "bg-green-100 text-green-700" 
                  : "bg-red-100 text-red-700"
              }`}>
                {sellerData?.fumigationCertificateCapability ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <label className="text-sm font-manrope font-medium text-stone-700">
                Export Logistics Prepared
              </label>
              <span className={`px-3 py-1 rounded-full text-xs font-inter ${
                sellerData?.exportLogisticsPrepared 
                  ? "bg-green-100 text-green-700" 
                  : "bg-red-100 text-red-700"
              }`}>
                {sellerData?.exportLogisticsPrepared ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


