"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function SellerSidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <aside className="w-64 bg-white border-r border-yogreet-light-gray min-h-screen">
      <div className="p-6">
        <Link href="/seller" className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-yogreet-red flex items-center justify-center">
            <span className="text-white font-poppins font-bold text-lg">Y</span>
          </div>
          <span className="font-poppins font-semibold text-yogreet-charcoal">Yogreet</span>
        </Link>

        <nav className="space-y-2">
          <Link
            href="/seller"
            className={`block px-4 py-3 font-inter text-sm transition-colors ${
              isActive("/seller") ? "bg-yogreet-red text-white" : "text-yogreet-charcoal hover:bg-yogreet-light-gray"
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/seller/products"
            className={`block px-4 py-3 font-inter text-sm transition-colors ${
              isActive("/seller/products")
                ? "bg-yogreet-red text-white"
                : "text-yogreet-charcoal hover:bg-yogreet-light-gray"
            }`}
          >
            My Products
          </Link>
          <Link
            href="/seller/orders"
            className={`block px-4 py-3 font-inter text-sm transition-colors ${
              isActive("/seller/orders")
                ? "bg-yogreet-red text-white"
                : "text-yogreet-charcoal hover:bg-yogreet-light-gray"
            }`}
          >
            Orders
          </Link>
          <Link
            href="/seller/samples"
            className={`block px-4 py-3 font-inter text-sm transition-colors ${
              isActive("/seller/samples")
                ? "bg-yogreet-red text-white"
                : "text-yogreet-charcoal hover:bg-yogreet-light-gray"
            }`}
          >
            Sample Requests
          </Link>
          <Link
            href="/seller/analytics"
            className={`block px-4 py-3 font-inter text-sm transition-colors ${
              isActive("/seller/analytics")
                ? "bg-yogreet-red text-white"
                : "text-yogreet-charcoal hover:bg-yogreet-light-gray"
            }`}
          >
            Analytics
          </Link>
          <Link
            href="/seller/settings"
            className={`block px-4 py-3 font-inter text-sm transition-colors ${
              isActive("/seller/settings")
                ? "bg-yogreet-red text-white"
                : "text-yogreet-charcoal hover:bg-yogreet-light-gray"
            }`}
          >
            Settings
          </Link>
        </nav>
      </div>
    </aside>
  )
}
