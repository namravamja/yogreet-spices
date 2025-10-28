"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { FiMenu } from "react-icons/fi"
import { LoginModal, SignupModal, SellerSignupModal, SellerLoginModal } from "../auth"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [isSellerSignupModalOpen, setIsSellerSignupModalOpen] = useState(false)
  const [isSellerLoginModalOpen, setIsSellerLoginModalOpen] = useState(false)

  // Navigation menu items
  const menuItems = [
    { href: "/explore", label: "Explore Spices" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ]

  // Modal handlers
  const handleLoginClick = () => {
    console.log("Login button clicked")
    setIsLoginModalOpen(true)
    setIsSignupModalOpen(false)
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
      <nav className="sticky top-0 z-50 bg-white/60 backdrop-blur-sm">
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
                      className="text-yogreet-charcoal font-inter text-base hover:text-yogreet-purple transition-colors cursor-pointer"
                    >
                      {item.label}
                    </Link>
              ))}
            </div>
            
            {/* Separator */}
            <div className="w-px h-6 bg-gray-300"></div>
            
            {/* Auth Buttons */}
            <div className="flex items-center gap-6">
              <button 
                onClick={handleBecomeSellerClick}
                className="px-4 py-2 text-yogreet-sage font-manrope font-medium hover:text-yogreet-sage/80 transition-colors cursor-pointer"
              >
                Become a seller
              </button>
              <button 
                onClick={handleLoginClick}
                className="px-4 py-2 text-yogreet-charcoal font-manrope font-medium hover:text-yogreet-purple transition-colors cursor-pointer"
              >
                Login
              </button>
              <button 
                onClick={handleSignupClick}
                className="px-4 py-2 border border-yogreet-purple text-yogreet-purple font-manrope font-medium hover:bg-yogreet-purple hover:text-white transition-all cursor-pointer rounded-sm"
              >
                Sign Up
              </button>
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
                    className="block px-4 py-2 text-yogreet-charcoal font-inter text-sm hover:bg-yogreet-light-gray cursor-pointer"
                  >
                    {item.label}
                  </Link>
            ))}
            <div className="px-4 pt-2 space-y-2">
              <button 
                onClick={handleBecomeSellerClick}
                className="w-full px-4 py-2 text-yogreet-charcoal font-manrope font-medium hover:text-yogreet-purple transition-colors text-center cursor-pointer"
              >
                Become Seller
              </button>
              <div className="flex gap-2">
                <button 
                  onClick={handleLoginClick}
                  className="flex-1 px-4 py-2 text-yogreet-charcoal font-manrope font-medium hover:text-yogreet-purple transition-colors text-center cursor-pointer"
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
    />
    </>
  )
}
