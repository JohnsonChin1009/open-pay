"use client"

import type React from "react"
import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Globe,
  Zap,
  DollarSign,
  QrCode,
  ArrowRight,
  Shield,
  ChevronDown,
  ChevronUp,
  Upload,
  CheckCircle,
  Camera,
} from "lucide-react"
import Navbar from "@/components/custom/Navbar"
import Footer from "@/components/custom/Footer"
import QRScanner from "@/components/custom/QrScanner"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPaid, setIsPaid] = useState(false)

  // Create Request Form State
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isDecoding, setIsDecoding] = useState(false)
  const [isDecoded, setIsDecoded] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [merchantData, setMerchantData] = useState({
    name: "",
    id: "",
    location: "",
  })
  const [paymentAmount, setPaymentAmount] = useState("")
  const [usdcAmount, setUsdcAmount] = useState("")

  // Add these new state variables
  const [isRequestCreated, setIsRequestCreated] = useState(false)
  const [countdown, setCountdown] = useState(30)
  const [countdownActive, setCountdownActive] = useState(false)

  // Add this near the top with other state variables
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
        processQRCode()
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleScanSuccess = (qrData: string) => {
    console.log("QR Code scanned:", qrData)
    setShowScanner(false)

    // Don't set uploaded image for camera scans
    setUploadedImage(null)
    processQRCode(qrData)
  }

  const processQRCode = (qrData?: string) => {
    setIsDecoding(true)
    setIsDecoded(false)

    // Simulate decoding process
    setTimeout(() => {
      setIsDecoding(false)
      setIsDecoded(true)

      // Parse different QR code formats and set appropriate merchant data
      let merchantInfo = {
        name: "MAY CHIN ENTERPRISE",
        id: "2332896031",
        location: "SELANGOR",
      }

      if (qrData) {
        if (qrData.includes("SINGAPORE_COFFEE")) {
          merchantInfo = {
            name: "SINGAPORE COFFEE HOUSE",
            id: "1234567890",
            location: "SINGAPORE",
          }
        } else if (qrData.includes("BANGKOK_STREET")) {
          merchantInfo = {
            name: "BANGKOK STREET FOOD",
            id: "9876543210",
            location: "BANGKOK",
          }
        }
      }

      setMerchantData(merchantInfo)
    }, 1500) // Longer delay to show processing
  }

  const calculateUSDC = (myrAmount: string) => {
    const amount = Number.parseFloat(myrAmount)
    if (!isNaN(amount) && amount > 0) {
      const rate = 4.88
      const usdcValue = (amount / rate).toFixed(2)
      return usdcValue
    }
    return ""
  }

  const handleAmountChange = useCallback((value: string) => {
    // Only allow valid number input
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setPaymentAmount(value)
      // Calculate USDC without causing re-renders
      const calculatedUSDC = calculateUSDC(value)
      setUsdcAmount(calculatedUSDC)
    }
  }, [])

  const resetForm = useCallback(() => {
    setUploadedImage(null)
    setIsDecoded(false)
    setIsDecoding(false)
    setMerchantData({ name: "", id: "", location: "" })
    setPaymentAmount("")
    setUsdcAmount("")
  }, [])

  // Replace the handleCreateRequest function with this:
  const handleCreateRequest = useCallback(() => {
    // Show success dialog
    setIsRequestCreated(true)
    setCountdown(30)
    setCountdownActive(true)
  }, [])

  // Add this useEffect to manage the countdown
  useEffect(() => {
    if (countdownActive && isRequestCreated) {
      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current)
              countdownIntervalRef.current = null
            }
            setCountdownActive(false)
            setIsRequestCreated(false)
            resetForm()
            return 30
          }
          return prev - 1
        })
      }, 1000)
    }

    // Cleanup function
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
        countdownIntervalRef.current = null
      }
    }
  }, [countdownActive, isRequestCreated])

  // Update the dialog close handlers:
  const handleCloseNow = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }
    setIsRequestCreated(false)
    setCountdownActive(false)
    resetForm()
  }

  const handleCreateAnother = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }
    setIsRequestCreated(false)
    setCountdownActive(false)
    // Don't reset form - user might want to create another similar request
  }

  const CreateRequestForm = useMemo(() => {
    // eslint-disable-next-line react/display-name
    return () => (
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - QR Code Upload */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Card className="p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-black mb-6">Upload Merchant QR Code</h3>

              <div className="space-y-4">
                {!uploadedImage && !isDecoded ? (
                  <div className="space-y-4">
                    {/* Camera Scan Option */}
                    <Button
                      onClick={() => setShowScanner(true)}
                      className="w-full bg-yellow-400 text-black hover:bg-yellow-500 transition-colors py-6 text-lg font-medium"
                    >
                      <Camera className="mr-2" size={24} />
                      Scan with Camera
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">or</span>
                      </div>
                    </div>

                    {/* File Upload Option */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-yellow-400 transition-colors">
                      <input
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="qr-upload"
                      />
                      <label htmlFor="qr-upload" className="cursor-pointer">
                        <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                        <p className="text-gray-600 mb-2">Click to upload QR code image</p>
                        <p className="text-sm text-gray-500">JPEG or PNG format</p>
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {uploadedImage && (
                      <div className="relative">
                        <img
                          src={uploadedImage || "/placeholder.svg"}
                          alt="Uploaded QR Code"
                          className="w-full h-48 object-cover rounded-lg border"
                        />
                        {isDecoding && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                            <div className="text-center text-white">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                              <p className="text-sm">Decoding QR Code...</p>
                            </div>
                          </div>
                        )}
                        {isDecoded && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full"
                          >
                            <CheckCircle size={20} />
                          </motion.div>
                        )}
                      </div>
                    )}

                    {!uploadedImage && isDecoding && (
                      <div className="bg-gray-100 rounded-lg p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
                        <p className="text-gray-600">Processing QR Code...</p>
                      </div>
                    )}

                    {!uploadedImage && isDecoded && (
                      <div className="bg-gray-100 rounded-lg p-8 text-center">
                        <Camera className="mx-auto mb-4 text-green-500" size={48} />
                        <p className="text-gray-600">QR Code scanned successfully!</p>
                      </div>
                    )}

                    {isDecoded && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-green-50 border border-green-200 rounded-lg p-4"
                      >
                        <h4 className="font-medium text-green-800 mb-2">QR Code Decoded Successfully!</h4>
                        <div className="space-y-1 text-sm text-green-700">
                          <p>
                            <span className="font-medium">Merchant:</span> {merchantData.name}
                          </p>
                          <p>
                            <span className="font-medium">ID:</span> {merchantData.id}
                          </p>
                          <p>
                            <span className="font-medium">Location:</span> {merchantData.location}
                          </p>
                        </div>
                      </motion.div>
                    )}

                    <div className="flex gap-2">
                      <Button onClick={() => setShowScanner(true)} variant="outline" className="flex-1">
                        <Camera className="mr-2" size={16} />
                        Scan Again
                      </Button>
                      <Button variant="outline" onClick={resetForm} className="flex-1 bg-transparent">
                        Reset
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Right Column - Payment Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <Card className="p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-black mb-6">Payment Details</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Merchant Name</label>
                  <input
                    type="text"
                    value={merchantData.name}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                    placeholder="Scan QR code to auto-fill"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Merchant ID</label>
                  <input
                    type="text"
                    value={merchantData.id}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                    placeholder="Scan QR code to auto-fill"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount to Pay (MYR)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={paymentAmount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="Enter amount in MYR"
                  />
                </div>

                {paymentAmount && usdcAmount && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
                  >
                    <div className="mb-2">
                      <span className="text-sm text-gray-600">You&apos;ll Pay</span>
                      <p className="text-2xl font-bold text-black">${usdcAmount} USDC</p>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">*Simulated Rate: 1 USDC = 4.88 MYR*</p>
                    <p className="text-xs text-gray-500">*Flat 2% platform fee will be applied*</p>
                  </motion.div>
                )}

                <Button
                  onClick={handleCreateRequest}
                  className="w-full bg-black text-white hover:bg-gray-800 transition-colors py-3 text-lg font-medium mt-6"
                  disabled={!isDecoded || !paymentAmount || !usdcAmount}
                >
                  Create Request
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }, [
    uploadedImage,
    isDecoding,
    isDecoded,
    merchantData,
    paymentAmount,
    usdcAmount,
    handleImageUpload,
    handleAmountChange,
    handleCreateRequest,
    resetForm,
    setShowScanner,
  ])

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
      merchantName: "MAY CHIN ENTERPRISE",
      amount: "RM 50.00",
      currency: "MYR",
      offeringAmount: "$10.25 USDC",
      id: 1,
    },
    {
      merchantName: "SINGAPORE COFFEE HOUSE",
      amount: "S$25.50",
      currency: "SGD",
      offeringAmount: "$18.75 USDC",
      id: 2,
    },
    {
      merchantName: "BANGKOK STREET FOOD",
      amount: "฿180.00",
      currency: "THB",
      offeringAmount: "$5.20 USDC",
      id: 3,
    },
    {
      merchantName: "KUALA LUMPUR MART",
      amount: "RM 75.00",
      currency: "MYR",
      offeringAmount: "$15.40 USDC",
      id: 4,
    },
    {
      merchantName: "THAI MASSAGE SPA",
      amount: "฿450.00",
      currency: "THB",
      offeringAmount: "$13.10 USDC",
      id: 5,
    },
    {
      merchantName: "SINGAPORE ELECTRONICS",
      amount: "S$120.00",
      currency: "SGD",
      offeringAmount: "$88.50 USDC",
      id: 6,
    },
  ]

  const handleFulfillRequest = (request: unknown) => {
    setSelectedRequest(request)
    setIsDialogOpen(true)
    setIsPaid(false)
  }

  const handleSubmitPayment = () => {
    if (isPaid && selectedRequest) {
      // Extract USDC amount from the offering amount (remove $ and USDC)
      const usdcAmount = selectedRequest.offeringAmount.replace(/[$\sUSDC]/g, "")

      // Show success toast with custom JSX content
      toast("Request completed successfully", {
        description: (
          <div>
            {usdcAmount} USDC has been credited to your wallet. View{" "}
            <button
              onClick={() => {
                // Handle wallet view navigation here
                console.log("Navigate to wallet")
              }}
              className="text-blue-600 underline hover:text-blue-800 transition-colors"
            >
              here
            </button>
          </div>
        ),
        duration: 5000,
      })

      // Handle payment submission logic here
      console.log("Payment submitted for:", selectedRequest)
      setIsDialogOpen(false)
      setSelectedRequest(null)
      setIsPaid(false)
    }
  }

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

          {/* Desktop: Horizontal Layout */}
          <div className="hidden md:grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="bg-yellow-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="text-black" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">1. Scan QR Code</h3>
              <p className="text-gray-600 text-sm">Snap a picture of the local merchant&apos;s QR code.</p>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="bg-yellow-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="text-black" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">2. Submit Your Currency</h3>
              <p className="text-gray-600 text-sm">Pay in your currency via USDC using Ramp.</p>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="bg-yellow-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="text-black" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">3. Live on OpenPay</h3>
              <p className="text-gray-600 text-sm">Your payment request is visible for volunteers to fulfill.</p>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="bg-yellow-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-black" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">4. Done!</h3>
              <p className="text-gray-600 text-sm">Merchant gets paid in local fiat, volunteer earns USDC.</p>
            </motion.div>
          </div>

          {/* Mobile: Vertical Layout */}
          <div className="md:hidden space-y-8 max-w-md mx-auto">
            <motion.div
              className="flex items-start gap-4"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="bg-yellow-400 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                <QrCode className="text-black" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-black mb-1">1. Scan QR Code</h3>
                <p className="text-gray-600 text-sm">Snap a picture of the local merchant&apos;s QR code.</p>
              </div>
            </motion.div>

            <motion.div
              className="flex items-start gap-4"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="bg-yellow-400 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                <DollarSign className="text-black" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-black mb-1">2. Submit Your Currency</h3>
                <p className="text-gray-600 text-sm">Pay in your currency via USDC using Ramp.</p>
              </div>
            </motion.div>

            <motion.div
              className="flex items-start gap-4"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="bg-yellow-400 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                <Globe className="text-black" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-black mb-1">3. Live on OpenPay</h3>
                <p className="text-gray-600 text-sm">Your payment request is visible for volunteers to fulfill.</p>
              </div>
            </motion.div>

            <motion.div
              className="flex items-start gap-4"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="bg-yellow-400 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="text-black" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-black mb-1">4. Done!</h3>
                <p className="text-gray-600 text-sm">Merchant gets paid in local fiat, volunteer earns USDC.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Create Request Section */}
      <section id="create-request" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Create Request</h2>
            <p className="text-gray-600 text-lg">Scan a merchant QR code and create your payment request</p>
          </div>

          <CreateRequestForm />
        </div>
      </section>

      {/* Live Requests Section */}
      <section id="request" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Live Requests</h2>
            <p className="text-gray-600 text-lg">Help fulfill payment requests and earn USDC</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requestExamples.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="border-2 hover:border-yellow-400 transition-all duration-300 hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="font-semibold text-black text-lg mb-2">{request.merchantName}</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Amount:</span>
                          <span className="font-semibold text-lg">{request.amount}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Currency:</span>
                          <span className="font-medium">{request.currency}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">You earn:</span>
                          <span className="font-semibold text-green-600">{request.offeringAmount}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleFulfillRequest(request)}
                      className="w-full bg-yellow-400 text-black hover:bg-yellow-500 transition-colors font-medium"
                    >
                      Fulfill Request
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
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

      {/* QR Scanner Modal */}
      <AnimatePresence>
        {showScanner && <QRScanner onScanSuccess={handleScanSuccess} onClose={() => setShowScanner(false)} />}
      </AnimatePresence>

      {/* Payment Confirmation Dialog */}
      <AnimatePresence>
        {isDialogOpen && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-black">Confirm Payment</DialogTitle>
              </DialogHeader>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {selectedRequest && (
                  <div className="text-center">
                    <h3 className="font-medium text-lg mb-2">{selectedRequest.merchantName}</h3>
                    <p className="text-gray-600 mb-4">Amount: {selectedRequest.amount}</p>
                  </div>
                )}

                {/* QR Code Placeholder */}
                <div className="flex justify-center">
                  <div className="w-48 h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <QrCode size={64} className="text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">QR Code</p>
                    </div>
                  </div>
                </div>

                <p className="text-center text-gray-600">Please scan and complete the payment to the merchant.</p>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="payment-confirmation"
                    checked={isPaid}
                    onCheckedChange={(checked) => setIsPaid(checked === true)}
                  />
                  <label
                    htmlFor="payment-confirmation"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I have paid the merchant
                  </label>
                </div>

                <Button
                  onClick={handleSubmitPayment}
                  disabled={!isPaid}
                  className="w-full bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Payment
                </Button>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Request Created Success Dialog */}
      <AnimatePresence>
        {isRequestCreated && (
          <Dialog open={isRequestCreated} onOpenChange={() => {}}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-black text-center">
                  Request Created Successfully!
                </DialogTitle>
              </DialogHeader>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="space-y-6 text-center"
              >
                <div className="flex justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle size={32} className="text-white" />
                  </motion.div>
                </div>

                <div>
                  <h3 className="font-medium text-lg mb-2">Your payment request is now live!</h3>
                  <p className="text-gray-600 mb-4">
                    Other users can now see and fulfill your request. You&apos;ll be notified when someone accepts it.
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="mb-2">
                    <span className="text-sm text-gray-600">Request Details:</span>
                    <p className="font-semibold text-black">{merchantData.name}</p>
                    <p className="text-sm text-gray-600">Amount: RM {paymentAmount}</p>
                    <p className="text-sm text-gray-600">You&apos;ll pay: ${usdcAmount} USDC</p>
                  </div>
                </div>

                {countdownActive && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">This dialog will close automatically in:</p>
                    <div className="text-2xl font-bold text-black">{countdown}s</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <motion.div
                        className="bg-yellow-400 h-2 rounded-full"
                        initial={{ width: "100%" }}
                        animate={{ width: "0%" }}
                        transition={{ duration: 30, ease: "linear" }}
                      />
                    </div>
                  </motion.div>
                )}

                <div className="flex gap-2">
                  <Button onClick={handleCloseNow} variant="outline" className="flex-1 bg-transparent">
                    Close Now
                  </Button>
                  <Button onClick={handleCreateAnother} className="flex-1 bg-yellow-400 text-black hover:bg-yellow-500">
                    Create Another
                  </Button>
                </div>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  )
}
