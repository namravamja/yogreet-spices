"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FiX, FiEye, FiEyeOff, FiMail, FiLock } from "react-icons/fi"
import { useLoginSellerMutation } from "@/services/api/authApi"
import toast from "react-hot-toast"

interface SellerLoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToSignup: () => void
  onLoginSuccess?: () => void
  redirectUrl?: string
}

export function SellerLoginModal({ isOpen, onClose, onSwitchToSignup, onLoginSuccess, redirectUrl }: SellerLoginModalProps) {
  const router = useRouter()
  const [loginSeller, { isLoading }] = useLoginSellerMutation()
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const loginData = {
        email: formData.email,
        password: formData.password,
      }

      const response = await loginSeller(loginData).unwrap()
      
      toast.success(response.message || "Login successful!")
      
      // Small delay to ensure cache invalidation completes
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Set seller login state
      localStorage.setItem('yogreet-seller-login-state', 'true')
      onClose()
      
      if (onLoginSuccess) {
        onLoginSuccess()
      }
      
      // Redirect to seller page after login (or use redirectUrl if provided)
      if (redirectUrl) {
        router.push(redirectUrl)
      } else {
        router.push("/seller")
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "Login failed. Please check your credentials."
      toast.error(errorMessage)
      
      // If error is about email verification, show additional message with link
      if (errorMessage.toLowerCase().includes("verify") || errorMessage.toLowerCase().includes("verification")) {
        setTimeout(() => {
          toast((t) => (
            <div className="flex flex-col gap-2">
              <span>{errorMessage}</span>
              <a
                href="/seller/verify-document/1"
                className="text-yogreet-sage hover:underline font-medium text-sm"
                onClick={() => toast.dismiss(t.id)}
              >
                Go to verification →
              </a>
            </div>
          ), { duration: 6000 })
        }, 500)
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        email: "",
        password: "",
      })
      setShowPassword(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-none transition-opacity cursor-pointer"
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
      />

      {/* Modal Content */}
      <div 
        className="relative bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10 p-1 rounded-full hover:bg-gray-100 cursor-pointer"
        >
          <FiX className="h-5 w-5" />
        </button>

        <div className="px-9 py-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl mt-4 font-poppins font-bold text-yogreet-charcoal">
              Welcome back, Seller
            </h2>
            <p className="mt-2 font-inter text-gray-600">
              Access your seller dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-manrope font-medium text-gray-700 mb-1"
              >
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-yogreet-sage focus:border-yogreet-sage disabled:bg-gray-50 disabled:text-gray-500 font-inter"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-manrope font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-yogreet-sage focus:border-yogreet-sage disabled:bg-gray-50 disabled:text-gray-500 font-inter"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5" />
                  ) : (
                    <FiEye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me and Forgot password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-yogreet-sage focus:ring-yogreet-sage border-gray-300 rounded cursor-pointer"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700 cursor-pointer font-inter"
                >
                  Remember me
                </label>
              </div>
              <button
                type="button"
                className="text-sm text-yogreet-sage hover:text-yogreet-charcoal font-medium cursor-pointer font-inter"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-yogreet-sage hover:bg-yogreet-sage/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yogreet-sage disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors font-manrope"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Signing in...
                </>
              ) : (
                "Sign in as Seller"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={onSwitchToSignup}
              className="font-medium text-yogreet-sage hover:text-yogreet-charcoal cursor-pointer font-inter"
            >
              New seller? Create your account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
