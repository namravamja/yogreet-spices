import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Base API URL - fallback to localhost if env var not set
const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const PublicApi = createApi({
  reducerPath: "publicApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_API_URL,
    credentials: "include",
  }),
  tagTypes: ["Seller", "Product"],
  endpoints: (builder) => ({
    // Get public seller profile (for buyers to view)
    getPublicSellerProfile: builder.query({
      query: (sellerId: string) => `/sellers/${sellerId}`,
      providesTags: (result, error, sellerId) => [{ type: "Seller", id: sellerId }],
    }),
  }),
});

export const { useGetPublicSellerProfileQuery } = PublicApi;

