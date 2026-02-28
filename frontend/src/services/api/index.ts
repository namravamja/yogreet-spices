import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Base API URL - fallback to localhost if env var not set
const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const AuthApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_API_URL}/auth`,
    credentials: "include",
  }),
  tagTypes: ["Buyer", "Seller", "Admin"],
  endpoints: () => ({}),
});

export const BuyerApi = createApi({
  reducerPath: "buyerApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_API_URL}/buyer`,
    credentials: "include",
  }),
  tagTypes: ["Buyer", "Cart", "Orders"],
  endpoints: () => ({}),
});

export const SellerApi = createApi({
  reducerPath: "sellerApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_API_URL}/seller`,
    credentials: "include",
  }),
  tagTypes: ["Seller", "Products", "Orders"],
  endpoints: () => ({}),
});

export { ProductApi, useGetProductsQuery } from "./productApi";
export { PublicApi, useGetPublicSellerProfileQuery } from "./publicApi";
export { AdminApi, useGetAdminQuery, useGetAllSellersQuery, useGetAllBuyersQuery, useGetAdminStatsQuery, useGetSellerByIdQuery, useVerifyDocumentMutation, useUnverifyDocumentMutation } from "./adminApi";
