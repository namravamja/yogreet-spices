"use client";

import { ReactNode, useRef } from "react";
import { Provider } from "react-redux";
import { makeStore, AppStore } from "@/lib/store";
import { Toaster } from "react-hot-toast";

export default function StoreProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return (
    <Provider store={storeRef.current}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#fff",
            color: "#333",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            fontSize: "14px",
            fontWeight: "500",
            padding: "12px 16px",
            maxWidth: "500px",
          },
          success: {
            style: {
              background: "#f0fdf4",
              color: "#166534",
              border: "1px solid #86efac",
            },
            iconTheme: {
              primary: "#22c55e",
              secondary: "#f0fdf4",
            },
          },
          error: {
            style: {
              background: "#fef2f2",
              color: "#991b1b",
              border: "1px solid #fecaca",
            },
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fef2f2",
            },
          },
          loading: {
            style: {
              background: "#f9fafb",
              color: "#6b7280",
              border: "1px solid #e5e7eb",
            },
          },
        }}
      />
      {children}
    </Provider>
  );
}

