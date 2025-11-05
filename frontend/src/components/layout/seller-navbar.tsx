"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { FiMenu, FiUser, FiLogOut, FiPackage, FiBox, FiChevronDown, FiCheckCircle, FiGrid } from "react-icons/fi"
import { SellerSignupModal, SellerLoginModal } from "../auth"

export function SellerNavbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isSellerSignupModalOpen, setIsSellerSignupModalOpen] = useState(false)
  const [isSellerLoginModalOpen, setIsSellerLoginModalOpen] = useState(false)
  const [isSellerLoggedIn, setIsSellerLoggedIn] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [showSellerDropdown, setShowSellerDropdown] = useState(false)
  const [dropdownTimeout, setDropdownTimeout] = useState<NodeJS.Timeout | null>(null)
  const [sellerDropdownTimeout, setSellerDropdownTimeout] = useState<NodeJS.Timeout | null>(null)
  // Mock: whether seller's document verification is pending
  const [isDocVerificationPending] = useState(true)
  const [profileCompletion, setProfileCompletion] = useState(0)

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    try {
      // Mock seller data - replace with actual API call
      const sellerData = {
        fullName: "Rajesh Kumar",
        storeName: "Premium Spice Exports",
        email: "rajesh@premiumspice.com",
        mobile: "+91 98765 43210",
        businessType: "Exporter",
        businessRegistrationNumber: "SPICE123456789",
        productCategories: ["Turmeric", "Cardamom", "Black Pepper", "Cumin"],
        businessAddress: {
          street: "123 Spice Market Street",
          city: "Kochi",
          state: "Kerala",
          country: "India",
          pinCode: "682001"
        },
        bankAccountName: "Premium Spice Exports",
        bankName: "State Bank of India",
        accountNumber: "1234567890123456",
        ifscCode: "SBIN0001234",
        gstNumber: "29ABCDE1234F1Z5",
        panNumber: "ABCDE1234F",
        shippingType: "Self Ship",
        serviceAreas: ["Domestic", "International"],
        inventoryVolume: "10000+",
        returnPolicy: "30-day return policy for quality issues",
        termsAgreed: true
      };

      let completed = 0;
      const total = 23;

      if (sellerData?.fullName?.trim()) completed++;
      if (sellerData?.storeName?.trim()) completed++;
      if (sellerData?.email?.trim()) completed++;
      if (sellerData?.mobile?.trim()) completed++;
      if (sellerData?.businessType?.trim()) completed++;
      if (sellerData?.businessRegistrationNumber?.trim()) completed++;
      if (Array.isArray(sellerData?.productCategories) && sellerData.productCategories.length > 0) completed++;
      if (sellerData?.businessAddress?.street?.trim()) completed++;
      if (sellerData?.businessAddress?.city?.trim()) completed++;
      if (sellerData?.businessAddress?.state?.trim()) completed++;
      if (sellerData?.businessAddress?.country?.trim()) completed++;
      if (sellerData?.businessAddress?.pinCode?.trim()) completed++;
      if (sellerData?.bankAccountName?.trim()) completed++;
      if (sellerData?.bankName?.trim()) completed++;
      if (sellerData?.accountNumber?.trim()) completed++;
      if (sellerData?.ifscCode?.trim()) completed++;
      if (sellerData?.gstNumber?.trim()) completed++;
      if (sellerData?.panNumber?.trim()) completed++;
      if (sellerData?.shippingType?.trim()) completed++;
      if (Array.isArray(sellerData?.serviceAreas) && sellerData.serviceAreas.length > 0) completed++;
      if (sellerData?.inventoryVolume?.trim()) completed++;
      if (sellerData?.returnPolicy?.trim()) completed++;
      if (sellerData?.termsAgreed) completed++;

      return Math.round((completed / total) * 100);
    } catch (error) {
      console.error("Error calculating profile completion:", error);
      return 0;
    }
  };

  // Check localStorage on component mount
  useEffect(() => {
    const savedSellerLoginState = localStorage.getItem('yogreet-seller-login-state')
    if (savedSellerLoginState === 'true') {
      setIsSellerLoggedIn(true)
      setProfileCompletion(calculateProfileCompletion())
    }
  }, [])

  // Navigation menu items - only Explore Spices (no About/Contact)
  const menuItems = [
    { href: "/explore", label: "Explore Spices" },
  ]

  const handleCloseModals = () => {
    setIsSellerSignupModalOpen(false)
    setIsSellerLoginModalOpen(false)
  }

  const handleBecomeSellerClick = () => {
    console.log("Become Seller button clicked")
    setIsSellerSignupModalOpen(true)
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

  // Logout handler
  const handleLogout = () => {
    setIsSellerLoggedIn(false)
    localStorage.removeItem('yogreet-seller-login-state')
    setShowProfileDropdown(false)
  }

  // Seller login handler
  const handleSellerLoginSuccess = () => {
    setIsSellerLoggedIn(true)
    setIsSellerLoginModalOpen(false)
    setIsSellerSignupModalOpen(false)
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
                      className={`font-inter text-base transition-colors cursor-pointer ${
                        pathname === item.href 
                          ? "text-yogreet-sage font-medium" 
                          : "text-yogreet-charcoal hover:text-yogreet-red"
                      }`}
                    >
                      {item.label}
                    </Link>
              ))}
            </div>
            
            {/* Seller Dashboard Links - Only when logged in */}
            {isSellerLoggedIn && (
              <>
                {/* Separator */}
                <div className="w-px h-6 bg-gray-300"></div>
                
                {/* Seller Menu Items */}
                <div className="flex items-center gap-4">
                  <Link 
                    href="/seller" 
                    className={`font-inter text-base transition-colors cursor-pointer ${
                      pathname === "/seller" 
                        ? "text-yogreet-sage font-medium" 
                        : "text-yogreet-charcoal hover:text-yogreet-sage"
                    }`}
                  >
                    Home
                  </Link>
                  <Link 
                    href="/seller/dashboard" 
                    className={`font-inter text-base transition-colors cursor-pointer ${
                      pathname?.startsWith("/seller/dashboard") 
                        ? "text-yogreet-sage font-medium" 
                        : "text-yogreet-charcoal hover:text-yogreet-sage"
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/seller/products" 
                    className={`font-inter text-base transition-colors cursor-pointer ${
                      pathname?.startsWith("/seller/products") 
                        ? "text-yogreet-sage font-medium" 
                        : "text-yogreet-charcoal hover:text-yogreet-sage"
                    }`}
                  >
                    My Products
                  </Link>
                  <Link 
                    href="/seller/orders" 
                    className={`font-inter text-base transition-colors cursor-pointer ${
                      pathname?.startsWith("/seller/orders") 
                        ? "text-yogreet-sage font-medium" 
                        : "text-yogreet-charcoal hover:text-yogreet-sage"
                    }`}
                  >
                    Orders
                  </Link>
                  <Link 
                    href="/seller/samples" 
                    className={`font-inter text-base transition-colors cursor-pointer ${
                      pathname?.startsWith("/seller/samples") 
                        ? "text-yogreet-sage font-medium" 
                        : "text-yogreet-charcoal hover:text-yogreet-sage"
                    }`}
                  >
                    Sample Requests
                  </Link>
                </div>
              </>
            )}
            
            {/* Separator */}
            <div className="w-px h-6 bg-gray-300"></div>
            
            {/* Auth Buttons */}
            <div className="flex items-center gap-6">
              {!isSellerLoggedIn && (
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
                        <button className="w-full px-4 py-2 text-yogreet-charcoal hover:bg-yogreet-light-gray transition-colors cursor-pointer text-left">
                          How to become a seller ?
                        </button>
                        <button 
                          onClick={() => {
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
              
              {isSellerLoggedIn ? (
                /* Seller Profile Icon with Dropdown */
                <div 
                  className="relative"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <button className="w-10 h-10 bg-yogreet-sage rounded-full flex items-center justify-center hover:bg-yogreet-sage/80 transition-colors cursor-pointer relative">
                    <FiUser className="w-5 h-5 text-white" />
                    {isDocVerificationPending && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-yogreet-sage text-white text-[10px] leading-none rounded-full flex items-center justify-center border-2 border-white">
                        2
                      </span>
                    )}
                  </button>
                  
                  {/* Seller Profile Dropdown Menu */}
                  {showProfileDropdown && (
                    <div 
                      className="absolute right-0 top-14 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="py-2">
                        <Link 
                          href="/seller/profile" 
                          className="flex items-center gap-3 px-4 py-2 text-yogreet-charcoal hover:bg-yogreet-light-gray transition-colors cursor-pointer"
                        >
                          <FiUser className="w-4 h-4" />
                          <span className="flex-1">Profile</span>
                          {profileCompletion > 0 && (
                            <span className="text-xs font-medium text-yogreet-sage">
                              {profileCompletion}%
                            </span>
                          )}
                        </Link>
                        <Link 
                          href="/seller/verify-document" 
                          className="flex items-center gap-3 px-4 py-2 text-yogreet-charcoal hover:bg-yogreet-light-gray transition-colors cursor-pointer"
                        >
                          <FiCheckCircle className="w-4 h-4" />
                          <span>Verify Document</span>
                          {isDocVerificationPending && (
                            <span className="ml-auto w-5 h-5 bg-yogreet-sage text-white text-[10px] leading-none rounded-full flex items-center justify-center">
                              1
                            </span>
                          )}
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
                /* Login/Signup Buttons for Seller */
                <>
                  <button 
                    onClick={() => setIsSellerLoginModalOpen(true)}
                    className="px-4 py-2 text-yogreet-charcoal font-manrope font-medium hover:text-yogreet-red transition-colors cursor-pointer"
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => setIsSellerSignupModalOpen(true)}
                    className="px-4 py-2 border border-yogreet-sage text-yogreet-sage font-manrope font-medium hover:bg-yogreet-sage hover:text-white transition-all cursor-pointer rounded-sm"
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
                    className={`block px-4 py-2 font-inter text-sm transition-colors cursor-pointer ${
                      pathname === item.href
                        ? "text-yogreet-sage bg-yogreet-sage/10 font-medium" 
                        : "text-yogreet-charcoal hover:bg-yogreet-light-gray"
                    }`}
                  >
                    {item.label}
                  </Link>
            ))}
            <div className="px-4 pt-2 space-y-2">
              {isSellerLoggedIn ? (
                /* Mobile Seller Menu Items */
                <div className="space-y-2 mb-4">
                  <Link 
                    href="/seller" 
                    className={`block px-4 py-2 font-inter text-sm transition-colors cursor-pointer ${
                      pathname === "/seller"
                        ? "text-yogreet-sage bg-yogreet-sage/10 font-medium" 
                        : "text-yogreet-charcoal hover:bg-yogreet-light-gray"
                    }`}
                  >
                    Home
                  </Link>
                  <Link 
                    href="/seller/dashboard" 
                    className={`block px-4 py-2 font-inter text-sm transition-colors cursor-pointer ${
                      pathname?.startsWith("/seller/dashboard")
                        ? "text-yogreet-sage bg-yogreet-sage/10 font-medium" 
                        : "text-yogreet-charcoal hover:bg-yogreet-light-gray"
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/seller/products" 
                    className={`block px-4 py-2 font-inter text-sm transition-colors cursor-pointer ${
                      pathname?.startsWith("/seller/products")
                        ? "text-yogreet-sage bg-yogreet-sage/10 font-medium" 
                        : "text-yogreet-charcoal hover:bg-yogreet-light-gray"
                    }`}
                  >
                    My Products
                  </Link>
                  <Link 
                    href="/seller/orders" 
                    className={`block px-4 py-2 font-inter text-sm transition-colors cursor-pointer ${
                      pathname?.startsWith("/seller/orders")
                        ? "text-yogreet-sage bg-yogreet-sage/10 font-medium" 
                        : "text-yogreet-charcoal hover:bg-yogreet-light-gray"
                    }`}
                  >
                    Orders
                  </Link>
                  <Link 
                    href="/seller/samples" 
                    className={`block px-4 py-2 font-inter text-sm transition-colors cursor-pointer ${
                      pathname?.startsWith("/seller/samples")
                        ? "text-yogreet-sage bg-yogreet-sage/10 font-medium" 
                        : "text-yogreet-charcoal hover:bg-yogreet-light-gray"
                    }`}
                  >
                    Sample Requests
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
                        <button className="w-full px-4 py-2 text-yogreet-charcoal hover:bg-yogreet-light-gray transition-colors cursor-pointer text-left">
                          How to become a seller
                        </button>
                        <button 
                          onClick={() => {
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
              
              {isSellerLoggedIn ? (
                /* Mobile Seller Profile Options */
                <div className="space-y-2">
                  <Link 
                    href="/seller/profile" 
                    className="flex items-center gap-3 px-4 py-2 text-yogreet-charcoal hover:bg-yogreet-light-gray transition-colors cursor-pointer"
                  >
                    <FiUser className="w-4 h-4" />
                    <span className="flex-1">Profile</span>
                    {profileCompletion > 0 && (
                      <span className="text-xs font-medium text-yogreet-sage">
                        {profileCompletion}%
                      </span>
                    )}
                  </Link>
                  <Link 
                    href="/seller/verify-document" 
                    className="flex items-center gap-3 px-4 py-2 text-yogreet-charcoal hover:bg-yogreet-light-gray transition-colors cursor-pointer"
                  >
                    <FiCheckCircle className="w-4 h-4" />
                    Verify Document
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
                    onClick={() => setIsSellerLoginModalOpen(true)}
                    className="flex-1 px-4 py-2 text-yogreet-charcoal font-manrope font-medium hover:text-yogreet-red transition-colors text-center cursor-pointer"
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => setIsSellerSignupModalOpen(true)}
                    className="flex-1 px-4 py-2 border border-yogreet-sage text-yogreet-sage font-manrope font-medium hover:bg-yogreet-sage hover:text-white transition-all cursor-pointer rounded-sm"
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
    <SellerSignupModal 
      isOpen={isSellerSignupModalOpen} 
      onClose={handleCloseModals}
      onSwitchToLogin={handleSwitchToSellerLogin}
    />
    <SellerLoginModal 
      isOpen={isSellerLoginModalOpen} 
      onClose={handleCloseModals}
      onSwitchToSignup={handleSwitchToSellerSignup}
      onLoginSuccess={handleSellerLoginSuccess}
    />
    </>
  )
}

