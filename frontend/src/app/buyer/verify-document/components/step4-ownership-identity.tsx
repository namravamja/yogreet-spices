"use client";

import type React from "react";
import { useRef, useState, useEffect } from "react";

interface ProfileData {
  director_id_document?: string;
  business_address_proof_document?: string;
  business_address?: string;
}

interface Step4Props {
  data: ProfileData;
  updateData: (updates: Partial<ProfileData>) => void;
  setUploadedFiles: (
    files:
      | Record<string, File>
      | ((prev: Record<string, File>) => Record<string, File>)
  ) => void;
}

export default function Step4OwnershipIdentity({ data, updateData, setUploadedFiles }: Step4Props) {
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [localFiles, setLocalFiles] = useState<Record<string, File | null>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});

  useEffect(() => {
    return () => {
      Object.values(previews).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

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
            className="mt-1 flex items-center justify-center px-6 py-12 min-h-40 border-2 border-dashed border-stone-300 rounded-md hover:border-yogreet-purple/50 transition-colors cursor-pointer"
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
                {existingUrl && !existingUrl.toLowerCase().endsWith(".pdf") ? (
                  <img
                    src={existingUrl}
                    alt="Uploaded"
                    className="w-28 h-20 object-cover rounded border border-stone-200"
                  />
                ) : (
                  <div className="w-28 h-20 flex items-center justify-center rounded border border-stone-200 text-xs text-stone-600">
                    PDF document
                  </div>
                )}
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
        Ownership & Identity Verification
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">{renderUpload("director_id_document", "Director / Authorized Person ID (NRIC/Passport)")}</div>
        
        <div className="md:col-span-2">{renderUpload("business_address_proof_document", "Business Address Proof")}</div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-stone-700 mb-2">Business Address (full address)</label>
          <textarea
            value={data?.business_address || ""}
            onChange={(e) => updateData({ business_address: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-red focus:outline-none focus:ring-1 focus:ring-yogreet-red"
          />
        </div>
      </div>
    </div>
  );
}


