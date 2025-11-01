"use client";

import type React from "react";
import { useRef, useState } from "react";

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
}

export default function Step3FoodSafetyCompliance({ data, updateData, setUploadedFiles }: Step3Props) {
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [localFiles, setLocalFiles] = useState<Record<string, File | null>>({});
  const [multiFiles, setMultiFiles] = useState<File[]>([]);

  const handleChange = (field: keyof SellerFoodSafetyData, value: any) => {
    updateData({ [field]: value } as Partial<SellerFoodSafetyData>);
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

  // removed multi-upload UI as requested

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-light text-yogreet-charcoal mb-4 sm:mb-6">Food & Safety Compliance</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-stone-700 mb-2">FSSAI License Number</label>
          <input
            type="text"
            value={data.fssaiLicenseNumber || ""}
            onChange={(e) => handleChange("fssaiLicenseNumber", e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage"
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-3">{renderUpload("fssaiCertificate", "FSSAI Certificate")}</div>
      </div>

    </div>
  );
}


