"use client"

import Link from "next/link"

export function HeroSection() {
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
      
      {/* Bottom gradient fade for smooth transition */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-linear-to-t from-black/80 via-black/40 to-transparent z-10"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20 w-full flex items-center justify-center">
        <div className="max-w-6xl text-center">
          <h1 className="text-7xl font-poppins text-white mb-6 text-balance">
            Connect with Verified Spice Exporters Worldwide
          </h1>
          <p className="text-white/90 font-inter text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Source premium quality Indian spices directly from certified exporters. Browse verified sellers, compare prices, and secure your orders with our trusted escrow system.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mb-8 justify-center">
            <Link 
              href="/explore"
              className="px-6 py-4 bg-yogreet-red border border-yogreet-red text-white font-manrope font-medium hover:bg-yogreet-red/60 transition-all cursor-pointer text-center text-base md:text-lg rounded-md"
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
              className="px-8 py-4 border-2 bg-white/90 rounded-md border-white font-manrope font-medium hover:bg-white/70 transition-all cursor-pointer text-center text-base md:text-lg"
            >
              How It Works ?
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

