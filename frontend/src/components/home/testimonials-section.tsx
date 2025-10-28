"use client"

import { useState } from "react"
import { FiChevronLeft, FiChevronRight } from "react-icons/fi"

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const testimonials = [
    {
      name: "Rajesh Kumar",
      role: "Spice Exporter",
      image: "/professional-man-1.jpg",
      quote:
        "Yogreet has transformed how I connect with international buyers. The platform is transparent and trustworthy.",
    },
    {
      name: "Priya Sharma",
      role: "Wholesale Buyer",
      image: "/professional-woman-1.jpg",
      quote: "Finding quality spices has never been easier. I love the sample request feature before bulk orders.",
    },
    {
      name: "Ahmed Hassan",
      role: "Distributor",
      image: "/professional-man-2.png",
      quote: "The global reach and verified sellers make Yogreet my go-to platform for sourcing premium spices.",
    },
    {
      name: "Maria Santos",
      role: "Restaurant Owner",
      image: "/professional-woman-2.png",
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
    <section className="bg-yogreet py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-poppins font-semibold text-yogreet-charcoal mb-4">
            What Our Users Say
          </h2>
          <p className="text-yogreet-charcoal font-inter text-base max-w-2xl mx-auto">
            Join thousands of satisfied traders on Yogreet.
          </p>
        </div>

        <div className="relative max-w-3xl mx-auto">
          {/* Testimonial Card */}
          <div className="bg-white p-8 md:p-12 shadow-md">
            <div className="flex items-center gap-4 mb-6">
              <img
                src={testimonials[currentIndex].image || "/placeholder.svg"}
                alt={testimonials[currentIndex].name}
                className="w-16 h-16 object-cover"
              />
              <div>
                <h3 className="font-poppins font-semibold text-yogreet-charcoal">{testimonials[currentIndex].name}</h3>
                <p className="text-yogreet-charcoal font-inter text-sm">{testimonials[currentIndex].role}</p>
              </div>
            </div>
            <p className="text-yogreet-charcoal font-inter text-base leading-relaxed italic">
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
