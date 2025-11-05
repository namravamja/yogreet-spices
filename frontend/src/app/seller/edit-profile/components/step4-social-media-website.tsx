"use client";

interface SellerProfileDataStep4 {
  socialLinks: {
    website: string;
    instagram: string;
    facebook: string;
    twitter: string;
  };
}

interface Step4Props {
  data: SellerProfileDataStep4 & Record<string, any>;
  updateData: (updates: Partial<SellerProfileDataStep4>) => void;
  isLoading?: boolean;
}

export default function Step4SocialMediaWebsite({ data, updateData }: Step4Props) {
  const handleSocialLinkChange = (platform: string, value: string) => {
    updateData({
      socialLinks: {
        ...data.socialLinks,
        [platform]: value,
      },
    });
  };

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-poppins font-light text-yogreet-charcoal mb-4 sm:mb-6">
        Social Media & Website
      </h2>

      <div className="space-y-6">
        {/* Website */}
        <div>
          <label className="block text-sm font-manrope font-medium text-stone-700 mb-2">
            Website
          </label>
          <input
            type="url"
            value={data.socialLinks?.website || ""}
            onChange={(e) => handleSocialLinkChange("website", e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage font-inter"
            placeholder="https://www.example.com"
          />
          <p className="mt-1 text-xs text-stone-500 font-inter">
            Your business website URL (optional)
          </p>
        </div>

        {/* Instagram */}
        <div>
          <label className="block text-sm font-manrope font-medium text-stone-700 mb-2">
            Instagram
          </label>
          <input
            type="text"
            value={data.socialLinks?.instagram || ""}
            onChange={(e) => handleSocialLinkChange("instagram", e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage font-inter"
            placeholder="@your_instagram_handle"
          />
          <p className="mt-1 text-xs text-stone-500 font-inter">
            Your Instagram handle or profile link (optional)
          </p>
        </div>

        {/* Facebook */}
        <div>
          <label className="block text-sm font-manrope font-medium text-stone-700 mb-2">
            Facebook
          </label>
          <input
            type="text"
            value={data.socialLinks?.facebook || ""}
            onChange={(e) => handleSocialLinkChange("facebook", e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage font-inter"
            placeholder="Your Facebook page name or link"
          />
          <p className="mt-1 text-xs text-stone-500 font-inter">
            Your Facebook page name or profile link (optional)
          </p>
        </div>

        {/* Twitter */}
        <div>
          <label className="block text-sm font-manrope font-medium text-stone-700 mb-2">
            Twitter/X
          </label>
          <input
            type="text"
            value={data.socialLinks?.twitter || ""}
            onChange={(e) => handleSocialLinkChange("twitter", e.target.value)}
            className="w-full px-4 py-3 border border-stone-300 rounded-md focus:border-yogreet-sage focus:outline-none focus:ring-1 focus:ring-yogreet-sage font-inter"
            placeholder="@your_twitter_handle"
          />
          <p className="mt-1 text-xs text-stone-500 font-inter">
            Your Twitter/X handle or profile link (optional)
          </p>
        </div>

        {/* Helper Text */}
        <div className="bg-yogreet-sage/10 border border-yogreet-sage/20 rounded-md p-4 mt-6">
          <p className="text-sm text-stone-700 font-inter">
            <span className="font-medium text-yogreet-sage">Note:</span> All social media and website links are optional. However, providing them helps buyers learn more about your business and builds trust.
          </p>
        </div>
      </div>
    </div>
  );
}

