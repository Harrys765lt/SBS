import { MessageCircle, Sparkles, Mail } from "lucide-react";
import { Button } from "./ui/button";

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white mt-24 relative overflow-hidden">
      {/* Subtle Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tl from-purple-600/10 to-pink-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
        {/* Newsletter Section */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-10 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span className="text-sm text-purple-400">Stay Updated</span>
              </div>
              <h3 className="mb-2 text-white">Get the latest updates</h3>
              <p className="text-gray-400">
                Subscribe to our newsletter for exclusive offers and booking tips
              </p>
            </div>
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-5 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 rounded-xl px-6 shadow-lg">
                <Mail className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Fein Booking
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Book salons, restaurants, and sports venues across Kuala Lumpur with instant WhatsApp confirmation.
            </p>
            <div className="flex items-center gap-2 text-emerald-400">
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs">
                Powered by WhatsApp
              </span>
            </div>
          </div>

          {/* About */}
          <div>
            <h6 className="mb-6 text-white">About</h6>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white text-sm transition-colors duration-300 hover:translate-x-1 inline-block"
                >
                  How it works
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white text-sm transition-colors duration-300 hover:translate-x-1 inline-block"
                >
                  For Businesses
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white text-sm transition-colors duration-300 hover:translate-x-1 inline-block"
                >
                  Careers
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white text-sm transition-colors duration-300 hover:translate-x-1 inline-block"
                >
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h6 className="mb-6 text-white">Support</h6>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white text-sm transition-colors duration-300 hover:translate-x-1 inline-block"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white text-sm transition-colors duration-300 hover:translate-x-1 inline-block"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white text-sm transition-colors duration-300 hover:translate-x-1 inline-block"
                >
                  WhatsApp Support
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white text-sm transition-colors duration-300 hover:translate-x-1 inline-block"
                >
                  FAQs
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h6 className="mb-6 text-white">Legal</h6>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white text-sm transition-colors duration-300 hover:translate-x-1 inline-block"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white text-sm transition-colors duration-300 hover:translate-x-1 inline-block"
                >
                  PDPA Compliance
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white text-sm transition-colors duration-300 hover:translate-x-1 inline-block"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white text-sm transition-colors duration-300 hover:translate-x-1 inline-block"
                >
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © 2025 Fein Booking. All rights reserved.
          </p>
          <p className="text-gray-400 text-sm flex items-center gap-2">
            Made with <span className="text-pink-500">❤️</span> in Kuala Lumpur
          </p>
        </div>
      </div>
    </footer>
  );
}
