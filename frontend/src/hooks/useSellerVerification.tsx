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
  iecCode?: string;
  apedaRegistrationNumber?: string;
  spicesBoardRegistrationNumber?: string;
  bankAccountHolderName?: string;
  bankAccountNumber?: string;
  bankIfscCode?: string;
  fssaiLicenseNumber?: string;

  // Completion percentages from database
  profileCompletion?: number | null;
  documentCompletion?: number | null;
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

  // Use profile completion percentage from database
  const profileProgress = useMemo(() => {
    if (!sellerData) return 0;

    // Use the actual value from database if available
    if (typeof sellerData.profileCompletion === "number") {
      return Math.max(0, Math.min(100, sellerData.profileCompletion));
    }

    // Fallback to 0 if not available
    return 0;
  }, [sellerData]);

  // Use document verification completion percentage from database
  const documentVerificationProgress = useMemo(() => {
    if (!sellerData) return 0;

    // Use the actual value from database if available
    if (typeof sellerData.documentCompletion === "number") {
      return Math.max(0, Math.min(100, sellerData.documentCompletion));
    }

    // Fallback to 0 if not available
    return 0;
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

