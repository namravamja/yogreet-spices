"use client";

import type React from "react";
import { toast } from "sonner";
import { useRef, useState } from "react";

interface ProfileData {
  tax_registration_certificate_document?: string;
  tax_registration_number?: string;
  tax_registration_authority?: string;
  bank_letter_or_statement_document?: string;
  bank_name?: string;
  account_holder_name?: string;
}

interface Step3Props {
  data: ProfileData;
  updateData: (updates: Partial<ProfileData>) => void;
  setUploadedFiles: (
    files:
      | Record<string, File>
      | ((prev: Record<string, File>) => Record<string, File>)
  ) => void;
  onSave?: () => Promise<boolean>;
  isLoading?: boolean;
}

export default function Step3TaxFinancialLegitimacy({
  data,
  updateData,
  setUploadedFiles,
  onSave,
  isLoading = false,
}: Step3Props) {
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [localFiles, setLocalFiles] = useState<Record<string, File | null>>({});
  const handleInputChange = (field: keyof ProfileData, value: any) => {
    try {
      updateData({ [field]: value });
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      toast.error(`Failed to update ${field}`);
    }
  };

  const renderUpload = (id: string, label: string) => {
    const file = localFiles[id] || null;
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
            className="mt-1 flex items-center justify-center px-6 py-12 border-2 border-dashed border-stone-300 rounded-md hover:border-yogreet-purple/50 transition-colors cursor-pointer"
          >
            <div className="space-y-1 text-center flex flex-col items-center">
              <div className="text-sm text-yogreet-warm-gray">
                <span className="font-medium text-yogreet-purple">Click to upload</span> or drag and drop
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
                className="text-red-500 hover:text-red-700"
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
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-light text-yogreet-charcoal mb-4 sm:mb-6">
        Tax & Financial Legitimacy
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="md:col-span-2">{renderUpload("tax_registration_certificate_document", "Tax Registration Certificate")}</div>
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-stone-700 mb-2">Tax Registration Number (TIN/SST)</label>
          <input
            type="text"
            value={(data as any)?.tax_registration_number || ""}
            onChange={(e) => handleInputChange("tax_registration_number" as keyof ProfileData, e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-purple focus:outline-none focus:ring-1 focus:ring-yogreet-purple"
          />
        </div>
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-stone-700 mb-2">Tax Registration Authority (LHDN Malaysia)</label>
          <input
            type="text"
            value={(data as any)?.tax_registration_authority || ""}
            onChange={(e) => handleInputChange("tax_registration_authority" as keyof ProfileData, e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-purple focus:outline-none focus:ring-1 focus:ring-yogreet-purple"
          />
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-medium text-yogreet-charcoal mb-4">Bank Verification</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">{renderUpload("bank_letter_or_statement_document", "Bank Letter or Statement")}</div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-stone-700 mb-2">Bank Name</label>
            <input
              type="text"
              value={(data as any)?.bank_name || ""}
              onChange={(e) => handleInputChange("bank_name" as keyof ProfileData, e.target.value)}
              className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-purple focus:outline-none focus:ring-1 focus:ring-yogreet-purple"
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-stone-700 mb-2">Account Holder Name (must match company name)</label>
            <input
              type="text"
              value={(data as any)?.account_holder_name || ""}
              onChange={(e) => handleInputChange("account_holder_name" as keyof ProfileData, e.target.value)}
              className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-purple focus:outline-none focus:ring-1 focus:ring-yogreet-purple"
            />
          </div>
        </div>
      </div>

      
    </div>
  );
}



