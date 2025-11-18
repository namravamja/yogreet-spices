"use client";

import { Globe, Instagram, Facebook, Twitter, Edit } from "lucide-react";
import { useRouter } from "next/navigation";

interface SocialLinks {
  website?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  twitter?: string | null;
}

interface SellerData {
  socialLinks?: SocialLinks | null;
}

interface SocialMediaLinksProps {
  sellerData: SellerData;
  onEdit?: () => void;
}

export default function SocialMediaLinks({
  sellerData,
  onEdit,
}: SocialMediaLinksProps) {
  const router = useRouter();
  return (
    <div className="bg-white border border-stone-200 shadow-sm">
      <div className="p-6 border-b border-stone-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-manrope font-medium text-yogreet-charcoal flex items-center">
            <Globe className="w-5 h-5 mr-2 text-yogreet-sage" />
            Social Media & Website
          </h2>
          <button
            onClick={() => (onEdit ? onEdit() : router.push("/seller/edit-profile/5"))}
            className="px-3 py-1.5 border border-yogreet-sage text-yogreet-sage rounded-md hover:bg-yogreet-sage/10 transition-colors cursor-pointer text-sm font-manrope flex items-center gap-1.5"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-manrope font-medium text-stone-700 mb-1 flex items-center">
              <Globe className="w-4 h-4 mr-2 text-yogreet-sage" />
              Website
            </label>
            <p className={`py-2 font-inter ${sellerData?.socialLinks?.website ? "text-stone-600" : "text-red-500"}`}>
              {sellerData?.socialLinks?.website || "not provided"}
            </p>
          </div>
          <div>
            <label className="text-sm font-manrope font-medium text-stone-700 mb-1 flex items-center">
              <Instagram className="w-4 h-4 mr-2 text-yogreet-sage" />
              Instagram
            </label>
            <p className={`py-2 font-inter ${sellerData?.socialLinks?.instagram ? "text-stone-600" : "text-red-500"}`}>
              {sellerData?.socialLinks?.instagram || "not provided"}
            </p>
          </div>
          <div>
            <label className="text-sm font-manrope font-medium text-stone-700 mb-1 flex items-center">
              <Facebook className="w-4 h-4 mr-2 text-yogreet-sage" />
              Facebook
            </label>
            <p className={`py-2 font-inter ${sellerData?.socialLinks?.facebook ? "text-stone-600" : "text-red-500"}`}>
              {sellerData?.socialLinks?.facebook || "not provided"}
            </p>
          </div>
          <div>
            <label className="text-sm font-manrope font-medium text-stone-700 mb-1 flex items-center">
              <Twitter className="w-4 h-4 mr-2 text-yogreet-sage" />
              Twitter
            </label>
            <p className={`py-2 font-inter ${sellerData?.socialLinks?.twitter ? "text-stone-600" : "text-red-500"}`}>
              {sellerData?.socialLinks?.twitter || "not provided"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

