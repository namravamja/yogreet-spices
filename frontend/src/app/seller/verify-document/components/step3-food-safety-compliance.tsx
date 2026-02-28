"use client";

import type React from "react";
import { useRef, useState, useCallback } from "react";
import { VerifiableInput, useVerificationTracker, VerificationStatus } from "@/components/shared/VerifiableInput";
import { useGetVerificationStatusQuery } from "@/services/api/verificationApi";
import { FiShield } from "react-icons/fi";

interface SellerFoodSafetyData {
  fssaiLicenseNumber: string;
  fssaiCertificate?: string;
}

interface Step3Props {
  data: SellerFoodSafetyData & Record<string, any>;
  updateData: (updates: Partial<SellerFoodSafetyData>) => void;
  setUploadedFiles: (
    files:
      | Record<string, File | File[]>
      | ((prev: Record<string, File | File[]>) => Record<string, File | File[]>)
  ) => void;
  onSave?: () => Promise<boolean>;
  isLoading?: boolean;
  onVerificationStatusChange?: (allVerified: boolean) => void;
}

export default function Step3FoodSafetyCompliance({ data, updateData, setUploadedFiles, onVerificationStatusChange }: Step3Props) {
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [localFiles, setLocalFiles] = useState<Record<string, File | null>>({});
  
  // Fetch stored verification status from database
  const { data: storedStatus } = useGetVerificationStatusQuery();
  const autoVerified = storedStatus?.autoVerified || {};
  
  // Track verification status for FSSAI
  const verificationTracker = useVerificationTracker(['fssaiLicenseNumber']);

  const handleChange = (field: keyof SellerFoodSafetyData, value: any) => {
    updateData({ [field]: value } as Partial<SellerFoodSafetyData>);
  };

  // Handle verification status change
  const handleVerificationChange = useCallback((field: string) => (status: VerificationStatus) => {
    verificationTracker.updateFieldStatus(field, status);
    // Notify parent about verification status
    const allVerified = verificationTracker.areAllFieldsVerified();
    onVerificationStatusChange?.(allVerified);
  }, [verificationTracker, onVerificationStatusChange]);

  const renderUpload = (id: string, label: string) => {
    const file = localFiles[id] || null;
    const existingUrl = (data as any)[id] as string | undefined;
    return (
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">{label}</label>
        <input
          ref={(el) => {
            inputRefs.current[id] = el;
          }}
          type="file"
          accept="application/pdf,image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0] || null;
            setLocalFiles((prev) => ({ ...prev, [id]: f }));
            if (f) setUploadedFiles((prev) => ({ ...(typeof prev === "function" ? {} : prev), [id]: f } as any));
          }}
        />
        {!file ? (
          <div
            onClick={() => inputRefs.current[id]?.click()}
            className="mt-1 flex items-center justify-center px-6 py-12 border-2 border-dashed border-stone-300 rounded-md hover:border-yogreet-sage/50 transition-colors cursor-pointer"
          >
            <div className="space-y-1 text-center flex flex-col items-center">
              <div className="text-sm text-yogreet-warm-gray">
                <span className="font-medium text-yogreet-sage">Click to upload</span> or drag and drop
              </div>
              <p className="text-xs text-yogreet-warm-gray">PDF, JPG, PNG up to 10MB</p>
            </div>
          </div>
        ) : (
          <div className="mt-1 p-3 border-2 border-dashed border-stone-300 rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-700">{file.name}</p>
                <p className="text-xs text-stone-500">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <button
                type="button"
                className="text-red-500 hover:text-red-700 cursor-pointer"
                onClick={() => {
                  setLocalFiles((prev) => ({ ...prev, [id]: null }));
                  setUploadedFiles((prev) => {
                    const next = typeof prev === "function" ? (prev as any)({}) : { ...(prev as any) };
                    delete (next as any)[id];
                    return next;
                  });
                  if (inputRefs.current[id]) inputRefs.current[id]!.value = "";
                }}
              >
                Remove
              </button>
            </div>
          </div>
        )}
        {!file && existingUrl ? (
          <div className="mt-2 p-3 border border-stone-200 rounded-md bg-stone-50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-stone-700">Current document preview</p>
              <button
                type="button"
                className="text-red-500 hover:text-red-700 text-sm cursor-pointer"
                onClick={() => {
                  updateData({ [id]: "" } as any);
                }}
              >
                Remove
              </button>
            </div>
            {/\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(existingUrl) ? (
              <img src={existingUrl} alt="Document preview" className="max-h-64 w-auto object-contain border border-stone-200 bg-white" />
            ) : /\.(pdf)(\?.*)?$/i.test(existingUrl) ? (
              <object data={existingUrl} type="application/pdf" className="w-full h-80 border border-stone-200 bg-white">
                <iframe src={existingUrl} className="w-full h-80" />
              </object>
            ) : (
              <div className="text-sm text-stone-600">
                Preview not available.
                <a href={existingUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-yogreet-sage underline">
                  Open file
                </a>
              </div>
            )}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-light text-yogreet-charcoal mb-4 sm:mb-6">Food & Safety Compliance</h2>

      {/* FSSAI verification info banner */}
      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
            <FiShield className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-amber-800">FSSAI Format Validation</h4>
            <p className="text-xs text-amber-700 mt-1">
              Your FSSAI license number format is validated automatically. The license type is determined from the first 2 digits:
              <span className="block mt-1 text-amber-600">
                10/11/12 = Basic Registration | 20/21/22 = State License
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* FSSAI License Number with auto-verification */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-3">
          <VerifiableInput
            id="fssaiLicenseNumber"
            label="FSSAI License Number"
            value={data.fssaiLicenseNumber || ""}
            onChange={(value) => handleChange("fssaiLicenseNumber", value)}
            documentType="fssai"
            placeholder="XXXXXXXXXXXXXX"
            formatHint="14-digit FSSAI license number (starts with license type code)"
            onVerificationChange={handleVerificationChange('fssaiLicenseNumber')}
            minLengthToVerify={14}
            initialStoredStatus={autoVerified.fssaiLicenseNumber}
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-3">{renderUpload("fssaiCertificate", "FSSAI Certificate")}</div>
      </div>

    </div>
  );
}


