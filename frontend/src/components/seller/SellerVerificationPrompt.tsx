"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle, FileText, User } from "lucide-react";
import { useSellerVerification } from "@/hooks/useSellerVerification";

export function SellerVerificationPrompt() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  
  const {
    isLoading,
    isAuthenticated,
    profileProgress,
    documentVerificationProgress,
    isProfileComplete,
    isDocumentVerificationComplete,
    isFullyVerified,
  } = useSellerVerification();

  // Show modal continuously if seller is authenticated and not fully verified
  useEffect(() => {
    if (!isLoading && isAuthenticated && !isFullyVerified) {
      // Small delay to ensure page is loaded
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    } else if (isFullyVerified) {
      // Close modal if fully verified
      setIsOpen(false);
    }
  }, [isLoading, isAuthenticated, isFullyVerified]);

  const handleCompleteProfile = () => {
    // Navigate to edit profile - modal will stay open until verification complete
    router.push("/seller/edit-profile");
  };

  const handleUploadDocuments = () => {
    // Navigate to verify documents - modal will stay open until verification complete
    router.push("/seller/verify-document/1");
  };

  // Don't render if loading, not authenticated, or fully verified
  if (isLoading || !isAuthenticated || isFullyVerified) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 w-full h-full bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 font-manrope mb-4">Complete Your Seller Profile</h3>
          
          <div className="space-y-6">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
          <p className="text-stone-700 font-inter mb-2">
            To start selling on Yogreet, please complete your profile and verify your documents.
          </p>
        </div>

        {/* Profile Completion Status */}
        <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {isProfileComplete ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <User className="w-5 h-5 text-yellow-600" />
              )}
              <span className="font-manrope font-medium text-stone-900">
                Profile Completion
              </span>
            </div>
            <span className={`font-poppins font-bold ${
              isProfileComplete ? "text-green-600" : "text-yellow-600"
            }`}>
              {profileProgress}%
            </span>
          </div>
          <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isProfileComplete ? "bg-green-600" : "bg-yellow-600"
              }`}
              style={{ width: `${profileProgress}%` }}
            />
          </div>
          {!isProfileComplete && (
            <p className="text-sm text-stone-600 mt-2 font-inter">
              Complete your business information to proceed.
            </p>
          )}
        </div>

        {/* Document Verification Status */}
        <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {isDocumentVerificationComplete ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <FileText className="w-5 h-5 text-yellow-600" />
              )}
              <span className="font-manrope font-medium text-stone-900">
                Document Verification
              </span>
            </div>
            <span className={`font-poppins font-bold ${
              isDocumentVerificationComplete ? "text-green-600" : "text-yellow-600"
            }`}>
              {documentVerificationProgress}%
            </span>
          </div>
          <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isDocumentVerificationComplete ? "bg-green-600" : "bg-yellow-600"
              }`}
              style={{ width: `${documentVerificationProgress}%` }}
            />
          </div>
          {!isDocumentVerificationComplete && (
            <p className="text-sm text-stone-600 mt-2 font-inter">
              Upload required documents to verify your business.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-stone-200">
          <Link
            href="/seller/edit-profile"
            onClick={handleCompleteProfile}
            className="flex-1 bg-yogreet-sage hover:bg-yogreet-sage/90 text-white px-6 py-3 font-manrope font-medium transition-colors cursor-pointer rounded-md flex items-center justify-center gap-2"
          >
            <User className="w-5 h-5" />
            {isProfileComplete ? "View Profile" : "Complete Profile"}
          </Link>
          <Link
            href="/seller/verify-document/1"
            onClick={handleUploadDocuments}
            className="flex-1 bg-yogreet-red hover:bg-yogreet-red/90 text-white px-6 py-3 font-manrope font-medium transition-colors cursor-pointer rounded-md flex items-center justify-center gap-2"
          >
            <FileText className="w-5 h-5" />
            {isDocumentVerificationComplete ? "View Documents" : "Upload Documents"}
          </Link>
        </div>

            <p className="text-xs text-stone-500 text-center font-inter font-semibold">
              This popup will remain until your profile and document verification are 100% complete.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

