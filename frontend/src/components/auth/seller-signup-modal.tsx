"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FiX, FiEye, FiEyeOff, FiMail, FiLock, FiUser, FiShoppingBag } from "react-icons/fi"
import { useSignupSellerMutation } from "@/services/api/authApi"
import { toast } from "sonner"
import { useVerificationModal } from "@/components/auth/verification-modal-provider"
import { motion, AnimatePresence } from "framer-motion"

interface SellerSignupModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToLogin: () => void
}

export function SellerSignupModal({ isOpen, onClose, onSwitchToLogin }: SellerSignupModalProps) {
  const router = useRouter()
  const [signupSeller, { isLoading }] = useSignupSellerMutation()
  const { showVerificationModal } = useVerificationModal()
  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "", // Merged from storeName and companyName
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const signupData = {
        email: formData.email.trim(),
        password: formData.password,
        fullName: formData.fullName.trim() || undefined,
        companyName: formData.companyName.trim() || undefined, // Merged from storeName and companyName
      }

      const response = await signupSeller(signupData).unwrap()
      
      toast.success(response.message || "Seller account created successfully! Please check your email to verify your account.")
      onClose()
      try { 
        localStorage.setItem("yg_just_signed_up", "1") 
        localStorage.setItem("yg_user_role", "SELLER")
        localStorage.setItem("yg_signup_email", formData.email)
      } catch {}
      router.push("/")
      // Show verification modal after navigation
      setTimeout(() => {
        showVerificationModal()
      }, 300)
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "Failed to create seller account. Please try again."
      toast.error(errorMessage)
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
            fullName: "",
            companyName: "", // Merged from storeName and companyName
            email: "",
            password: "",
          })
      setShowPassword(false)
    }
  }, [isOpen])

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="modal-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-100 flex items-center justify-center p-4"
        >
      {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="absolute inset-0 bg-black/60 backdrop-blur-none cursor-pointer"
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
      />

      {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ 
              duration: 0.25, 
              ease: [0.4, 0, 0.2, 1],
              opacity: { duration: 0.2 }
            }}
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
              Join as Seller
            </h2>
            <p className="mt-2 font-inter text-gray-600">
              Start selling your spices globally
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-manrope font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#212121] focus:border-[#212121] disabled:bg-gray-50 disabled:text-gray-500 font-inter"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Company Name */}
            <div>
              <label htmlFor="companyName" className="block text-sm font-manrope font-medium text-gray-700 mb-1">
                Store/Company Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiShoppingBag className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#212121] focus:border-[#212121] disabled:bg-gray-50 disabled:text-gray-500 font-inter"
                  placeholder="Enter your store/company name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-manrope font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
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
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#212121] focus:border-[#212121] disabled:bg-gray-50 disabled:text-gray-500 font-inter"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-manrope font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
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
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#212121] focus:border-[#212121] disabled:bg-gray-50 disabled:text-gray-500 font-inter"
                  placeholder="Create a password"
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 mt-6 py-3 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-[#212121] hover:bg-[#212121]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#212121] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors font-manrope"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creating seller account...
                </>
              ) : (
                "Go to Document Verification"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={onSwitchToLogin}
              className="font-medium text-[#212121] hover:text-yogreet-charcoal cursor-pointer font-inter"
            >
              Already have a seller account? Sign in
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
      )}
    </AnimatePresence>
  )
}
