"use client"

import { useState, useEffect } from "react"
import {
  Package,
  ArrowRight,
  Sparkles,
  Heart,
  Globe,
  Shield,
  Zap,
  ChevronRight,
  Play,
  User,
  BarChart3,
  Box,
  CheckCircle2,
  UserCircle,
  FileCheck,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSellerVerification } from "@/hooks/useSellerVerification"
import { getCookie } from "@/utils/cookies"

const features = [
  {
    title: "Product Management",
    description:
      "Easily manage your entire spice catalog with our intuitive interface",
    icon: Package,
    color: "red",
    href: "/seller/products",
    benefits: ["Bulk upload", "Inventory tracking", "Price management"],
  },
  {
    title: "Order Management",
    description:
      "Track and manage all your orders efficiently in one place",
    icon: Box,
    color: "sage",
    href: "/seller/orders",
    benefits: ["Real-time tracking", "Order history", "Customer details"],
  },
  {
    title: "Analytics & Insights",
    description: "Monitor your sales performance and make data-driven decisions",
    icon: BarChart3,
    color: "sage",
    href: "/seller/dashboard",
    benefits: ["Sales reports", "Performance metrics", "Revenue tracking"],
  },
]

const quickStart = [
  {
    step: "01",
    title: "Verify Your Documents",
    description: "Complete seller verification to start exporting",
    href: "/seller/verify-document",
    icon: CheckCircle2,
  },
  {
    step: "02",
    title: "Add Your Products",
    description: "Upload your spice products to start selling",
    href: "/seller/products",
    icon: Package,
  },
  {
    step: "03",
    title: "Manage Orders",
    description: "Track and fulfill orders from buyers worldwide",
    href: "/seller/orders",
    icon: Box,
  },
  {
    step: "04",
    title: "View Dashboard",
    description: "Monitor your business performance and growth",
    href: "/seller/dashboard",
    icon: BarChart3,
  },
]

const platformBenefits = [
  {
    icon: Globe,
    title: "Global Reach",
    description: "Connect with buyers worldwide and expand your spice export market",
  },
  {
    icon: Shield,
    title: "Secure Platform",
    description:
      "Your data and transactions are protected with enterprise-grade security",
  },
  {
    icon: Zap,
    title: "Easy to Use",
    description:
      "Intuitive interface designed specifically for spice exporters and sellers",
  },
  {
    icon: Heart,
    title: "Community Focused",
    description:
      "Join a community that values authentic spices and traditional quality",
  },
]

export default function SellerLanding() {
  const [greeting, setGreeting] = useState("")
  const [isSellerLoggedIn, setIsSellerLoggedIn] = useState(false)
  const router = useRouter()
  
  const {
    isLoading: isVerificationLoading,
    profileProgress,
    documentVerificationProgress,
    isFullyVerified,
  } = useSellerVerification()

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Good morning")
    else if (hour < 17) setGreeting("Good afternoon")
    else setGreeting("Good evening")

    // Check if seller is logged in
    const sellerLoginState = getCookie('yogreet-seller-login-state')
    if (sellerLoginState === 'true') {
      setIsSellerLoggedIn(true)
    }
  }, [])

  // Show login prompt if not authenticated
  if (!isSellerLoggedIn) {
    return (
      <div className="min-h-screen gradient-to-br from-stone-50 via-white to-stone-50">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center py-16">
            <User className="w-24 h-24 mx-auto text-stone-300 mb-6" />
            <h1 className="text-3xl font-poppins font-light text-yogreet-charcoal mb-4">
              Login Required
            </h1>
            <p className="text-stone-600 mb-8 font-inter">
              Please login to access the seller platform.
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-yogreet-sage hover:bg-yogreet-sage/90 text-white px-6 py-3 font-manrope font-medium transition-colors cursor-pointer rounded-md"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-to-br from-stone-50 via-white to-stone-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-to-r from-yogreet-sage/10 to-yogreet-red/10 opacity-50"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-yogreet-sage/20 rounded-full -translate-y-48 translate-x-48 opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-yogreet-red/20 rounded-full translate-y-32 -translate-x-32 opacity-30"></div>

        <div className="relative container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-yogreet-sage mr-3" />
              <span className="text-yogreet-sage font-manrope font-medium text-lg">
                Welcome to Yogreet, Seller
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-poppins font-light text-yogreet-charcoal mb-6 leading-tight">
              {greeting},<br />
              <span className="font-medium text-yogreet-sage">
                Spice Exporter
              </span>
            </h1>

            <p className="text-xl text-stone-600 mb-8 max-w-2xl mx-auto leading-relaxed font-inter">
              Your export journey starts here. Manage your products, track
              orders, and connect with buyers who appreciate authentic,
              high-quality spices.
            </p>

            {!isVerificationLoading && (
              <>
                {!isFullyVerified ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {/* Profile Completion Card */}
                    <div className="bg-white rounded-xl border border-stone-200 p-8 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                      <div className="flex items-start mb-6">
                        <div className="p-4 bg-blue-500/10 rounded-xl mr-4 shrink-0">
                          <UserCircle className="w-7 h-7 text-blue-600" />
                        </div>
                        <div className="text-left">
                          <h3 className="text-lg font-poppins font-medium text-yogreet-charcoal">
                            Profile Completion
                          </h3>
                          <p className="text-stone-500 text-sm font-inter">
                            Complete your seller profile
                          </p>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-inter text-stone-600">Progress</span>
                          <span className="text-sm font-manrope font-semibold text-blue-600">
                            {profileProgress}%
                          </span>
                        </div>
                        <div className="w-full bg-stone-100 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${profileProgress}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <Link
                        href="/seller/edit-profile"
                        className="mt-auto bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-manrope font-medium transition-colors flex items-center justify-center"
                      >
                        {profileProgress < 100 ? 'Complete Profile' : 'Edit Profile'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </div>

                    {/* Document Verification Card */}
                    <div className="bg-white rounded-xl border border-stone-200 p-8 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                      <div className="flex items-start mb-6">
                        <div className="p-4 bg-yogreet-sage/10 rounded-xl mr-4 shrink-0">
                          <FileCheck className="w-7 h-7 text-yogreet-sage" />
                        </div>
                        <div className="text-left">
                          <h3 className="text-lg font-poppins font-medium text-yogreet-charcoal">
                            Document Verification
                          </h3>
                          <p className="text-stone-500 text-sm font-inter">
                            Upload required documents
                          </p>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-inter text-stone-600">Progress</span>
                          <span className="text-sm font-manrope font-semibold text-yogreet-sage">
                            {documentVerificationProgress}%
                          </span>
                        </div>
                        <div className="w-full bg-stone-100 rounded-full h-2">
                          <div 
                            className="bg-yogreet-sage h-2 rounded-full transition-all duration-500"
                            style={{ width: `${documentVerificationProgress}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <Link
                        href="/seller/verify-document"
                        className="mt-auto bg-yogreet-sage hover:bg-yogreet-sage/90 text-white px-6 py-3 rounded-lg font-manrope font-medium transition-colors flex items-center justify-center"
                      >
                        {documentVerificationProgress < 100 ? 'Continue Verification' : 'View Documents'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                      href="/seller/dashboard"
                      className="bg-yogreet-sage hover:bg-yogreet-sage/90 text-white px-8 py-4 rounded-lg font-manrope font-medium transition-all duration-300 flex items-center group"
                    >
                      View Dashboard
                      <BarChart3 className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                      href="/seller/products"
                      className="bg-white hover:bg-stone-50 text-yogreet-charcoal px-8 py-4 rounded-lg font-manrope font-medium border border-stone-200 transition-all duration-300 flex items-center group"
                    >
                      Manage Products
                      <Package className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-poppins font-light text-yogreet-charcoal mb-4">
              Everything You Need to
              <span className="font-medium text-yogreet-sage"> Succeed</span>
            </h2>
            <p className="text-stone-600 max-w-2xl mx-auto font-inter">
              Powerful tools designed to help you manage your spice export
              business efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Link
                key={index}
                href={feature.href}
                className="group bg-stone-50 rounded-2xl p-8 hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-stone-200"
              >
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${
                    feature.color === "red"
                      ? "bg-yogreet-red/10"
                      : "bg-yogreet-sage/10"
                  }`}
                >
                  <feature.icon
                    className={`w-7 h-7 ${
                      feature.color === "red"
                        ? "text-yogreet-red"
                        : "text-yogreet-sage"
                    }`}
                  />
                </div>

                <h3 className="text-xl font-poppins font-medium text-yogreet-charcoal mb-3">
                  {feature.title}
                </h3>
                <p className="text-stone-600 mb-6 font-inter leading-relaxed">
                  {feature.description}
                </p>

                <ul className="space-y-2 mb-6">
                  {feature.benefits.map((benefit, i) => (
                    <li
                      key={i}
                      className="flex items-center text-sm text-stone-500 font-inter"
                    >
                      <CheckCircle2 className="w-4 h-4 text-yogreet-sage mr-2" />
                      {benefit}
                    </li>
                  ))}
                </ul>

                <div className="flex items-center text-yogreet-sage font-manrope font-medium group-hover:translate-x-2 transition-transform">
                  Explore
                  <ChevronRight className="w-5 h-5 ml-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Start Guide */}
      <section className="py-20 bg-stone-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-poppins font-light text-yogreet-charcoal mb-4">
              Quick Start
              <span className="font-medium text-yogreet-sage"> Guide</span>
            </h2>
            <p className="text-stone-600 max-w-2xl mx-auto font-inter">
              Follow these simple steps to start your export journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {quickStart.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="group bg-white rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-stone-200 hover:border-yogreet-sage/30"
              >
                <div className="flex items-center mb-4">
                  <span className="text-4xl font-poppins font-bold text-stone-200 mr-4">
                    {item.step}
                  </span>
                  <div className="w-12 h-12 rounded-lg bg-yogreet-sage/10 flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-yogreet-sage" />
                  </div>
                </div>

                <h3 className="text-lg font-poppins font-medium text-yogreet-charcoal mb-2">
                  {item.title}
                </h3>
                <p className="text-stone-500 text-sm font-inter">
                  {item.description}
                </p>

                <div className="mt-4 flex items-center text-yogreet-sage text-sm font-manrope font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Benefits */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-poppins font-light text-yogreet-charcoal mb-4">
              Why Choose
              <span className="font-medium text-yogreet-sage"> Yogreet</span>
            </h2>
            <p className="text-stone-600 max-w-2xl mx-auto font-inter">
              Join a platform built specifically for spice exporters
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {platformBenefits.map((benefit, index) => (
              <div
                key={index}
                className="text-center group"
              >
                <div className="w-16 h-16 rounded-2xl bg-yogreet-sage/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-yogreet-sage/20 transition-colors">
                  <benefit.icon className="w-8 h-8 text-yogreet-sage" />
                </div>
                <h3 className="text-lg font-poppins font-medium text-yogreet-charcoal mb-2">
                  {benefit.title}
                </h3>
                <p className="text-stone-500 text-sm font-inter leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-linear-to-br from-yogreet-sage to-yogreet-sage/90">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-poppins font-light text-white mb-6">
            Ready to Grow Your
            <span className="font-medium"> Spice Business?</span>
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-8 font-inter">
            Start managing your products and connecting with buyers today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/seller/dashboard"
              className="bg-white text-yogreet-sage hover:bg-stone-100 px-8 py-4 rounded-lg font-manrope font-medium transition-colors flex items-center"
            >
              Go to Dashboard
              <BarChart3 className="w-5 h-5 ml-2" />
            </Link>
            <Link
              href="/seller/products/add"
              className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-lg font-manrope font-medium transition-colors flex items-center"
            >
              Add Your First Product
              <Package className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

