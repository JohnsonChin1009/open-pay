"use client";

import Link from "next/link"
import { Linkedin, Twitter } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="bg-yellow-400 text-black font-bold text-xl px-3 py-1 rounded-lg inline-block mb-4">
              OpenPay
            </div>
            <p className="text-gray-300 max-w-md">
              Scan local QR codes and pay with any currency. Let the network settle it for you with transparent fees.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#about" className="text-gray-300 hover:text-yellow-400 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="text-gray-300 hover:text-yellow-400 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="#faq" className="text-gray-300 hover:text-yellow-400 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="#request" className="text-gray-300 hover:text-yellow-400 transition-colors">
                  Request
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-300 hover:text-yellow-400 transition-colors">
                <Linkedin size={24} />
              </Link>
              <Link href="#" className="text-gray-300 hover:text-yellow-400 transition-colors">
                <Twitter size={24} />
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-300">© {new Date().getFullYear()} OpenPay. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
