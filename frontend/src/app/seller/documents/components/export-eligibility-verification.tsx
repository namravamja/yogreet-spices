"use client";

import { Globe, FileCheck2, Edit } from "lucide-react";
import { useRouter } from "next/navigation";

interface ExportEligibilityVerificationProps {
  sellerData: any;
  onEdit?: () => void;
}

export default function ExportEligibilityVerification({
  sellerData,
  onEdit,
}: ExportEligibilityVerificationProps) {
  const router = useRouter();
  return (
    <div className="bg-white border border-stone-200 shadow-sm">
      <div className="p-6 border-b border-stone-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-manrope font-medium text-yogreet-charcoal flex items-center">
            <Globe className="w-5 h-5 mr-2 text-yogreet-sage" />
            Export Eligibility Verification
          </h2>
          <button
            onClick={() => (onEdit ? onEdit() : router.push("/seller/verify-document/2"))}
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
              <FileCheck2 className="w-4 h-4 mr-2 text-yogreet-sage" />
              Registration & Certificates
            </h3>
            <div>
              <label className="block text-sm font-manrope font-medium text-stone-700 mb-1">
                IEC Code *
              </label>
              <p className={`py-2 font-inter ${sellerData?.iecCode ? "text-stone-600" : "text-red-500"}`}>
                {sellerData?.iecCode || "not provided"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-manrope font-medium text-stone-700 mb-1">
                IEC Certificate
              </label>
              {sellerData?.iecCertificate ? (
                <a href={sellerData.iecCertificate} target="_blank" rel="noopener noreferrer" className="text-yogreet-sage hover:underline font-inter">
                  View Document
                </a>
              ) : (
                <p className="text-red-500 font-inter">not provided</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-manrope font-medium text-stone-700 mb-1">
                Trade License
              </label>
              {sellerData?.tradeLicense ? (
                <a href={sellerData.tradeLicense} target="_blank" rel="noopener noreferrer" className="text-yogreet-sage hover:underline font-inter">
                  View Document
                </a>
              ) : (
                <p className="text-red-500 font-inter">not provided</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-manrope font-medium text-stone-700 mb-1">
                APEDA Registration Number *
              </label>
              <p className={`py-2 font-inter ${sellerData?.apedaRegistrationNumber ? "text-stone-600" : "text-red-500"}`}>
                {sellerData?.apedaRegistrationNumber || "not provided"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-manrope font-medium text-stone-700 mb-1">
                APEDA Certificate
              </label>
              {sellerData?.apedaCertificate ? (
                <a href={sellerData.apedaCertificate} target="_blank" rel="noopener noreferrer" className="text-yogreet-sage hover:underline font-inter">
                  View Document
                </a>
              ) : (
                <p className="text-red-500 font-inter">not provided</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-manrope font-medium text-stone-700 mb-1">
                Spices Board Registration Number *
              </label>
              <p className={`py-2 font-inter ${sellerData?.spicesBoardRegistrationNumber ? "text-stone-600" : "text-red-500"}`}>
                {sellerData?.spicesBoardRegistrationNumber || "not provided"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-manrope font-medium text-stone-700 mb-1">
                Spices Board Certificate
              </label>
              {sellerData?.spicesBoardCertificate ? (
                <a href={sellerData.spicesBoardCertificate} target="_blank" rel="noopener noreferrer" className="text-yogreet-sage hover:underline font-inter">
                  View Document
                </a>
              ) : (
                <p className="text-red-500 font-inter">not provided</p>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-manrope font-medium text-stone-700 flex items-center mb-4">
              <Globe className="w-4 h-4 mr-2 text-yogreet-sage" />
              Bank Details
            </h3>
            <div>
              <label className="block text-sm font-manrope font-medium text-stone-700 mb-1">
                Bank Account Holder Name *
              </label>
              <p className={`py-2 font-inter ${sellerData?.bankAccountHolderName ? "text-stone-600" : "text-red-500"}`}>
                {sellerData?.bankAccountHolderName || "not provided"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-manrope font-medium text-stone-700 mb-1">
                Bank Account Number *
              </label>
              <p className={`py-2 font-inter ${sellerData?.bankAccountNumber ? "text-stone-600" : "text-red-500"}`}>
                {sellerData?.bankAccountNumber || "not provided"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-manrope font-medium text-stone-700 mb-1">
                Bank IFSC Code *
              </label>
              <p className={`py-2 font-inter ${sellerData?.bankIfscCode ? "text-stone-600" : "text-red-500"}`}>
                {sellerData?.bankIfscCode || "not provided"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-manrope font-medium text-stone-700 mb-1">
                Bank Proof Document
              </label>
              {sellerData?.bankProofDocument ? (
                <a href={sellerData.bankProofDocument} target="_blank" rel="noopener noreferrer" className="text-yogreet-sage hover:underline font-inter">
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


