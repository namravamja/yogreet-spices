import { AuthApi } from "./index";
import { BuyerApi } from "./index";
import { SellerApi } from "./index";

export const authApi = AuthApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    signupBuyer: builder.mutation({
      query: (buyerData) => ({
        url: "/buyer/signup",
        method: "POST",
        body: buyerData,
      }),
      invalidatesTags: ["Buyer"],
    }),

    loginBuyer: builder.mutation({
      query: (credentials) => ({
        url: "/buyer/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Buyer"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Manually invalidate buyer query by dispatching a refetch
          dispatch(BuyerApi.util.invalidateTags(["Buyer"]));
        } catch (err) {
          // Error handling
        }
      },
    }),

    signupSeller: builder.mutation({
      query: (sellerData) => ({
        url: "/seller/signup",
        method: "POST",
        body: sellerData,
      }),
      invalidatesTags: ["Seller"],
    }),

    loginSeller: builder.mutation({
      query: (credentials) => ({
        url: "/seller/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Seller"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Manually invalidate seller query by dispatching a refetch
          dispatch(SellerApi.util.invalidateTags(["Seller"]));
        } catch (err) {
          // Error handling
        }
      },
    }),

    verifyEmail: builder.query({
      query: (verificationToken) => ({
        url: `/verify-email?token=${verificationToken}`,
        method: "GET",
      }),
    }),

    resendVerificationEmail: builder.mutation({
      query: ({ email, role }) => ({
        url: "/resend-verification",
        method: "POST",
        body: { email, role },
      }),
    }),

    logout: builder.mutation({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
      invalidatesTags: ["Buyer", "Seller"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Manually invalidate both buyer and seller queries
          dispatch(BuyerApi.util.invalidateTags(["Buyer"]));
          dispatch(SellerApi.util.invalidateTags(["Seller"]));
        } catch (err) {
          // Even on error, clear the cache
          dispatch(BuyerApi.util.invalidateTags(["Buyer"]));
          dispatch(SellerApi.util.invalidateTags(["Seller"]));
        }
      },
    }),
  }),
});

export const {
  useSignupBuyerMutation,
  useLoginBuyerMutation,
  useSignupSellerMutation,
  useLoginSellerMutation,
  useVerifyEmailQuery,
  useResendVerificationEmailMutation,
  useLogoutMutation,
} = authApi;

