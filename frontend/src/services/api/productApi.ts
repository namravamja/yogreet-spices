import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Base API URL - fallback to localhost if env var not set
const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const ProductApi = createApi({
  reducerPath: "productApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_API_URL}/products`,
    credentials: "include",
  }),
  tagTypes: ["Product"],
  endpoints: (builder) => ({
    getProducts: builder.query<{ success: boolean; products: any[] }, void>({
      query: () => "/",
      providesTags: ["Product"],
    }),
  }),
});

export const { useGetProductsQuery } = ProductApi;

