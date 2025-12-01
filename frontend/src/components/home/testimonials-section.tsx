"use client"

import { useState } from "react"
import { FiChevronLeft, FiChevronRight } from "react-icons/fi"
import { PROFESSIONAL_MAN_1_URL, PROFESSIONAL_WOMAN_1_URL, PROFESSIONAL_MAN_2_URL, PROFESSIONAL_WOMAN_2_URL, PLACEHOLDER_SVG_URL } from "@/constants/static-images"

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const testimonials = [
    {
      name: "Rajesh Kumar",
      role: "Spice Exporter",
      image: PROFESSIONAL_MAN_1_URL,
      quote:
        "Yogreet has transformed how I connect with international buyers. The platform is transparent and trustworthy.",
    },
    {
      name: "Priya Sharma",
      role: "Wholesale Buyer",
      image: PROFESSIONAL_WOMAN_1_URL,
      quote: "Finding quality spices has never been easier. I love the sample request feature before placing orders.",
    },
    {
      name: "Ahmed Hassan",
      role: "Distributor",
      image: PROFESSIONAL_MAN_2_URL,
      quote: "The global reach and verified sellers make Yogreet my go-to platform for sourcing premium spices.",
    },
    {
      name: "Maria Santos",
      role: "Restaurant Owner",
      image: PROFESSIONAL_WOMAN_2_URL,
      quote: "Consistent quality and reliable delivery. Yogreet has become an essential part of my supply chain.",
    },
  ]

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section className="bg-yogreet py-12 sm:py-14 md:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-poppins font-semibold text-yogreet-charcoal mb-3 sm:mb-4 leading-tight px-2 sm:px-0">
            What Our Users Say
          </h2>
          <p className="text-yogreet-charcoal font-inter text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4 sm:px-6 md:px-0">
            Join thousands of satisfied traders on Yogreet.
          </p>
        </div>

        <div className="relative max-w-3xl mx-auto">
          {/* Testimonial Card */}
          <div className="bg-white p-6 sm:p-8 md:p-10 lg:p-12 shadow-md">
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5 md:mb-6">
              <img
                src={testimonials[currentIndex].image || PLACEHOLDER_SVG_URL}
                alt={testimonials[currentIndex].name}
                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 object-cover rounded-full"
              />
              <div>
                <h3 className="font-poppins font-semibold text-yogreet-charcoal text-sm sm:text-base md:text-lg">{testimonials[currentIndex].name}</h3>
                <p className="text-yogreet-charcoal font-inter text-xs sm:text-sm">{testimonials[currentIndex].role}</p>
              </div>
            </div>
            <p className="text-yogreet-charcoal font-inter text-sm sm:text-base md:text-lg leading-relaxed italic">
              "{testimonials[currentIndex].quote}"
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={prevSlide}
              className="p-2 bg-yogreet-red text-white hover:opacity-90 transition-opacity"
              aria-label="Previous testimonial"
            >
              <FiChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="p-2 bg-yogreet-red text-white hover:opacity-90 transition-opacity"
              aria-label="Next testimonial"
            >
              <FiChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 transition-colors ${
                  index === currentIndex ? "bg-yogreet-red" : "bg-yogreet-charcoal opacity-30"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
