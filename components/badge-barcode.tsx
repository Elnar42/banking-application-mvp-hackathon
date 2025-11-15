'use client'

import { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { QrCode, Eye, EyeOff } from 'lucide-react'

interface BadgeBarcodeProps {
  badgeId: string
  badgeName: string
  className?: string
}

// Generate consistent random seed from badge ID
function seedRandom(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i)
    hash = hash & hash
  }
  return Math.abs(hash)
}

export function BadgeBarcode({ badgeId, badgeName, className }: BadgeBarcodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [showBarcode, setShowBarcode] = useState(false)

  useEffect(() => {
    if (!canvasRef.current || !showBarcode) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 160
    canvas.height = 320

    // Clear canvas
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Generate deterministic random pattern from badge ID
    const seedValue = seedRandom(badgeId)
    let currentSeed = seedValue
    const random = () => {
      const x = Math.sin(currentSeed++) * 10000
      return x - Math.floor(x)
    }

    // Create vertical barcode pattern
    const barHeight = 3
    let y = 20

    ctx.fillStyle = '#000000'

    // Start pattern
    ctx.fillRect(15, y, 130, barHeight * 2)
    y += barHeight * 3
    ctx.fillRect(15, y, 130, barHeight)
    y += barHeight * 2

    // Generate random bar pattern (top to bottom)
    for (let i = 0; i < 50; i++) {
      const height = barHeight * (random() > 0.5 ? 2 : 1)
      const width = 130 * (0.3 + random() * 0.7)
      
      if (y < canvas.height - 40) {
        ctx.fillRect(15, y, width, height)
        y += height + barHeight
      }
    }

    // Stop pattern
    ctx.fillRect(15, y, 130, barHeight * 2)
    y += barHeight * 2
    ctx.fillRect(15, y, 130, barHeight)

    // Add barcode number text
    const barcodeNumber = `${seedValue.toString().slice(0, 12)}`
    ctx.fillStyle = '#000000'
    ctx.font = 'bold 14px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(barcodeNumber, canvas.width / 2, canvas.height - 15)
  }, [badgeId, showBarcode])

  return (
    <div className={className}>
      <div className="flex flex-col items-center gap-4">
        <Button
          onClick={() => setShowBarcode(!showBarcode)}
          variant={showBarcode ? "outline" : "default"}
          className={showBarcode 
            ? "w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50" 
            : "w-full bg-emerald-500 hover:bg-emerald-600 text-white"
          }
        >
          {showBarcode ? (
            <>
              <EyeOff className="h-4 w-4 mr-2" />
              Hide Barcode
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Show Barcode
            </>
          )}
        </Button>

        {showBarcode && (
          <Card className="p-6 rounded-2xl border-2 border-emerald-200 bg-white w-full max-w-sm mx-auto">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center">
                <QrCode className="h-6 w-6 text-white" />
              </div>
              <div className="text-center">
                <p className="text-base font-bold text-gray-900 mb-1">Badge Barcode</p>
                <p className="text-sm text-muted-foreground">Show this at participating stores</p>
              </div>
              <div className="bg-white p-4 rounded-lg border-2 border-gray-300 w-full max-w-[200px] flex justify-center overflow-hidden">
                <canvas
                  ref={canvasRef}
                  className="w-full h-auto"
                  style={{ 
                    imageRendering: 'crisp-edges',
                    maxWidth: '160px',
                    maxHeight: '320px'
                  }}
                />
              </div>
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                Present this barcode at checkout to redeem your <span className="font-semibold text-emerald-600">{badgeName}</span> benefits
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
