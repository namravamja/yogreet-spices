"use client";

import { ShieldCheck, ClipboardCheck, Edit } from "lucide-react";
import { useRouter } from "next/navigation";

interface FoodSafetyComplianceProps {
  sellerData: any;
  onEdit?: () => void;
}

export default function FoodSafetyCompliance({
  sellerData,
  onEdit,
}: FoodSafetyComplianceProps) {
  const router = useRouter();
  return (
    <div className="bg-white border border-stone-200 shadow-sm">
      <div className="p-6 border-b border-stone-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-manrope font-medium text-yogreet-charcoal flex items-center">
            <ShieldCheck className="w-5 h-5 mr-2 text-yogreet-sage" />
            Food &amp; Safety Compliance
          </h2>
          <button
            onClick={() => (onEdit ? onEdit() : router.push("/seller/verify-document/3"))}
            className="px-3 py-1.5 border border-yogreet-sage text-yogreet-sage rounded-md hover:bg-yogreet-sage/10 transition-colors cursor-pointer text-sm font-manrope flex items-center gap-1.5"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-sm font-manrope font-medium text-stone-700 flex items-center mb-4">
              <ClipboardCheck className="w-4 h-4 mr-2 text-yogreet-sage" />
              FSSAI Details
            </h3>
            <div>
              <label className="block text-sm font-manrope font-medium text-stone-700 mb-1">
                FSSAI License Number *
              </label>
              <p className={`py-2 font-inter ${sellerData?.fssaiLicenseNumber ? "text-stone-600" : "text-red-500"}`}>
                {sellerData?.fssaiLicenseNumber || "not provided"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-manrope font-medium text-stone-700 mb-1">
                FSSAI Certificate
              </label>
              {sellerData?.fssaiCertificate ? (
                <a href={sellerData.fssaiCertificate} target="_blank" rel="noopener noreferrer" className="text-yogreet-sage hover:underline font-inter">
                  View Document
                </a>
              ) : (
                <p className="text-red-500 font-inter">not provided</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


