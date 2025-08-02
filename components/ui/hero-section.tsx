import { Button } from "@/components/ui/button"
import { Star, Search, DollarSign, Hammer } from "lucide-react"

export function HeroSection() {
  const actionButtons = [
    {
      icon: Star,
      text: "Accounting Tool",
      variant: "default" as const,
      className: "bg-black text-white hover:bg-black/90",
    },
    {
      icon: Search,
      text: "Openpay Doc",
      variant: "default" as const,
      className: "bg-black text-white hover:bg-black/90",
    },
    {
      icon: DollarSign,
      text: "Get Your Stats",
      variant: "default" as const,
      className: "bg-yellow-500 text-white hover:bg-yellow-600",
    },
    {
      icon: Hammer,
      text: "Start Building",
      variant: "default" as const,
      className: "bg-black text-white hover:bg-black/90",
    },
  ]

  return (
    <section className="pt-32 pb-20 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="font-headline text-3xl sm:text-4xl lg:text-9xl font-bold text-black mb-8 leading-none">
          Open
          <br/>
          Pay
        </h1>

        <div className="max-w-3xl mx-auto mb-12">
          <p className="text-xl md:text-2xl text-black/80 leading-relaxed">
            An app that simplifies MSMEs financewith chat that connects to POS systems via APIs,
            and replaces tedious forms with guided steps.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          {actionButtons.map((button, index) => (
            <button
              key={index}
              className={`rounded-full px-6 py-3 text-sm font-medium flex items-center gap-2 ${button.className}`}
              
            >
              <button.icon className="w-4 h-4" />
              {button.text}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
