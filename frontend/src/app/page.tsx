import { Navbar, Footer } from "@/components/layout"
import { HeroSection, FeaturesSection, TopSpicesSection, HowItWorksSection, TestimonialsSection, CTASection } from "@/components/home"

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TopSpicesSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </main>
  )
}
