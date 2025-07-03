"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import Link from "next/link"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <div className="bg-yellow-400 text-black font-bold text-xl px-3 py-1 rounded-lg">OpenPay</div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link
                href="#about"
                className="text-gray-900 hover:text-yellow-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                About
              </Link>
              <Link
                href="#how-it-works"
                className="text-gray-900 hover:text-yellow-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                How It Works
              </Link>
              <Link
                href="#faq"
                className="text-gray-900 hover:text-yellow-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                FAQ
              </Link>
              <Link
                href="#request"
                className="text-gray-900 hover:text-yellow-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Request
              </Link>
            </div>
          </div>

          {/* Desktop CTA Button */}
          <div className="hidden md:block">
            <Button className="bg-black text-white hover:bg-gray-800 transition-colors">Get Started</Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-900 hover:text-yellow-600 p-2">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <Link href="#about" className="text-gray-900 hover:text-yellow-600 block px-3 py-2 text-base font-medium">
                About
              </Link>
              <Link
                href="#how-it-works"
                className="text-gray-900 hover:text-yellow-600 block px-3 py-2 text-base font-medium"
              >
                How It Works
              </Link>
              <Link href="#faq" className="text-gray-900 hover:text-yellow-600 block px-3 py-2 text-base font-medium">
                FAQ
              </Link>
              <Link
                href="#request"
                className="text-gray-900 hover:text-yellow-600 block px-3 py-2 text-base font-medium"
              >
                Request
              </Link>
              <div className="px-3 py-2">
                <Button className="w-full bg-black text-white hover:bg-gray-800 transition-colors">Get Started</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
