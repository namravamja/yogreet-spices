"use client"

import Link from "next/link"
import { CheckCircle, ArrowRight } from "lucide-react"
import { useState } from "react"
import { SignupModal } from "../auth"

export function HowItWorksSection() {
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
  const steps = [
    {
      title: "Create Your Account",
      description: "Sign up as a buyer with your basic details to access verified spice exporters and start browsing premium Indian spices.",
      requirements: [
        "Email address",
        "Full name",
        "Shipping address",
        "Phone number"
      ],
    },
    {
      title: "Browse & Compare Spices",
      description: "Explore premium Indian spices from verified exporters. Compare quality, prices, certifications, and read detailed product descriptions.",
      requirements: [
        "Spice preferences and requirements",
        "Quality standards needed",
        "Quantity requirements",
        "Budget considerations"
      ],
    },
    {
      title: "Request Free Samples",
      description: "Get complimentary samples to test aroma, texture, and purity before committing to large orders. No cost to you.",
      requirements: [
        "Sample request form",
        "Quality approval process",
        "Feedback on samples",
        "Decision on bulk order"
      ],
    },
    {
      title: "Place Your Order",
      description: "Order with confidence using our secure escrow payment system. Your funds are protected until you receive and approve your spices.",
      requirements: [
        "Payment method setup",
        "Order confirmation",
        "Shipping preferences",
        "Delivery timeline"
      ],
    },
    {
      title: "Secure Payment & Delivery",
      description: "Your payment is held securely in escrow. Funds are released only when you receive and approve your spice order.",
      requirements: [
        "Order inspection",
        "Quality verification",
        "Payment release approval",
        "Delivery confirmation"
      ],
    },
    {
      title: "Build Long-term Partnership",
      description: "Establish ongoing relationships with trusted exporters for regular spice purchases and exclusive deals.",
      requirements: [
        "Regular order scheduling",
        "Preferred supplier status",
        "Exclusive pricing benefits",
        "Priority customer support"
      ],
    },
  ]

  return (
    <>
    <section id="how-it-works" className="bg-white py-16 md:py-18">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-poppins font-semibold text-yogreet-charcoal mb-4">
            How to Buy Spices on Yogreet
          </h2>
          <p className="text-yogreet-charcoal font-inter text-base max-w-2xl mx-auto">
            Start buying premium Indian spices from verified exporters in six simple steps.
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[15px] md:left-1/2 transform md:-translate-x-1/2 top-0 bottom-0 w-0.5 bg-yogreet-sage z-0"></div>

            {/* Steps */}
            <div className="space-y-12">
              {/* Step 1 */}
              <div className="relative flex flex-col md:flex-row items-start">
                <div className="flex-none md:w-1/2 md:pr-8 md:text-right order-2 md:order-1 mt-6 md:mt-0 pl-10 md:pl-0">
                  <h3 className="text-xl font-medium text-yogreet-charcoal mb-2">
                    Create Your Buyer Account
                  </h3>
                  <p className="text-yogreet-charcoal mb-4">
                    Sign up as a buyer with your business details to access verified spice exporters and start browsing premium Indian spices.
                  </p>
                  <button
                    onClick={handleSignupClick}
                    className="inline-flex items-center cursor-pointer text-yogreet-purple hover:text-yogreet-purple/80"
                  >
                    Join Yogreet <ArrowRight className="ml-2 w-4 h-4" />
                  </button>
                </div>
                <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-yogreet-red text-white z-10 order-1 md:order-2">
                  1
                </div>
                <div className="flex-none md:w-1/2 md:pl-8 order-3 mt-6 md:mt-0 pl-10">
                  <div className="bg-yogreet-light-gray p-4 rounded-lg">
                    <h4 className="font-medium text-yogreet-charcoal mb-2">
                      Requirements:
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-yogreet-red mr-2 shrink-0 mt-0.5" />
                        <span>Email address</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-yogreet-red mr-2 shrink-0 mt-0.5" />
                        <span>Full name</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-yogreet-red mr-2 shrink-0 mt-0.5" />
                        <span>Shipping address</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-yogreet-red mr-2 shrink-0 mt-0.5" />
                        <span>Phone number</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative flex flex-col md:flex-row items-start">
                <div className="flex-none md:w-1/2 md:pr-8 md:text-right order-2 md:order-1 mt-6 md:mt-0 pl-10 md:pl-0">
                  <div className="bg-yogreet-light-gray p-4 rounded-lg">
                    <h4 className="font-medium text-yogreet-charcoal mb-2">
                      What You Can Do:
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start md:flex-row-reverse">
                        <CheckCircle className="w-5 h-5 text-yogreet-red md:ml-2 mr-2 md:mr-0 shrink-0 mt-0.5" />
                        <span>Browse verified exporters</span>
                      </li>
                      <li className="flex items-start md:flex-row-reverse">
                        <CheckCircle className="w-5 h-5 text-yogreet-red md:ml-2 mr-2 md:mr-0 shrink-0 mt-0.5" />
                        <span>Compare prices and quality</span>
                      </li>
                      <li className="flex items-start md:flex-row-reverse">
                        <CheckCircle className="w-5 h-5 text-yogreet-red md:ml-2 mr-2 md:mr-0 shrink-0 mt-0.5" />
                        <span>Read certifications</span>
                      </li>
                      <li className="flex items-start md:flex-row-reverse">
                        <CheckCircle className="w-5 h-5 text-yogreet-red md:ml-2 mr-2 md:mr-0 shrink-0 mt-0.5" />
                        <span>Filter by preferences</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-yogreet-red text-white z-10 order-1 md:order-2">
                  2
                </div>
                <div className="flex-none md:w-1/2 md:pl-8 order-3 mt-6 md:mt-0 pl-10">
                  <h3 className="text-xl font-medium text-yogreet-charcoal mb-2">
                    Browse & Compare Spices
                  </h3>
                  <p className="text-yogreet-charcoal mb-4">
                    Explore premium Indian spices from verified exporters. Compare quality, prices, certifications, and read detailed product descriptions.
                  </p>
                  <p className="text-yogreet-charcoal">
                    Use our advanced filters to find exactly what you need for your business.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative flex flex-col md:flex-row items-start">
                <div className="flex-none md:w-1/2 md:pr-8 md:text-right order-2 md:order-1 mt-6 md:mt-0 pl-10 md:pl-0">
                  <h3 className="text-xl font-medium text-yogreet-charcoal mb-2">
                    Request Free Samples
                  </h3>
                  <p className="text-yogreet-charcoal mb-4">
                    Get complimentary samples to test aroma, texture, and purity before committing to large orders. No cost to you.
                  </p>
                  <p className="text-yogreet-charcoal">
                    This ensures you get exactly the quality you expect before placing bulk orders.
                  </p>
                </div>
                <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-yogreet-red text-white z-10 order-1 md:order-2">
                  3
                </div>
                <div className="flex-none md:w-1/2 order-3 mt-6 md:mt-0 pl-10 md:pl-8">
                  <div className="bg-yogreet-light-gray p-4 rounded-lg">
                    <h4 className="font-medium text-yogreet-charcoal mb-2">
                      Sample Process:
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-yogreet-red mr-2 shrink-0 mt-0.5" />
                        <span>Sample request form</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-yogreet-red mr-2 shrink-0 mt-0.5" />
                        <span>Quality approval process</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-yogreet-red mr-2 shrink-0 mt-0.5" />
                        <span>Feedback on samples</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-yogreet-red mr-2 shrink-0 mt-0.5" />
                        <span>Decision on bulk order</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative flex flex-col md:flex-row items-start">
                <div className="flex-none md:w-1/2 md:pr-8 md:text-right order-2 md:order-1 mt-6 md:mt-0 pl-10 md:pl-0">
                  <div className="bg-yogreet-light-gray p-4 rounded-lg">
                    <h4 className="font-medium text-yogreet-charcoal mb-2">
                      Order Requirements:
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start md:flex-row-reverse">
                        <CheckCircle className="w-5 h-5 text-yogreet-red md:ml-2 mr-2 md:mr-0 shrink-0 mt-0.5" />
                        <span>Payment method setup</span>
                      </li>
                      <li className="flex items-start md:flex-row-reverse">
                        <CheckCircle className="w-5 h-5 text-yogreet-red md:ml-2 mr-2 md:mr-0 shrink-0 mt-0.5" />
                        <span>Order confirmation</span>
                      </li>
                      <li className="flex items-start md:flex-row-reverse">
                        <CheckCircle className="w-5 h-5 text-yogreet-red md:ml-2 mr-2 md:mr-0 shrink-0 mt-0.5" />
                        <span>Shipping preferences</span>
                      </li>
                      <li className="flex items-start md:flex-row-reverse">
                        <CheckCircle className="w-5 h-5 text-yogreet-red md:ml-2 mr-2 md:mr-0 shrink-0 mt-0.5" />
                        <span>Delivery timeline</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-yogreet-red text-white z-10 order-1 md:order-2">
                  4
                </div>
                <div className="flex-none md:w-1/2 order-3 mt-6 md:mt-0 pl-10 md:pl-8">
                  <h3 className="text-xl font-medium text-yogreet-charcoal mb-2">
                    Place Your Order
                  </h3>
                  <p className="text-yogreet-charcoal mb-4">
                    Order with confidence using our secure escrow payment system. Your funds are protected until you receive and approve your spices.
                  </p>
                  <p className="text-yogreet-charcoal">
                    Choose from multiple payment options and shipping methods.
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="relative flex flex-col md:flex-row items-start">
                <div className="flex-none md:w-1/2 md:pr-8 md:text-right order-2 md:order-1 mt-6 md:mt-0 pl-10 md:pl-0">
                  <h3 className="text-xl font-medium text-yogreet-charcoal mb-2">
                    Secure Payment & Delivery
                  </h3>
                  <p className="text-yogreet-charcoal mb-4">
                    Your payment is held securely in escrow. Funds are released only when you receive and approve your spice order.
                  </p>
                  <p className="text-yogreet-charcoal">
                    Track your order in real-time and receive notifications at each step.
                  </p>
                </div>
                <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-yogreet-red text-white z-10 order-1 md:order-2">
                  5
                </div>
                <div className="flex-none md:w-1/2 order-3 mt-6 md:mt-0 pl-10 md:pl-8">
                  <div className="bg-yogreet-light-gray p-4 rounded-lg">
                    <h4 className="font-medium text-yogreet-charcoal mb-2">
                      Delivery Process:
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-yogreet-red mr-2 shrink-0 mt-0.5" />
                        <span>Order inspection</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-yogreet-red mr-2 shrink-0 mt-0.5" />
                        <span>Quality verification</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-yogreet-red mr-2 shrink-0 mt-0.5" />
                        <span>Payment release approval</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-yogreet-red mr-2 shrink-0 mt-0.5" />
                        <span>Delivery confirmation</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 6 */}
              <div className="relative flex flex-col md:flex-row items-start">
                <div className="flex-none md:w-1/2 md:pr-8 md:text-right order-2 md:order-1 mt-6 md:mt-0 pl-10 md:pl-0">
                  <div className="bg-yogreet-light-gray p-4 rounded-lg">
                    <h4 className="font-medium text-yogreet-charcoal mb-2">
                      Partnership Benefits:
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start md:flex-row-reverse">
                        <CheckCircle className="w-5 h-5 text-yogreet-red md:ml-2 mr-2 md:mr-0 shrink-0 mt-0.5" />
                        <span>Regular order scheduling</span>
                      </li>
                      <li className="flex items-start md:flex-row-reverse">
                        <CheckCircle className="w-5 h-5 text-yogreet-red md:ml-2 mr-2 md:mr-0 shrink-0 mt-0.5" />
                        <span>Preferred supplier status</span>
                      </li>
                      <li className="flex items-start md:flex-row-reverse">
                        <CheckCircle className="w-5 h-5 text-yogreet-red md:ml-2 mr-2 md:mr-0 shrink-0 mt-0.5" />
                        <span>Exclusive pricing benefits</span>
                      </li>
                      <li className="flex items-start md:flex-row-reverse">
                        <CheckCircle className="w-5 h-5 text-yogreet-red md:ml-2 mr-2 md:mr-0 shrink-0 mt-0.5" />
                        <span>Priority customer support</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-yogreet-red text-white z-10 order-1 md:order-2">
                  6
                </div>
                <div className="flex-none md:w-1/2 order-3 mt-6 md:mt-0 pl-10 md:pl-8">
                  <h3 className="text-xl font-medium text-yogreet-charcoal mb-2">
                    Build Long-term Partnership
                  </h3>
                  <p className="text-yogreet-charcoal mb-4">
                    Establish ongoing relationships with trusted exporters for regular spice purchases and exclusive deals.
                  </p>
                  <p className="text-yogreet-charcoal">
                    Enjoy priority support and special pricing as a valued customer.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Signup Modal */}
    <SignupModal 
      isOpen={isSignupModalOpen}
      onClose={handleCloseModals}
      onSwitchToLogin={handleSwitchToLogin}
    />
  </>
  )
}