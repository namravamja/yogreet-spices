import type React from "react";
import type { Metadata } from "next";
import { Poppins, Inter, Manrope } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/lib/store/provider";
import { VerificationModalProviderWithModal } from "@/components/auth/verification-modal-provider";
import { Toaster } from "@/components/ui/sonner";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "Yogreet - Global Indian Spices Trading Platform",
  description:
    "Connect with verified Indian spice sellers and buyers globally. Trade premium spices with ease.",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${inter.variable} ${manrope.variable} font-sans antialiased`}
      >
        <StoreProvider>
          <VerificationModalProviderWithModal>
            {children}
          </VerificationModalProviderWithModal>
          <Toaster position="top-right" richColors closeButton />
        </StoreProvider>
      </body>
    </html>
  );
}
