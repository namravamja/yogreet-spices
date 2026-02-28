"use client";

import type React from "react";
import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";

interface ProfileData {
  company_registration_certificate?: string;
  company_registration_number?: string;
  company_name?: string;
  date_of_incorporation?: string;
  ssm_company_profile_document?: string;
  business_trade_license_document?: string;
  business_license_number?: string;
  business_license_issuing_authority?: string;
  business_license_expiry_date?: string;
}

interface Step1Props {
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

export default function Step1BasicCompanyVerification({
  data,
  updateData,
  setUploadedFiles,
  onSave,
  isLoading = false,
}: Step1Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [localFiles, setLocalFiles] = useState<Record<string, File | null>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});

  useEffect(() => {
    return () => {
      Object.values(previews).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    try {
      updateData({ [field]: value });
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      toast.error(`Failed to update ${field}`);
    }
  };

  const renderUpload = (id: string, label: string) => {
    const file = localFiles[id] || null;
    const existingUrl = (data as any)?.[id] as string | undefined;
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
            if (f) {
              setUploadedFiles((prev) => ({ ...(typeof prev === "function" ? {} : prev), [id]: f } as any));
              if (f.type?.startsWith("image/")) {
                setPreviews((p) => {
                  const prevUrl = p[id];
                  if (prevUrl) URL.revokeObjectURL(prevUrl);
                  return { ...p, [id]: URL.createObjectURL(f) };
                });
              }
            }
          }}
        />
        {!file && !existingUrl ? (
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
        ) : file ? (
          <div className="mt-1 p-3 border-2 border-dashed border-stone-300 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {previews[id] && (
                  <img
                    src={previews[id]}
                    alt="Preview"
                    className="w-28 h-20 object-cover rounded border border-stone-200"
                  />
                )}
                <div>
                  <p className="text-sm font-medium text-stone-700">{file.name}</p>
                  <p className="text-xs text-stone-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
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
                  if (previews[id]) {
                    URL.revokeObjectURL(previews[id]);
                    setPreviews((p) => {
                      const n = { ...p };
                      delete n[id];
                      return n;
                    });
                  }
                  if (inputRefs.current[id]) inputRefs.current[id]!.value = "";
                }}
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-1 p-3 border-2 border-dashed border-stone-300 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={existingUrl as string}
                  alt="Uploaded"
                  className="w-28 h-20 object-cover rounded border border-stone-200"
                />
                <div className="truncate">
                  <p className="text-sm font-medium text-stone-700">Existing document</p>
                  <p className="text-xs text-stone-500 max-w-xs truncate">{existingUrl}</p>
                </div>
              </div>
              <button
                type="button"
                className="text-stone-600 hover:text-stone-800"
                onClick={() => inputRefs.current[id]?.click()}
              >
                Replace
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
        Basic Company Verification
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-3">{renderUpload("company_registration_certificate", "Company Registration Certificate")}</div>
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Company Registration Number
          </label>
          <input
            type="text"
            value={data?.company_registration_number || ""}
            onChange={(e) => handleInputChange("company_registration_number", e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-purple focus:outline-none focus:ring-1 focus:ring-yogreet-purple"
          />
        </div>
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-stone-700 mb-2">Company Name</label>
          <input
            type="text"
            value={data?.company_name || ""}
            onChange={(e) => handleInputChange("company_name", e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-purple focus:outline-none focus:ring-1 focus:ring-yogreet-purple"
          />
        </div>
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-stone-700 mb-2">Date of Incorporation</label>
          <input
            type="date"
            value={data?.date_of_incorporation || ""}
            onChange={(e) => handleInputChange("date_of_incorporation", e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-purple focus:outline-none focus:ring-1 focus:ring-yogreet-purple"
          />
        </div>
      </div>

      <div className="mt-4 sm:mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-3">{renderUpload("ssm_company_profile_document", "SSM Company Profile / Business Extract")}</div>
      </div>

      <div className="mt-4 sm:mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-3">{renderUpload("business_trade_license_document", "Business / Trade License Document")}</div>
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-stone-700 mb-2">Business License Number</label>
          <input
            type="text"
            value={data?.business_license_number || ""}
            onChange={(e) => handleInputChange("business_license_number", e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-purple focus:outline-none focus:ring-1 focus:ring-yogreet-purple"
          />
        </div>
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-stone-700 mb-2">Issuing Authority</label>
          <input
            type="text"
            value={data?.business_license_issuing_authority || ""}
            onChange={(e) => handleInputChange("business_license_issuing_authority", e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-red focus:outline-none focus:ring-1 focus:ring-yogreet-red"
          />
        </div>
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-stone-700 mb-2">License Expiry Date</label>
          <input
            type="date"
            value={data?.business_license_expiry_date || ""}
            onChange={(e) => handleInputChange("business_license_expiry_date", e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-red focus:outline-none focus:ring-1 focus:ring-yogreet-red"
          />
        </div>
      </div>

      
    </div>
  );
}
