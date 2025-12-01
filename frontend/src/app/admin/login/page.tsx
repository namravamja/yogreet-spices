"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FiEye, FiEyeOff, FiUser, FiLock } from "react-icons/fi"
import { useLoginAdminMutation } from "@/services/api/authApi"
import { toast } from "sonner"
import Image from "next/image"
import { YOGREET_LOGO_URL } from "@/constants/static-images"
import { setCookie } from "@/utils/cookies"

export default function AdminLoginPage() {
  const router = useRouter()
  const [loginAdmin, { isLoading }] = useLoginAdminMutation()
  
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const loginData = {
        username: formData.username,
        password: formData.password,
      }

      const response = await loginAdmin(loginData).unwrap()
      
      toast.success(response.message || "Login successful!")
      
      // Small delay to ensure cache invalidation completes
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Set admin login state in cookie
      setCookie('yogreet-admin-login-state', 'true', { expires: 30 }) // 30 days
      
      // Redirect to admin page after login
      router.push("/admin")
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "Login failed. Please check your credentials."
      toast.error(errorMessage)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-stone-50 via-white to-stone-50 px-4 py-12">
      <div className="max-w-sm w-full">
        {/* Logo and Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <Image 
              src={YOGREET_LOGO_URL}
              alt="Yogreet Logo" 
              width={150} 
              height={56} 
              className="h-12 w-auto"
            />
          </div>
          <h1 className="text-2xl font-poppins font-bold text-yogreet-charcoal mb-2">
            Admin Login
          </h1>
          <p className="text-stone-600 font-inter text-sm">
            Sign in to access the admin panel
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-stone-300 p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-manrope font-medium text-gray-700 mb-3"
              >
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-yogreet-sage focus:border-yogreet-sage disabled:bg-gray-50 disabled:text-gray-500 font-inter"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-manrope font-medium text-gray-700 mb-3"
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
                  className="block w-full pl-10 pr-10 py-4 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-yogreet-sage focus:border-yogreet-sage disabled:bg-gray-50 disabled:text-gray-500 font-inter"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
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
              className="w-full bg-yogreet-sage hover:bg-yogreet-sage/90 text-white px-6 py-4 rounded-md font-manrope font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer mt-2"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center text-xs text-stone-600 font-inter">
          <p>© {new Date().getFullYear()} Yogreet. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

