"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { AdminNavbar } from "@/components/admin/admin-navbar"
import { useAuth } from "@/hooks/useAuth"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, isLoading } = useAuth("admin")

  useEffect(() => {
    // Only redirect if not on login page and not loading
    if (!isLoading && !isAuthenticated && pathname !== "/admin/login") {
      router.push("/admin/login")
    }
  }, [isAuthenticated, isLoading, pathname, router])

  // Show nothing while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yogreet-sage mx-auto"></div>
          <p className="mt-4 text-stone-600 font-inter">Loading...</p>
        </div>
      </div>
    )
  }

  // If not authenticated and not on login page, show nothing (redirect is in progress)
  if (!isAuthenticated && pathname !== "/admin/login") {
    return null
  }

  // If on login page, don't show navbar
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Admin Navbar */}
      <AdminNavbar />

        {/* Main Content */}
      <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>
    </div>
  )
}

