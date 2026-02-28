"use client"

import { useState, useEffect } from "react"
import {
  Users,
  ShoppingBag,
  Package,
  ShoppingCart,
  CheckCircle2,
  Activity,
  ArrowRight,
  Sparkles,
  Heart,
  Globe,
  Shield,
  Zap,
  User,
  BarChart3,
  FileText,
  Settings,
  TrendingUp,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useGetAdminStatsQuery } from "@/services/api/adminApi"
import { useAuth } from "@/hooks/useAuth"

const quickStart = [
  {
    step: "01",
    title: "Review Sellers",
    description: "Monitor and verify seller accounts and documents",
    href: "/admin/sellers",
    icon: Users,
  },
  {
    step: "02",
    title: "Manage Buyers",
    description: "View buyer accounts and track their activity",
    href: "/admin/buyers",
    icon: ShoppingBag,
  },
  {
    step: "03",
    title: "Handle Disputes",
    description: "Review evidence and resolve refunds or releases",
    href: "/admin/disputes",
    icon: AlertTriangle,
  },
  {
    step: "04",
    title: "View Analytics",
    description: "Monitor platform statistics and performance metrics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
]

const platformBenefits = [
  {
    icon: Globe,
    title: "Complete Control",
    description: "Full oversight and control over the entire platform ecosystem",
  },
  {
    icon: Shield,
    title: "Secure Management",
    description:
      "Enterprise-grade security for managing sensitive user and transaction data",
  },
  {
    icon: Zap,
    title: "Efficient Tools",
    description:
      "Streamlined interface designed for comprehensive platform administration",
  },
  {
    icon: Heart,
    title: "Data-Driven",
    description:
      "Make informed decisions with comprehensive analytics and insights",
  },
]

export default function AdminLanding() {
  const [greeting, setGreeting] = useState("")
  const router = useRouter()
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth("admin")
  
  const { data: stats, isLoading: isStatsLoading } = useGetAdminStatsQuery(undefined)

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Good morning")
    else if (hour < 17) setGreeting("Good afternoon")
    else setGreeting("Good evening")
  }, [])

  // Show loading state while checking authentication
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yogreet-sage mx-auto"></div>
          <p className="mt-4 text-stone-600 font-inter">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect handled by layout, but show nothing if not authenticated
  if (!isAuthenticated) {
    return null
  }

  const statCards = [
    {
      title: "Total Sellers",
      value: stats?.totalSellers || 0,
      icon: Users,
      color: "bg-yogreet-red",
      textColor: "text-yogreet-red",
    },
    {
      title: "Total Buyers",
      value: stats?.totalBuyers || 0,
      icon: ShoppingBag,
      color: "bg-yogreet-sage",
      textColor: "text-yogreet-sage",
    },
    {
      title: "Total Products",
      value: stats?.totalProducts || 0,
      icon: Package,
      color: "bg-yogreet-gold",
      textColor: "text-yogreet-gold",
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: "bg-yogreet-orange",
      textColor: "text-yogreet-orange",
    },
    {
      title: "Verified Sellers",
      value: stats?.verifiedSellers || 0,
      icon: CheckCircle2,
      color: "bg-yogreet-sage",
      textColor: "text-yogreet-sage",
    },
    {
      title: "Active Sellers",
      value: stats?.activeSellers || 0,
      icon: Activity,
      color: "bg-yogreet-red",
      textColor: "text-yogreet-red",
    },
  ]

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
                Welcome to Admin Panel
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-poppins font-light text-yogreet-charcoal mb-6 leading-tight">
              {greeting},<br />
              <span className="font-medium text-yogreet-sage">
                Administrator
              </span>
            </h1>

            <p className="text-xl text-stone-600 mb-8 max-w-2xl mx-auto leading-relaxed font-inter">
              Manage your platform with comprehensive tools. Monitor sellers,
              buyers, products, and orders all from one centralized dashboard.
            </p>

            {/* Stats Overview */}
            {!isStatsLoading && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto mt-12">
                {statCards.map((stat, index) => {
                  const Icon = stat.icon
                  return (
                    <div
                      key={index}
                      className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-yogreet-warm-gray font-inter text-xs mb-1">{stat.title}</h3>
                        <p className={`text-2xl font-poppins font-bold ${stat.textColor}`}>
                          {stat.value.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {isStatsLoading && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto mt-12">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-xl border border-stone-200 p-6 animate-pulse">
                    <div className="h-12 w-12 bg-gray-200 rounded-lg mx-auto mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-12 mx-auto"></div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto mt-12">
              <Link
                href="/admin/sellers"
                className="bg-yogreet-sage text-white px-8 py-4 rounded-lg hover:bg-yogreet-sage/90 transition-all duration-300 font-manrope font-medium flex items-center justify-center group shadow-md hover:shadow-lg"
              >
                <Users className="w-5 h-5 mr-2" />
                Manage Sellers
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/admin/buyers"
                className="bg-yogreet-red text-white px-8 py-4 rounded-lg hover:bg-yogreet-red/90 transition-all duration-300 font-manrope font-medium flex items-center justify-center group shadow-md hover:shadow-lg"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Manage Buyers
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
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
              Follow these steps to effectively manage your platform and ensure
              smooth operations.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {quickStart.map((item, index) => {
                const Icon = item.icon
                return (
                  <Link
                    key={index}
                    href={item.href}
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
              Why This{" "}
              <span className="text-yogreet-sage font-medium">Admin Panel</span>
            </h2>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto font-inter">
              Comprehensive tools and features designed to help you manage your
              platform effectively and efficiently.
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
              Ready to Manage Your Platform?
            </h2>
            <p className="text-xl text-stone-300 mb-8 font-inter">
              Access all administrative tools and features to ensure smooth
              platform operations and excellent user experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/admin/sellers"
                className="bg-yogreet-sage text-white px-8 py-4 rounded-lg hover:bg-yogreet-sage/90 transition-all duration-300 font-manrope font-medium flex items-center justify-center group"
              >
                Manage Sellers
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/admin/buyers"
                className="bg-yogreet-red text-white px-8 py-4 rounded-lg hover:bg-yogreet-red/90 transition-all duration-300 font-manrope font-medium flex items-center justify-center group"
              >
                Manage Buyers
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
