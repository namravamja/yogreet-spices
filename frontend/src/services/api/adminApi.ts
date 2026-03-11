import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Base API URL - fallback to localhost if env var not set
const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Dispute types
export interface DisputeProduct {
  productId: string;
  productName: string;
  quantity: number;
  priceAtPurchase: number;
  sellerId: string;
  sellerName?: string;
  sellerEmail?: string;
  productBarcodeImage?: string;
}

export interface DisputeEvidence {
  type: "image" | "document" | "description";
  url?: string;
  description?: string;
  uploadedBy: {
    role: "buyer" | "seller" | "admin";
    userId: string;
  };
  uploadedAt: string;
}

export interface DisputeTimelineEvent {
  action: "created" | "evidence_added" | "admin_reviewed" | "resolved" | "escalated" | "comment_added";
  performedBy: {
    role: "buyer" | "seller" | "admin";
    userId: string;
    name?: string;
  };
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface AdminNote {
  note: string;
  addedBy: string;
  addedByName?: string;
  addedAt: string;
}

export interface Dispute {
  _id: string;
  orderId: string;
  buyerId: string;
  buyerInfo: {
    fullName: string;
    email: string;
    phone?: string;
  };
  orderInfo: {
    totalAmount: number;
    subtotal: number;
    shippingCost: number;
    taxAmount: number;
    currency: string;
    paymentMethod: string;
    gateway: string;
    placedAt: string;
    deliveredAt?: string;
  };
  products: DisputeProduct[];
  reason: "not_received" | "wrong_item" | "damaged" | "quality_issue" | "other";
  reasonDescription?: string;
  buyerEvidence: {
    barcodeImage: string;
    additionalImages?: string[];
    description?: string;
  };
  sellerEvidence?: {
    barcodeImage?: string;
    additionalImages?: string[];
    description?: string;
    respondedAt?: string;
  };
  evidenceHistory: DisputeEvidence[];
  status: "open" | "under_review" | "awaiting_seller" | "resolved" | "escalated";
  priority: "low" | "medium" | "high" | "critical";
  resolution?: {
    action: "refund" | "partial_refund" | "release_to_seller" | "rejected";
    refundAmount?: number;
    refundPercentage?: number;
    resolvedBy: string;
    resolvedByName?: string;
    resolvedAt: string;
    notes?: string;
  };
  adminNotes: AdminNote[];
  timeline: DisputeTimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface DisputeStats {
  total: number;
  open: number;
  underReview: number;
  resolved: number;
  highPriority: number;
}

// Create admin API instance
export const AdminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_API_URL,
    credentials: "include",
  }),
  tagTypes: ["Admin", "Sellers", "Buyers", "Stats", "Disputes", "DisputeDetail"],
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

    // Get seller products by seller ID
    getSellerProductsById: builder.query({
      query: (id: string) => `/admin/sellers/${id}/products`,
      providesTags: (result, error, id) => [{ type: "Sellers", id: `${id}-products` }],
    }),

    // Get seller orders by seller ID
    getSellerOrdersById: builder.query({
      query: (id: string) => `/admin/sellers/${id}/orders`,
      providesTags: (result, error, id) => [{ type: "Sellers", id: `${id}-orders` }],
    }),

    // Get buyer by ID
    getBuyerById: builder.query({
      query: (id: string) => `/admin/buyers/${id}`,
      providesTags: (result, error, id) => [{ type: "Buyers", id }],
    }),

    // Get buyer orders by buyer ID
    getBuyerOrdersById: builder.query({
      query: (id: string) => `/admin/buyers/${id}/orders`,
      providesTags: (result, error, id) => [{ type: "Buyers", id: `${id}-orders` }],
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

    // List all disputes
    getDisputes: builder.query<Dispute[], { status?: string; priority?: string } | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.status) queryParams.append("status", params.status);
        if (params?.priority) queryParams.append("priority", params.priority);
        const queryString = queryParams.toString();
        return `/admin/disputes${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: ["Disputes"],
      transformResponse: (response: any) => {
        if (response && typeof response === "object" && "data" in response) {
          return response.data;
        }
        return response;
      },
    }),

    // Get dispute stats
    getDisputeStats: builder.query<DisputeStats, void>({
      query: () => "/admin/disputes/stats",
      providesTags: ["Disputes"],
      transformResponse: (response: any) => {
        if (response && typeof response === "object" && "data" in response) {
          return response.data;
        }
        return response;
      },
    }),

    // Get single dispute by ID
    getDisputeById: builder.query<Dispute, string>({
      query: (disputeId) => `/admin/disputes/${disputeId}`,
      providesTags: (result, error, id) => [{ type: "DisputeDetail", id }],
      transformResponse: (response: any) => {
        if (response && typeof response === "object" && "data" in response) {
          return response.data;
        }
        return response;
      },
    }),

    // Get dispute by order ID
    getDisputeByOrderId: builder.query<Dispute, string>({
      query: (orderId) => `/admin/disputes/order/${orderId}`,
      providesTags: (result) => result ? [{ type: "DisputeDetail", id: result._id }] : [],
      transformResponse: (response: any) => {
        if (response && typeof response === "object" && "data" in response) {
          return response.data;
        }
        return response;
      },
    }),

    // Update dispute status
    updateDisputeStatus: builder.mutation<Dispute, { disputeId: string; status: string }>({
      query: ({ disputeId, status }) => ({
        url: `/admin/disputes/${disputeId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, arg) => [
        "Disputes",
        { type: "DisputeDetail", id: arg.disputeId },
      ],
    }),

    // Update dispute priority
    updateDisputePriority: builder.mutation<Dispute, { disputeId: string; priority: string }>({
      query: ({ disputeId, priority }) => ({
        url: `/admin/disputes/${disputeId}/priority`,
        method: "PATCH",
        body: { priority },
      }),
      invalidatesTags: (result, error, arg) => [
        "Disputes",
        { type: "DisputeDetail", id: arg.disputeId },
      ],
    }),

    // Resolve dispute (new comprehensive method)
    resolveDisputeNew: builder.mutation<
      Dispute,
      {
        disputeId: string;
        action: "refund" | "partial_refund" | "release_to_seller" | "rejected";
        refundAmount?: number;
        refundPercentage?: number;
        notes?: string;
      }
    >({
      query: ({ disputeId, ...body }) => ({
        url: `/admin/disputes/${disputeId}/resolve`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        "Disputes",
        { type: "DisputeDetail", id: arg.disputeId },
        "Stats",
      ],
    }),

    // Add admin note
    addAdminNote: builder.mutation<Dispute, { disputeId: string; note: string }>({
      query: ({ disputeId, note }) => ({
        url: `/admin/disputes/${disputeId}/notes`,
        method: "POST",
        body: { note },
      }),
      invalidatesTags: (result, error, arg) => [{ type: "DisputeDetail", id: arg.disputeId }],
    }),

    // Legacy: Refund payment (backward compatibility)
    refundPayment: builder.mutation({
      query: ({ orderId, amount }: { orderId: string; amount?: number }) => ({
        url: `/admin/payments/${orderId}/refund`,
        method: "POST",
        body: amount ? { amount } : undefined,
      }),
      invalidatesTags: ["Disputes", "Stats"],
    }),

    // Legacy: Force release payment (backward compatibility)
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
  useGetSellerProductsByIdQuery,
  useGetSellerOrdersByIdQuery,
  useGetBuyerByIdQuery,
  useGetBuyerOrdersByIdQuery,
  useVerifyDocumentMutation,
  useUnverifyDocumentMutation,
  useUpdateSellerVerificationStatusMutation,
  useMarkFieldsAsReviewedMutation,
  useGetDisputesQuery,
  useGetDisputeStatsQuery,
  useGetDisputeByIdQuery,
  useGetDisputeByOrderIdQuery,
  useUpdateDisputeStatusMutation,
  useUpdateDisputePriorityMutation,
  useResolveDisputeNewMutation,
  useAddAdminNoteMutation,
  useRefundPaymentMutation,
  useForceReleasePaymentMutation,
} = AdminApi;
