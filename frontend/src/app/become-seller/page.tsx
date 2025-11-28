"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { CheckCircle, ArrowRight, FileText, Globe, Shield, Users, TrendingUp, Clock, Award, Zap, ChevronDown } from "lucide-react"
import { Navbar, Footer } from "@/components/layout"
import { SellerSignupModal, SellerLoginModal } from "@/components/auth"
import { toast } from "sonner"

function LoginModalHandler({ setIsLoginModalOpen }: { setIsLoginModalOpen: (open: boolean) => void }) {
  const searchParams = useSearchParams()

  useEffect(() => {
    const openLogin = searchParams.get("openLogin")
    const verified = searchParams.get("verified")

    if (openLogin === "true") {
      setIsLoginModalOpen(true)
      
      if (verified === "true") {
        toast.success("Email verified successfully! Please log in to continue.")
      } else if (verified === "already") {
        toast.success("Your email is already verified. Please log in to continue.")
      }
    }
  }, [searchParams, setIsLoginModalOpen])

  return null
}

export default function BecomeSellerPage() {
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  const handleSignupClick = () => {
    setIsSignupModalOpen(true)
    setIsLoginModalOpen(false)
  }

  const handleSwitchToLogin = () => {
    setIsSignupModalOpen(false)
    setIsLoginModalOpen(true)
  }

  const handleSwitchToSignup = () => {
    setIsLoginModalOpen(false)
    setIsSignupModalOpen(true)
  }

  const handleCloseModals = () => {
    setIsSignupModalOpen(false)
    setIsLoginModalOpen(false)
  }

  const benefits = [
    {
      icon: Globe,
      title: "Global Reach",
      description: "Connect with buyers from around the world and expand your business internationally.",
    },
    {
      icon: TrendingUp,
      title: "Increased Sales",
      description: "Access a growing marketplace of verified buyers actively looking for quality spices.",
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Enjoy secure transactions with escrow protection for both you and your buyers.",
    },
    {
      icon: Users,
      title: "Verified Network",
      description: "Join a trusted network of verified exporters and build long-term partnerships.",
    },
    {
      icon: Zap,
      title: "Easy Management",
      description: "Manage your products, orders, and inventory all in one convenient dashboard.",
    },
    {
      icon: Award,
      title: "Brand Recognition",
      description: "Showcase your certifications and quality standards to build buyer confidence.",
    },
  ]

  const requirements = [
    {
      title: "Business Identity Verification",
      items: [
        "PAN number",
        "GST number",
        "Owner ID document (Aadhaar/Passport)",
        "Incorporation certificate (if applicable)",
        "MSME/Udyam certificate (optional)",
        "Business address proof",
      ],
    },
    {
      title: "Export Eligibility Verification",
      items: [
        "IEC (Import Export Code) certificate",
        "APEDA registration number",
        "Spices Board registration number",
        "Trade license",
        "Bank account details and proof",
      ],
    },
    {
      title: "Food Safety Compliance",
      items: [
        "FSSAI license number and certificate",
        "Food quality certifications (ISO, HACCP, etc.)",
        "Lab testing capability (if applicable)",
      ],
    },
    {
      title: "Export Documentation & Shipment Capability",
      items: [
        "Certificate of Origin capability",
        "Phytosanitary Certificate capability",
        "Packaging compliance",
        "Fumigation certificate capability",
        "Export logistics preparedness",
      ],
    },
  ]

  const steps = [
    {
      number: 1,
      title: "Create Your Seller Account",
      description: "Sign up with your business email, full name, and company details. Verify your email address to proceed.",
      icon: Users,
      details: [
        "Provide your business information",
        "Verify your email address",
        "Set up your account password",
      ],
    },
    {
      number: 2,
      title: "Complete Document Verification",
      description: "Submit your business documents and certifications. Our team will review them to verify your eligibility as a spice exporter.",
      icon: FileText,
      details: [
        "Upload business identity verification documents",
        "Submit export eligibility verification documents",
        "Provide food safety compliance documents",
        "Confirm shipping & logistics information",
        "Verify export documentation & shipment capabilities",
      ],
    },
    {
      title: "Build Your Profile",
      description: "Complete your seller profile with business details, addresses, shipping logistics, and social media links.",
      icon: Award,
      details: [
        "Add business address information",
        "Set up shipping type and service areas",
        "Configure return policy",
        "Link your website and social media profiles",
        "Add store photos and business description",
      ],
      number: 3,
    },
    {
      number: 4,
      title: "Start Listing Products",
      description: "Once verified, you can start listing your spice products with photos, descriptions, pricing, and inventory details.",
      icon: TrendingUp,
      details: [
        "Upload product images",
        "Set prices and inventory levels",
        "Add product descriptions",
        "Configure shipping options",
      ],
    },
  ]

  const topSellers = [
    {
      name: "SpiceWorld Exports",
      country: "Kochi, India",
      image: "/professional-man-1.jpg",
      stats: { products: 24, rating: 4.9, years: 8 },
    },
    {
      name: "Golden Masala Co.",
      country: "Surat, India",
      image: "/professional-woman-1.jpg",
      stats: { products: 18, rating: 4.8, years: 6 },
    },
    {
      name: "Heritage Spices",
      country: "Guntur, India",
      image: "/professional-man-2.png",
      stats: { products: 30, rating: 5.0, years: 10 },
    },
    {
      name: "Saffron Valley",
      country: "Jammu, India",
      image: "/professional-woman-2.png",
      stats: { products: 12, rating: 4.7, years: 5 },
    },
    {
      name: "Deccan Traders",
      country: "Hyderabad, India",
      image: "/professional-man-1.jpg",
      stats: { products: 22, rating: 4.8, years: 7 },
    },
    {
      name: "Coastal Spices",
      country: "Mangalore, India",
      image: "/professional-woman-1.jpg",
      stats: { products: 16, rating: 4.6, years: 4 },
    },
    {
      name: "Himalayan Spice House",
      country: "Dehradun, India",
      image: "/professional-woman-1.jpg",
      stats: { products: 14, rating: 4.7, years: 5 },
    },
  ]

  const faqs = [
    {
      question: "How long does verification take?",
      answer:
        "Once you submit all required documents, our team typically reviews and verifies your account within 2-5 business days. The timeline may vary based on the completeness of your documentation.",
    },
    {
      question: "What happens if my documents are rejected?",
      answer:
        "If your documents don't meet our requirements, our team will provide specific feedback on what needs to be corrected. You can resubmit updated documents for review.",
    },
    {
      question: "Is there a fee to become a seller?",
      answer:
        "Creating a seller account and going through verification is free. We only charge a commission on successful sales, ensuring you only pay when you make money.",
    },
    {
      question: "Can I sell if I don't have all certifications?",
      answer:
        "Some certifications are mandatory (like IEC, FSSAI), while others are optional but recommended. Our verification process will guide you on what's required for your specific business type.",
    },
    {
      question: "How do I get paid?",
      answer:
        "Payments are securely processed through our escrow system. Funds are held until the buyer confirms receipt and satisfaction, then released to your registered bank account.",
    },
  ]
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)

  return (
    <>
      <Suspense fallback={null}>
        <LoginModalHandler setIsLoginModalOpen={setIsLoginModalOpen} />
      </Suspense>
      <main className="min-h-screen bg-white">
        <Navbar />
        {/* Hero Section with Background Video */}
        <section className="relative overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-0"
          >
            <source src="/seller-hero.mp4" type="video/mp4" />
          </video>
          {/* Overlay for readability */}
          <div className="absolute inset-0 bg-black/50 z-10"></div>
          {/* Optional left-to-right gradient emphasis */}
          <div className="absolute inset-0 bg-linear-to-r from-black/50 via-black/20 to-transparent z-10"></div>
          <div className="relative mb-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 min-h-[520px] md:min-h-[680px] z-20 flex items-center justify-center">
            <div className="max-w-3xl text-center">
              <h1 className="text-5xl md:text-7xl font-poppins font-normal text-white leading-tight mb-4">
                Your Gateway to Global Spice Export
              </h1>
              <p className="text-white/90 font-inter text-base md:text-lg mb-8 max-w-2xl mx-auto">
                Join India's premier spice export platform. Showcase your products, reach verified buyers worldwide, and grow with secure escrow payments.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleSignupClick}
                  className="px-6 py-3 bg-yogreet-sage text-white font-manrope font-semibold hover:bg-yogreet-sage/90 transition-colors cursor-pointer rounded-md"
                >
                  Create Seller Account
                </button>
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-6 py-3 border-2 border-white text-white font-manrope font-semibold hover:bg-white/10 transition-colors cursor-pointer rounded-md"
                >
                  I already have an account
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Community / Top Sellers Section */}
          <section className="mb-20">
            <div className="text-center mb-10">
              <p className="text-yogreet-sage font-manrope font-semibold tracking-wide">
                Join our consistent community
              </p>
              <h2 className="text-3xl md:text-4xl font-poppins font-semibold text-yogreet-charcoal mt-2">
                Trusted by Top Exporters
              </h2>
              <p className="text-yogreet-charcoal/80 font-inter max-w-2xl mx-auto mt-3">
                Become part of a verified network of high-performing sellers growing globally on Yogreet.
              </p>
            </div>

            <div className="group/cards grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {topSellers.map((seller, idx) => (
                <div
                  key={idx}
                  className="group relative bg-white border border-yogreet-light-gray overflow-hidden hover:shadow-lg hover:cursor-pointer transition-shadow max-w-xs mx-auto"
                >
                  <div className="relative h-80 w-72 overflow-hidden bg-yogreet-light-gray">
                    <img
                      src={seller.image}
                      alt={seller.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover/cards:opacity-100 hover:opacity-0"></div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-white text-xs md:text-sm font-manrope px-2 py-1 rounded">
                        ★ {seller.stats.rating.toFixed(1)}
                      </span>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-4 flex items-center justify-between">
                      <h3 className="text-lg md:text-3xl font-poppins font-semibold text-white/50 group-hover:text-white transition-colors">
                        {seller.name}
                      </h3>
                    </div>
                  </div>
                </div>
              ))}
              {/* 8th CTA Card - Yogreet Sage */}
              <div className="relative bg-yogreet-sage overflow-hidden transition-shadow max-w-xs mx-auto">
                <div className="relative h-80 w-72 overflow-hidden bg-yogreet-sage flex items-center justify-center">
                  <div className="text-center px-6">
                    <h3 className="text-2xl md:text-3xl font-poppins font-semibold text-white mb-3">
                      Become a Seller
                    </h3>
                    <p className="text-base md:text-lg text-white/90 font-inter mb-5">
                      Join our exporter community and grow your business.
                    </p>
                    <div className="flex items-center justify-center">
                      <button
                        onClick={handleSignupClick}
                        className="bg-white text-yogreet-sage px-4 py-2 font-manrope font-semibold hover:bg-white/90 transition-colors cursor-pointer"
                      >
                        Join
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Benefits Section */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-poppins font-semibold text-yogreet-charcoal mb-4">
                Why Sell on Yogreet?
              </h2>
              <p className="text-yogreet-charcoal font-inter text-lg max-w-2xl mx-auto">
                Join thousands of verified spice exporters connecting with buyers worldwide
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="bg-yogreet-light-gray p-6 rounded-lg hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 bg-yogreet-sage/20 rounded-lg flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-yogreet-sage" />
                  </div>
                  <h3 className="text-xl font-poppins font-semibold text-yogreet-charcoal mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-yogreet-charcoal font-inter">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Requirements Section */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-poppins font-semibold text-yogreet-charcoal mb-4">
                What You Need
              </h2>
              <p className="text-yogreet-charcoal font-inter text-lg max-w-2xl mx-auto">
                Ensure you have these documents and certifications ready before starting the verification process
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {requirements.map((requirement, index) => (
                <div
                  key={index}
                  className="bg-yogreet-light-gray p-6 rounded-lg border border-yogreet-light-gray"
                >
                  <h3 className="text-xl font-poppins font-semibold text-yogreet-charcoal mb-4">
                    {requirement.title}
                  </h3>
                  <ul className="space-y-3">
                    {requirement.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-yogreet-red mr-3 shrink-0 mt-0.5" />
                        <span className="text-yogreet-charcoal font-inter">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Process Steps Section */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-poppins font-semibold text-yogreet-charcoal mb-4">
                How It Works
              </h2>
              <p className="text-yogreet-charcoal font-inter text-lg max-w-2xl mx-auto">
                Get started in four simple steps and begin selling in no time
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-[15px] md:left-1/2 transform md:-translate-x-1/2 top-0 bottom-0 w-0.5 bg-yogreet-sage z-0"></div>

                {/* Steps */}
                <div className="space-y-12">
                  {steps.map((step, index) => {
                    const isOdd = step.number % 2 === 1;
                    
                    return (
                      <div key={index} className="relative flex flex-col md:flex-row items-start">
                        {/* Left side - Content for odd steps, Details box for even steps */}
                        <div className="flex-none md:w-1/2 md:pr-8 md:text-right order-2 md:order-1 mt-6 md:mt-0 pl-10 md:pl-0">
                          {isOdd ? (
                            <>
                              <div className="flex items-center gap-3 mb-3 md:justify-end">
                                <div className="w-10 h-10 bg-yogreet-sage/20 rounded-lg flex items-center justify-center">
                                  <step.icon className="w-5 h-5 text-yogreet-sage" />
                                </div>
                                <h3 className="text-xl font-poppins font-semibold text-yogreet-charcoal">
                                  {step.title}
                                </h3>
                              </div>
                              <p className="text-yogreet-charcoal font-inter mb-4">
                                {step.description}
                              </p>
                            </>
                          ) : (
                            <div className="bg-yogreet-light-gray p-4 rounded-lg">
                              <ul className="space-y-2">
                                {step.details.map((detail, detailIndex) => (
                                  <li key={detailIndex} className="flex items-start md:flex-row-reverse">
                                    <CheckCircle className="w-4 h-4 text-yogreet-red md:ml-2 mr-2 md:mr-0 shrink-0 mt-1" />
                                    <span className="text-sm text-yogreet-charcoal font-inter">{detail}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        
                        {/* Center - Step number */}
                        <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-yogreet-red text-white z-10 order-1 md:order-2 font-poppins font-semibold">
                          {step.number}
                        </div>
                        
                        {/* Right side - Details box for odd steps, Content for even steps */}
                        <div className="flex-none md:w-1/2 md:pl-8 order-3 mt-6 md:mt-0 pl-10">
                          {isOdd ? (
                            <div className="bg-yogreet-light-gray p-4 rounded-lg">
                              <ul className="space-y-2">
                                {step.details.map((detail, detailIndex) => (
                                  <li key={detailIndex} className="flex items-start">
                                    <CheckCircle className="w-4 h-4 text-yogreet-red mr-2 shrink-0 mt-1" />
                                    <span className="text-sm text-yogreet-charcoal font-inter">{detail}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-yogreet-sage/20 rounded-lg flex items-center justify-center">
                                  <step.icon className="w-5 h-5 text-yogreet-sage" />
                                </div>
                                <h3 className="text-xl font-poppins font-semibold text-yogreet-charcoal">
                                  {step.title}
                                </h3>
                              </div>
                              <p className="text-yogreet-charcoal font-inter mb-4">
                                {step.description}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Timeline Section */}
          <section className="mb-20 bg-yogreet-light-gray rounded-lg p-8 md:p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-poppins font-semibold text-yogreet-charcoal mb-4">
                Verification Timeline
              </h2>
              <p className="text-yogreet-charcoal font-inter text-lg max-w-2xl mx-auto">
                Our streamlined verification process gets you started quickly
              </p>
            </div>

            <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-yogreet-sage rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-poppins font-semibold text-yogreet-charcoal mb-2">
                  Account Setup
                </h3>
                <p className="text-yogreet-charcoal font-inter mb-2">5-10 minutes</p>
                <p className="text-sm text-yogreet-charcoal/70 font-inter">
                  Create your account and verify your email
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-yogreet-sage rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-poppins font-semibold text-yogreet-charcoal mb-2">
                  Document Review
                </h3>
                <p className="text-yogreet-charcoal font-inter mb-2">2-5 business days</p>
                <p className="text-sm text-yogreet-charcoal/70 font-inter">
                  Our team reviews your submitted documents
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-yogreet-sage rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-poppins font-semibold text-yogreet-charcoal mb-2">
                  Get Verified
                </h3>
                <p className="text-yogreet-charcoal font-inter mb-2">Ready to sell!</p>
                <p className="text-sm text-yogreet-charcoal/70 font-inter">
                  Start listing products and connecting with buyers
                </p>
              </div>
            </div>
          </section>
        </div>
        
          {/* CTA Section */}
          <section className="text-center mb-20 w-full bg-black/80 py-12 md:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
              <h2 className="text-3xl md:text-4xl font-poppins font-semibold mb-4">Ready to Start Selling?</h2>
              <p className="text-white/90 font-inter text-lg mb-8 max-w-2xl mx-auto">
                Join Yogreet today and connect with buyers from around the world. Get started in minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={handleSignupClick}
                  className="bg-white text-yogreet-sage px-8 py-3 rounded-md font-manrope font-semibold hover:bg-white/90 transition-colors cursor-pointer flex items-center gap-2"
                >
                  Create Seller Account
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-md font-manrope font-semibold hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Already have an account? Sign In
                </button>
              </div>
            </div>
          </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* FAQ Section */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-poppins font-semibold text-yogreet-charcoal mb-4">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx
                return (
                  <div key={idx} className="bg-yogreet-light-gray rounded-lg">
                    <div className="flex items-center justify-between px-4 py-3">
                      <h3 className="text-base md:text-lg font-poppins font-semibold text-yogreet-charcoal">
                        {faq.question}
                      </h3>
                      <button
                        aria-label={isOpen ? 'Collapse answer' : 'Expand answer'}
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="p-2 rounded-md text-yogreet-charcoal hover:bg-white/40 cursor-pointer"
                      >
                        <ChevronDown className={`w-5 h-5 ${isOpen ? "rotate-180" : ""}`} />
                      </button>
                    </div>
                    {isOpen && (
                      <div className="px-4 pb-4">
                        <p className="text-yogreet-charcoal font-inter">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        </div>

        <Footer />
      </main>

      {/* Modals */}
      <SellerSignupModal
        isOpen={isSignupModalOpen}
        onClose={handleCloseModals}
        onSwitchToLogin={handleSwitchToLogin}
      />
      <SellerLoginModal
        isOpen={isLoginModalOpen}
        onClose={handleCloseModals}
        onSwitchToSignup={handleSwitchToSignup}
      />
    </>
  )
}

