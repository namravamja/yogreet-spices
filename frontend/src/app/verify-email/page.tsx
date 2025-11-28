"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Navbar, Footer } from "@/components/layout";

function VerifyEmailPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const status = searchParams.get("status");
    const message = searchParams.get("message");

    if (status === "success") {
      toast.success("Email verified successfully! You can now log in.");
      setTimeout(() => {
        router.push("/?openLogin=true");
      }, 1500);
    } else if (status === "already") {
      toast.success("Your email is already verified.");
      setTimeout(() => {
        router.push("/?openLogin=true");
      }, 1500);
    } else if (status === "error") {
      const errorMessage = message ? decodeURIComponent(message) : "Email verification failed. Please try again.";
      toast.error(errorMessage);
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } else {
      // No status parameter, redirect to home
      router.push("/");
    }
  }, [searchParams, router]);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yogreet-sage mx-auto mb-4"></div>
          <p className="text-stone-600 font-inter">Processing email verification...</p>
        </div>
      </div>
      <Footer />
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yogreet-sage mx-auto mb-4"></div>
            <p className="text-stone-600 font-inter">Loading...</p>
          </div>
        </div>
        <Footer />
      </main>
    }>
      <VerifyEmailPageContent />
    </Suspense>
  );
}

