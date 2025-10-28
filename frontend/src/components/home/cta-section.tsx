export function CTASection() {
  return (
    <section className="bg-yogreet-charcoal py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-poppins font-semibold text-white mb-6">
          Join the Global Spice Trade with Yogreet Today
        </h2>
        <p className="text-white font-inter text-base mb-8 max-w-2xl mx-auto leading-relaxed">
          Whether you're a seller looking to reach global markets or a buyer seeking premium spices, Yogreet is your
          trusted platform for secure, transparent trading.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-3 bg-white text-yogreet-purple font-manrope font-medium hover:opacity-90 transition-opacity cursor-pointer">
            Start Selling
          </button>
          <button className="px-8 py-3 border-2 border-white text-white font-manrope font-medium hover:bg-white hover:text-yogreet-purple transition-colors cursor-pointer">
            Start Buying
          </button>
        </div>
      </div>
    </section>
  )
}
