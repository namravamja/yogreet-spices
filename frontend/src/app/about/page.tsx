"use client"

import { Globe, Shield, Users, TrendingUp, Award, Heart, Target, Zap } from "lucide-react"
import { Navbar, Footer } from "@/components/layout"
import PageHero from "@/components/shared/PageHero"
import Link from "next/link"

export default function AboutPage() {
  const values = [
    {
      icon: Shield,
      title: "Trust & Verification",
      description: "We verify every exporter to ensure you're trading with legitimate, certified businesses.",
    },
    {
      icon: Users,
      title: "Transparency",
      description: "Clear pricing, honest descriptions, and open communication between buyers and sellers.",
    },
    {
      icon: Award,
      title: "Quality First",
      description: "Premium Indian spices that meet international quality standards and certifications.",
    },
    {
      icon: Heart,
      title: "Customer Focus",
      description: "Your satisfaction is our priority. We're here to support you every step of the way.",
    },
  ]

  const features = [
    {
      icon: Globe,
      title: "Global Marketplace",
      description: "Connect spice exporters from India with buyers from around the world in one secure platform.",
    },
    {
      icon: Shield,
      title: "Verified Exporters",
      description: "All sellers undergo rigorous verification to ensure they meet export eligibility and quality standards.",
    },
    {
      icon: TrendingUp,
      title: "Secure Transactions",
      description: "Our escrow payment system protects both buyers and sellers, ensuring funds are released only upon satisfaction.",
    },
    {
      icon: Zap,
      title: "Easy Trading",
      description: "Streamlined process from browsing to ordering, with sample requests and secure delivery.",
    },
  ]

  const stats = [
    { number: "100+", label: "Verified Exporters" },
    { number: "50+", label: "Countries Served" },
    { number: "1000+", label: "Happy Customers" },
    { number: "24/7", label: "Support Available" },
  ]

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      <PageHero
        title="About Yogreet"
        subtitle="Connecting Global Spice Trade"
        description="Yogreet is India's premier platform for connecting verified spice exporters with global buyers. We make international spice trading secure, transparent, and accessible."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Mission Section */}
        <section className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-poppins font-semibold text-yogreet-charcoal mb-6">
                Our Mission
              </h2>
              <p className="text-yogreet-charcoal font-inter text-lg mb-4 leading-relaxed">
                To revolutionize the global spice trade by creating a trusted, transparent, and efficient marketplace that connects Indian spice exporters directly with international buyers.
              </p>
              <p className="text-yogreet-charcoal font-inter text-lg mb-4 leading-relaxed">
                We eliminate intermediaries, reduce costs, and ensure quality through rigorous verification processes while protecting both buyers and sellers with secure payment systems.
              </p>
              <p className="text-yogreet-charcoal font-inter text-lg leading-relaxed">
                Our platform empowers small and medium spice exporters to reach global markets while giving buyers direct access to authentic, premium Indian spices.
              </p>
            </div>
            <div className="bg-yogreet-light-gray rounded-lg p-8">
              <h3 className="text-2xl font-poppins font-semibold text-yogreet-charcoal mb-6">
                Why Yogreet?
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-yogreet-sage rounded-full flex items-center justify-center mr-3 shrink-0 mt-1">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-poppins font-semibold text-yogreet-charcoal mb-1">Direct Trade</h4>
                    <p className="text-yogreet-charcoal font-inter">Buy directly from exporters, cutting out middlemen and reducing costs.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-yogreet-sage rounded-full flex items-center justify-center mr-3 shrink-0 mt-1">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-poppins font-semibold text-yogreet-charcoal mb-1">Verified Quality</h4>
                    <p className="text-yogreet-charcoal font-inter">All exporters are verified with proper licenses and certifications.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-yogreet-sage rounded-full flex items-center justify-center mr-3 shrink-0 mt-1">
                    <Award className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-poppins font-semibold text-yogreet-charcoal mb-1">Secure Payments</h4>
                    <p className="text-yogreet-charcoal font-inter">Escrow system protects your money until you're satisfied.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-yogreet-sage rounded-full flex items-center justify-center mr-3 shrink-0 mt-1">
                    <Globe className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-poppins font-semibold text-yogreet-charcoal mb-1">Global Reach</h4>
                    <p className="text-yogreet-charcoal font-inter">Connect with buyers and sellers from around the world.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="mb-20 bg-yogreet-sage rounded-lg p-12 text-white">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-poppins font-semibold mb-4">
              Yogreet in Numbers
            </h2>
            <p className="text-white/90 font-inter text-lg max-w-2xl mx-auto">
              Growing together with trusted exporters and satisfied buyers worldwide
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-poppins font-bold mb-2">
                  {stat.number}
                </div>
                <div className="text-white/90 font-inter text-sm md:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-poppins font-semibold text-yogreet-charcoal mb-4">
              Our Values
            </h2>
            <p className="text-yogreet-charcoal font-inter text-lg max-w-2xl mx-auto">
              The principles that guide everything we do at Yogreet
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-yogreet-light-gray p-6 rounded-lg text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-16 h-16 bg-yogreet-sage/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-yogreet-sage" />
                </div>
                <h3 className="text-xl font-poppins font-semibold text-yogreet-charcoal mb-3">
                  {value.title}
                </h3>
                <p className="text-yogreet-charcoal font-inter">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-poppins font-semibold text-yogreet-charcoal mb-4">
              What We Offer
            </h2>
            <p className="text-yogreet-charcoal font-inter text-lg max-w-2xl mx-auto">
              Comprehensive solutions for spice trading, from verification to delivery
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white border-2 border-yogreet-light-gray p-6 rounded-lg hover:border-yogreet-sage transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-yogreet-sage/20 rounded-lg flex items-center justify-center shrink-0">
                    <feature.icon className="w-6 h-6 text-yogreet-sage" />
                  </div>
                  <div>
                    <h3 className="text-xl font-poppins font-semibold text-yogreet-charcoal mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-yogreet-charcoal font-inter">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center mb-20">
          <div className="bg-yogreet-charcoal rounded-lg p-12 text-white">
            <h2 className="text-3xl md:text-4xl font-poppins font-semibold mb-4">
              Join the Yogreet Community
            </h2>
            <p className="text-white/90 font-inter text-lg mb-8 max-w-2xl mx-auto">
              Whether you're a spice exporter looking to reach global markets or a buyer seeking premium Indian spices, Yogreet is here for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/become-seller"
                className="bg-yogreet-sage text-white px-8 py-3 rounded-md font-manrope font-semibold hover:bg-yogreet-sage/90 transition-colors cursor-pointer"
              >
                Become a Seller
              </Link>
              <Link
                href="/explore"
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-md font-manrope font-semibold hover:bg-white/10 transition-colors cursor-pointer"
              >
                Explore Spices
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  )
}

