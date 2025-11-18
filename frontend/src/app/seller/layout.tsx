"use client"

import { usePathname } from "next/navigation"
import { SellerNavbar } from "@/components/layout/seller-navbar"
import { Footer } from "@/components/layout"

interface SellerLayoutProps {
  children: React.ReactNode
}

export default function SellerLayout({ children }: SellerLayoutProps) {
  const pathname = usePathname()
  const isVerificationPage = pathname?.startsWith("/seller/verify-document")
  const isProfilePage = pathname?.startsWith("/seller/profile") || pathname?.startsWith("/seller/edit-profile")
  
  return (
    <div className="min-h-screen bg-white flex flex-col">
       <SellerNavbar />
      {/* Main Content Area */}
      <main className="flex-1">
        {children}
      </main>

      {/* Separation Line */}
      {!isVerificationPage && <div className="border-t border-gray-200"></div>}

      {/* Footer - Hidden on verification pages */}
      {!isVerificationPage && <Footer />}

      {/* Verification Prompt Modal removed per requirements */}
    </div>
  )
}


