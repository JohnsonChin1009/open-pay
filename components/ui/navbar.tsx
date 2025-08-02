import Link from "next/link"
import Image from "next/image"

export function Navbar() {
  const navItems = [
    { name: "About Us", href: "#" },
    { name: "OpenPay Flow", href: "#" },
    { name: "Why OpenPay", href: "#" },
    { name: "Roadmap", href: "#" },
    { name: "Developers", href: "#" },
  ]

  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-yellow-300 backdrop-blur-sm rounded-full px-6 py-3">
        <div className="flex items-center space-x-8">
          <div className="relative w-[120px] h-[48px] sm:w-[140px] sm:h-[56px] md:w-[160px] md:h-[60px]">
            <Image
              src="/logo2.png"
              alt="openpay logo"
              fill
              className="object-contain"
            />
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-black/80 font-bold hover:text-white transition-colors text-md"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <button className="bg-white text-black hover:bg-gray-100 rounded-full px-6">
            Get Started
          </button>
        </div>
      </div>
    </nav>
  )
}
