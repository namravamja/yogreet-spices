"use client";

import { Globe, Instagram, Facebook, Twitter } from "lucide-react";

interface SocialLinks {
  website?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
}

interface ArtistData {
  socialLinks: SocialLinks;
}

interface SocialMediaLinksProps {
  artistData: ArtistData;
}

export default function SocialMediaLinks({
  artistData,
}: SocialMediaLinksProps) {
  return (
    <div className="bg-white border border-stone-200 shadow-sm">
      <div className="p-6 border-b border-stone-200">
        <h2 className="text-xl font-medium text-stone-900 flex items-center">
          <Globe className="w-5 h-5 mr-2" />
          Social Media & Website
        </h2>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-stone-700 mb-1 flex items-center">
              <Globe className="w-4 h-4 mr-2" />
              Website
            </label>
            <p className="text-stone-600 py-2">
              {artistData?.socialLinks?.website || "not provided"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-stone-700 mb-1 flex items-center">
              <Instagram className="w-4 h-4 mr-2" />
              Instagram
            </label>
            <p className="text-stone-600 py-2">
              {artistData?.socialLinks?.instagram || "not provided"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-stone-700 mb-1 flex items-center">
              <Facebook className="w-4 h-4 mr-2" />
              Facebook
            </label>
            <p className="text-stone-600 py-2">
              {artistData?.socialLinks?.facebook || "not provided"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-stone-700 mb-1 flex items-center">
              <Twitter className="w-4 h-4 mr-2" />
              Twitter
            </label>
            <p className="text-stone-600 py-2">
              {artistData?.socialLinks?.twitter || "not provided"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
