import { Suspense } from "react"
import { Navbar, Footer } from "@/components/layout"
import { HeroSection, CategoriesSection, FeaturesSection, TopSpicesSection, HowItWorksSection, TestimonialsSection, CTASection } from "@/components/home"

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Suspense fallback={<div className="h-24" />}>
        <Navbar />
      </Suspense>
      <HeroSection />
      <CategoriesSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TopSpicesSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </main>
  )
}
