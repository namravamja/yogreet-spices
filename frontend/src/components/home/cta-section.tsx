export function CTASection() {
  return (
    <section className="bg-yogreet-charcoal py-12 sm:py-14 md:py-16 lg:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-poppins font-semibold text-white mb-4 sm:mb-5 md:mb-6 leading-tight px-2 sm:px-0">
          Join the Global Spice Trade with Yogreet Today
        </h2>
        <p className="text-white font-inter text-sm sm:text-base md:text-lg mb-6 sm:mb-7 md:mb-8 max-w-2xl mx-auto leading-relaxed px-4 sm:px-6 md:px-0">
          Whether you're a seller looking to reach global markets or a buyer seeking premium spices, Yogreet is your
          trusted platform for secure, transparent trading.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
          <button className="px-6 py-2.5 sm:px-8 sm:py-3 bg-white text-yogreet-purple font-manrope font-medium hover:opacity-90 transition-opacity cursor-pointer text-sm sm:text-base md:text-lg">
            Start Selling
          </button>
          <button className="px-6 py-2.5 sm:px-8 sm:py-3 border-2 border-white text-white font-manrope font-medium hover:bg-white hover:text-yogreet-purple transition-colors cursor-pointer text-sm sm:text-base md:text-lg">
            Start Buying
          </button>
        </div>
      </div>
    </section>
  )
}
