"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FiHome, FiUsers, FiShoppingBag } from "react-icons/fi"

interface AdminSidebarProps {
  onClose?: () => void
}

export function AdminSidebar({ onClose }: AdminSidebarProps) {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  const handleLinkClick = () => {
    if (onClose) {
      onClose()
    }
  }

  return (
    <aside className="w-64 bg-white border-r border-yogreet-light-gray min-h-screen h-full overflow-y-auto">
      <div className="p-4 sm:p-6">
        <Link href="/admin" className="flex items-center gap-2 mb-6 md:mb-8" onClick={handleLinkClick}>
          <span className="font-poppins font-semibold text-yogreet-charcoal text-xl">Admin Panel</span>
        </Link>

        <nav className="space-y-2">
          <Link
            href="/admin"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 px-4 py-3 font-inter text-sm transition-colors ${
              isActive("/admin") ? "bg-yogreet-red text-white" : "text-yogreet-charcoal hover:bg-yogreet-light-gray"
            }`}
          >
            <FiHome className="w-4 h-4 shrink-0" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/admin/sellers"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 px-4 py-3 font-inter text-sm transition-colors ${
              isActive("/admin/sellers")
                ? "bg-yogreet-red text-white"
                : "text-yogreet-charcoal hover:bg-yogreet-light-gray"
            }`}
          >
            <FiUsers className="w-4 h-4 shrink-0" />
            <span>Sellers</span>
          </Link>
          <Link
            href="/admin/buyers"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 px-4 py-3 font-inter text-sm transition-colors ${
              isActive("/admin/buyers")
                ? "bg-yogreet-red text-white"
                : "text-yogreet-charcoal hover:bg-yogreet-light-gray"
            }`}
          >
            <FiShoppingBag className="w-4 h-4 shrink-0" />
            <span>Buyers</span>
          </Link>
        </nav>
      </div>
    </aside>
  )
}

