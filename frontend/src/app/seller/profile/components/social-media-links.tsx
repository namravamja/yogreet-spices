"use client";

import { Globe, Instagram, Facebook, Twitter } from "lucide-react";

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
}

export default function SocialMediaLinks({
  sellerData,
}: SocialMediaLinksProps) {
  return (
    <div className="bg-white border border-stone-200 shadow-sm">
      <div className="p-6 border-b border-stone-200">
        <h2 className="text-xl font-manrope font-medium text-yogreet-charcoal flex items-center">
          <Globe className="w-5 h-5 mr-2 text-yogreet-sage" />
          Social Media & Website
        </h2>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-manrope font-medium text-stone-700 mb-1 flex items-center">
              <Globe className="w-4 h-4 mr-2 text-yogreet-sage" />
              Website
            </label>
            <p className="text-stone-600 py-2 font-inter">
              {sellerData?.socialLinks?.website || "not provided"}
            </p>
          </div>
          <div>
            <label className="text-sm font-manrope font-medium text-stone-700 mb-1 flex items-center">
              <Instagram className="w-4 h-4 mr-2 text-yogreet-sage" />
              Instagram
            </label>
            <p className="text-stone-600 py-2 font-inter">
              {sellerData?.socialLinks?.instagram || "not provided"}
            </p>
          </div>
          <div>
            <label className="text-sm font-manrope font-medium text-stone-700 mb-1 flex items-center">
              <Facebook className="w-4 h-4 mr-2 text-yogreet-sage" />
              Facebook
            </label>
            <p className="text-stone-600 py-2 font-inter">
              {sellerData?.socialLinks?.facebook || "not provided"}
            </p>
          </div>
          <div>
            <label className="text-sm font-manrope font-medium text-stone-700 mb-1 flex items-center">
              <Twitter className="w-4 h-4 mr-2 text-yogreet-sage" />
              Twitter
            </label>
            <p className="text-stone-600 py-2 font-inter">
              {sellerData?.socialLinks?.twitter || "not provided"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

