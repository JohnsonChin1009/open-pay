"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { motion } from "framer-motion"

interface QRScannerProps {
  onScanSuccess: (data: string) => void
  onClose: () => void
}

// Improved QR code detection function
const detectQRCode = (imageData: ImageData): string | null => {
  const { data, width, height } = imageData

  // Sample a smaller region in the center for better performance
  const centerX = Math.floor(width / 2)
  const centerY = Math.floor(height / 2)
  const sampleSize = Math.min(200, Math.floor(Math.min(width, height) / 3))

  let darkPixels = 0
  let lightPixels = 0
  let totalPixels = 0
  let edgeCount = 0

  // Sample pixels in the center region
  for (let y = centerY - sampleSize / 2; y < centerY + sampleSize / 2; y += 2) {
    for (let x = centerX - sampleSize / 2; x < centerX + sampleSize / 2; x += 2) {
      if (x >= 0 && x < width && y >= 0 && y < height) {
        const index = (y * width + x) * 4
        const r = data[index]
        const g = data[index + 1]
        const b = data[index + 2]
        const brightness = (r + g + b) / 3

        totalPixels++

        if (brightness < 80) {
          darkPixels++
        } else if (brightness > 180) {
          lightPixels++
        }

        // Check for edges (high contrast between adjacent pixels)
        if (x < width - 2 && y < height - 2) {
          const nextIndex = (y * width + (x + 2)) * 4
          const nextBrightness = (data[nextIndex] + data[nextIndex + 1] + data[nextIndex + 2]) / 3
          if (Math.abs(brightness - nextBrightness) > 100) {
            edgeCount++
          }
        }
      }
    }
  }

  if (totalPixels === 0) return null

  const darkRatio = darkPixels / totalPixels
  const lightRatio = lightPixels / totalPixels
  const edgeRatio = edgeCount / totalPixels

  // More lenient detection criteria
  const hasGoodContrast = darkRatio > 0.15 && lightRatio > 0.15
  const hasEnoughEdges = edgeRatio > 0.1
  const hasQRPattern = hasGoodContrast && hasEnoughEdges

  console.log("Detection stats:", {
    darkRatio: darkRatio.toFixed(3),
    lightRatio: lightRatio.toFixed(3),
    edgeRatio: edgeRatio.toFixed(3),
    hasQRPattern,
  })

  if (hasQRPattern) {
    // Simulate different types of QR codes
    const qrTypes = [
      "https://duitnow.my/pay?merchant=MAY_CHIN_ENTERPRISE&id=2332896031",
      "paynow://pay?merchant=SINGAPORE_COFFEE&id=1234567890",
      "promptpay://pay?merchant=BANGKOK_STREET&id=9876543210",
    ]
    return qrTypes[Math.floor(Math.random() * qrTypes.length)]
  }

  return null
}

export default function QRScanner({ onScanSuccess, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [scanningStatus, setScanningStatus] = useState<string>("Position QR code in frame")
  const [debugInfo, setDebugInfo] = useState<string>("")
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [scanAttempts, setScanAttempts] = useState(0)

  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    try {
      setError(null)
      setScanningStatus("Starting camera...")

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Try back camera first
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })

      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.play()
        setIsScanning(true)
        setScanningStatus("Position QR code in frame")
        startScanning()
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      // Try with front camera if back camera fails
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user", // Front camera
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        })

        setStream(mediaStream)
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
          videoRef.current.play()
          setIsScanning(true)
          setScanningStatus("Using front camera - Position QR code in frame")
          startScanning()
        }
      } catch (frontCamErr) {
        setError("Unable to access camera. Please ensure camera permissions are granted.")
        console.error("Error accessing front camera:", frontCamErr)
      }
    }
  }

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }

    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setIsScanning(false)
  }

  const startScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
    }

    scanIntervalRef.current = setInterval(() => {
      if (videoRef.current && canvasRef.current && isScanning) {
        const video = videoRef.current
        const canvas = canvasRef.current
        const context = canvas.getContext("2d")

        if (context && video.readyState === video.HAVE_ENOUGH_DATA) {
          // Set canvas size to match video
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight

          // Draw current video frame to canvas
          context.drawImage(video, 0, 0, canvas.width, canvas.height)

          // Get image data for QR detection
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height)

          // Try to detect QR code
          const qrData = detectQRCode(imageData)

          setScanAttempts((prev) => prev + 1)
          setDebugInfo(`Scan attempts: ${scanAttempts + 1}`)

          if (qrData) {
            setScanningStatus("QR Code detected! Processing...")
            setIsScanning(false)

            // Stop scanning
            if (scanIntervalRef.current) {
              clearInterval(scanIntervalRef.current)
              scanIntervalRef.current = null
            }

            // Simulate processing delay
            setTimeout(() => {
              onScanSuccess(qrData)
              stopCamera()
            }, 1500)
          } else {
            // Update status based on scan attempts
            if (scanAttempts > 10) {
              setScanningStatus("Try moving closer or adjusting lighting")
            } else if (scanAttempts > 5) {
              setScanningStatus("Looking for QR code patterns...")
            }
          }
        }
      }
    }, 300) // Slightly slower for better performance
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-black">Scan QR Code</h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
            <X size={20} />
          </Button>
        </div>

        {error ? (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={startCamera} variant="outline">
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              <video ref={videoRef} className="w-full h-full object-cover" playsInline muted autoPlay />

              {/* Scanning overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="border-2 border-yellow-400 w-48 h-48 rounded-lg relative">
                  {/* Corner brackets */}
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-yellow-400"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-yellow-400"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-yellow-400"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-yellow-400"></div>

                  {/* Scanning line animation - only show when actively scanning */}
                  {isScanning && (
                    <motion.div
                      className="absolute left-0 right-0 h-0.5 bg-yellow-400 shadow-lg"
                      animate={{
                        y: [0, 192, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                    />
                  )}

                  {/* Processing overlay */}
                  {!isScanning && scanningStatus.includes("Processing") && (
                    <div className="absolute inset-0 bg-yellow-400 bg-opacity-20 rounded-lg flex items-center justify-center">
                      <div className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-medium">
                        Processing...
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Status indicator */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg text-center">
                  <p className="text-sm">{scanningStatus}</p>
                  {isScanning && (
                    <div className="flex items-center justify-center mt-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="ml-2 text-xs text-green-400">Scanning...</span>
                    </div>
                  )}
                  {debugInfo && <p className="text-xs text-gray-400 mt-1">{debugInfo}</p>}
                </div>
              </div>
            </div>

            <div className="text-center space-y-2">
              <p className="text-gray-600 text-sm mb-2">
                Hold your device steady and ensure the QR code is clearly visible
              </p>
              <p className="text-xs text-gray-500 mb-3">
                Supported: PayNow, DuitNow, PromptPay, and other payment QR codes
              </p>
            </div>

            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}
      </div>
    </motion.div>
  )
}
