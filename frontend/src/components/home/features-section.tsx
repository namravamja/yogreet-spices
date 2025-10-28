"use client"

import { FiShield, FiCreditCard, FiGift } from "react-icons/fi"

export function FeaturesSection() {
  const features = [
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
      title: "Free Samples Before Purchase",
      description: "Test quality and authenticity with complimentary samples before committing to large orders.",
      icon: FiGift,
    },
  ]

  return (
    <section className="bg-yogreet-light-gray py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-poppins font-semibold text-yogreet-charcoal mb-4">
            Why Choose Yogreet for Your Spice Purchases?
          </h2>
          <p className="text-yogreet-charcoal font-inter text-base max-w-2xl mx-auto">
            We ensure every spice purchase is secure, authentic, and delivers the quality you expect from premium Indian spices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            const iconColors = ['text-yogreet-red', 'text-yogreet-sage', 'text-yogreet-gold']
            const iconColor = iconColors[index % iconColors.length]
            
            return (
              <div key={index} className="bg-white p-8 hover:shadow-lg transition-shadow text-center rounded-sm">
                <IconComponent className={`w-10 h-10 ${iconColor} mb-4 mx-auto`} />
                <h3 className="font-poppins font-semibold text-yogreet-charcoal mb-3 text-lg">{feature.title}</h3>
                <p className="text-yogreet-charcoal font-inter text-sm leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
