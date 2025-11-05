"use client";

import { useRouter } from "next/navigation";
import { Edit, User } from "lucide-react";
import BasicInformation from "./components/basic-information";
import AddressInformation from "./components/address-information";
import BankingTaxInformation from "./components/banking-tax-information";
import ShippingLogistics from "./components/shipping-logistics";
import SocialMediaLinks from "./components/social-media-links";
import ProfileProgress from "./components/ProfileProgress";
import { useAuth } from "@/hooks/useAuth";
import { useGetSellerQuery } from "@/services/api/sellerApi";

export default function SellerProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth("seller");
  const { data: sellerData, isLoading: isDataLoading, isError, error, refetch } = useGetSellerQuery(undefined);

  const handleEditProfile = () => {
    router.push("/seller/edit-profile");
  };

  const isLoading = isAuthLoading || isDataLoading;

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen gradient-to-br from-stone-50 via-white to-stone-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yogreet-sage mx-auto mb-4"></div>
              <p className="text-stone-600 font-inter">Loading profile data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated || isError) {
    return (
      <div className="min-h-screen gradient-to-br from-stone-50 via-white to-stone-50">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center py-16">
            <User className="w-24 h-24 mx-auto text-stone-300 mb-6" />
            <h1 className="text-3xl font-poppins font-light text-yogreet-charcoal mb-4">
              {isError ? "Error Loading Profile" : "Login Required"}
            </h1>
            <p className="text-stone-600 mb-8 font-inter">
              {isError 
                ? error && "status" in error
                  ? `Error ${error.status}: ${typeof error.data === "object" && error.data && "error" in error.data ? error.data.error : "Failed to load profile"}`
                  : "Failed to load seller profile. Please try again."
                : "Please login to view your seller profile."}
            </p>
            <div className="flex gap-4 justify-center">
              {isError && (
                <button
                  onClick={() => refetch()}
                  className="bg-yogreet-sage hover:bg-yogreet-sage/90 text-white px-6 py-3 font-manrope font-medium transition-colors cursor-pointer rounded-md"
                >
                  Retry
                </button>
              )}
              {!isAuthenticated && (
                <button
                  onClick={() => router.push('/')}
                  className="bg-yogreet-sage hover:bg-yogreet-sage/90 text-white px-6 py-3 font-manrope font-medium transition-colors cursor-pointer rounded-md"
                >
                  Go to Login
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle no data state (data is null but no error)
  if (!sellerData) {
    return (
      <div className="min-h-screen gradient-to-br from-stone-50 via-white to-stone-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <User className="w-24 h-24 mx-auto text-stone-300 mb-6" />
              <p className="text-stone-600 mb-4 font-inter text-lg">No profile data found</p>
              <button
                onClick={handleEditProfile}
                className="bg-yogreet-sage hover:bg-yogreet-sage/90 text-white px-6 py-3 font-manrope font-medium transition-colors cursor-pointer rounded-md"
              >
                Create Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-to-br from-stone-50 via-white to-stone-50">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl">
        {/* Header */}
        <div className="bg-white border border-stone-200 shadow-sm mb-6">
          <div className="p-6 border-b border-stone-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-poppins font-light text-yogreet-charcoal mb-1">
                  Seller Profile
                </h1>
                <p className="text-stone-600 font-inter">
                  Manage your seller profile and business information
                </p>
              </div>
              <div className="flex space-x-3 w-full sm:w-auto">
                <button
                  onClick={handleEditProfile}
                  className="bg-yogreet-sage hover:bg-yogreet-sage/90 text-white px-4 py-2 font-manrope font-medium transition-colors flex items-center justify-center w-full sm:w-auto cursor-pointer rounded-md"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <ProfileProgress profileData={sellerData as any} />

        {/* Profile Content */}
        <div className="space-y-6">
          <BasicInformation sellerData={sellerData as any} />
          <AddressInformation sellerData={sellerData as any} />
          <BankingTaxInformation sellerData={sellerData as any} />
          <ShippingLogistics sellerData={sellerData as any} />
          <SocialMediaLinks sellerData={sellerData as any} />
        </div>
      </div>
    </div>
  );
}

