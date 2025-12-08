"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, Suspense } from "react"
import { YOGREET_LOGO_URL } from "@/constants/static-images"
import { FiMenu, FiUser, FiLogOut, FiPackage, FiTruck, FiShoppingCart, FiBox, FiChevronDown, FiCheckCircle, FiX } from "react-icons/fi"
import { LoginModal, SignupModal, SellerSignupModal, SellerLoginModal } from "../auth"
import { useAuth } from "@/hooks/useAuth"
import { useLogoutMutation } from "@/services/api/authApi"
import { useGetCartQuery } from "@/services/api/buyerApi"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { toast } from "sonner"
import { removeCookie } from "@/utils/cookies"
import { useDoubleTapLogout } from "@/hooks/useDoubleTapLogout"

// Component to handle searchParams logic separately
function NavbarSearchParamsHandler({ 
  isAuthenticated, 
  isAuthLoading, 
  setIsLoginModalOpen,
  setIsSellerLoginModalOpen,
  router 
}: { 
  isAuthenticated: boolean
  isAuthLoading: boolean
  setIsLoginModalOpen: (open: boolean) => void
  setIsSellerLoginModalOpen: (open: boolean) => void
  router: ReturnType<typeof useRouter>
}) {
  const searchParams = useSearchParams()

  // Check for openLogin (buyer) and openSellerLogin (seller) query parameters and open corresponding modal
  useEffect(() => {
    const openLogin = searchParams.get("openLogin")
    const openSellerLogin = searchParams.get("openSellerLogin")
    if (openSellerLogin === "true" && !isAuthenticated && !isAuthLoading) {
      setIsSellerLoginModalOpen(true)
      // Clean up URL by removing the query parameter
      router.replace("/", { scroll: false })
      return
    }
    if (openLogin === "true" && !isAuthenticated && !isAuthLoading) {
      setIsLoginModalOpen(true)
      // Clean up URL by removing the query parameter
      router.replace("/", { scroll: false })
    }
  }, [searchParams, isAuthenticated, isAuthLoading, router, setIsLoginModalOpen, setIsSellerLoginModalOpen])

  return null
}

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, isLoading: isAuthLoading, user, refetch } = useAuth("buyer")
  const [logout] = useLogoutMutation()
  const { data: cartData } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  })
  
  const cartItemsCount = cartData?.length || 0
  
  const [isOpen, setIsOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [isSellerSignupModalOpen, setIsSellerSignupModalOpen] = useState(false)
  const [isSellerLoginModalOpen, setIsSellerLoginModalOpen] = useState(false)
  const [sellerRedirectUrl, setSellerRedirectUrl] = useState<string | undefined>(undefined)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [showSellerDropdown, setShowSellerDropdown] = useState(false)
  const [dropdownTimeout, setDropdownTimeout] = useState<NodeJS.Timeout | null>(null)
  const [sellerDropdownTimeout, setSellerDropdownTimeout] = useState<NodeJS.Timeout | null>(null)
  // Mock: whether buyer's document verification is pending
  const [isDocVerificationPending] = useState(true)

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Navigation menu items - full list for sidebar (mobile)
  const menuItems = [
    { href: "/", label: "HOME" },
    { href: "/explore", label: "Explore Spices" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ]
  
  // Desktop menu items - exclude HOME
  const desktopMenuItems = menuItems.filter(item => item.href !== "/")

  // Modal handlers
  const handleLoginClick = () => {
    setIsLoginModalOpen(true)
    setIsSignupModalOpen(false)
  }

  // Login success handler - refetch user data
  const handleLoginSuccess = async () => {
    setIsLoginModalOpen(false)
    setIsSignupModalOpen(false)
    // Small delay to allow cache invalidation to complete
    setTimeout(() => {
      // Refetch user data after successful login
      if (refetch && typeof refetch === 'function') {
        try {
          refetch()
        } catch (error) {
          // Query might not be started yet, ignore error
          console.debug('Refetch called before query started, will refetch on mount')
        }
      }
    }, 200)
  }

  // Logout handler
  const performLogout = async () => {
    try {
      await logout(undefined).unwrap()
      toast.success("Logged out successfully")
      // Clear any cookie state
      removeCookie('yogreet-buyer-login-state')
      removeCookie('yogreet-seller-login-state')
      setShowProfileDropdown(false)
      // Refetch will automatically update the auth state
      if (refetch && typeof refetch === 'function') {
        try {
          await refetch()
        } catch (error) {
          // Query might not be started yet, ignore error
          console.debug('Refetch called before query started')
        }
      }
      // Optionally redirect to home
      router.push("/")
    } catch (error: any) {
      // Even if logout API fails, clear cookie state
      removeCookie('yogreet-buyer-login-state')
      removeCookie('yogreet-seller-login-state')
      setShowProfileDropdown(false)
      if (refetch && typeof refetch === 'function') {
        try {
          await refetch()
        } catch (error) {
          // Query might not be started yet, ignore error
          console.debug('Refetch called before query started')
        }
      }
      router.push("/")
    }
  }

  // Double tap logout handler
  const { handleLogoutClick } = useDoubleTapLogout(performLogout)

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
    }, 150) // 150ms delay before hiding
    setDropdownTimeout(timeout)
  }

  // Seller dropdown handlers
  const handleSellerMouseEnter = () => {
    if (sellerDropdownTimeout) {
      clearTimeout(sellerDropdownTimeout)
      setSellerDropdownTimeout(null)
    }
    setShowSellerDropdown(true)
  }

  const handleSellerMouseLeave = () => {
    const timeout = setTimeout(() => {
      setShowSellerDropdown(false)
    }, 150) // 150ms delay before hiding
    setSellerDropdownTimeout(timeout)
  }

  const handleSignupClick = () => {
    console.log("Signup button clicked")
    setIsSignupModalOpen(true)
    setIsLoginModalOpen(false)
  }

  const handleSwitchToSignup = () => {
    setIsLoginModalOpen(false)
    setIsSignupModalOpen(true)
  }

  const handleSwitchToLogin = () => {
    setIsSignupModalOpen(false)
    setIsLoginModalOpen(true)
  }

  const handleCloseModals = () => {
    setIsLoginModalOpen(false)
    setIsSignupModalOpen(false)
    setIsSellerSignupModalOpen(false)
    setIsSellerLoginModalOpen(false)
    setSellerRedirectUrl(undefined)
  }

  const handleBecomeSellerClick = () => {
    console.log("Become Seller button clicked")
    setIsSellerSignupModalOpen(true)
    setIsLoginModalOpen(false)
    setIsSignupModalOpen(false)
    setIsSellerLoginModalOpen(false)
  }

  const handleSwitchToSellerLogin = () => {
    setIsSellerSignupModalOpen(false)
    setIsSellerLoginModalOpen(true)
  }

  const handleSwitchToSellerSignup = () => {
    setIsSellerLoginModalOpen(false)
    setIsSellerSignupModalOpen(true)
  }

  return (
    <>
      <Suspense fallback={null}>
        <NavbarSearchParamsHandler
          isAuthenticated={isAuthenticated}
          isAuthLoading={isAuthLoading}
          setIsLoginModalOpen={setIsLoginModalOpen}
          setIsSellerLoginModalOpen={setIsSellerLoginModalOpen}
          router={router}
        />
      </Suspense>
      <nav className="sticky top-0 z-50 bg-white/60 backdrop-blur-sm shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
            <div className="flex justify-between items-center h-16 sm:h-20 md:h-24">
          {/* Logo */}
              <Link href="/" className="flex items-center cursor-pointer">
            <Image 
              src={YOGREET_LOGO_URL}
              alt="Yogreet Logo" 
              width={160} 
              height={60} 
              className="h-8 w-auto sm:h-10 md:h-12"
            />
          </Link>

          {/* All Navigation Options - Right Side */}
          <div className="hidden md:flex items-center gap-6">
            {/* Navigation Links */}
            <div className="flex items-center gap-6">
              {desktopMenuItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-yogreet-charcoal font-inter text-sm sm:text-base hover:text-yogreet-red transition-colors cursor-pointer ${
                      isActive ? 'font-semibold text-yogreet-red' : ''
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>
            
            {/* Separator */}
            <div className="w-px h-4 sm:h-5 md:h-6 bg-gray-300"></div>
            
            {/* Auth Buttons */}
            <div className="flex items-center gap-6">
              {isAuthenticated && !isAuthLoading ? (
                /* Cart Icon */
                <div className="flex items-center gap-4">
                  <Link href="/buyer/cart" className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-yogreet-light-gray rounded-full flex items-center justify-center hover:bg-yogreet-light-gray/80 transition-colors cursor-pointer relative">
                    <FiShoppingCart className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 text-yogreet-charcoal" />
                    {/* Cart badge */}
                    {cartItemsCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-yogreet-red text-white text-[10px] sm:text-xs rounded-full flex items-center justify-center">{cartItemsCount}</span>
                    )}
                  </Link>
                </div>
              ) : (
                /* Become a seller link when not logged in (no dropdown) */
                <Link 
                  href="/become-seller"
                  className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-yogreet-sage font-manrope font-medium text-xs sm:text-sm md:text-base hover:text-yogreet-sage/80 transition-colors cursor-pointer"
                >
                  Become a seller
                </Link>
              )}
              
              {isAuthenticated && !isAuthLoading ? (
                /* Profile Icon with Dropdown */
                <div 
                  className="relative"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <button className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-yogreet-purple rounded-full flex items-center justify-center hover:bg-yogreet-purple/80 transition-colors cursor-pointer relative">
                    {user?.image ? (
                      <Image
                        src={user.image}
                        alt={user.name || "User"}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <FiUser className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
                    )}
                    {isDocVerificationPending && (
                      <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-yogreet-purple text-white text-[10px] sm:text-xs rounded-full flex items-center justify-center z-10">
                        1
                      </span>
                    )}
                  </button>
                  
                  {/* Profile Dropdown Menu */}
                  {showProfileDropdown && (
                    <div 
                      className="absolute right-0 top-12 sm:top-14 w-52 sm:w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="py-2">
                        {/* User Info Section */}
                        {user && (
                          <div className="px-4 py-2 border-b border-gray-200">
                            <p className="text-sm font-medium text-yogreet-charcoal truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                        )}
                        <Link 
                          href="/buyer/profile" 
                          className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 text-yogreet-charcoal hover:bg-yogreet-light-gray transition-colors cursor-pointer text-sm sm:text-base"
                        >
                          <FiUser className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          Profile
                        </Link>
                        <Link 
                          href="/buyer/orders" 
                          className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 text-yogreet-charcoal hover:bg-yogreet-light-gray transition-colors cursor-pointer text-sm sm:text-base"
                        >
                          <FiPackage className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          Orders
                        </Link>
                        <Link 
                          href="/buyer/verify-document" 
                          className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 text-yogreet-charcoal hover:bg-yogreet-light-gray transition-colors cursor-pointer text-sm sm:text-base"
                        >
                          <FiCheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span>Verify Document</span>
                          {isDocVerificationPending && (
                            <span className="ml-auto w-4 h-4 sm:w-5 sm:h-5 bg-yogreet-purple text-white text-[10px] sm:text-[10px] leading-none rounded-full flex items-center justify-center">
                              1
                            </span>
                          )}
                        </Link>
                        <Link 
                          href="/buyer/track-order" 
                          className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 text-yogreet-charcoal hover:bg-yogreet-light-gray transition-colors cursor-pointer text-sm sm:text-base"
                        >
                          <FiTruck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          Track Order
                        </Link>
                        <hr className="my-1.5 sm:my-2 border-gray-200" />
                        <button 
                          onClick={handleLogoutClick}
                          className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 text-yogreet-charcoal hover:bg-yogreet-light-gray transition-colors cursor-pointer w-full text-left text-sm sm:text-base"
                        >
                          <FiLogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Login/Signup Buttons */
                <>
                  <button 
                    onClick={handleLoginClick}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 text-yogreet-charcoal font-manrope font-medium text-xs sm:text-sm md:text-base hover:text-yogreet-red transition-colors cursor-pointer"
                  >
                    Login
                  </button>
                  <button 
                    onClick={handleSignupClick}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 border border-yogreet-red text-yogreet-red font-manrope font-medium text-xs sm:text-sm md:text-base hover:bg-yogreet-red hover:text-white transition-all cursor-pointer rounded-sm"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button and Profile */}
          <div className="md:hidden flex items-center gap-3">
            {isAuthenticated && !isAuthLoading ? (
              <>
                {/* Mobile Cart Icon */}
                <Link href="/buyer/cart" className="relative p-1.5 sm:p-2 cursor-pointer">
                  <FiShoppingCart className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-yogreet-charcoal" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-yogreet-red text-white text-[10px] sm:text-xs rounded-full flex items-center justify-center">
                      {cartItemsCount}
                    </span>
                  )}
                </Link>
                {/* Mobile Profile Icon with Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="p-0.5 sm:p-1 cursor-pointer"
                    aria-label="Profile menu"
                  >
                    {user?.image ? (
                      <Image
                        src={user.image}
                        alt={user.name || "User"}
                        width={36}
                        height={36}
                        className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 object-cover rounded-full border-2 border-yogreet-purple"
                      />
                    ) : (
                      <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-yogreet-purple rounded-full flex items-center justify-center">
                        <FiUser className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
                      </div>
                    )}
                    {isDocVerificationPending && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-yogreet-purple text-white text-[10px] sm:text-xs rounded-full flex items-center justify-center border-2 border-white">
                        1
                      </span>
                    )}
                  </button>

                  {/* Mobile Profile Dropdown */}
                  {showProfileDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-40 md:hidden"
                        onClick={() => setShowProfileDropdown(false)}
                        aria-hidden="true"
                      />
                      <div className="absolute right-0 top-11 sm:top-12 md:top-14 w-52 sm:w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                        <div className="py-2">
                          {/* User Info Section */}
                          {user && (
                            <div className="px-4 py-2 border-b border-gray-200">
                              <p className="text-sm font-medium text-yogreet-charcoal truncate">{user.name}</p>
                              <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>
                          )}
                          <Link
                            href="/buyer/profile"
                            onClick={() => setShowProfileDropdown(false)}
                            className="flex items-center gap-3 px-4 py-2 text-yogreet-charcoal hover:bg-yogreet-light-gray transition-colors cursor-pointer"
                          >
                            <FiUser className="w-4 h-4" />
                            Profile
                          </Link>
                          <Link
                            href="/buyer/orders"
                            onClick={() => setShowProfileDropdown(false)}
                            className="flex items-center gap-3 px-4 py-2 text-yogreet-charcoal hover:bg-yogreet-light-gray transition-colors cursor-pointer"
                          >
                            <FiPackage className="w-4 h-4" />
                            Orders
                          </Link>
                          <Link
                            href="/buyer/verify-document"
                            onClick={() => setShowProfileDropdown(false)}
                            className="flex items-center gap-3 px-4 py-2 text-yogreet-charcoal hover:bg-yogreet-light-gray transition-colors cursor-pointer"
                          >
                            <FiCheckCircle className="w-4 h-4" />
                            <span>Verify Document</span>
                            {isDocVerificationPending && (
                              <span className="ml-auto w-5 h-5 bg-yogreet-purple text-white text-[10px] leading-none rounded-full flex items-center justify-center">
                                1
                              </span>
                            )}
                          </Link>
                          <Link
                            href="/buyer/track-order"
                            onClick={() => setShowProfileDropdown(false)}
                            className="flex items-center gap-3 px-4 py-2 text-yogreet-charcoal hover:bg-yogreet-light-gray transition-colors cursor-pointer"
                          >
                            <FiTruck className="w-4 h-4" />
                            Track Order
                          </Link>
                          <hr className="my-2 border-gray-200" />
                          <button
                            onClick={() => {
                              setShowProfileDropdown(false)
                              handleLogoutClick()
                            }}
                            className="flex items-center gap-3 px-4 py-2 text-yogreet-charcoal hover:bg-yogreet-light-gray transition-colors cursor-pointer w-full text-left"
                          >
                            <FiLogOut className="w-4 h-4" />
                            Logout
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                {/* Mobile Menu Button */}
                <button
                  className="p-2 cursor-pointer"
                  onClick={() => setIsOpen(!isOpen)}
                  aria-label="Toggle menu"
                >
                  <FiMenu className="w-6 h-6 text-yogreet-charcoal" />
                </button>
              </>
            ) : (
              <>
                {/* Mobile Login/Signup Buttons */}
                <button
                  onClick={handleLoginClick}
                  className="px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm text-yogreet-charcoal font-manrope font-medium hover:text-yogreet-red transition-colors cursor-pointer"
                >
                  Login
                </button>
                <button
                  onClick={handleSignupClick}
                  className="px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm border border-yogreet-red text-yogreet-red font-manrope font-medium hover:bg-yogreet-red hover:text-white transition-all cursor-pointer rounded-sm"
                >
                  Sign Up
                </button>
                {/* Mobile Menu Button */}
                <button
                  className="p-1.5 sm:p-2 cursor-pointer"
                  onClick={() => setIsOpen(!isOpen)}
                  aria-label="Toggle menu"
                >
                  <FiMenu className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-yogreet-charcoal" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

    </nav>

    {/* Mobile Sidebar Backdrop */}
    {isOpen && (
      <div 
        className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />
    )}

    {/* Mobile Sidebar */}
    <div
      className={`fixed top-0 right-0 h-full w-64 sm:w-72 bg-white shadow-2xl z-50 md:hidden transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-end p-4 sm:p-5">
        <button
          onClick={() => setIsOpen(false)}
          className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close menu"
        >
          <FiX className="w-4 h-4 sm:w-5 sm:h-5 text-yogreet-charcoal" />
        </button>
      </div>

      {/* Sidebar Content */}
      <div className="overflow-y-auto h-[calc(100vh-80px)] flex flex-col">
        {/* Navigation Links */}
        <div className="flex-1 py-6 sm:py-8">
          {menuItems.map((item) => {
            const isActive = item.href === '/' 
              ? pathname === '/' 
              : pathname === item.href || pathname?.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`relative flex items-center px-6 sm:px-8 py-4 sm:py-5 font-poppins text-base sm:text-lg transition-colors cursor-pointer ${
                  isActive
                    ? 'text-yogreet-purple font-semibold'
                    : 'text-yogreet-charcoal font-normal hover:text-yogreet-purple/70'
                }`}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-yogreet-purple rounded-r-full" />
                )}
                <span className="uppercase tracking-wide">{item.label}</span>
              </Link>
            )
          })}
        </div>

        {/* CTA Button at Bottom */}
        <div className="px-6 sm:px-8 pb-8 pt-4 border-t border-gray-100">
          <Link
            href="/contact"
            onClick={() => setIsOpen(false)}
            className="block w-full px-6 py-4 bg-yogreet-charcoal hover:bg-yogreet-charcoal/90 text-white font-manrope font-medium text-base sm:text-lg text-center rounded-full transition-colors cursor-pointer"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
    
    {/* Modals - Outside nav for proper z-index */}
    <LoginModal 
      isOpen={isLoginModalOpen} 
      onClose={handleCloseModals}
      onSwitchToSignup={handleSwitchToSignup}
      onLoginSuccess={handleLoginSuccess}
    />
    <SignupModal 
      isOpen={isSignupModalOpen} 
      onClose={handleCloseModals}
      onSwitchToLogin={handleSwitchToLogin}
    />
    <SellerSignupModal 
      isOpen={isSellerSignupModalOpen} 
      onClose={handleCloseModals}
      onSwitchToLogin={handleSwitchToSellerLogin}
    />
    <SellerLoginModal 
      isOpen={isSellerLoginModalOpen} 
      onClose={handleCloseModals}
      onSwitchToSignup={handleSwitchToSellerSignup}
      redirectUrl={sellerRedirectUrl}
    />
    </>
  )
}
