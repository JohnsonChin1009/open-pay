import { ChevronUp, Twitter, Share2, MessageCircle } from "lucide-react"

export function RightSidebar() {
  const socialLinks = [
    { icon: ChevronUp, href: "#", label: "Back to top" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Share2, href: "#", label: "Share" },
    { icon: MessageCircle, href: "#", label: "Discord" },
  ]

  return (
    <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-40">
      <div className="flex flex-col space-y-4">
        {socialLinks.map((link, index) => (
          <a
            key={index}
            href={link.href}
            className="w-10 h-10 bg-black/10 hover:bg-black/20 rounded-full flex items-center justify-center transition-colors group"
            aria-label={link.label}
          >
            <link.icon className="w-5 h-5 text-black/60 group-hover:text-black/80" />
          </a>
        ))}
      </div>
    </div>
  )
}
