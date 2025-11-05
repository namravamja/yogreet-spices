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
      invalidatesTags: ["Buyer"],
    }),

    updateAddress: builder.mutation({
      query: ({ id, ...addressData }) => ({
        url: `/addresses/${id}`,
        method: "PUT",
        body: addressData,
      }),
      invalidatesTags: ["Buyer"],
    }),

    deleteAddress: builder.mutation({
      query: (id) => ({
        url: `/addresses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Buyer"],
    }),

    setDefaultAddress: builder.mutation({
      query: (id) => ({
        url: `/addresses/${id}/default`,
        method: "PATCH",
      }),
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
      invalidatesTags: ["Cart", "Buyer"],
    }),

    updateCartItem: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/cart/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Cart"],
    }),

    removeCartItem: builder.mutation({
      query: (id) => ({
        url: `/cart/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),

    clearCart: builder.mutation({
      query: () => ({
        url: "/cart",
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),

    // Sample request operations
    getSamples: builder.query({
      query: () => "/samples",
      providesTags: ["Samples"],
    }),

    requestSample: builder.mutation({
      query: (data) => ({
        url: "/samples",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Samples"],
    }),

    updateSampleRequest: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/samples/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Samples"],
    }),

    removeSampleRequest: builder.mutation({
      query: (id) => ({
        url: `/samples/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Samples"],
    }),

    clearSampleRequests: builder.mutation({
      query: () => ({
        url: "/samples",
        method: "DELETE",
      }),
      invalidatesTags: ["Samples"],
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
  useGetSamplesQuery,
  useRequestSampleMutation,
  useUpdateSampleRequestMutation,
  useRemoveSampleRequestMutation,
  useClearSampleRequestsMutation,
} = buyerApi;

