"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { FiMenu, FiUser, FiLogOut, FiPackage, FiTruck, FiShoppingCart, FiBox, FiChevronDown, FiCheckCircle } from "react-icons/fi"
import { LoginModal, SignupModal, SellerSignupModal, SellerLoginModal } from "../auth"
import { useAuth } from "@/hooks/useAuth"
import { useLogoutMutation } from "@/services/api/authApi"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

export function Navbar() {
  const router = useRouter()
  const { isAuthenticated, isLoading: isAuthLoading, user, refetch } = useAuth("buyer")
  const [logout] = useLogoutMutation()
  
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

  // Navigation menu items
  const menuItems = [
    { href: "/explore", label: "Explore Spices" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ]

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
      refetch()
    }, 200)
  }

  // Logout handler
  const handleLogout = async () => {
    try {
      await logout(undefined).unwrap()
      toast.success("Logged out successfully")
      // Clear any local state
      localStorage.removeItem('yogreet-login-state')
      localStorage.removeItem('yogreet-seller-login-state')
      setShowProfileDropdown(false)
      // Refetch will automatically update the auth state
      await refetch()
      // Optionally redirect to home
      router.push("/")
    } catch (error: any) {
      // Even if logout API fails, clear local state
      localStorage.removeItem('yogreet-login-state')
      localStorage.removeItem('yogreet-seller-login-state')
      setShowProfileDropdown(false)
      await refetch()
      router.push("/")
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
      <nav className="sticky top-0 z-50 bg-white/60 backdrop-blur-sm shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
            <div className="flex justify-between items-center h-24">
          {/* Logo */}
              <Link href="/" className="flex items-center cursor-pointer">
            <Image 
              src="/Yogreet-logo.png"
              alt="Yogreet Logo" 
              width={160} 
              height={60} 
              className="h-12 w-auto"
            />
          </Link>

          {/* All Navigation Options - Right Side */}
          <div className="hidden md:flex items-center gap-6">
            {/* Navigation Links */}
            <div className="flex items-center gap-6">
              {menuItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-yogreet-charcoal font-inter text-base hover:text-yogreet-red transition-colors cursor-pointer"
                    >
                      {item.label}
                    </Link>
              ))}
            </div>
            
            {/* Separator */}
            <div className="w-px h-6 bg-gray-300"></div>
            
            {/* Auth Buttons */}
            <div className="flex items-center gap-6">
              {isAuthenticated && !isAuthLoading ? (
                /* Cart and Samples Icons */
                <div className="flex items-center gap-4">
                  <Link href="/buyer/cart" className="w-10 h-10 bg-yogreet-light-gray rounded-full flex items-center justify-center hover:bg-yogreet-light-gray/80 transition-colors cursor-pointer relative">
                    <FiShoppingCart className="w-5 h-5 text-yogreet-charcoal" />
                    {/* Cart badge */}
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-yogreet-red text-white text-xs rounded-full flex items-center justify-center">3</span>
                  </Link>
                  <Link href="/buyer/samples" className="w-10 h-10 bg-yogreet-light-gray rounded-full flex items-center justify-center hover:bg-yogreet-light-gray/80 transition-colors cursor-pointer relative">
                    <FiBox className="w-5 h-5 text-yogreet-charcoal" />
                    {/* Samples badge */}
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-yogreet-sage text-white text-xs rounded-full flex items-center justify-center">5</span>
                  </Link>
                </div>
              ) : (
                /* Become a seller button when not logged in */
                <div 
                  className="relative"
                  onMouseEnter={handleSellerMouseEnter}
                  onMouseLeave={handleSellerMouseLeave}
                >
                  <button 
                    onClick={handleBecomeSellerClick}
                    className="flex items-center gap-2 px-4 py-2 text-yogreet-sage font-manrope font-medium hover:text-yogreet-sage/80 transition-colors cursor-pointer"
                  >
                    Become a seller
                    <FiChevronDown className="w-4 h-4" />
                  </button>
                  
                  {/* Seller Dropdown Menu */}
                  {showSellerDropdown && (
                    <div 
                      className="absolute left-0 top-12 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                      onMouseEnter={handleSellerMouseEnter}
                      onMouseLeave={handleSellerMouseLeave}
                    >
                      <div className="py-2">
                        <Link
                          href="/become-seller"
                          onClick={() => setShowSellerDropdown(false)}
                          className="block w-full px-4 py-2 text-yogreet-charcoal hover:bg-yogreet-light-gray transition-colors cursor-pointer text-left"
                        >
                          How to become a seller ?
                        </Link>
                        <button 
                          onClick={() => {
                            setSellerRedirectUrl("/seller")
                            setIsSellerLoginModalOpen(true)
                            setShowSellerDropdown(false)
                          }}
                          className="block w-full px-4 py-2 text-yogreet-charcoal hover:bg-yogreet-light-gray transition-colors cursor-pointer text-left"
                        >
                          Go to profile
                        </button>
                        <button 
                          onClick={() => {
                            setIsSellerSignupModalOpen(true)
                            setShowSellerDropdown(false)
                          }}
                          className="block w-full px-4 py-2 text-yogreet-charcoal hover:bg-yogreet-light-gray transition-colors cursor-pointer text-left"
                        >
                          Build profile
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {isAuthenticated && !isAuthLoading ? (
                /* Profile Icon with Dropdown */
                <div 
                  className="relative"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <button className="w-10 h-10 bg-yogreet-purple rounded-full flex items-center justify-center hover:bg-yogreet-purple/80 transition-colors cursor-pointer relative">
                    {user?.image ? (
                      <Image
                        src={user.image}
                        alt={user.name || "User"}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <FiUser className="w-5 h-5 text-white" />
                    )}
                    {isDocVerificationPending && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-yogreet-purple text-white text-xs rounded-full flex items-center justify-center z-10">
                        1
                      </span>
                    )}
                  </button>
                  
                  {/* Profile Dropdown Menu */}
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
                            <p className="text-sm font-medium text-yogreet-charcoal truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                        )}
                        <Link 
                          href="/buyer/profile" 
                          className="flex items-center gap-3 px-4 py-2 text-yogreet-charcoal hover:bg-yogreet-light-gray transition-colors cursor-pointer"
                        >
                          <FiUser className="w-4 h-4" />
                          Profile
                        </Link>
                        <Link 
                          href="/buyer/orders" 
                          className="flex items-center gap-3 px-4 py-2 text-yogreet-charcoal hover:bg-yogreet-light-gray transition-colors cursor-pointer"
                        >
                          <FiPackage className="w-4 h-4" />
                          Orders
                        </Link>
                        <Link 
                          href="/buyer/verify-document" 
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
                          className="flex items-center gap-3 px-4 py-2 text-yogreet-charcoal hover:bg-yogreet-light-gray transition-colors cursor-pointer"
                        >
                          <FiTruck className="w-4 h-4" />
                          Track Order
                        </Link>
                        <hr className="my-2 border-gray-200" />
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
              ) : (
                /* Login/Signup Buttons */
                <>
                  <button 
                    onClick={handleLoginClick}
                    className="px-4 py-2 text-yogreet-charcoal font-manrope font-medium hover:text-yogreet-red transition-colors cursor-pointer"
                  >
                    Login
                  </button>
                  <button 
                    onClick={handleSignupClick}
                    className="px-4 py-2 border border-yogreet-purple text-yogreet-purple font-manrope font-medium hover:bg-yogreet-purple hover:text-white transition-all cursor-pointer rounded-sm"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 cursor-pointer" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
            <FiMenu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-2 text-yogreet-charcoal font-inter text-sm hover:bg-yogreet-light-gray cursor-pointer"
                  >
                    {item.label}
                  </Link>
            ))}
            <div className="px-4 pt-2 space-y-2">
              {isAuthenticated && !isAuthLoading ? (
                /* Mobile Cart and Samples */
                <div className="flex gap-4 mb-4">
                  <Link href="/buyer/cart" className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-yogreet-light-gray rounded-lg hover:bg-yogreet-light-gray/80 transition-colors cursor-pointer relative">
                    <FiShoppingCart className="w-4 h-4 text-yogreet-charcoal" />
                    <span className="text-yogreet-charcoal font-manrope font-medium">Cart</span>
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-yogreet-red text-white text-xs rounded-full flex items-center justify-center">3</span>
                  </Link>
                  <Link href="/buyer/samples" className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-yogreet-light-gray rounded-lg hover:bg-yogreet-light-gray/80 transition-colors cursor-pointer relative">
                    <FiBox className="w-4 h-4 text-yogreet-charcoal" />
                    <span className="text-yogreet-charcoal font-manrope font-medium">Samples</span>
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-yogreet-sage text-white text-xs rounded-full flex items-center justify-center">5</span>
                  </Link>
                </div>
              ) : (
                /* Become Seller button when not logged in */
                <div 
                  className="relative"
                  onMouseEnter={handleSellerMouseEnter}
                  onMouseLeave={handleSellerMouseLeave}
                >
                  <button 
                    onClick={handleBecomeSellerClick}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-yogreet-charcoal font-manrope font-medium hover:text-yogreet-red transition-colors cursor-pointer"
                  >
                    Become Seller
                    <FiChevronDown className="w-4 h-4" />
                  </button>
                  
                  {/* Mobile Seller Dropdown Menu */}
                  {showSellerDropdown && (
                    <div 
                      className="absolute left-0 top-12 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                      onMouseEnter={handleSellerMouseEnter}
                      onMouseLeave={handleSellerMouseLeave}
                    >
                      <div className="py-2">
                        <Link
                          href="/become-seller"
                          onClick={() => setShowSellerDropdown(false)}
                          className="block w-full px-4 py-2 text-yogreet-charcoal hover:bg-yogreet-light-gray transition-colors cursor-pointer text-left"
                        >
                          How to become a seller
                        </Link>
                        <button 
                          onClick={() => {
                            setSellerRedirectUrl("/seller")
                            setIsSellerLoginModalOpen(true)
                            setShowSellerDropdown(false)
                          }}
                          className="block w-full px-4 py-2 text-yogreet-charcoal hover:bg-yogreet-light-gray transition-colors cursor-pointer text-left"
                        >
                          Go to profile
                        </button>
                        <button 
                          onClick={() => {
                            setIsSellerSignupModalOpen(true)
                            setShowSellerDropdown(false)
                          }}
                          className="block w-full px-4 py-2 text-yogreet-charcoal hover:bg-yogreet-light-gray transition-colors cursor-pointer text-left"
                        >
                          Build profile
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {isAuthenticated && !isAuthLoading ? (
                /* Mobile Profile Options */
                <div className="space-y-2">
                  <Link 
                    href="/profile" 
                    className="flex items-center gap-3 px-4 py-2 text-yogreet-charcoal hover:bg-yogreet-light-gray transition-colors cursor-pointer"
                  >
                    <FiUser className="w-4 h-4" />
                    Profile
                  </Link>
                  <Link 
                    href="/orders" 
                    className="flex items-center gap-3 px-4 py-2 text-yogreet-charcoal hover:bg-yogreet-light-gray transition-colors cursor-pointer"
                  >
                    <FiPackage className="w-4 h-4" />
                    Orders
                  </Link>
                  <Link 
                    href="/track-order" 
                    className="flex items-center gap-3 px-4 py-2 text-yogreet-charcoal hover:bg-yogreet-light-gray transition-colors cursor-pointer"
                  >
                    <FiTruck className="w-4 h-4" />
                    Track Order
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2 text-yogreet-charcoal hover:bg-yogreet-light-gray transition-colors cursor-pointer w-full text-left"
                  >
                    <FiLogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              ) : (
                /* Mobile Login/Signup Buttons */
                <div className="flex gap-2">
                  <button 
                    onClick={handleLoginClick}
                    className="flex-1 px-4 py-2 text-yogreet-charcoal font-manrope font-medium hover:text-yogreet-red transition-colors text-center cursor-pointer"
                  >
                    Login
                  </button>
                  <button 
                    onClick={handleSignupClick}
                    className="flex-1 px-4 py-2 border border-yogreet-purple text-yogreet-purple font-manrope font-medium hover:bg-yogreet-purple hover:text-white transition-all cursor-pointer rounded-sm"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

    </nav>
    
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
