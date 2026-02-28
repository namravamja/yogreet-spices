import { BuyerApi } from "./index";

export const buyerApi = BuyerApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // Get buyer info from token (includes addresses, matches reference)
    getBuyer: builder.query({
      query: () => "/view",
      providesTags: ["Buyer"],
      // Transform response if it has source/data structure (from reference), otherwise use directly
      transformResponse: (response: any) => {
        // Handle reference format { source: "cache" | "db", data: buyer }
        if (response && typeof response === "object" && "data" in response && "source" in response) {
          return response.data;
        }
        // Handle direct response format
        return response;
      },
    }),

    // Update buyer info
    updateBuyer: builder.mutation({
      query: (updatedData) => {
        // Check if updatedData contains a file (avatar)
        if (updatedData instanceof FormData) {
          // If it's FormData (contains file), send as multipart/form-data
          return {
            url: "/update",
            method: "PUT",
            body: updatedData,
          };
        } else {
          // If it's regular JSON data, send as JSON
          return {
            url: "/update",
            method: "PUT",
            body: updatedData,
          };
        }
      },
      transformResponse: (response: any) => {
        if (response?.success && response?.data) {
          return { ...response.data, _message: response.message };
        }
        return response;
      },
      invalidatesTags: ["Buyer"],
    }),

    // Address operations
    getAddresses: builder.query({
      query: () => "/addresses",
      providesTags: ["Buyer"],
    }),

    createAddress: builder.mutation({
      query: (addressData) => ({
        url: "/addresses",
        method: "POST",
        body: addressData,
      }),
      transformResponse: (response: any) => {
        // Handle wrapped response: { success: true, message: "...", data: ... }
        if (response?.success && response?.data) {
          return { ...response.data, _message: response.message };
        }
        return response;
      },
      invalidatesTags: ["Buyer"],
    }),

    updateAddress: builder.mutation({
      query: ({ id, ...addressData }) => ({
        url: `/addresses/${id}`,
        method: "PUT",
        body: addressData,
      }),
      transformResponse: (response: any) => {
        if (response?.success && response?.data) {
          return { ...response.data, _message: response.message };
        }
        return response;
      },
      invalidatesTags: ["Buyer"],
    }),

    deleteAddress: builder.mutation({
      query: (id) => ({
        url: `/addresses/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: any) => {
        if (response?.success) {
          return { _message: response.message || "Address deleted successfully" };
        }
        return response;
      },
      invalidatesTags: ["Buyer"],
    }),

    setDefaultAddress: builder.mutation({
      query: (id) => ({
        url: `/addresses/${id}/default`,
        method: "PATCH",
      }),
      transformResponse: (response: any) => {
        if (response?.success && response?.data) {
          return { ...response.data, _message: response.message };
        }
        return response;
      },
      invalidatesTags: ["Buyer"],
    }),

    // Cart operations
    getCart: builder.query({
      query: () => "/cart",
      providesTags: ["Cart"],
    }),

    addToCart: builder.mutation({
      query: (data) => ({
        url: "/cart",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: any) => {
        if (response?.success && response?.data) {
          return { ...response.data, _message: response.message };
        }
        return response;
      },
      invalidatesTags: ["Cart", "Buyer"],
    }),

    updateCartItem: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/cart/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: any) => {
        if (response?.success && response?.data) {
          return { ...response.data, _message: response.message };
        }
        return response;
      },
      invalidatesTags: ["Cart"],
    }),

    removeCartItem: builder.mutation({
      query: (id) => ({
        url: `/cart/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: any) => {
        if (response?.success) {
          return { _message: response.message || "Item removed from cart successfully" };
        }
        return response;
      },
      invalidatesTags: ["Cart"],
    }),

    clearCart: builder.mutation({
      query: () => ({
        url: "/cart",
        method: "DELETE",
      }),
      transformResponse: (response: any) => {
        if (response?.success) {
          return { _message: response.message || "Cart cleared successfully" };
        }
        return response;
      },
      invalidatesTags: ["Cart"],
    }),

    // Order operations
    // Get single order by id
    getOrder: builder.query({
      query: (id: string) => `/orders/${id}`,
      providesTags: (result, error, id) => (result ? [{ type: "Orders", id }] : ["Orders"]),
      transformResponse: (response: any) => {
        if (response?.success && response?.data) {
          return response.data;
        }
        return response;
      },
    }),

    getOrders: builder.query({
      query: () => "/orders",
      providesTags: ["Orders"],
    }),

    createOrder: builder.mutation({
      query: (orderData) => ({
        url: "/orders",
        method: "POST",
        body: orderData,
      }),
      transformResponse: (response: any) => {
        if (response?.success && response?.data) {
          return { ...response.data, _message: response.message };
        }
        return response;
      },
      invalidatesTags: ["Cart", "Buyer", "Orders"],
    }),

    // Buyer verification step 1 (details)
    saveVerificationStep1: builder.mutation({
      query: (data) => ({
        url: "/verify/step1",
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: any) => {
        if (response?.success) {
          return { _message: response.message };
        }
        return response;
      },
      invalidatesTags: ["Buyer"],
    }),

    // Buyer verification step 1 documents
    uploadVerificationStep1Docs: builder.mutation({
      query: (formData: FormData) => ({
        url: "/verify/documents/step1",
        method: "POST",
        body: formData,
      }),
      transformResponse: (response: any) => {
        return response?.data ?? response;
      },
      invalidatesTags: ["Buyer"],
    }),

    autoVerify: builder.mutation({
      query: () => ({
        url: "/verify/auto-approve",
        method: "POST",
      }),
      transformResponse: (response: any) => {
        if (response?.success) {
          return { _message: response.message || "Buyer verified successfully" };
        }
        return response;
      },
      invalidatesTags: ["Buyer"],
    }),

  }),
});

export const {
  useGetBuyerQuery,
  useUpdateBuyerMutation,
  useGetAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
  useGetOrdersQuery,
  useGetOrderQuery,
  useCreateOrderMutation,
  useSaveVerificationStep1Mutation,
  useUploadVerificationStep1DocsMutation,
  useAutoVerifyMutation,
} = buyerApi;
