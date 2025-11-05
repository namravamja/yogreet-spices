import { SellerApi } from "./index";

export const sellerApi = SellerApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // Get seller info from token (includes addresses and related data, matches reference)
    getSeller: builder.query({
      query: () => "/view",
      providesTags: ["Seller"],
      // Transform response if it has source/data structure (from reference), otherwise use directly
      transformResponse: (response: any) => {
        // Handle reference format { source: "cache" | "db", data: seller }
        if (response && typeof response === "object" && "data" in response && "source" in response) {
          return response.data;
        }
        // Handle direct response format
        return response;
      },
    }),

    // Update seller info
    updateSeller: builder.mutation({
      query: (updatedData) => {
        // Check if updatedData contains a file (businessLogo)
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
      invalidatesTags: ["Seller"],
    }),

    // Get seller verification data
    getSellerVerification: builder.query({
      query: () => "/verification",
      providesTags: ["Seller"],
      transformResponse: (response: any) => {
        if (response && typeof response === "object" && "data" in response && "source" in response) {
          return response.data;
        }
        return response;
      },
    }),

    // Update seller verification
    updateSellerVerification: builder.mutation({
      query: (verificationData) => {
        // Check if verificationData contains files
        if (verificationData instanceof FormData) {
          return {
            url: "/verification",
            method: "PUT",
            body: verificationData,
          };
        } else {
          return {
            url: "/verification",
            method: "PUT",
            body: verificationData,
          };
        }
      },
      invalidatesTags: ["Seller"],
    }),
  }),
});

export const {
  useGetSellerQuery,
  useUpdateSellerMutation,
  useGetSellerVerificationQuery,
  useUpdateSellerVerificationMutation,
} = sellerApi;

