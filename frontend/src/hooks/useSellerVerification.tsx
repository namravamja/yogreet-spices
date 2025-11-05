"use client";

import { useMemo } from "react";
import { useGetSellerQuery } from "@/services/api/sellerApi";
import { useAuth } from "@/hooks/useAuth";

interface SellerData {
  // Profile fields
  fullName?: string | null;
  storeName?: string | null;
  email?: string;
  mobile?: string | null;
  businessType?: string | null;
  productCategories?: string[] | null;
  businessAddress?: {
    street?: string;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    pinCode?: string | null;
  } | null;
  bankAccountName?: string | null;
  bankName?: string | null;
  accountNumber?: string | null;
  ifscCode?: string | null;
  shippingType?: string | null;
  serviceAreas?: string[] | null;
  returnPolicy?: string | null;

  // Document verification fields (from verify-document)
  companyName?: string;
  ownerFullName?: string;
  ownerIdNumber?: string;
  iecCode?: string;
  apedaRegistrationNumber?: string;
  spicesBoardRegistrationNumber?: string;
  bankAccountHolderName?: string;
  bankAccountNumber?: string;
  bankIfscCode?: string;
  fssaiLicenseNumber?: string;
}

interface UseSellerVerificationResult {
  isLoading: boolean;
  isAuthenticated: boolean;
  profileProgress: number;
  documentVerificationProgress: number;
  isProfileComplete: boolean;
  isDocumentVerificationComplete: boolean;
  isFullyVerified: boolean; // Both profile and documents 100%
  sellerData: SellerData | null;
}

const safeString = (value: any): string => {
  return value ? String(value).trim() : "";
};

const safeArray = <T,>(value: T[] | undefined | null): T[] => {
  return Array.isArray(value) ? value : [];
};

export function useSellerVerification(): UseSellerVerificationResult {
  const { isAuthenticated, isLoading: authLoading } = useAuth("seller");
  const {
    data: sellerResponse,
    isLoading: isDataLoading,
    isError,
  } = useGetSellerQuery(undefined, {
    skip: !isAuthenticated,
  });

  const isLoading = authLoading || isDataLoading;

  // Extract seller data from cache response format
  const sellerData = useMemo(() => {
    if (!sellerResponse) return null;

    // Handle cache response format: {source: 'cache', data: {...}}
    if (sellerResponse.source && sellerResponse.data) {
      return sellerResponse.data as SellerData;
    }

    // Handle direct object format
    if (typeof sellerResponse === "object" && !Array.isArray(sellerResponse)) {
      return sellerResponse as SellerData;
    }

    return null;
  }, [sellerResponse]);

  // Calculate profile completion percentage
  const profileProgress = useMemo(() => {
    if (!sellerData) return 0;

    try {
      let completed = 0;
      const total = 20; // Total required fields across all steps

      // Step 1: Seller Account & Business Basics (6 fields)
      if (safeString(sellerData.fullName)) completed++;
      if (safeString(sellerData.storeName)) completed++;
      if (safeString(sellerData.email)) completed++;
      if (safeString(sellerData.mobile)) completed++;
      if (safeString(sellerData.businessType)) completed++;
      if (
        safeArray(sellerData.productCategories).length > 0
      )
        completed++;

      // Step 2: Address, Banking & Tax Details (11 fields)
      if (safeString(sellerData.businessAddress?.street)) completed++;
      if (safeString(sellerData.businessAddress?.city)) completed++;
      if (safeString(sellerData.businessAddress?.state)) completed++;
      if (safeString(sellerData.businessAddress?.country)) completed++;
      if (safeString(sellerData.businessAddress?.pinCode)) completed++;
      if (safeString(sellerData.bankAccountName)) completed++;
      if (safeString(sellerData.bankName)) completed++;
      if (safeString(sellerData.accountNumber)) completed++;
      if (safeString(sellerData.ifscCode)) completed++;
      // GST and PAN may be in documents, check if available in profile
      if (safeString((sellerData as any).gstNumber)) completed++;
      if (safeString((sellerData as any).panNumber)) completed++;

      // Step 3: Preferences, Logistics & Agreement (3 fields)
      if (safeString(sellerData.shippingType)) completed++;
      if (
        safeArray(sellerData.serviceAreas).length > 0
      )
        completed++;
      if (safeString(sellerData.returnPolicy)) completed++;

      return Math.round((completed / total) * 100);
    } catch (error) {
      console.error("Error calculating profile progress:", error);
      return 0;
    }
  }, [sellerData]);

  // Calculate document verification completion percentage
  const documentVerificationProgress = useMemo(() => {
    if (!sellerData) return 0;

    try {
      let completed = 0;
      
      // Required fields from verify-document steps
      // Note: businessType and panNumber/gstNumber may come from profile or verification
      const requiredFields = [
        safeString(sellerData.companyName),
        safeString(sellerData.businessType || ""), // Can be from profile or verification
        safeString((sellerData as any).panNumber || ""), // Check both places
        safeString((sellerData as any).gstNumber || ""), // Check both places
        safeString(sellerData.ownerFullName),
        safeString(sellerData.ownerIdNumber),
        safeString(sellerData.iecCode),
        safeString(sellerData.apedaRegistrationNumber),
        safeString(sellerData.spicesBoardRegistrationNumber),
        safeString(sellerData.bankAccountHolderName),
        safeString(sellerData.bankAccountNumber),
        safeString(sellerData.bankIfscCode),
        safeString(sellerData.fssaiLicenseNumber),
      ];

      // Count completed required fields
      completed = requiredFields.filter((field) => field.length > 0).length;

      // Calculate percentage (13 required fields total)
      const total = 13;
      return Math.round((completed / total) * 100);
    } catch (error) {
      console.error("Error calculating document verification progress:", error);
      return 0;
    }
  }, [sellerData]);

  // Check if profile is 100% complete
  const isProfileComplete = useMemo(() => {
    return profileProgress === 100;
  }, [profileProgress]);

  // Check if document verification is 100% complete
  const isDocumentVerificationComplete = useMemo(() => {
    return documentVerificationProgress === 100;
  }, [documentVerificationProgress]);

  // Check if both profile and documents are 100% complete
  const isFullyVerified = useMemo(() => {
    return isProfileComplete && isDocumentVerificationComplete;
  }, [isProfileComplete, isDocumentVerificationComplete]);

  return {
    isLoading,
    isAuthenticated: isAuthenticated && !isError,
    profileProgress,
    documentVerificationProgress,
    isProfileComplete,
    isDocumentVerificationComplete,
    isFullyVerified,
    sellerData,
  };
}

