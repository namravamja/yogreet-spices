"use client";

import { useMemo } from "react";
import { useGetBuyerQuery } from "@/services/api/buyerApi";
import { useGetSellerQuery } from "@/services/api/sellerApi";

interface ApiError {
  status?: number;
  data?: any;
  [key: string]: any;
}

interface BuyerData {
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
  [key: string]: any;
}

interface SellerData {
  fullName?: string;
  storeName?: string;
  email?: string;
  businessLogo?: string;
  [key: string]: any;
}

export function useAuth(role: "buyer" | "seller") {
  const {
    data: buyerData,
    isLoading: buyerLoading,
    isError: isBuyerError,
    error: buyerError,
    refetch: refetchBuyer,
  } = useGetBuyerQuery(undefined, {
    skip: role !== "buyer",
    refetchOnFocus: true,
    refetchOnReconnect: true,
    refetchOnMountOrArgChange: true,
  });

  const {
    data: sellerData,
    isLoading: sellerLoading,
    isError: isSellerError,
    error: sellerError,
    refetch: refetchSeller,
  } = useGetSellerQuery(undefined, {
    skip: role !== "seller",
    refetchOnFocus: true,
    refetchOnReconnect: true,
    refetchOnMountOrArgChange: true,
  });

  // Derive hasTriedAuth from query states - no useEffect needed
  const hasTriedAuth = useMemo(() => {
    if (role === "buyer") {
      // Has tried auth if query is not loading and we have either data or error
      return !buyerLoading && (!!buyerData || isBuyerError);
    } else {
      // Has tried auth if query is not loading and we have either data or error
      return !sellerLoading && (!!sellerData || isSellerError);
    }
  }, [role, buyerLoading, buyerData, isBuyerError, sellerLoading, sellerData, isSellerError]);

  const isAuthenticated = useMemo(() => {
    return (
      (role === "buyer" && !isBuyerError && !!buyerData && hasTriedAuth) ||
      (role === "seller" && !isSellerError && !!sellerData && hasTriedAuth)
    );
  }, [role, isBuyerError, buyerData, isSellerError, sellerData, hasTriedAuth]);

  const apiError = useMemo(() => {
    return (role === "buyer" ? buyerError : sellerError) as ApiError | undefined;
  }, [role, buyerError, sellerError]);

  const user = useMemo(() => {
    if (!isAuthenticated || !(buyerData || sellerData)) {
      return null;
    }

    return {
      name:
        role === "buyer"
          ? ((buyerData as BuyerData)?.firstName && (buyerData as BuyerData)?.lastName
              ? `${(buyerData as BuyerData).firstName} ${(buyerData as BuyerData).lastName}`
              : (buyerData as BuyerData)?.firstName || 
                (buyerData as BuyerData)?.email?.split("@")[0] || "User")
          : (sellerData as SellerData)?.fullName || 
            (sellerData as SellerData)?.storeName || 
            (sellerData as SellerData)?.email?.split("@")[0] || "User",
      image:
        role === "buyer"
          ? (buyerData as BuyerData)?.avatar || "/placeholder-user.jpg"
          : (sellerData as SellerData)?.businessLogo || "/placeholder-logo.png",
      email:
        role === "buyer"
          ? (buyerData as BuyerData)?.email
          : (sellerData as SellerData)?.email,
      ...(role === "buyer" ? buyerData : sellerData),
    };
  }, [isAuthenticated, buyerData, sellerData, role]);

  const isLoading = useMemo(() => {
    return (role === "buyer" ? buyerLoading : sellerLoading) && !hasTriedAuth;
  }, [role, buyerLoading, sellerLoading, hasTriedAuth]);

  return {
    isAuthenticated,
    isLoading,
    isError: role === "buyer" ? isBuyerError : isSellerError,
    error: apiError,
    user,
    refetch: role === "buyer" ? refetchBuyer : refetchSeller,
  };
}

