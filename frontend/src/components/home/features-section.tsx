"use client"

import { FiShield, FiCreditCard, FiGift, FiUsers } from "react-icons/fi"

export function FeaturesSection() {
  const features = [
    {
      title: "No Middle Man",
      description: "Connect directly with verified spice exporters, eliminating intermediaries and ensuring better prices and quality control.",
      icon: FiUsers,
    },
    {
      title: "Verified Exporters Only",
      description: "Buy from government-verified Indian spice exporters with proven track records and quality certifications.",
      icon: FiShield,
    },
    {
      title: "Secure Payment Protection",
      description: "Your money is safe with our escrow system - funds are released only when you're satisfied with your order.",
      icon: FiCreditCard,
    },
    {
      title: "Samples Before Purchase",
      description: "Test quality and authenticity with complimentary samples before committing to large orders.",
      icon: FiGift,
    },
  ]

  return (
    <section className="py-12 sm:py-14 md:py-16 lg:py-24 bg-yogreet-light-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-poppins font-semibold text-yogreet-charcoal mb-3 sm:mb-4 leading-tight px-2 sm:px-0">
            Why Choose Yogreet for Your Spice Purchases?
          </h2>
          <p className="text-yogreet-charcoal font-inter text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4 sm:px-6 md:px-0">
            We ensure every spice purchase is secure, authentic, and delivers the quality you expect from premium Indian spices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            const iconColors = ['text-yogreet-red', 'text-yogreet-sage', 'text-yogreet-gold', 'text-yogreet-red']
            const iconColor = iconColors[index % iconColors.length]
            
            return (
              <div key={index} className="bg-white p-4 sm:p-6 md:p-8 hover:shadow-lg transition-shadow text-center rounded-sm">
                <IconComponent className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 ${iconColor} mb-3 sm:mb-4 mx-auto`} />
                <h3 className="font-poppins font-semibold text-yogreet-charcoal mb-2 sm:mb-3 text-base sm:text-lg md:text-xl">{feature.title}</h3>
                <p className="text-yogreet-charcoal font-inter text-xs sm:text-sm md:text-base leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
