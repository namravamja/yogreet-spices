"use client";

import { useRouter } from "next/navigation";
import { Edit, User } from "lucide-react";
import BasicInformation from "./components/basic-information";
import AddressInformation from "./components/address-information";
import BankingTaxInformation from "./components/banking-tax-information";
import ShippingLogistics from "./components/shipping-logistics";
import SocialMediaLinks from "./components/social-media-links";
import { useGetartistQuery } from "@/services/api/artistApi";
import ProfileProgress from "../MakeProfile/components/ProfileProgress";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/app/(auth)/components/auth-modal-provider";
import { useMemo } from "react";

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth("artist");
  const { openArtistLogin } = useAuthModal();

  // Use the actual RTK Query hook - only run if authenticated
  const {
    data: artistResponse,
    isLoading,
    error,
  } = useGetartistQuery(undefined, {
    skip: !isAuthenticated,
  });

  // Extract the actual artist data from the cache response format
  const artistData = useMemo(() => {
    if (!artistResponse) return null;

    // Handle cache response format: {source: 'cache', data: {...}}
    if (artistResponse.source && artistResponse.data) {
      return artistResponse.data;
    }

    // Handle direct object format as fallback
    if (typeof artistResponse === "object" && !Array.isArray(artistResponse)) {
      return artistResponse;
    }

    return null;
  }, [artistResponse]);

  const handleEditProfile = () => {
    router.push("/Artist/MakeProfile");
  };

  // Show login prompt if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <User className="w-24 h-24 mx-auto text-stone-300 mb-6" />
            <h1 className="text-3xl font-light text-stone-900 mb-4">
              Login Required
            </h1>
            <p className="text-stone-600 mb-8">
              Please login to view your profile.
            </p>
            <button
              onClick={openArtistLogin}
              className="bg-terracotta-600 hover:bg-terracotta-700 text-white px-6 py-3 font-medium transition-colors cursor-pointer"
            >
              Login to Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle loading state
  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terracotta-500 mx-auto mb-4"></div>
            <p className="text-stone-600">Loading profile data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    console.error("Profile loading error:", error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading profile data</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-terracotta-500 hover:bg-terracotta-600 text-white px-4 py-2 rounded transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle no data state
  if (!artistData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-stone-600 mb-4">No profile data found</p>
            <button
              onClick={handleEditProfile}
              className="bg-terracotta-500 hover:bg-terracotta-600 text-white px-4 py-2 rounded transition-colors cursor-pointer"
            >
              Create Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl">
      {/* Header */}
      <div className="bg-white border border-stone-200 shadow-sm mb-6">
        <div className="p-6 border-b border-stone-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-medium text-stone-900 mb-1">
                Seller Profile
              </h1>
              <p className="text-stone-600">
                Manage your seller profile and business information
              </p>
            </div>
            <div className="flex space-x-3 w-full sm:w-auto">
              <button
                onClick={handleEditProfile}
                className="bg-terracotta-500 hover:bg-terracotta-600 text-white px-4 py-2 font-medium transition-colors flex items-center justify-center w-full sm:w-auto cursor-pointer"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <ProfileProgress profileData={artistData} />

      {/* Profile Content */}
      <div className="space-y-6">
        <BasicInformation artistData={artistData} />
        <AddressInformation artistData={artistData} />
        <BankingTaxInformation artistData={artistData} />
        <ShippingLogistics artistData={artistData} />
        <SocialMediaLinks artistData={artistData} />
      </div>
    </div>
  );
}
