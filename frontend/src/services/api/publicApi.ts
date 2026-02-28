import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Base API URL - fallback to localhost if env var not set
const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const PublicApi = createApi({
  reducerPath: "publicApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_API_URL,
    credentials: "include",
  }),
  tagTypes: ["Seller", "Product", "Orders"],
  endpoints: (builder) => ({
    // Get top sellers
    getTopSellers: builder.query({
      query: (limit: number = 10) => `/sellers/top?limit=${limit}`,
      providesTags: ["Seller"],
    }),
    // Get public seller profile (for buyers to view)
    getPublicSellerProfile: builder.query({
      query: (sellerId: string) => `/sellers/${sellerId}`,
      providesTags: (result, error, sellerId) => [{ type: "Seller", id: sellerId }],
    }),

    // Payments and escrow actions
    createPayment: builder.mutation({
      query: (orderId: string) => ({
        url: `/payments/create/${orderId}`,
        method: "POST",
      }),
      transformResponse: (response: any) => response?.data || response,
    }),
    confirmRelease: builder.mutation({
      query: (orderId: string) => ({
        url: `/payments/${orderId}/release`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, id) => [{ type: "Orders", id }, "Orders"],
    }),
    raiseDispute: builder.mutation({
      query: ({ orderId, file }: { orderId: string; file: File }) => {
        const fd = new FormData();
        fd.append("buyerBarcodeImage", file);
        return {
          url: `/payments/${orderId}/dispute`,
          method: "POST",
          body: fd,
        };
      },
      invalidatesTags: (_r, _e, arg) => [{ type: "Orders", id: arg.orderId }, "Orders"],
    }),
    markDelivered: builder.mutation({
      query: (orderId: string) => ({
        url: `/payments/${orderId}/delivered`,
        method: "PATCH",
      }),
      invalidatesTags: (_r, _e, id) => [{ type: "Orders", id }, "Orders"],
    }),
  }),
});

export const { useGetTopSellersQuery, useGetPublicSellerProfileQuery, useCreatePaymentMutation, useConfirmReleaseMutation, useRaiseDisputeMutation, useMarkDeliveredMutation } = PublicApi;
