import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Base API URL - fallback to localhost if env var not set
const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Create admin API instance
export const AdminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_API_URL,
    credentials: "include",
  }),
  tagTypes: ["Admin", "Sellers", "Buyers", "Stats", "Disputes"],
  endpoints: (builder) => ({
    // Get admin info from token
    getAdmin: builder.query({
      query: () => "/admin/view",
      providesTags: ["Admin"],
      // Transform response if it has source/data structure (from reference), otherwise use directly
      transformResponse: (response: any) => {
        // Handle reference format { source: "cache" | "db", data: admin }
        if (response && typeof response === "object" && "data" in response && "source" in response) {
          return response.data;
        }
        // Handle direct response format
        return response;
      },
    }),

    // Get all sellers
    getAllSellers: builder.query({
      query: () => "/admin/sellers",
      providesTags: ["Admin", "Sellers"],
    }),

    // Get all buyers
    getAllBuyers: builder.query({
      query: () => "/admin/buyers",
      providesTags: ["Admin", "Buyers"],
    }),

    // Get admin stats
    getAdminStats: builder.query({
      query: () => "/admin/stats",
      providesTags: ["Admin", "Stats"],
    }),

    // Get seller by ID
    getSellerById: builder.query({
      query: (id: string) => `/admin/sellers/${id}`,
      providesTags: (result, error, id) => [{ type: "Sellers", id }],
    }),

    // Verify seller document
    verifyDocument: builder.mutation({
      query: ({ sellerId, documentField }: { sellerId: string; documentField: string }) => ({
        url: "/admin/sellers/verify-document",
        method: "POST",
        body: { sellerId, documentField },
      }),
      invalidatesTags: (result, error, arg) => [{ type: "Sellers", id: arg.sellerId }],
    }),

    // Unverify seller document
    unverifyDocument: builder.mutation({
      query: ({ sellerId, documentField }: { sellerId: string; documentField: string }) => ({
        url: "/admin/sellers/unverify-document",
        method: "POST",
        body: { sellerId, documentField },
      }),
      invalidatesTags: (result, error, arg) => [{ type: "Sellers", id: arg.sellerId }],
    }),

    // Update seller verification status
    updateSellerVerificationStatus: builder.mutation({
      query: ({ sellerId, status, notes }: { sellerId: string; status: "approved" | "rejected"; notes?: string }) => ({
        url: "/admin/sellers/update-verification-status",
        method: "POST",
        body: { sellerId, status, notes },
      }),
      invalidatesTags: (result, error, arg) => [{ type: "Sellers", id: arg.sellerId }],
    }),

    // Mark fields as reviewed
    markFieldsAsReviewed: builder.mutation({
      query: ({ sellerId, fields }: { sellerId: string; fields: string[] }) => ({
        url: "/admin/sellers/mark-fields-reviewed",
        method: "POST",
        body: { sellerId, fields },
      }),
      invalidatesTags: (result, error, arg) => [{ type: "Sellers", id: arg.sellerId }],
    }),

    // List disputes
    getDisputes: builder.query({
      query: () => "/admin/disputes",
      providesTags: ["Disputes"],
      transformResponse: (response: any) => {
        if (response && typeof response === "object" && "data" in response) {
          return response.data;
        }
        return response;
      },
    }),

    // Refund payment
    refundPayment: builder.mutation({
      query: ({ orderId, amount }: { orderId: string; amount?: number }) => ({
        url: `/admin/payments/${orderId}/refund`,
        method: "POST",
        body: amount ? { amount } : undefined,
      }),
      invalidatesTags: ["Disputes", "Stats"],
    }),

    // Force release payment
    forceReleasePayment: builder.mutation({
      query: ({ orderId }: { orderId: string }) => ({
        url: `/admin/payments/${orderId}/force-release`,
        method: "POST",
      }),
      invalidatesTags: ["Disputes", "Stats"],
    }),
  }),
});

export const {
  useGetAdminQuery,
  useGetAllSellersQuery,
  useGetAllBuyersQuery,
  useGetAdminStatsQuery,
  useGetSellerByIdQuery,
  useVerifyDocumentMutation,
  useUnverifyDocumentMutation,
  useUpdateSellerVerificationStatusMutation,
  useMarkFieldsAsReviewedMutation,
  useGetDisputesQuery,
  useRefundPaymentMutation,
  useForceReleasePaymentMutation,
} = AdminApi;
