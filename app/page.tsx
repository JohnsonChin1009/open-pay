"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Globe, Zap, DollarSign, QrCode, ArrowRight, Clock, Shield, Users, ChevronDown, ChevronUp } from "lucide-react"
import Navbar from "@/components/custom/Navbar"
import Footer from "@/components/custom/Footer"

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const faqData = [
    {
      question: "What currencies are supported?",
      answer:
        "OpenPay supports major currencies including USD, EUR, GBP, SGD, MYR, THB, and many more. We're constantly adding new currencies based on user demand.",
    },
    {
      question: "Is this safe?",
      answer:
        "Yes, OpenPay uses bank-level encryption and secure escrow systems. All transactions are monitored and protected by our fraud detection systems.",
    },
    {
      question: "Who settles the payments?",
      answer:
        "Other OpenPay users in the network settle payments. When you scan a QR code, someone with the local currency completes the payment and receives your currency in exchange.",
    },
    {
      question: "What fees do I pay?",
      answer:
        "OpenPay charges a flat 2% platform fee with no hidden costs. This covers the transaction processing, currency exchange, and platform maintenance.",
    },
  ]

  const requestExamples = [
    {
      country: "🇸🇬",
      provider: "PayNow",
      localAmount: "S$45.00",
      offeringCurrency: "USD",
      rate: "1.35",
      status: "Open",
      timeLeft: "2m 15s",
    },
    {
      country: "🇲🇾",
      provider: "DuitNow",
      localAmount: "RM120.00",
      offeringCurrency: "EUR",
      rate: "4.85",
      status: "Completed",
      timeLeft: "Settled",
    },
    {
      country: "🇹🇭",
      provider: "PromptPay",
      localAmount: "฿850.00",
      offeringCurrency: "GBP",
      rate: "42.5",
      status: "Open",
      timeLeft: "5m 42s",
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-yellow-50 via-white to-yellow-100 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-black mb-6">
              Scan. Pay. Settle —<br />
              <span className="text-yellow-600">Across Borders.</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Pay local QR codes with any currency. Let the network settle it for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-black text-white hover:bg-gray-800 transition-colors px-8 py-4 text-lg">
                Try Now
                <ArrowRight className="ml-2" size={20} />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-black text-black hover:bg-black hover:text-white transition-colors px-8 py-4 text-lg bg-transparent"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=800&width=1200')] opacity-5 bg-center bg-cover"></div>
      </section>

      {/* About OpenPay */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Why OpenPay?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-yellow-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="text-black" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">Borderless Payments</h3>
              <p className="text-gray-600">No local bank? No problem. Pay anywhere with the currency you have.</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-yellow-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="text-black" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">Instant Matching</h3>
              <p className="text-gray-600">Requests are fulfilled in real-time by our global network of users.</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-yellow-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <DollarSign className="text-black" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">Transparent Fees</h3>
              <p className="text-gray-600">Just 2% platform fee, no hidden costs. Know exactly what you pay.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How Does It Work */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">How Does It Work?</h2>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="bg-yellow-400 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-black font-bold text-lg">1</span>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-semibold text-black mb-2">Scan a local QR code</h3>
                  <p className="text-gray-600">
                    Use your phone to scan any supported local payment QR code (PayNow, DuitNow, PromptPay, etc.)
                  </p>
                </div>
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <QrCode size={32} className="text-gray-600" />
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="bg-yellow-400 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-black font-bold text-lg">2</span>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-semibold text-black mb-2">Choose your currency to offer</h3>
                  <p className="text-gray-600">Select which currency you want to pay with and set your exchange rate</p>
                </div>
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <DollarSign size={32} className="text-gray-600" />
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="bg-yellow-400 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-black font-bold text-lg">3</span>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-semibold text-black mb-2">Someone completes the payment for you</h3>
                  <p className="text-gray-600">
                    Another user with local currency pays the merchant and receives your currency
                  </p>
                </div>
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Users size={32} className="text-gray-600" />
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="bg-yellow-400 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-black font-bold text-lg">4</span>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-semibold text-black mb-2">You&apos; done!</h3>
                  <p className="text-gray-600">
                    Merchant gets local funds, you spend what you have. Transaction complete!
                  </p>
                </div>
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                  <Shield size={32} className="text-green-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Request Section */}
      <section id="request" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Live Requests</h2>
            <p className="text-gray-600 text-lg">See real-time payment requests from users around the world</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {requestExamples.map((request, index) => (
              <Card key={index} className="border-2 hover:border-yellow-400 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{request.country}</span>
                      <span className="font-medium text-gray-700">{request.provider}</span>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        request.status === "Open" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {request.status}
                    </span>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-semibold">{request.localAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Offering:</span>
                      <span className="font-semibold">{request.offeringCurrency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rate:</span>
                      <span className="font-semibold">{request.rate}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock size={16} />
                      {request.timeLeft}
                    </div>
                    {request.status === "Open" && (
                      <Button size="sm" className="bg-yellow-400 text-black hover:bg-yellow-500">
                        Fulfill
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <Card key={index} className="border-2">
                <CardContent className="p-0">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="text-lg font-semibold text-black">{faq.question}</h3>
                    {openFaq === index ? (
                      <ChevronUp className="text-gray-500" size={20} />
                    ) : (
                      <ChevronDown className="text-gray-500" size={20} />
                    )}
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-6">
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
