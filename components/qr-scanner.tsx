'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, Keyboard, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface QRScannerProps {
  onScan: (qrCode: string) => void
  isScanning: boolean
}

export function QRScanner({ onScan, isScanning }: QRScannerProps) {
  const [manualCode, setManualCode] = useState('')
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [error, setError] = useState('')
  const [validationError, setValidationError] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastScannedCodeRef = useRef<string>('')
  const isScanningRef = useRef<boolean>(false)
  const scanCooldownRef = useRef<boolean>(false)

  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [])

  const validateEKassaURL = (url: string): boolean => {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname === 'monitoring.e-kassa.gov.az'
    } catch {
      return false
    }
  }

  const handleScanResult = (qrData: string) => {
    console.log('[v0] QR detected:', qrData)
    
    if (!validateEKassaURL(qrData)) {
      setValidationError('Invalid QR code. Only e-Kassa receipts are accepted.')
      console.log('[v0] Invalid QR code - not from e-kassa.gov.az')
      
      setTimeout(() => {
        setValidationError('')
        isScanningRef.current = false
        scanCooldownRef.current = false
        if (isCameraActive) {
          startQRDetection()
        }
      }, 3000)
      return
    }
    
    console.log('[v0] Valid e-Kassa URL detected, processing...')
    setValidationError('')
    isScanningRef.current = true
    lastScannedCodeRef.current = qrData
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
    
    // Stop camera to prevent multiple scans
    stopCamera()
    
    onScan(qrData)
    
    scanCooldownRef.current = true
    setTimeout(() => {
      scanCooldownRef.current = false
      isScanningRef.current = false
    }, 2000)
  }

  const startCamera = async () => {
    console.log('[v0] Starting camera...')
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      
      console.log('[v0] Camera stream obtained')
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        console.log('[v0] Stream set to video element')
        
        videoRef.current.onloadedmetadata = async () => {
          console.log('[v0] Video metadata loaded')
          if (videoRef.current) {
            try {
              await videoRef.current.play()
              console.log('[v0] Video playing successfully')
              setIsCameraActive(true)
            } catch (err) {
              console.error('[v0] Video play error:', err)
              setError('Failed to start camera preview')
            }
          }
        }
      }
    } catch (err: any) {
      console.error('[v0] Camera error:', err)
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera access denied. Please allow camera permissions.')
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No camera found.')
      } else {
        setError('Failed to access camera.')
      }
    }
  }

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsCameraActive(false)
  }

  const handleStartScanning = () => {
    console.log('[v0] Start scanning clicked, camera active:', isCameraActive)
    if (!isCameraActive) {
      startCamera()
      return
    }
    
    startQRDetection()
  }

  const startQRDetection = () => {
    isScanningRef.current = false
    lastScannedCodeRef.current = ''
    setValidationError('')
    
    if ('BarcodeDetector' in window) {
      try {
        const barcodeDetector = new (window as any).BarcodeDetector({ 
          formats: ['qr_code', 'code_128', 'ean_13'] 
        })
        
        scanIntervalRef.current = setInterval(async () => {
          if (isScanningRef.current || scanCooldownRef.current) {
            return
          }
          
          if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            try {
              const barcodes = await barcodeDetector.detect(videoRef.current)
              if (barcodes.length > 0) {
                const qrData = barcodes[0].rawValue
                
                if (qrData === lastScannedCodeRef.current) {
                  return
                }
                
                handleScanResult(qrData)
              }
            } catch (err) {
              // Silent fail - keep trying
            }
          }
        }, 200)
      } catch (err) {
        console.warn('BarcodeDetector failed, falling back to jsQR:', err)
        startJSQRDetection()
      }
    } else {
      startJSQRDetection()
    }
  }
  
  const startJSQRDetection = () => {
    isScanningRef.current = false
    lastScannedCodeRef.current = ''
    
    import('jsqr').then(({ default: jsQR }) => {
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d', { willReadFrequently: true })
      
      if (!context) {
        setError('Failed to initialize QR scanner')
        return
      }
      
      scanIntervalRef.current = setInterval(() => {
        if (isScanningRef.current || scanCooldownRef.current) {
          return
        }
        
        if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
          try {
            canvas.width = videoRef.current.videoWidth
            canvas.height = videoRef.current.videoHeight
            context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'dontInvert',
            })
            
            if (code && code.data) {
              if (code.data === lastScannedCodeRef.current) {
                return
              }
              
              handleScanResult(code.data)
            }
          } catch (err) {
            // Silent fail - keep trying
          }
        }
      }, 200)
    }).catch((err) => {
      console.error('jsQR import failed:', err)
      setError('QR scanner library failed to load.')
    })
  }

  const handleManualScan = () => {
    if (manualCode.trim()) {
      if (!validateEKassaURL(manualCode.trim())) {
        setValidationError('Invalid URL. Only e-Kassa receipt URLs are accepted.')
        return
      }
      setValidationError('')
      onScan(manualCode)
      setManualCode('')
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto px-4">
      {validationError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}

      <div className="relative border-4 border-dashed border-gray-300 rounded-3xl overflow-hidden bg-gray-50 w-full" style={{ minHeight: '400px' }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
          style={{ minHeight: '400px' }}
        />
        
        {!isCameraActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Camera className="h-24 w-24 text-gray-400 mb-4" />
            <p className="text-gray-500 text-center px-4">
              {error || 'Starting camera...'}
            </p>
          </div>
        )}
        
        {isCameraActive && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-64 h-64 md:w-72 md:h-72">
              <div className="absolute inset-0 border-4 border-white/80 rounded-2xl" />
              <div className="absolute -top-2 -left-2 w-12 h-12 border-t-4 border-l-4 border-emerald-500 rounded-tl-2xl" />
              <div className="absolute -top-2 -right-2 w-12 h-12 border-t-4 border-r-4 border-emerald-500 rounded-tr-2xl" />
              <div className="absolute -bottom-2 -left-2 w-12 h-12 border-b-4 border-l-4 border-emerald-500 rounded-bl-2xl" />
              <div className="absolute -bottom-2 -right-2 w-12 h-12 border-b-4 border-r-4 border-emerald-500 rounded-br-2xl" />
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-gray-600 font-medium">
        Position QR code from your e-Kassa receipt in the frame
      </p>

      <Button
        onClick={handleStartScanning}
        disabled={isScanning}
        size="lg"
        className="w-full h-16 text-lg font-semibold rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white"
      >
        {isScanning ? 'Scanning...' : 'Start Scanning'}
      </Button>

      <div className="bg-emerald-50 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3 mb-3">
          <Keyboard className="h-5 w-5 text-emerald-600" />
          <p className="text-sm font-semibold text-emerald-900">
            Or enter e-Kassa URL manually
          </p>
        </div>
        <div className="flex gap-3">
          <Input
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="https://monitoring.e-kassa.gov.az/..."
            disabled={isScanning}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleManualScan()
              }
            }}
            className="flex-1 h-12 rounded-xl border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
          />
          <Button 
            onClick={handleManualScan}
            disabled={!manualCode.trim() || isScanning} 
            size="lg"
            className="h-12 px-6 bg-emerald-600 hover:bg-emerald-700 rounded-xl"
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  )
}
