"use client";

import { AlertCircle } from "lucide-react";

interface VerificationStatusMessageProps {
  isVerified: boolean;
  progress: number;
}

export default function VerificationStatusMessage({ isVerified, progress }: VerificationStatusMessageProps) {
  // Show under review message when all documents are uploaded (100% progress)
  if (progress === 100) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-manrope font-medium text-blue-800 mb-1">
              Account Under Review
            </h3>
            <p className="text-sm text-blue-700 font-inter">
              All required documents have been uploaded. Your account is under surveillance and will be verified in a short time.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-manrope font-medium text-amber-800 mb-1">
            Account Not Verified
          </h3>
          <p className="text-sm text-amber-700 font-inter mb-2">
            Your seller account is currently not verified. To complete verification and enable exports, please upload all required documents.
          </p>
          <p className="text-xs text-amber-600 font-inter">
            Current completion: <span className="font-semibold">{progress}%</span>. Complete all document sections to proceed with verification.
          </p>
        </div>
      </div>
    </div>
  );
}

