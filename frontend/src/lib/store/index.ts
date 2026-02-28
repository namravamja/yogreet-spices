import { configureStore } from "@reduxjs/toolkit";
import { AuthApi, BuyerApi, SellerApi, ProductApi, AdminApi } from "@/services/api"; // base API with injectEndpoints
import { PublicApi } from "@/services/api/publicApi"; // Import PublicApi directly
import { VerificationApi } from "@/services/api/verificationApi"; // Import VerificationApi
import "@/services/api/authApi"; // This ensures auth endpoints are injected into the base api
import "@/services/api/buyerApi";
import "@/services/api/sellerApi";
import "@/services/api/productApi";
import "@/services/api/publicApi"; // Ensure publicApi is initialized

export const makeStore = () =>
  configureStore({
    reducer: {
      [AuthApi.reducerPath]: AuthApi.reducer,
      [BuyerApi.reducerPath]: BuyerApi.reducer,
      [SellerApi.reducerPath]: SellerApi.reducer,
      [ProductApi.reducerPath]: ProductApi.reducer,
      [PublicApi.reducerPath]: PublicApi.reducer,
      [AdminApi.reducerPath]: AdminApi.reducer,
      [VerificationApi.reducerPath]: VerificationApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        AuthApi.middleware,
        BuyerApi.middleware,
        SellerApi.middleware,
        ProductApi.middleware,
        PublicApi.middleware,
        AdminApi.middleware,
        VerificationApi.middleware
      ),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

