"use client";

import { useMemo } from "react";
import { useGetBuyerQuery } from "@/services/api/buyerApi";
import { useGetSellerQuery } from "@/services/api/sellerApi";
import { useGetAdminQuery } from "@/services/api/adminApi";
import { PLACEHOLDER_USER_URL, PLACEHOLDER_LOGO_URL } from "@/constants/static-images";

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

interface AdminData {
  username?: string;
  [key: string]: any;
}

export function useAuth(role: "buyer" | "seller" | "admin") {
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

  const {
    data: adminData,
    isLoading: adminLoading,
    isError: isAdminError,
    error: adminError,
    refetch: refetchAdmin,
  } = useGetAdminQuery(undefined, {
    skip: role !== "admin",
    refetchOnFocus: true,
    refetchOnReconnect: true,
    refetchOnMountOrArgChange: true,
  });

  // Derive hasTriedAuth from query states - no useEffect needed
  const hasTriedAuth = useMemo(() => {
    if (role === "buyer") {
      // Has tried auth if query is not loading and we have either data or error
      return !buyerLoading && (!!buyerData || isBuyerError);
    } else if (role === "seller") {
      // Has tried auth if query is not loading and we have either data or error
      return !sellerLoading && (!!sellerData || isSellerError);
    } else {
      // Has tried auth if query is not loading and we have either data or error
      return !adminLoading && (!!adminData || isAdminError);
    }
  }, [role, buyerLoading, buyerData, isBuyerError, sellerLoading, sellerData, isSellerError, adminLoading, adminData, isAdminError]);

  const isAuthenticated = useMemo(() => {
    return (
      (role === "buyer" && !isBuyerError && !!buyerData && hasTriedAuth) ||
      (role === "seller" && !isSellerError && !!sellerData && hasTriedAuth) ||
      (role === "admin" && !isAdminError && !!adminData && hasTriedAuth)
    );
  }, [role, isBuyerError, buyerData, isSellerError, sellerData, isAdminError, adminData, hasTriedAuth]);

  const apiError = useMemo(() => {
    if (role === "buyer") return buyerError as ApiError | undefined;
    if (role === "seller") return sellerError as ApiError | undefined;
    return adminError as ApiError | undefined;
  }, [role, buyerError, sellerError, adminError]);

  const user = useMemo(() => {
    if (!isAuthenticated || !(buyerData || sellerData || adminData)) {
      return null;
    }

    if (role === "admin") {
      return {
        name: (adminData as AdminData)?.username || "Admin",
        image: PLACEHOLDER_USER_URL,
        username: (adminData as AdminData)?.username,
        ...adminData,
      };
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
          ? (buyerData as BuyerData)?.avatar || PLACEHOLDER_USER_URL
          : (sellerData as SellerData)?.businessLogo || PLACEHOLDER_LOGO_URL,
      email:
        role === "buyer"
          ? (buyerData as BuyerData)?.email
          : (sellerData as SellerData)?.email,
      ...(role === "buyer" ? buyerData : sellerData),
    };
  }, [isAuthenticated, buyerData, sellerData, adminData, role]);

  const isLoading = useMemo(() => {
    if (role === "buyer") return buyerLoading && !hasTriedAuth;
    if (role === "seller") return sellerLoading && !hasTriedAuth;
    return adminLoading && !hasTriedAuth;
  }, [role, buyerLoading, sellerLoading, adminLoading, hasTriedAuth]);

  return {
    isAuthenticated,
    isLoading,
    isError: role === "buyer" ? isBuyerError : role === "seller" ? isSellerError : isAdminError,
    error: apiError,
    user,
    refetch: role === "buyer" ? refetchBuyer : role === "seller" ? refetchSeller : refetchAdmin,
  };
}

