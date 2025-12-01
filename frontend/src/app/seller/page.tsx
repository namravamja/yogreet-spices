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
    href: "/seller/analytics",
    benefits: ["Sales reports", "Performance metrics", "Revenue tracking"],
  },
]

const quickStart = [
  {
    step: "01",
    title: "Verify Your Documents",
    description: "Complete seller verification to start exporting",
    href: "/seller/verify-document", // Will be dynamically updated based on progress
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
    title: "Analytics Dashboard",
    description: "Monitor your business performance and growth",
    href: "/seller/analytics",
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
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-manrope font-semibold text-yogreet-charcoal mb-2">
                            Profile Completion
                          </h3>
                          <p className="text-sm text-stone-600 font-inter leading-relaxed">
                            {profileProgress < 100
                              ? "Complete your profile to continue"
                              : "Profile is complete"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-auto space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-inter font-medium text-stone-700">
                            Progress
                          </span>
                          <span className="text-lg font-manrope font-semibold text-blue-600">
                            {profileProgress}%
                          </span>
                        </div>
                        <div className="relative h-3 w-full overflow-hidden rounded-full bg-stone-100">
                          <div
                            className="h-full bg-blue-600 transition-all duration-500 rounded-full"
                            style={{ width: `${profileProgress}%` }}
                          />
                        </div>
                        {profileProgress < 100 && (
                          <Link
                            href={profileProgress > 40 ? "/seller/profile" : "/seller/edit-profile"}
                            className="inline-flex items-center justify-center w-full mt-5 px-4 py-2.5 bg-blue-500/10 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg font-manrope font-medium text-sm transition-all duration-300 group"
                          >
                            {profileProgress > 40 ? "View Profile" : "Complete Profile"}
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Verification Status Card */}
                    <div className="bg-white rounded-xl border border-stone-200 p-8 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                      <div className="flex items-start mb-6">
                        <div className="p-4 bg-yogreet-red/10 rounded-xl mr-4 shrink-0">
                          <FileCheck className="w-7 h-7 text-yogreet-red" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-manrope font-semibold text-yogreet-charcoal mb-2">
                            Verification Status
                          </h3>
                          <p className="text-sm text-stone-600 font-inter leading-relaxed">
                            {documentVerificationProgress < 100
                              ? "Complete verification to start selling"
                              : "Verification is complete"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-auto space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-inter font-medium text-stone-700">
                            Progress
                          </span>
                          <span className="text-lg font-manrope font-semibold text-yogreet-red">
                            {documentVerificationProgress}%
                          </span>
                        </div>
                        <div className="relative h-3 w-full overflow-hidden rounded-full bg-stone-100">
                          <div
                            className="h-full bg-yogreet-red transition-all duration-500 rounded-full"
                            style={{ width: `${documentVerificationProgress}%` }}
                          />
                        </div>
                        {documentVerificationProgress < 100 && (
                          <Link
                            href={documentVerificationProgress > 40 ? "/seller/documents" : "/seller/verify-document"}
                            className="inline-flex items-center justify-center w-full mt-5 px-4 py-2.5 bg-yogreet-red/10 text-yogreet-red hover:bg-yogreet-red hover:text-white rounded-lg font-manrope font-medium text-sm transition-all duration-300 group"
                          >
                            {documentVerificationProgress > 40 ? "View Documents" : "Complete Verification"}
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
                    <Link
                      href="/seller/products"
                      className="bg-yogreet-sage text-white px-8 py-4 rounded-lg hover:bg-yogreet-sage/90 transition-all duration-300 font-manrope font-medium flex items-center justify-center group shadow-md hover:shadow-lg"
                    >
                      <Package className="w-5 h-5 mr-2" />
                      Add Products
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                      href="/seller/orders"
                      className="bg-white text-yogreet-charcoal px-8 py-4 rounded-lg border-2 border-stone-200 hover:bg-stone-50 hover:border-yogreet-sage transition-all duration-300 font-manrope font-medium flex items-center justify-center group shadow-md hover:shadow-lg"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      View Orders
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
              Everything You Need to{" "}
              <span className="text-yogreet-sage font-medium">Succeed</span>
            </h2>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto font-inter">
              Powerful tools designed specifically for spice exporters to
              manage their business and grow their exports.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="group bg-white rounded-xl border border-stone-200 p-8 hover:shadow-lg hover:border-yogreet-sage/30 transition-all duration-300"
                >
                  <div className="flex items-start mb-6">
                    <div
                      className={`p-3 rounded-lg ${
                        feature.color === "red"
                          ? "bg-yogreet-red/10"
                          : "bg-yogreet-sage/10"
                      } mr-4`}
                    >
                      <Icon
                        className={`w-6 h-6 ${
                          feature.color === "red"
                            ? "text-yogreet-red"
                            : "text-yogreet-sage"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-manrope font-medium text-yogreet-charcoal mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-stone-600 mb-4 font-inter">
                        {feature.description}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, idx) => (
                        <li
                          key={idx}
                          className="flex items-center text-stone-600 text-sm font-inter"
                        >
                          <div className="w-1.5 h-1.5 bg-yogreet-sage rounded-full mr-3"></div>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    href={feature.href}
                    className="inline-flex items-center text-yogreet-sage hover:text-yogreet-sage/80 font-manrope font-medium group-hover:translate-x-1 transition-all duration-300"
                  >
                    Explore feature
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Quick Start Guide */}
      <section className="py-20 gradient-to-r from-stone-50 to-stone-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-poppins font-light text-yogreet-charcoal mb-4">
              Quick Start{" "}
              <span className="text-yogreet-sage font-medium">Guide</span>
            </h2>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto font-inter">
              Follow these simple steps to set up your account and start
              exporting your premium spices.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {quickStart.map((item, index) => {
                const Icon = item.icon
                // Dynamically set href for "Verify Your Documents" based on progress
                const href = item.href === "/seller/verify-document" && documentVerificationProgress > 40
                  ? "/seller/documents"
                  : item.href
                return (
                  <Link
                    key={index}
                    href={href}
                    className="group bg-white rounded-lg p-6 border border-stone-200 hover:shadow-md hover:border-yogreet-sage/30 transition-all duration-300"
                  >
                    <div className="flex items-start">
                      <div className="shrink-0 mr-4">
                        <div className="w-12 h-12 bg-yogreet-sage/10 rounded-lg flex items-center justify-center mb-2">
                          <Icon className="w-6 h-6 text-yogreet-sage" />
                        </div>
                        <div className="text-2xl font-poppins font-light text-yogreet-sage">
                          {item.step}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-manrope font-medium text-yogreet-charcoal mb-2 group-hover:text-yogreet-sage transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-stone-600 text-sm mb-3 font-inter">
                          {item.description}
                        </p>
                        <div className="flex items-center text-yogreet-sage text-sm font-manrope font-medium">
                          Start now
                          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Platform Benefits */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-poppins font-light text-yogreet-charcoal mb-4">
              Why Choose{" "}
              <span className="text-yogreet-sage font-medium">Yogreet</span>
            </h2>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto font-inter">
              Join thousands of spice exporters who trust our platform to grow their
              export business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {platformBenefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <div key={index} className="text-center group">
                  <div className="w-16 h-16 gradient-to-br from-yogreet-sage/20 to-yogreet-red/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-8 h-8 text-yogreet-sage" />
                  </div>
                  <h3 className="text-lg font-manrope font-medium text-yogreet-charcoal mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-stone-600 text-sm font-inter">
                    {benefit.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-yogreet-charcoal">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-poppins font-light text-white mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-stone-300 mb-8 font-inter">
              Join our community of premium spice exporters and start sharing your
              authentic spices with the world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={documentVerificationProgress > 40 ? "/seller/documents" : "/seller/verify-document"}
                className="bg-yogreet-sage text-white px-8 py-4 rounded-lg hover:bg-yogreet-sage/90 transition-all duration-300 font-manrope font-medium flex items-center justify-center group"
              >
                {documentVerificationProgress > 40 ? "View Documents" : "Verify Documents"}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/seller/products"
                className="bg-transparent text-white px-8 py-4 rounded-lg border-2 border-white hover:bg-white hover:text-yogreet-charcoal transition-all duration-300 font-manrope font-medium"
              >
                Explore Features
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

