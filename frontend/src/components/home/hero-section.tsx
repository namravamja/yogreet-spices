"use client";

import Link from "next/link";
import { FiX, FiShield, FiGift, FiCreditCard } from "react-icons/fi";

export function HeroSection() {
  const heroOptions = [
    {
      title: "No Middle Man",
      description:
        "Buy directly from spice exporters, eliminating intermediaries and getting better prices.",
      icon: FiX,
    },
    {
      title: "Verified Indian Exporters",
      description:
        "Purchase only from trusted, government-verified exporters to ensure authenticity and quality.",
      icon: FiShield,
      highlight: true,
      badge: "TRUSTED",
    },
    {
      title: "Secure Escrow Payment System",
      description:
        "Your payments are protected — funds are released only when you receive and approve your spice order.",
      icon: FiCreditCard,
      highlight: true,
      badge: "SECURE",
    },
    {
      title: "Free Sample Before Bulk Order",
      description:
        "Get free samples to verify aroma, texture, and purity before placing large or wholesale orders.",
      icon: FiGift,
    },
  ];
  return (
    <section
      className="relative overflow-hidden bg-white pt-14 pb-20 sm:pt-16 sm:pb-24 md:pt-18 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/herosection.jpg')" }}
    >
      {/* Overlay to reduce image opacity */}
      <div className="absolute inset-0 bg-white/95"></div>

      {/* Bottom gradient shadow for smooth transition */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-white to-transparent"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="max-w-xl space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-yogreet-red/10 px-4 py-1 text-sm font-medium text-yogreet-red">
              <span className="h-2 w-2 rounded-full bg-yogreet-red" />
              India’s trusted spice export network
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-poppins font-semibold text-yogreet-charcoal leading-tight text-balance">
              Discover Premium Indian Spices from Trusted Exporters
            </h1>
            <p className="text-lg font-inter text-yogreet-charcoal/80 leading-relaxed">
              Buy authentic Indian spices directly from verified exporters. Skip
              the middleman, get better prices, and enjoy secure transactions
              with our escrow payment system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/explore"
                className="group inline-flex items-center justify-center gap-2 rounded-full border border-transparent bg-yogreet-red px-6 py-3 text-white font-manrope font-medium shadow-[0_18px_45px_-18px_rgba(240,68,56,0.55)] transition-all hover:translate-y-[-2px] hover:shadow-[0_24px_55px_-20px_rgba(240,68,56,0.6)]"
              >
                Start Buying Spices
              </Link>
              <button
                onClick={() => {
                  const element = document.getElementById("how-it-works");
                  if (element) {
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition =
                      elementPosition + window.pageYOffset - 100; // 100px offset for navbar
                    window.scrollTo({
                      top: offsetPosition,
                      behavior: "smooth",
                    });
                  }
                }}
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-yogreet-sage px-6 py-3 text-yogreet-sage font-manrope font-medium transition-all hover:bg-yogreet-sage hover:text-white hover:shadow-[0_18px_40px_-20px_rgba(16,185,129,0.45)]"
              >
                How It Works ?
              </button>
            </div>
          </div>

          {/* Right Visual - Zig-zag Card Flow */}
          <div className="flex flex-col gap-6 sm:gap-7 lg:gap-9">
            {heroOptions.map((option, index) => {
              const IconComponent = option.icon;

              const accentStyles = [
                {
                  iconBg: "bg-yogreet-red",
                  badgeBg: "bg-yogreet-red",
                  border: "border-yogreet-red/20",
                  shadow: "md:shadow-[0_30px_60px_-35px_rgba(240,68,56,0.55)]",
                  dot: "bg-yogreet-red",
                  ring: "ring-yogreet-red/70",
                },
                {
                  iconBg: "bg-yogreet-sage",
                  badgeBg: "bg-yogreet-sage",
                  border: "border-yogreet-sage/25",
                  shadow: "md:shadow-[0_30px_60px_-35px_rgba(16,185,129,0.45)]",
                  dot: "bg-yogreet-sage",
                  ring: "ring-yogreet-sage/70",
                },
                {
                  iconBg: "bg-yogreet-gold",
                  badgeBg: "bg-yogreet-gold",
                  border: "border-yogreet-gold/25",
                  shadow: "md:shadow-[0_30px_60px_-35px_rgba(234,179,8,0.35)]",
                  dot: "bg-yogreet-gold",
                  ring: "ring-yogreet-gold/70",
                },
                {
                  iconBg: "bg-yogreet-purple",
                  badgeBg: "bg-yogreet-purple",
                  border: "border-yogreet-purple/25",
                  shadow: "md:shadow-[0_30px_60px_-35px_rgba(124,58,237,0.45)]",
                  dot: "bg-yogreet-purple",
                  ring: "ring-yogreet-purple/70",
                },
              ];
              const accent = accentStyles[index % accentStyles.length];

              const layouts = [
                { align: "md:ml-0 md:mr-auto", dot: "left" },
                { align: "md:mr-0 md:ml-auto", dot: "right" },
                { align: "md:ml-0 md:mr-auto", dot: "left" },
                { align: "md:mr-0 md:ml-auto", dot: "right" },
              ];
              const layout = layouts[index % layouts.length];

              const layoutClasses =
                index === 1 ? "sm:flex-row-reverse" : "sm:flex-row";

              return (
                <div key={index} className="flex justify-center">
                  <div className={`w-full md:max-w-md ${layout.align}`}>
                    <div
                      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white/80 p-6 sm:p-7 backdrop-blur transition-all duration-300 ${layoutClasses} items-start gap-4 sm:gap-5 ${
                        option.highlight
                          ? `${accent.border} ${accent.shadow} md:shadow-lg`
                          : `${accent.border}`
                      }`}
                    >
                      {/* Red circle for No Middle Man card */}
                      {layout.dot === "left" ? (
                        <span
                          className={`hidden md:block absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full ${accent.dot}`}
                        ></span>
                      ) : (
                        <span
                          className={`hidden md:block absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full ${accent.dot}`}
                        ></span>
                      )}
                      <span className="absolute inset-0 rounded-2xl border border-white/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
                      <div
                        className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-xl text-white ${
                          accent.iconBg
                        } ${
                          option.highlight
                            ? `ring-2 ${accent.ring} ring-offset-2`
                            : ""
                        }`}
                      >
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="font-poppins font-semibold text-yogreet-charcoal">
                            {option.title}
                          </h3>
                          {option.badge && (
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-semibold text-white ${accent.badgeBg}`}
                            >
                              {option.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-yogreet-charcoal/80 font-inter text-sm leading-relaxed sm:text-base">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
