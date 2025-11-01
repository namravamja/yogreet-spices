"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function BuyerSidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <aside className="w-64 bg-white border-r border-yogreet-light-gray min-h-screen">
      <div className="p-6">
        <Link href="/buyer" className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-yogreet-red flex items-center justify-center">
            <span className="text-white font-poppins font-bold text-lg">Y</span>
          </div>
          <span className="font-poppins font-semibold text-yogreet-charcoal">Yogreet</span>
        </Link>

        <nav className="space-y-2">
          <Link
            href="/buyer/profile"
            className={`block px-4 py-3 font-inter text-sm transition-colors ${
              isActive("/buyer/profile") ? "bg-yogreet-red text-white" : "text-yogreet-charcoal hover:bg-yogreet-light-gray"
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/buyer/browse"
            className={`block px-4 py-3 font-inter text-sm transition-colors ${
              isActive("/buyer/browse")
                ? "bg-yogreet-red text-white"
                : "text-yogreet-charcoal hover:bg-yogreet-light-gray"
            }`}
          >
            Browse Spices
          </Link>
          <Link
            href="/buyer/orders"
            className={`block px-4 py-3 font-inter text-sm transition-colors ${
              isActive("/buyer/orders")
                ? "bg-yogreet-red text-white"
                : "text-yogreet-charcoal hover:bg-yogreet-light-gray"
            }`}
          >
            My Orders
          </Link>
          <Link
            href="/buyer/samples"
            className={`block px-4 py-3 font-inter text-sm transition-colors ${
              isActive("/buyer/samples")
                ? "bg-yogreet-red text-white"
                : "text-yogreet-charcoal hover:bg-yogreet-light-gray"
            }`}
          >
            Sample Requests
          </Link>
          <Link
            href="/buyer/favorites"
            className={`block px-4 py-3 font-inter text-sm transition-colors ${
              isActive("/buyer/favorites")
                ? "bg-yogreet-red text-white"
                : "text-yogreet-charcoal hover:bg-yogreet-light-gray"
            }`}
          >
            Favorites
          </Link>
          <Link
            href="/buyer/support"
            className={`block px-4 py-3 font-inter text-sm transition-colors ${
              isActive("/buyer/support")
                ? "bg-yogreet-red text-white"
                : "text-yogreet-charcoal hover:bg-yogreet-light-gray"
            }`}
          >
            Support
          </Link>
        </nav>
      </div>
    </aside>
  )
}
