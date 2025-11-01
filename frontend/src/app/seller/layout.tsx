"use client"

import { usePathname } from "next/navigation"
import { Navbar } from "@/components/layout"
import { Footer } from "@/components/layout"

interface SellerLayoutProps {
  children: React.ReactNode
}

export default function SellerLayout({ children }: SellerLayoutProps) {
  const pathname = usePathname()
  const isVerificationPage = pathname?.startsWith("/seller/verify-document")
  
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar - Hidden on verification pages */}
      {!isVerificationPage && <Navbar />}

      {/* Main Content Area */}
      <main className="flex-1">
        {children}
      </main>

      {/* Separation Line */}
      {!isVerificationPage && <div className="border-t border-gray-200"></div>}

      {/* Footer - Hidden on verification pages */}
      {!isVerificationPage && <Footer />}
    </div>
  )
}


