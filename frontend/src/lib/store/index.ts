import { configureStore } from "@reduxjs/toolkit";
import { AuthApi, BuyerApi, SellerApi, ProductApi } from "@/services/api"; // base API with injectEndpoints
import "@/services/api/authApi"; // This ensures auth endpoints are injected into the base api
import "@/services/api/buyerApi";
import "@/services/api/sellerApi";
import "@/services/api/productApi";

export const makeStore = () =>
  configureStore({
    reducer: {
      [AuthApi.reducerPath]: AuthApi.reducer,
      [BuyerApi.reducerPath]: BuyerApi.reducer,
      [SellerApi.reducerPath]: SellerApi.reducer,
      [ProductApi.reducerPath]: ProductApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        AuthApi.middleware,
        BuyerApi.middleware,
        SellerApi.middleware,
        ProductApi.middleware
      ),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

