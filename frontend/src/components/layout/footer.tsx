import Link from "next/link"
import { Linkedin, Twitter, Github } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-yogreet-beige border-t border-yogreet-light-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-yogreet-red flex items-center justify-center">
                <span className="text-white font-poppins font-bold text-lg">Y</span>
              </div>
              <span className="font-poppins font-semibold text-yogreet-charcoal text-lg">Yogreet</span>
            </div>
            <p className="text-yogreet-charcoal font-inter text-sm leading-relaxed">
              Connecting Indian spice sellers with global buyers. Trade premium spices with ease and transparency.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-poppins font-semibold text-yogreet-charcoal mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-yogreet-charcoal font-inter text-sm hover:text-yogreet-red transition-colors cursor-pointer"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-yogreet-charcoal font-inter text-sm hover:text-yogreet-red transition-colors cursor-pointer"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-yogreet-charcoal font-inter text-sm hover:text-yogreet-red transition-colors cursor-pointer"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-yogreet-charcoal font-inter text-sm hover:text-yogreet-red transition-colors cursor-pointer"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-poppins font-semibold text-yogreet-charcoal mb-4">Connect</h3>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 bg-white flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
              >
                <Linkedin className="w-5 h-5 text-blue-600 hover:text-white" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white flex items-center justify-center hover:bg-blue-400 hover:text-white transition-colors cursor-pointer"
              >
                <Twitter className="w-5 h-5 text-blue-400 hover:text-white" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white flex items-center justify-center hover:bg-gray-800 hover:text-white transition-colors cursor-pointer"
              >
                <Github className="w-5 h-5 text-gray-800 hover:text-white" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-yogreet-light-gray pt-8 text-center">
          <p className="text-yogreet-charcoal font-inter text-sm">
            © 2025 Yogreet. All rights reserved. Connecting global spice trade.
          </p>
        </div>
      </div>
    </footer>
  )
}
