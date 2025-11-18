"use client";

import { BadgeCheck, IdCard, Edit } from "lucide-react";
import { useRouter } from "next/navigation";

interface BusinessIdentityVerificationProps {
  sellerData: any;
  onEdit?: () => void;
}

export default function BusinessIdentityVerification({
  sellerData,
  onEdit,
}: BusinessIdentityVerificationProps) {
  const router = useRouter();
  return (
    <div className="bg-white border border-stone-200 shadow-sm">
      <div className="p-6 border-b border-stone-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-manrope font-medium text-yogreet-charcoal flex items-center">
            <IdCard className="w-5 h-5 mr-2 text-yogreet-sage" />
            Business Identity Verification
          </h2>
          <button
            onClick={() => (onEdit ? onEdit() : router.push("/seller/verify-document/1"))}
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
              <BadgeCheck className="w-4 h-4 mr-2 text-yogreet-sage" />
              Company Details
            </h3>
            <div>
              <label className="block text-sm font-manrope font-medium text-stone-700 mb-1">
                Company Name *
              </label>
              <p className={`py-2 font-inter ${sellerData?.companyName ? "text-stone-600" : "text-red-500"}`}>
                {sellerData?.companyName || "not provided"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-manrope font-medium text-stone-700 mb-1">
                Business Type *
              </label>
              <p className={`py-2 font-inter ${sellerData?.businessType ? "text-stone-600" : "text-red-500"}`}>
                {sellerData?.businessType || "not provided"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-manrope font-medium text-stone-700 mb-1">
                Owner Full Name *
              </label>
              <p className={`py-2 font-inter ${sellerData?.fullName || sellerData?.ownerFullName ? "text-stone-600" : "text-red-500"}`}>
                {sellerData?.fullName || sellerData?.ownerFullName || "not provided"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-manrope font-medium text-stone-700 mb-1">
                PAN Number *
              </label>
              <p className={`py-2 font-inter ${sellerData?.panNumber ? "text-stone-600" : "text-red-500"}`}>
                {sellerData?.panNumber || "not provided"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-manrope font-medium text-stone-700 mb-1">
                GST Number *
              </label>
              <p className={`py-2 font-inter ${sellerData?.gstNumber ? "text-stone-600" : "text-red-500"}`}>
                {sellerData?.gstNumber || "not provided"}
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-manrope font-medium text-stone-700 flex items-center mb-4">
              <IdCard className="w-4 h-4 mr-2 text-yogreet-sage" />
              Documents
            </h3>
            <div>
              <label className="block text-sm font-manrope font-medium text-stone-700 mb-1">
                Owner ID Document
              </label>
              {sellerData?.ownerIdDocument ? (
                <a href={sellerData.ownerIdDocument} target="_blank" rel="noopener noreferrer" className="text-yogreet-sage hover:underline font-inter">
                  View Document
                </a>
              ) : (
                <p className="text-red-500 font-inter">not provided</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-manrope font-medium text-stone-700 mb-1">
                Incorporation Certificate
              </label>
              {sellerData?.incorporationCertificate ? (
                <a href={sellerData.incorporationCertificate} target="_blank" rel="noopener noreferrer" className="text-yogreet-sage hover:underline font-inter">
                  View Document
                </a>
              ) : (
                <p className="text-red-500 font-inter">not provided</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-manrope font-medium text-stone-700 mb-1">
                MSME / Udyam Certificate
              </label>
              {sellerData?.msmeUdyamCertificate ? (
                <a href={sellerData.msmeUdyamCertificate} target="_blank" rel="noopener noreferrer" className="text-yogreet-sage hover:underline font-inter">
                  View Document
                </a>
              ) : (
                <p className="text-red-500 font-inter">not provided</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-manrope font-medium text-stone-700 mb-1">
                Business Address Proof
              </label>
              {sellerData?.businessAddressProof ? (
                <a href={sellerData.businessAddressProof} target="_blank" rel="noopener noreferrer" className="text-yogreet-sage hover:underline font-inter">
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


