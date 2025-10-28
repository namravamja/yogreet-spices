"use client"

import Link from "next/link"
import { FiX, FiShield, FiGift, FiCreditCard } from "react-icons/fi"

export function HeroSection() {
  const heroOptions = [
    {
      title: "No Middle Man",
      description: "Buy directly from spice exporters, eliminating intermediaries and getting better prices.",
      icon: FiX,
    },
    {
      title: "Verified Indian Exporters",
      description: "Purchase only from trusted, government-verified exporters to ensure authenticity and quality.",
      icon: FiShield,
      highlight: true,
      badge: "TRUSTED",
    },
    {
      title: "Secure Escrow Payment System",
      description: "Your payments are protected — funds are released only when you receive and approve your spice order.",
      icon: FiCreditCard,
      highlight: true,
      badge: "SECURE",
    },
    {
      title: "Free Sample Before Bulk Order",
      description: "Get free samples to verify aroma, texture, and purity before placing large or wholesale orders.",
      icon: FiGift,
    },
  ]
  return (
    <section 
      className="bg-white py-16 md:py-24 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: "url('/herosection.jpg')" }}
    >
      {/* Overlay to reduce image opacity */}
      <div className="absolute inset-0 bg-white/93"></div>
      
      {/* Bottom gradient shadow for smooth transition */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-linear-to-t from-white to-transparent"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <h1 className="text-4xl md:text-5xl font-poppins font-semibold text-yogreet-charcoal mb-6 text-balance">
              Discover Premium Indian Spices from Trusted Exporters
            </h1>
            <p className="text-base font-inter text-yogreet-charcoal leading-relaxed mb-8 text-balance">
              Buy authentic Indian spices directly from verified exporters. Skip the middleman, get better prices,
              and enjoy secure transactions with our escrow payment system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/explore"
                className="px-6 py-3 bg-yogreet-red text-white font-manrope font-medium hover:opacity-90 transition-opacity cursor-pointer text-center"
              >
                Start Buying Spices
              </Link>
              <button 
                onClick={() => {
                  const element = document.getElementById('how-it-works');
                  if (element) {
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - 100; // 100px offset for navbar
                    window.scrollTo({
                      top: offsetPosition,
                      behavior: 'smooth'
                    });
                  }
                }}
                className="px-6 py-3 border-2 border-yogreet-sage text-yogreet-sage font-manrope font-medium hover:bg-yogreet-sage hover:text-white transition-colors cursor-pointer text-center"
              >
                How It Works ?
              </button>
            </div>
          </div>

          {/* Right Visual - Zig-zag Card Flow */}
          <div className="space-y-8">
            {heroOptions.map((option, index) => {
              const IconComponent = option.icon
              const iconColors = ['bg-yogreet-red', 'bg-yogreet-sage', 'bg-yogreet-gold', 'bg-yogreet-purple']
              const iconColor = iconColors[index % iconColors.length]
              
              // Create uneven positioning with different offsets
              const positions = [
                { justify: 'justify-start', width: 'w-4/5', margin: '-ml-12' },
                { justify: 'justify-end', width: 'w-3/4', margin: '-mr-16' },
                { justify: 'justify-start', width: 'w-5/6', margin: 'ml-4' },
                { justify: 'justify-end', width: 'w-4/5', margin: 'mr-4' }
              ]
              const position = positions[index]
              
              return (
                <div key={index} className={`flex ${position.justify}`}>
                  <div className={`${position.width} ${position.margin}`}>
                    <div className={`p-6 flex items-start gap-4 h-32 rounded-sm relative ${
                      option.highlight 
                        ? 'bg-white/80 border border-yogreet-red shadow-lg transform scale-105' 
                        : 'bg-white/60 border border-black'
                    }`}>
                      {/* Red circle for No Middle Man card */}
                      {index === 0 && (
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-yogreet-red rounded-full"></div>
                      )}
                      {/* Red circle for Verified Indian Exporters card */}
                      {index === 1 && (
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-yogreet-red rounded-full"></div>
                      )}
                      {/* Red circles for Free Sample and Escrow Payment cards */}
                      {(index === 2 || index === 3) && (
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-yogreet-red rounded-full"></div>
                      )}
                      {index === 1 ? (
                        // Swapped layout for Verified Indian Exporters card
                        <>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-poppins font-semibold text-yogreet-charcoal">{option.title}</h3>
                              {option.badge && (
                                <span className="px-2 py-1 bg-yogreet-red text-white text-xs font-bold rounded-full">
                                  {option.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-yogreet-charcoal font-inter text-sm">
                              {option.description}
                            </p>
                          </div>
                          <div className={`w-12 h-12 ${iconColor} flex items-center justify-center rounded-xs ${
                            option.highlight ? 'ring-2 ring-yogreet-red ring-offset-2' : ''
                          }`}>
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                        </>
                      ) : (
                        // Default layout for other cards
                        <>
                          <div className={`w-12 h-12 ${iconColor} flex items-center justify-center rounded-xs ${
                            option.highlight ? 'ring-2 ring-yogreet-red ring-offset-2' : ''
                          }`}>
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-poppins font-semibold text-yogreet-charcoal">{option.title}</h3>
                              {option.badge && (
                                <span className="px-2 py-1 bg-yogreet-red text-white text-xs font-bold rounded-full">
                                  {option.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-yogreet-charcoal font-inter text-sm">
                              {option.description}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
