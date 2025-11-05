"use client";

import { useState, useEffect } from "react";
import {
  Package,
  Users,
  FileText,
  Star,
  Settings,
  UserPlus,
  ArrowRight,
  Sparkles,
  Heart,
  Globe,
  Shield,
  Zap,
  ChevronRight,
  Play,
  User,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/app/(auth)/components/auth-modal-provider";

const features = [
  {
    title: "Product Management",
    description:
      "Easily manage your entire product catalog with our intuitive interface",
    icon: Package,
    color: "terracotta",
    href: "/Artist/Product",
    benefits: ["Bulk upload", "Inventory tracking", "Price management"],
  },
  {
    title: "Artist Profiles",
    description:
      "Showcase your artistry and connect with customers through rich profiles",
    icon: Users,
    color: "sage",
    href: "/Artist/Profile",
    benefits: ["Story telling", "Portfolio showcase", "Customer connection"],
  },
  {
    title: "Content Creation",
    description:
      "Share your journey and expertise through our journal platform",
    icon: FileText,
    color: "clay",
    href: "/Artist/Journal",
    benefits: ["Rich editor", "SEO optimized", "Social sharing"],
  },
  {
    title: "Review Management",
    description: "Monitor and respond to customer feedback to build trust",
    icon: Star,
    color: "terracotta",
    href: "/Artist/Reviews",
    benefits: ["Real-time alerts", "Response tools", "Analytics"],
  },
];

const quickStart = [
  {
    step: "01",
    title: "Set Up Your Profile",
    description: "Create your artist profile and tell your story",
    href: "/Artist/MakeProfile",
    icon: UserPlus,
  },
  {
    step: "02",
    title: "Add Your Products",
    description: "Upload your first products to start selling",
    href: "/Artist/Product/AddProduct",
    icon: Package,
  },
  {
    step: "03",
    title: "Organize Categories",
    description: "Set up product categories for better organization",
    href: "/Artist/Product",
    icon: Settings,
  },
  {
    step: "04",
    title: "Share Your Story",
    description: "Write your first journal article",
    href: "/Artist/Journal",
    icon: FileText,
  },
];

const platformBenefits = [
  {
    icon: Globe,
    title: "Global Reach",
    description: "Connect with customers worldwide and expand your market",
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
      "Intuitive interface designed specifically for artisans and creators",
  },
  {
    icon: Heart,
    title: "Community Focused",
    description:
      "Join a community that values traditional crafts and authentic artistry",
  },
];

export default function ArtistLanding() {
  const [greeting, setGreeting] = useState("");
  const { isAuthenticated, isLoading: authLoading } = useAuth("artist");
  const { openArtistLogin } = useAuthModal();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  // Show login prompt if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-50">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center py-16">
            <User className="w-24 h-24 mx-auto text-stone-300 mb-6" />
            <h1 className="text-3xl font-light text-stone-900 mb-4">
              Login Required
            </h1>
            <p className="text-stone-600 mb-8">
              Please login to access the artist platform.
            </p>
            <button
              onClick={openArtistLogin}
              className="bg-terracotta-600 hover:bg-terracotta-700 text-white px-6 py-3 font-medium transition-colors cursor-pointer"
            >
              Login to Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-50">
        <div className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terracotta-600 mx-auto mb-4"></div>
              <p className="text-stone-600">Loading artist platform...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-terracotta-50 to-sage-50 opacity-50"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-terracotta-100 rounded-full -translate-y-48 translate-x-48 opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-sage-100 rounded-full translate-y-32 -translate-x-32 opacity-30"></div>

        <div className="relative container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-terracotta-600 mr-3" />
              <span className="text-terracotta-600 font-medium text-lg">
                Welcome to Aadivaa, Artist
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-light text-stone-900 mb-6 leading-tight">
              {greeting},<br />
              <span className="font-medium text-terracotta-600">
                Creative Artist
              </span>
            </h1>

            <p className="text-xl text-stone-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Your creative journey starts here. Manage your products, share
              your story, and connect with customers who appreciate authentic
              craftsmanship.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/Artist/Profile"
                className="bg-terracotta-600 text-white px-8 py-4 rounded-lg hover:bg-terracotta-700 transition-all duration-300 font-medium flex items-center justify-center group"
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/Artist/Dashboard"
                className="bg-white text-stone-700 px-8 py-4 rounded-lg border border-stone-200 hover:bg-stone-50 transition-all duration-300 font-medium flex items-center justify-center group"
              >
                <Play className="w-5 h-5 mr-2" />
                View Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-stone-900 mb-4">
              Everything You Need to{" "}
              <span className="text-terracotta-600 font-medium">Succeed</span>
            </h2>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              Powerful tools designed specifically for artisans and creators to
              manage their business and showcase their craft.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group bg-white rounded-xl border border-stone-200 p-8 hover:shadow-lg hover:border-stone-300 transition-all duration-300"
                >
                  <div className="flex items-start mb-6">
                    <div
                      className={`p-3 rounded-lg bg-${feature.color}-100 mr-4`}
                    >
                      <Icon className={`w-6 h-6 text-${feature.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-medium text-stone-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-stone-600 mb-4">
                        {feature.description}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, idx) => (
                        <li
                          key={idx}
                          className="flex items-center text-stone-600 text-sm"
                        >
                          <div className="w-1.5 h-1.5 bg-terracotta-400 rounded-full mr-3"></div>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    href={feature.href}
                    className="inline-flex items-center text-terracotta-600 hover:text-terracotta-700 font-medium group-hover:translate-x-1 transition-all duration-300"
                  >
                    Explore feature
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Start Guide */}
      <section className="py-20 bg-gradient-to-r from-stone-50 to-stone-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-stone-900 mb-4">
              Quick Start{" "}
              <span className="text-sage-600 font-medium">Guide</span>
            </h2>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              Follow these simple steps to set up your account and start selling
              your beautiful crafts.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {quickStart.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={index}
                    href={item.href}
                    className="group bg-white rounded-lg p-6 border border-stone-200 hover:shadow-md hover:border-stone-300 transition-all duration-300"
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-4">
                        <div className="w-12 h-12 bg-terracotta-100 rounded-lg flex items-center justify-center mb-2">
                          <Icon className="w-6 h-6 text-terracotta-600" />
                        </div>
                        <div className="text-2xl font-light text-terracotta-600">
                          {item.step}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-stone-900 mb-2 group-hover:text-terracotta-600 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-stone-600 text-sm mb-3">
                          {item.description}
                        </p>
                        <div className="flex items-center text-terracotta-600 text-sm font-medium">
                          Start now
                          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Platform Benefits */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-stone-900 mb-4">
              Why Choose{" "}
              <span className="text-clay-600 font-medium">Aadivaa</span>
            </h2>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              Join thousands of artisans who trust our platform to grow their
              creative business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {platformBenefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-br from-terracotta-100 to-sage-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-8 h-8 text-terracotta-600" />
                  </div>
                  <h3 className="text-lg font-medium text-stone-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-stone-600 text-sm">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-stone-900">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-light text-white mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-stone-300 mb-8">
              Join our community of talented artisans and start sharing your
              craft with the world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/Artist/MakeProfile"
                className="bg-terracotta-600 text-white px-8 py-4 rounded-lg hover:bg-terracotta-700 transition-all duration-300 font-medium flex items-center justify-center group"
              >
                Create Your Profile
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/Artist/Product"
                className="bg-transparent text-white px-8 py-4 rounded-lg border-2 border-white hover:bg-white hover:text-stone-900 transition-all duration-300 font-medium"
              >
                Explore Features
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
