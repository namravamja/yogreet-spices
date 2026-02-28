"use client";

import type React from "react";
import { useRef, useState, useCallback } from "react";
import { VerifiableInput, useVerificationTracker, VerificationStatus } from "@/components/shared/VerifiableInput";
import { useGetVerificationStatusQuery } from "@/services/api/verificationApi";
import { FiCheckCircle, FiInfo } from "react-icons/fi";

interface SellerExportEligibilityData {
  iecCode: string;
  iecCertificate?: string;
  apedaRegistrationNumber: string;
  apedaCertificate?: string;
  spicesBoardRegistrationNumber: string;
  spicesBoardCertificate?: string;
  tradeLicense?: string;
  bankAccountHolderName: string;
  bankAccountNumber: string;
  bankIfscCode: string;
  bankProofDocument?: string;
}

interface Step2Props {
  data: SellerExportEligibilityData & Record<string, any>;
  updateData: (updates: Partial<SellerExportEligibilityData>) => void;
  setUploadedFiles: (
    files:
      | Record<string, File | File[]>
      | ((prev: Record<string, File | File[]>) => Record<string, File | File[]>)
  ) => void;
  onSave?: () => Promise<boolean>;
  isLoading?: boolean;
  onVerificationStatusChange?: (allVerified: boolean) => void;
}

export default function Step2ExportEligibility({ data, updateData, setUploadedFiles, onVerificationStatusChange }: Step2Props) {
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [localFiles, setLocalFiles] = useState<Record<string, File | null>>({});
  const [ifscBankData, setIfscBankData] = useState<{ bank?: string; branch?: string } | null>(null);
  
  // Fetch stored verification status from database
  const { data: storedStatus } = useGetVerificationStatusQuery();
  const autoVerified = storedStatus?.autoVerified || {};
  
  // Track verification status for auto-verifiable fields
  const verificationTracker = useVerificationTracker(['iecCode', 'bankIfscCode', 'bankAccountNumber']);

  const handleChange = (field: keyof SellerExportEligibilityData, value: any) => {
    updateData({ [field]: value } as Partial<SellerExportEligibilityData>);
  };

  // Handle verification status change for any field
  const handleVerificationChange = useCallback((field: string) => (status: VerificationStatus) => {
    verificationTracker.updateFieldStatus(field, status);
    
    // Store IFSC bank data if verified
    if (field === 'bankIfscCode' && status.status === 'verified' && status.data) {
      setIfscBankData({ bank: status.data.bank, branch: status.data.branch });
    }
    
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
      <h2 className="text-xl sm:text-2xl font-light text-yogreet-charcoal mb-4 sm:mb-6">Export Eligibility Verification</h2>

      {/* Auto-verification info banner */}
      <div className="mb-6 p-4 bg-yogreet-sage/5 border border-yogreet-sage/20 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-8 h-8 bg-yogreet-sage/10 rounded-full flex items-center justify-center">
            <FiCheckCircle className="w-4 h-4 text-yogreet-sage" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-yogreet-charcoal">Auto-Verification Enabled</h4>
            <p className="text-xs text-stone-500 mt-1">
              IEC Code and IFSC are automatically verified via official databases. 
              IFSC verification fetches bank and branch details from RBI&apos;s database.
            </p>
          </div>
        </div>
      </div>

      {/* IEC Code with auto-verification */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <VerifiableInput
            id="iecCode"
            label="IEC Code"
            value={data.iecCode || ""}
            onChange={(value) => handleChange("iecCode", value)}
            documentType="iec"
            placeholder="AAAAAAAAAA"
            formatHint="10 alphanumeric characters"
            onVerificationChange={handleVerificationChange('iecCode')}
            minLengthToVerify={10}
            initialStoredStatus={autoVerified.iecCode}
          />
        </div>
        <div className="md:col-span-3">{renderUpload("iecCertificate", "IEC Certificate")}</div>
        <div className="md:col-span-3">{renderUpload("tradeLicense", "Trade License")}</div>
      </div>

      {/* APEDA - Manual verification required */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-stone-700 mb-2">
            APEDA Registration Number
            <span className="ml-2 text-xs text-stone-400">(Manual verification)</span>
          </label>
          <input
            type="text"
            value={data.apedaRegistrationNumber || ""}
            onChange={(e) => handleChange("apedaRegistrationNumber", e.target.value.toUpperCase())}
            className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage"
          />
        </div>
        <div className="md:col-span-3">{renderUpload("apedaCertificate", "APEDA Certificate")}</div>
      </div>

      {/* Spices Board - Manual verification required */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Spices Board Registration Number
            <span className="ml-2 text-xs text-stone-400">(Manual verification)</span>
          </label>
          <input
            type="text"
            value={data.spicesBoardRegistrationNumber || ""}
            onChange={(e) => handleChange("spicesBoardRegistrationNumber", e.target.value.toUpperCase())}
            className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage"
          />
        </div>
        <div className="md:col-span-3">{renderUpload("spicesBoardCertificate", "Spices Board Certificate")}</div>
      </div>

      {/* Bank Details Section */}
      <div className="mt-8 mb-4">
        <h3 className="text-lg font-medium text-yogreet-charcoal flex items-center gap-2">
          Bank Account Details
          <span className="text-xs font-normal px-2 py-0.5 bg-green-100 text-green-700 rounded-full">IFSC Auto-Verified via RBI</span>
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-stone-700 mb-2">Bank Account Holder Name</label>
          <input
            type="text"
            value={data.bankAccountHolderName || ""}
            onChange={(e) => handleChange("bankAccountHolderName", e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage"
          />
        </div>
        <div className="md:col-span-1">
          <VerifiableInput
            id="bankAccountNumber"
            label="Bank Account Number"
            value={data.bankAccountNumber || ""}
            onChange={(value) => handleChange("bankAccountNumber", value)}
            documentType="bankAccount"
            placeholder="XXXXXXXXXXXXX"
            formatHint="9-18 digits"
            onVerificationChange={handleVerificationChange('bankAccountNumber')}
            minLengthToVerify={9}
            initialStoredStatus={autoVerified.bankAccountNumber}
          />
        </div>
        <div className="md:col-span-1">
          <VerifiableInput
            id="bankIfscCode"
            label="Bank IFSC Code"
            value={data.bankIfscCode || ""}
            onChange={(value) => handleChange("bankIfscCode", value)}
            documentType="ifsc"
            placeholder="AAAA0XXXXXX"
            formatHint="11 characters: 4 letters + 0 + 6 alphanumeric"
            onVerificationChange={handleVerificationChange('bankIfscCode')}
            minLengthToVerify={11}
            initialStoredStatus={autoVerified.bankIfscCode}
          />
        </div>
        
        {/* Show verified bank info */}
        {ifscBankData && (
          <div className="md:col-span-3 p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center gap-2 text-sm text-green-700">
              <FiInfo className="w-4 h-4" />
              <span>
                <strong>Bank:</strong> {ifscBankData.bank} | <strong>Branch:</strong> {ifscBankData.branch}
              </span>
            </div>
          </div>
        )}
        
        <div className="md:col-span-3">{renderUpload("bankProofDocument", "Bank Proof Document (Cancelled Cheque/Statement)")}</div>
      </div>
    </div>
  );
}


