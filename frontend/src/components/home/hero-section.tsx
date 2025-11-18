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
  ]
  return (
    <section 
      className="bg-white py-10 md:py-16 relative overflow-hidden min-h-[600px] md:min-h-[670px] flex items-center"
    >
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>
      
      {/* Overlay to reduce video opacity */}
      <div className="absolute inset-0 bg-black/50 z-10"></div>
      
      {/* Left to right gradient overlay - more opacity on left, fading to transparent by middle */}
      <div className="absolute inset-0 bg-linear-to-r from-black/60 via-black/30 to-transparent z-15"></div>
      
      {/* Bottom gradient shadow for smooth transition */}
      <div className="absolute bottom-0 left-0 right-0 h-20 z-10"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20 w-full">
        <div className="max-w-7xl">
          <h1 className="text-5xl md:text-7xl font-poppins text-white mb-6 text-balance">
            Discover Premium Indian Spices from Trusted Exporters
          </h1>
          {/* Hero Options - Stacked vertically */}
          <div className="space-y-4 mb-8">
            {heroOptions.map((option, index) => {
              const IconComponent = option.icon
              const iconColors = ['bg-yogreet-red', 'bg-yogreet-sage', 'bg-yogreet-gold', 'bg-yogreet-purple']
              const iconColor = iconColors[index % iconColors.length]
              
              return (
                <div key={index} className="flex items-start gap-3">
                  <div className={`w-11 h-11 shrink-0 ${iconColor} flex items-center justify-center rounded-xs ${
                    option.highlight ? 'ring-2 ring-yogreet-red ring-offset-2' : ''
                  }`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="font-poppins font-semibold text-white text-sm leading-tight">{option.title}</h3>
                      {option.badge && (
                        <span className="px-2 py-0.5 bg-yogreet-red text-white text-xs font-bold rounded-full whitespace-nowrap">
                          {option.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-white/90 font-inter text-xs leading-snug">
                      {option.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <Link 
              href="/explore"
              className="px-5 py-2.5 bg-yogreet-red/60 border border-yogreet-red text-white font-manrope font-medium hover:bg-yogreet-red/30 transition-all cursor-pointer text-center text-sm rounded-md"
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
              className="px-5 py-2.5 border-2 bg-white/20 rounded-md border-white text-white font-manrope font-medium hover:bg-white/30 transition-all cursor-pointer text-center text-sm"
            >
              How It Works ?
            </button>
          </div>

          
        </div>
      </div>
    </section>
  )
}
