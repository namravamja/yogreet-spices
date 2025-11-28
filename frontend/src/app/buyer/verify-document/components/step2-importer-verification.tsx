"use client";

import type React from "react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface ProfileData {
  import_license_document?: string;
  import_license_number?: string;
  issuing_authority?: string;
  import_license_expiry_date?: string;
  food_safety_certificate_document?: string;
  food_safety_authority?: string;
  food_safety_certificate_number?: string;
  food_safety_license_expiry_date?: string;
}

interface Step2Props {
  data: ProfileData & Record<string, any>;
  updateData: (updates: Partial<ProfileData>) => void;
  setUploadedFiles: React.Dispatch<React.SetStateAction<Record<string, File>>>;
  onSave?: () => Promise<boolean>;
  isLoading?: boolean;
}

export default function Step2ImporterVerification({
  data,
  updateData,
  setUploadedFiles,
  onSave,
  isLoading = false,
}: Step2Props) {
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [localFiles, setLocalFiles] = useState<Record<string, File | null>>({});

  const handleInputChange = (field: keyof ProfileData, value: any) => {
    updateData({ [field]: value });
  };

  const handleFileUpload = (inputId: string, file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      toast.error("Please upload an image or PDF file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }
    setUploadedFiles((prev: Record<string, File>) => ({ ...prev, [inputId]: file }));
    toast.success(`Document uploaded: ${file.name}`);
  };

  const triggerFileUpload = (inputId: string) => {
    fileInputRefs.current[inputId]?.click();
  };

  const renderUpload = (id: string, label: string) => {
    const file = localFiles[id] || null;
    return (
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">{label}</label>
        <input
          ref={(el) => {
            fileInputRefs.current[id] = el;
          }}
          type="file"
          accept="application/pdf,image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0] || null;
            setLocalFiles((prev) => ({ ...prev, [id]: f }));
            if (f) handleFileUpload(id, f);
          }}
        />
        {!file ? (
          <div
            onClick={() => fileInputRefs.current[id]?.click()}
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
                  setUploadedFiles((prev: Record<string, File>) => {
                    const next = { ...prev };
                    delete next[id];
                    return next;
                  });
                  if (fileInputRefs.current[id]) fileInputRefs.current[id]!.value = "";
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
        Importer Verification
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-3">{renderUpload("import_license_document", "Import License / AP Document")}</div>
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-stone-700 mb-2">Import License Number</label>
          <input
            type="text"
            value={data?.import_license_number || ""}
            onChange={(e) => handleInputChange("import_license_number", e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-purple focus:outline-none focus:ring-1 focus:ring-yogreet-purple"
          />
        </div>
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-stone-700 mb-2">Issuing Authority (MOA/MAQIS)</label>
          <select
            value={data?.issuing_authority || ""}
            onChange={(e) => handleInputChange("issuing_authority", e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-purple focus:outline-none focus:ring-1 focus:ring-yogreet-purple"
          >
            <option value="">Select</option>
            <option value="MOA">MOA</option>
            <option value="MAQIS">MAQIS</option>
          </select>
        </div>
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-stone-700 mb-2">Import License Expiry Date</label>
          <input
            type="date"
            value={data?.import_license_expiry_date || ""}
            onChange={(e) => handleInputChange("import_license_expiry_date", e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-purple focus:outline-none focus:ring-1 focus:ring-yogreet-purple"
          />
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium text-yogreet-charcoal mb-4">Food Safety Registration (if applicable)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-3">{renderUpload("food_safety_certificate_document", "Food Safety Certificate Document")}</div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-stone-700 mb-2">Food Safety Authority (MOH/Other)</label>
            <input
              type="text"
              value={data?.food_safety_authority || ""}
              onChange={(e) => handleInputChange("food_safety_authority", e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-purple focus:outline-none focus:ring-1 focus:ring-yogreet-purple"
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-stone-700 mb-2">Certificate Number</label>
            <input
              type="text"
              value={data?.food_safety_certificate_number || ""}
              onChange={(e) => handleInputChange("food_safety_certificate_number", e.target.value)}
              className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-red focus:outline-none focus:ring-1 focus:ring-yogreet-red"
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-stone-700 mb-2">License Expiry Date</label>
            <input
              type="date"
              value={data?.food_safety_license_expiry_date || ""}
              onChange={(e) => handleInputChange("food_safety_license_expiry_date", e.target.value)}
              className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-red focus:outline-none focus:ring-1 focus:ring-yogreet-red"
            />
          </div>
        </div>
      </div>

      
    </div>
  );
}



