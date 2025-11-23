"use client";

import type React from "react";
import { useRef, useState } from "react";

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
}

export default function Step1BusinessIdentity({ data, updateData, setUploadedFiles }: Step1Props) {
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [localFiles, setLocalFiles] = useState<Record<string, File | null>>({});

  const handleChange = (field: keyof SellerVerificationDataStep1, value: any) => {
    updateData({ [field]: value } as Partial<SellerVerificationDataStep1>);
  };

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

      {/* PAN Number and GST Number */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">PAN Number</label>
          <input
            type="text"
            value={data.panNumber || ""}
            onChange={(e) => handleChange("panNumber", e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">GST Number</label>
          <input
            type="text"
            value={data.gstNumber || ""}
            onChange={(e) => handleChange("gstNumber", e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage"
          />
        </div>
      </div>

      {/* Aadhaar Number */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-stone-700 mb-2">Aadhaar Number</label>
              <input
                type="text"
          value={data.aadharNumber || ""}
          onChange={(e) => handleChange("aadharNumber", e.target.value)}
                className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage"
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


