"use client";

import type React from "react";
import { useRef, useState } from "react";

interface SellerVerificationDataStep1 {
  companyName: string;
  businessType: string;
  incorporationCertificate?: string;
  msmeUdyamCertificate?: string;
  panNumber: string;
  gstNumber: string;
  businessAddress: string;
  businessAddressProof?: string;
  ownerFullName: string;
  ownerIdDocument?: string;
  ownerIdNumber: string;
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

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-light text-yogreet-charcoal mb-4 sm:mb-6">Business Identity Verification</h2>

      {/* Top priority fields moved to the top: PAN, GST, Owner Full Name, Owner ID Document */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-stone-700 mb-2">Owner Full Name</label>
          <input
            type="text"
            value={data.ownerFullName || ""}
            onChange={(e) => handleChange("ownerFullName", e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage"
          />
        </div>
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-stone-700 mb-2">PAN Number</label>
          <input
            type="text"
            value={data.panNumber || ""}
            onChange={(e) => handleChange("panNumber", e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage"
          />
        </div>
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-stone-700 mb-2">GST Number</label>
          <input
            type="text"
            value={data.gstNumber || ""}
            onChange={(e) => handleChange("gstNumber", e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage"
          />
        </div>
      </div>

      {/* Company Name and Business Type moved to second place */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-stone-700 mb-2">Company Name</label>
              <input
                type="text"
                value={data.companyName || ""}
                onChange={(e) => handleChange("companyName", e.target.value)}
                className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage"
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-stone-700 mb-2">Business Type</label>
              <input
                type="text"
                value={data.businessType || ""}
                onChange={(e) => handleChange("businessType", e.target.value)}
                className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage"
              />
            </div>
          </div>
        </div>
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

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-stone-700 mb-2">Business Address</label>
          <textarea
            rows={3}
            value={data.businessAddress || ""}
            onChange={(e) => handleChange("businessAddress", e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage"
          />
        </div>
      </div>
    </div>
  );
}


