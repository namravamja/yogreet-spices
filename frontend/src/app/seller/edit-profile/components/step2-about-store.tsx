"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { FileText, Image as ImageIcon, X } from "lucide-react";

interface Props {
  data: {
    about: string;
    storePhotos: string[];
  };
  updateData: (updates: Partial<any>) => void;
  setUploadedFiles: (
    files:
      | Record<string, File | File[]>
      | ((prev: Record<string, File | File[]>) => Record<string, File | File[]>)
  ) => void;
  isLoading?: boolean;
}

export default function Step2AboutStore({ data, updateData, setUploadedFiles, isLoading }: Props) {
  const [localAbout, setLocalAbout] = useState<string>(data.about || "");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const selectedPreviews = useMemo(() => {
    return selectedFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
  }, [selectedFiles]);

  const handleStorePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length) {
      setSelectedFiles((prev) => [...prev, ...files]);
      setUploadedFiles((prev) => {
        const prevVal = typeof prev === "function" ? {} : (prev || {});
        const existing = Array.isArray((prevVal as any).storePhotos) ? ((prevVal as any).storePhotos as File[]) : [];
        return { ...(prevVal as any), storePhotos: [...existing, ...files] };
      });
    }
  };

  const removeExistingPhoto = (index: number) => {
    const next = (data.storePhotos || []).filter((_, i) => i !== index);
    updateData({ storePhotos: next });
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => {
      const next = [...prev];
      next.splice(index, 1);
      // reflect in uploaded files as well
      setUploadedFiles((prevFiles) => {
        const base = typeof prevFiles === "function" ? {} : (prevFiles || {});
        const existing = Array.isArray((base as any).storePhotos) ? ((base as any).storePhotos as File[]) : [];
        const newFiles = existing.filter((_, i) => i !== index);
        return { ...(base as any), storePhotos: newFiles };
      });
      return next;
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg sm:text-xl font-manrope font-semibold text-yogreet-charcoal flex items-center">
          <FileText className="w-5 h-5 mr-2 text-yogreet-sage" />
          About Your Store
        </h2>
        <p className="text-stone-600 mt-1 font-inter text-sm">
          Tell buyers about your business, quality standards, and story.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-manrope font-medium text-stone-700 mb-2">
            About
          </label>
          <textarea
            value={localAbout}
            onChange={(e) => setLocalAbout(e.target.value)}
            onBlur={() => updateData({ about: localAbout })}
            placeholder="Describe your store, sourcing, certifications, experience, etc."
            className="w-full min-h-[120px] border border-stone-300 rounded-md px-3 py-2 font-inter text-stone-700 outline-none focus:ring-2 focus:ring-yogreet-sage/40 focus:border-yogreet-sage"
          />
        </div>

        <div>
          <label className="flex items-center text-sm font-manrope font-medium text-stone-700 mb-2">
            <ImageIcon className="w-4 h-4 mr-2 text-yogreet-sage" />
            Store Photos
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleStorePhotosChange}
            className="block w-full text-sm text-stone-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-manrope file:bg-yogreet-sage/10 file:text-yogreet-sage hover:file:bg-yogreet-sage/20 cursor-pointer"
          />

          {/* Existing uploaded photos from server */}
          {Array.isArray(data.storePhotos) && data.storePhotos.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {data.storePhotos.map((src, idx) => (
                <div key={`existing-${idx}`} className="relative w-full aspect-4/3 bg-stone-100 border border-stone-200 overflow-hidden rounded-sm">
                  <Image
                    src={src}
                    alt={`Store photo ${idx + 1}`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 200px"
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingPhoto(idx)}
                    className="absolute top-2 right-2 p-1.5 bg-white/90 border border-stone-300 rounded-full hover:bg-white transition-colors cursor-pointer"
                    aria-label="Remove photo"
                  >
                    <X className="w-4 h-4 text-stone-700" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Newly selected (unsaved) files previews */}
          {selectedPreviews.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {selectedPreviews.map((p, idx) => (
                <div key={`selected-${idx}`} className="relative w-full aspect-4/3 bg-stone-100 border border-stone-200 overflow-hidden rounded-sm">
                  <Image
                    src={p.url}
                    alt={`Selected store photo ${idx + 1}`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 200px"
                    className="object-cover"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() => removeSelectedFile(idx)}
                    className="absolute top-2 right-2 p-1.5 bg-white/90 border border-stone-300 rounded-full hover:bg-white transition-colors cursor-pointer"
                    aria-label="Remove selected photo"
                  >
                    <X className="w-4 h-4 text-stone-700" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


