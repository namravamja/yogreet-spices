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

    // Get seller products
    getSellerProducts: builder.query({
      query: () => "/products",
      providesTags: ["Products"],
      transformResponse: (response: any) => {
        // Handle direct array format
        if (Array.isArray(response)) {
          return response;
        }
        // Handle object with data property
        if (response && typeof response === "object" && "data" in response) {
          return response.data;
        }
        return response;
      },
    }),

    // Get single seller product
    getSellerProduct: builder.query({
      query: (productId: string) => `/products/${productId}`,
      providesTags: (result, error, productId) => [{ type: "Products", id: productId }],
      transformResponse: (response: any) => {
        // Handle direct object format
        if (response && typeof response === "object" && !Array.isArray(response)) {
          return response;
        }
        // Handle object with data property
        if (response && typeof response === "object" && "data" in response) {
          return response.data;
        }
        return response;
      },
    }),

    // Create product
    createProduct: builder.mutation({
      query: (productData) => {
        // Product data should always be FormData (contains images)
        if (productData instanceof FormData) {
          return {
            url: "/products",
            method: "POST",
            body: productData,
          };
        } else {
          // If not FormData, convert to FormData
          const formData = new FormData();
          Object.entries(productData).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              if (Array.isArray(value)) {
                formData.append(key, JSON.stringify(value));
              } else {
                formData.append(key, String(value));
              }
            }
          });
          return {
            url: "/products",
            method: "POST",
            body: formData,
          };
        }
      },
      invalidatesTags: ["Seller", "Products"],
    }),

    // Update product
    updateProduct: builder.mutation({
      query: ({ productId, productData }) => {
        // Product data should always be FormData (contains images)
        if (productData instanceof FormData) {
          return {
            url: `/products/${productId}`,
            method: "PUT",
            body: productData,
          };
        } else {
          // If not FormData, convert to FormData
          const formData = new FormData();
          Object.entries(productData).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              if (Array.isArray(value)) {
                formData.append(key, JSON.stringify(value));
              } else {
                formData.append(key, String(value));
              }
            }
          });
          return {
            url: `/products/${productId}`,
            method: "PUT",
            body: formData,
          };
        }
      },
      invalidatesTags: (result, error, { productId }) => [
        "Seller",
        "Products",
        { type: "Products", id: productId },
      ],
    }),

    // Delete product
    deleteProduct: builder.mutation({
      query: (productId: string) => ({
        url: `/products/${productId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Seller", "Products"],
    }),

    // Get seller orders
    getSellerOrders: builder.query({
      query: ({ page = 1, limit = 10, status }: { page?: number; limit?: number; status?: string }) => {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(limit));
        if (status) params.set("status", status);
        return `/orders?${params.toString()}`;
      },
      providesTags: ["Orders"],
      transformResponse: (response: any) => {
        // Accept either { orders, pagination } or direct object with data
        if (response && typeof response === "object" && "orders" in response) {
          return response;
        }
        if (response && typeof response === "object" && "data" in response) {
          return response.data;
        }
        return response;
      },
    }),

    updateOrderStatus: builder.mutation({
      query: ({ orderId, status }: { orderId: string; status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" }) => ({
        url: `/orders/${orderId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Orders"],
    }),
  }),
});

export const {
  useGetSellerQuery,
  useUpdateSellerMutation,
  useGetSellerVerificationQuery,
  useUpdateSellerVerificationMutation,
  useGetSellerProductsQuery,
  useGetSellerProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetSellerOrdersQuery,
  useUpdateOrderStatusMutation,
} = sellerApi;
