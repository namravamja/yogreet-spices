"use client";

import type React from "react";
import { useRef, useState, useCallback } from "react";
import { VerifiableInput, useVerificationTracker, VerificationStatus } from "@/components/shared/VerifiableInput";
import { useGetVerificationStatusQuery } from "@/services/api/verificationApi";
import { FiAlertTriangle, FiCheckCircle } from "react-icons/fi";

interface SellerVerificationDataStep1 {
  panNumber: string;
  gstNumber: string;
  ownerIdDocument?: string;
  incorporationCertificate?: string;
  msmeUdyamCertificate?: string;
  businessAddressProof?: string;
  aadharNumber?: string;
}

interface Step1Props {
  data: SellerVerificationDataStep1 & Record<string, any>;
  updateData: (updates: Partial<SellerVerificationDataStep1>) => void;
  setUploadedFiles: (
    files:
      | Record<string, File | File[]>
      | ((prev: Record<string, File | File[]>) => Record<string, File | File[]>)
  ) => void;
  onSave?: () => Promise<boolean>;
  isLoading?: boolean;
  onVerificationStatusChange?: (allVerified: boolean) => void;
}

export default function Step1BusinessIdentity({ data, updateData, setUploadedFiles, onVerificationStatusChange }: Step1Props) {
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [localFiles, setLocalFiles] = useState<Record<string, File | null>>({});
  
  // Fetch stored verification status from database
  const { data: storedStatus } = useGetVerificationStatusQuery();
  const autoVerified = storedStatus?.autoVerified || {};
  
  // Track verification status for auto-verifiable fields
  const verificationTracker = useVerificationTracker(['panNumber', 'gstNumber', 'aadharNumber']);

  const handleChange = (field: keyof SellerVerificationDataStep1, value: any) => {
    updateData({ [field]: value } as Partial<SellerVerificationDataStep1>);
  };

  // Handle verification status change for any field
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
            {/* Inline preview */}
            {/\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(existingUrl) ? (
              <img src={existingUrl} alt="Document preview" className="max-h-64 w-auto object-contain border border-stone-200 bg-white" />
            ) : /\.(pdf)(\?.*)?$/i.test(existingUrl) ? (
              <object data={existingUrl} type="application/pdf" className="w-full h-80 border border-stone-200 bg-white">
                <iframe src={existingUrl} className="w-full h-80" />
              </object>
            ) : (
              <div className="text-sm text-stone-600">
                Preview not available. {/* Fallback link for unknown types */}
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
      <h2 className="text-xl sm:text-2xl font-light text-yogreet-charcoal mb-4 sm:mb-6">Business Identity Verification</h2>

      {/* Auto-verification info banner */}
      <div className="mb-6 p-4 bg-yogreet-sage/5 border border-yogreet-sage/20 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-8 h-8 bg-yogreet-sage/10 rounded-full flex items-center justify-center">
            <FiAlertTriangle className="w-4 h-4 text-yogreet-sage" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-yogreet-charcoal">Auto-Verification Enabled</h4>
            <p className="text-xs text-stone-500 mt-1">
              PAN, GST, and Aadhaar numbers are automatically verified when you finish typing. 
              Cross-verification ensures PAN embedded in GST matches your PAN number.
            </p>
          </div>
        </div>
      </div>

      {/* Stored verification status display */}
      {(autoVerified.panNumber?.verified || autoVerified.gstNumber?.verified || autoVerified.aadharNumber?.verified) && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <FiCheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-green-800">Previously Verified Documents</h4>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                {autoVerified.panNumber?.verified && (
                  <div className="text-xs bg-white px-3 py-2 rounded border border-green-200">
                    <span className="font-medium text-green-700">PAN:</span>{" "}
                    <span className="text-stone-600">{data.panNumber}</span>
                    <div className="text-stone-400 mt-0.5">
                      Verified {autoVerified.panNumber.verifiedAt ? new Date(autoVerified.panNumber.verifiedAt).toLocaleDateString() : ""}
                    </div>
                  </div>
                )}
                {autoVerified.gstNumber?.verified && (
                  <div className="text-xs bg-white px-3 py-2 rounded border border-green-200">
                    <span className="font-medium text-green-700">GST:</span>{" "}
                    <span className="text-stone-600">{data.gstNumber}</span>
                    <div className="text-stone-400 mt-0.5">
                      Verified {autoVerified.gstNumber.verifiedAt ? new Date(autoVerified.gstNumber.verifiedAt).toLocaleDateString() : ""}
                    </div>
                  </div>
                )}
                {autoVerified.aadharNumber?.verified && (
                  <div className="text-xs bg-white px-3 py-2 rounded border border-green-200">
                    <span className="font-medium text-green-700">Aadhaar:</span>{" "}
                    <span className="text-stone-600">{data.aadharNumber?.replace(/(\d{4})/g, '$1 ').trim()}</span>
                    <div className="text-stone-400 mt-0.5">
                      Verified {autoVerified.aadharNumber.verifiedAt ? new Date(autoVerified.aadharNumber.verifiedAt).toLocaleDateString() : ""}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAN Number and GST Number with auto-verification */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <VerifiableInput
          id="panNumber"
          label="PAN Number"
          value={data.panNumber || ""}
          onChange={(value) => handleChange("panNumber", value)}
          documentType="pan"
          placeholder="AAAAA0000A"
          formatHint="Format: 5 letters + 4 digits + 1 letter (e.g., ABCDE1234F)"
          crossCheckData={data.gstNumber ? { gst: data.gstNumber } : undefined}
          onVerificationChange={handleVerificationChange('panNumber')}
          minLengthToVerify={10}
          initialStoredStatus={autoVerified.panNumber}
        />
        <VerifiableInput
          id="gstNumber"
          label="GST Number"
          value={data.gstNumber || ""}
          onChange={(value) => handleChange("gstNumber", value)}
          documentType="gst"
          placeholder="22AAAAA0000A1Z5"
          formatHint="Format: 2 digits (state) + PAN + entity code + Z + checksum"
          crossCheckData={data.panNumber ? { pan: data.panNumber } : undefined}
          onVerificationChange={handleVerificationChange('gstNumber')}
          minLengthToVerify={15}
          initialStoredStatus={autoVerified.gstNumber}
        />
      </div>

      {/* Aadhaar Number with auto-verification */}
      <div className="mt-6">
        <VerifiableInput
          id="aadharNumber"
          label="Aadhaar Number"
          value={data.aadharNumber || ""}
          onChange={(value) => handleChange("aadharNumber", value)}
          documentType="aadhaar"
          placeholder="XXXX XXXX XXXX"
          formatHint="12-digit Aadhaar number (with Verhoeff checksum validation)"
          onVerificationChange={handleVerificationChange('aadharNumber')}
          minLengthToVerify={12}
          initialStoredStatus={autoVerified.aadharNumber}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-3">{renderUpload("ownerIdDocument", "Owner ID Document (PAN/Passport/Aadhaar)")}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-3 mt-6">{renderUpload("incorporationCertificate", "Incorporation Certificate")}</div>
        <div className="md:col-span-3">{renderUpload("msmeUdyamCertificate", "MSME / Udyam Certificate")}</div>
      </div>

      

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-3">{renderUpload("businessAddressProof", "Business Address Proof")}</div>
      </div>
    </div>
  );
}


