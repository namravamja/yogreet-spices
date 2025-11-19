"use client";

import Image from "next/image";
import { FileText, Edit, ImageIcon, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

interface SellerData {
  about?: string | null;
  storePhoto?: string | null; // backward compatibility: single photo
  storePhotos?: string[] | null; // new: multiple photos
}

interface AboutStoreProps {
  sellerData: SellerData;
  onEdit?: () => void;
}

export default function AboutStore({ sellerData, onEdit }: AboutStoreProps) {
  const router = useRouter();
  const aboutText = sellerData?.about || "";
  const photos: string[] = Array.isArray(sellerData?.storePhotos) && sellerData?.storePhotos?.length
    ? (sellerData?.storePhotos as string[]).filter(Boolean)
    : (sellerData?.storePhoto ? [sellerData.storePhoto] : []);

  // Check if all required fields are complete
  const isComplete = aboutText.trim() && photos.length > 0;
  
  const buttonText = isComplete ? "Edit" : "Upload";
  const ButtonIcon = isComplete ? Edit : Upload;

  return (
    <div className="bg-white border border-stone-200 shadow-sm">
      <div className="p-6 border-b border-stone-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-manrope font-medium text-yogreet-charcoal flex items-center">
            <FileText className="w-5 h-5 mr-2 text-yogreet-sage" />
            About & Store Photo
          </h2>
          <button
            onClick={() => (onEdit ? onEdit() : router.push("/seller/edit-profile/2"))}
            className="px-3 py-1.5 border border-yogreet-sage text-yogreet-sage rounded-md hover:bg-yogreet-sage/10 transition-colors cursor-pointer text-sm font-manrope flex items-center gap-1.5"
          >
            <ButtonIcon className="w-4 h-4" />
            {buttonText}
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* About */}
        <div>
          <label className="block text-sm font-manrope font-medium text-stone-700 mb-2">
            About
          </label>
          {aboutText ? (
            <p className="text-stone-700 leading-relaxed font-inter whitespace-pre-line">
              {aboutText}
            </p>
          ) : (
            <p className="text-stone-500 italic font-inter">No description provided.</p>
          )}
        </div>

        {/* Store Photos */}
        <div className="pt-6 border-t border-stone-200">
          <label className="text-sm font-manrope font-medium text-stone-700 mb-3 flex items-center">
            <ImageIcon className="w-4 h-4 mr-2 text-yogreet-sage" />
            Store Photos
          </label>
          {photos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {photos.map((src, idx) => (
                <div key={idx} className="relative w-full aspect-4/3 bg-stone-100 overflow-hidden border border-stone-200">
                  <Image
                    src={src}
                    alt={`Store Photo ${idx + 1}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full max-w-md aspect-4/3 bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400">
              <span className="text-sm font-inter">No store photos uploaded</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


