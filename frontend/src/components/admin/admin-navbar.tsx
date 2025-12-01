"use client"

import Link from "next/link"
import { YOGREET_LOGO_URL } from "@/constants/static-images"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { FiHome, FiUsers, FiShoppingBag, FiLogOut, FiUser, FiChevronDown, FiMenu, FiX } from "react-icons/fi"
import { useAuth } from "@/hooks/useAuth"
import { useLogoutMutation } from "@/services/api/authApi"
import { toast } from "sonner"
import { removeCookie } from "@/utils/cookies"

export function AdminNavbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, user, refetch } = useAuth("admin")
  const [logout] = useLogoutMutation()
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [dropdownTimeout, setDropdownTimeout] = useState<NodeJS.Timeout | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isActive = (path: string) => pathname === path

  // Logout handler
  const handleLogout = async () => {
    try {
      await logout(undefined).unwrap()
      toast.success("Logged out successfully")
      // Clear admin login state
      removeCookie('yogreet-admin-login-state')
      setShowProfileDropdown(false)
      // Refetch will automatically update the auth state
      await refetch()
      // Redirect to login page
      router.push("/admin/login")
    } catch (error: any) {
      // Even if logout API fails, clear cookie state
      removeCookie('yogreet-admin-login-state')
      setShowProfileDropdown(false)
      await refetch()
      router.push("/admin/login")
    }
  }

  // Dropdown handlers with delay
  const handleMouseEnter = () => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout)
      setDropdownTimeout(null)
    }
    setShowProfileDropdown(true)
  }

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setShowProfileDropdown(false)
    }, 150)
    setDropdownTimeout(timeout)
  }

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: FiHome },
    { href: "/admin/sellers", label: "Sellers", icon: FiUsers },
    { href: "/admin/buyers", label: "Buyers", icon: FiShoppingBag },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white/60 backdrop-blur-sm shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex justify-between items-center h-24">
          {/* Logo */}
          <Link href="/admin" className="flex items-center cursor-pointer">
            <Image 
              src={YOGREET_LOGO_URL}
              alt="Yogreet Logo" 
              width={160} 
              height={60} 
              className="h-12 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {/* Navigation Links */}
            <div className="flex items-center gap-6">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 text-yogreet-charcoal font-inter text-base transition-colors ${
                      isActive(item.href)
                        ? "text-yogreet-red font-medium"
                        : "hover:text-yogreet-red"
                    } cursor-pointer`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
            
            {/* Separator */}
            <div className="w-px h-6 bg-gray-300"></div>
            
            {/* Admin Profile Dropdown */}
            {isAuthenticated && user && (
              <div 
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  className="w-10 h-10 bg-yogreet-purple rounded-full flex items-center justify-center hover:bg-yogreet-purple/80 transition-colors cursor-pointer"
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                >
                  <FiUser className="w-5 h-5 text-white" />
                </button>

                {/* Dropdown Menu */}
                {showProfileDropdown && (
                  <div 
                    className="absolute right-0 top-14 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="py-2">
                      {/* User Info Section */}
                      {user && (
                        <div className="px-4 py-2 border-b border-gray-200">
                          <p className="text-sm font-medium text-yogreet-charcoal truncate">{user.username || user.name || "Admin"}</p>
                          <p className="text-xs text-gray-500 truncate">Administrator</p>
                        </div>
                      )}
                      <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 text-yogreet-charcoal hover:bg-yogreet-light-gray transition-colors cursor-pointer w-full text-left"
                      >
                        <FiLogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 cursor-pointer" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <FiX className="w-6 h-6" />
            ) : (
              <FiMenu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-yogreet-charcoal font-inter text-sm hover:bg-yogreet-light-gray cursor-pointer"
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
            {isAuthenticated && user && (
              <div className="px-4 pt-2 space-y-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-4 py-2">
                    <div className="w-10 h-10 rounded-full bg-yogreet-purple flex items-center justify-center">
                      <FiUser className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-yogreet-charcoal">{user.username || user.name || "Admin"}</p>
                      <p className="text-xs text-gray-500">Administrator</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2 text-yogreet-charcoal hover:bg-yogreet-light-gray transition-colors cursor-pointer w-full text-left"
                  >
                    <FiLogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

