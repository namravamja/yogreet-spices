"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FiX, FiEye, FiEyeOff, FiMail, FiLock, FiUser } from "react-icons/fi"
import { useSignupBuyerMutation } from "@/services/api/authApi"
import toast from "react-hot-toast"
import { useVerificationModal } from "@/components/auth/verification-modal-provider"

interface SignupModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToLogin: () => void
}

export function SignupModal({ isOpen, onClose, onSwitchToLogin }: SignupModalProps) {
  const router = useRouter()
  const [signupBuyer, { isLoading }] = useSignupBuyerMutation()
  const { showVerificationModal } = useVerificationModal()
  
  const [formData, setFormData] = useState({
    buyerName: "",
    companyName: "",
    companyEmail: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)

  // Field configs rendered from an array
  const fieldConfigs = [
    {
      name: "buyerName" as const,
      label: "Buyer Name",
      type: "text" as const,
      placeholder: "Enter buyer name",
      Icon: FiUser,
    },
    {
      name: "companyName" as const,
      label: "Company Name",
      type: "text" as const,
      placeholder: "Enter your company name",
      Icon: FiUser,
    },
    {
      name: "companyEmail" as const,
      label: "Company Email Address",
      type: "email" as const,
      placeholder: "Enter company email",
      Icon: FiMail,
    },
    {
      name: "password" as const,
      label: "Password",
      type: "password" as const,
      placeholder: "Create a password",
      Icon: FiLock,
    },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Split buyerName into firstName and lastName (if space exists)
      const nameParts = formData.buyerName.trim().split(" ")
      const firstName = nameParts[0] || ""
      const lastName = nameParts.slice(1).join(" ") || ""

      const signupData = {
        email: formData.companyEmail,
        password: formData.password,
        firstName: firstName,
        lastName: lastName || undefined,
      }

      const response = await signupBuyer(signupData).unwrap()
      
      toast.success(response.message || "Account created successfully! Please check your email to verify your account.")
      onClose()
      try { 
        localStorage.setItem("yg_just_signed_up", "1") 
        localStorage.setItem("yg_user_role", "BUYER")
        localStorage.setItem("yg_signup_email", formData.companyEmail)
      } catch {}
      router.push("/")
      // Show verification modal after navigation
      setTimeout(() => {
        showVerificationModal()
      }, 300)
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "Failed to create account. Please try again."
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
            buyerName: "",
            companyName: "",
            companyEmail: "",
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
              Join Yogreet
            </h2>
            <p className="mt-2 font-inter text-gray-600">
              Create your buyer account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {fieldConfigs.map(({ name, label, type, placeholder, Icon }) => (
              <div key={name}>
                <label htmlFor={name} className="block text-sm font-manrope font-medium text-gray-700 mb-1">
                  {label}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id={name}
                    name={name}
                    type={name === "password" ? (showPassword ? "text" : "password") : type}
                    required
                    value={(formData as any)[name]}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={`block w-full pl-10 ${name === "password" ? "pr-10" : "pr-3"} py-3 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-yogreet-purple focus:border-yogreet-purple disabled:bg-gray-50 disabled:text-gray-500 font-inter`}
                    placeholder={placeholder}
                  />
                  {name === "password" && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                    </button>
                  )}
                </div>
              </div>
            ))}


            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-yogreet-purple hover:bg-yogreet-purple/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yogreet-purple disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors font-manrope"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={onSwitchToLogin}
              className="font-medium text-yogreet-purple hover:text-yogreet-charcoal cursor-pointer font-inter"
            >
              Already have an account? Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
