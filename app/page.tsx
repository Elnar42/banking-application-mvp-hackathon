'use client'

import { useState, useEffect } from 'react'
import { QRScanner } from '@/components/qr-scanner'
import { ReceiptDisplay, ReceiptData } from '@/components/receipt-display'
import { ScannedItemsList } from '@/components/scanned-items-list'
import { MilestonesView } from '@/components/milestones-view'
import { Recommendations } from '@/components/recommendations'
import { ScannedItem, Badge, Milestone } from '@/lib/data-store'
import { Button } from '@/components/ui/button'
import { Home, ScanLine, Award, HistoryIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { cn } from '@/lib/utils'
import { TrendingDown } from 'lucide-react'

type NavSection = 'home' | 'scan' | 'badges' | 'history'

export default function BankingApp() {
  const [items, setItems] = useState<ScannedItem[]>([])
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([])
  const [availableBadges, setAvailableBadges] = useState<Badge[]>([])
  const [continuingBadges, setContinuingBadges] = useState<{ badge: Badge; milestone: Milestone }[]>([])
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, totalCO2: 0 })
  const [isScanning, setIsScanning] = useState(false)
  const [activeSection, setActiveSection] = useState<NavSection>('home')
  const [scannedReceipt, setScannedReceipt] = useState<ReceiptData | null>(null)
  const { toast } = useToast()

  const fetchData = async () => {
    try {
      const [itemsRes, earnedBadgesRes, availableBadgesRes, continuingBadgesRes, statsRes] = await Promise.all([
        fetch('/api/items'),
        fetch('/api/badges'),
        fetch('/api/badges/available'),
        fetch('/api/badges/continuing'),
        fetch('/api/stats'),
      ])

      const itemsData = await itemsRes.json()
      const earnedBadgesData = await earnedBadgesRes.json()
      const availableBadgesData = await availableBadgesRes.json()
      const continuingBadgesData = await continuingBadgesRes.json()
      const statsData = await statsRes.json()

      if (itemsData.items && Array.isArray(itemsData.items)) {
        setItems(itemsData.items)
      }
      if (earnedBadgesData.badges && Array.isArray(earnedBadgesData.badges)) {
        setEarnedBadges(earnedBadgesData.badges)
      }
      if (availableBadgesData.badges && Array.isArray(availableBadgesData.badges)) {
        setAvailableBadges(availableBadgesData.badges)
      }
      if (continuingBadgesData.badges && Array.isArray(continuingBadgesData.badges)) {
        setContinuingBadges(continuingBadgesData.badges)
      }
      if (statsData.stats && typeof statsData.stats === 'object') {
        const newStats = { ...statsData.stats }
        if (itemsData.items && itemsData.items.length > 0) {
          const calculatedCO2 = itemsData.items
            .filter((item: ScannedItem) => item.status === 'approved' && item.co2 !== null && typeof item.co2 === 'number')
            .reduce((sum: number, item: ScannedItem) => sum + (Number(item.co2) || 0), 0)
          
          newStats.totalCO2 = calculatedCO2
        }
        setStats(newStats)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleScan = async (qrCode: string) => {
    if (!qrCode || !qrCode.trim()) {
      toast({
        title: 'Invalid QR Code',
        description: 'Please scan a valid QR code or enter one manually.',
        variant: 'destructive',
      })
      return
    }

    setIsScanning(true)
    console.log('[v0] Starting scan for QR:', qrCode)
    
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode: qrCode.trim() }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process QR code')
      }

      console.log('[v0] Scan response:', data)

      if (data.receipt) {
        console.log('[v0] Setting receipt data:', data.receipt)
        setScannedReceipt(data.receipt)
        toast({
          title: '✅ Receipt Scanned!',
          description: `Found ${data.receipt.items.length} items. Total: ${data.receipt.total.toFixed(2)} ₼`,
        })
      } else {
        console.log('[v0] No receipt in response, refreshing data')
        const calculatedCO2 = data.totalCO2 || 0
        await fetchData()
        toast({
          title: '✅ Receipt Processed!',
          description: `CO₂ footprint calculated: ${calculatedCO2.toFixed(1)} kg`,
        })
        setActiveSection('home')
      }
    } catch (error: any) {
      console.error('[v0] Scan error:', error)
      if (error.name === 'AbortError') {
        toast({
          title: 'Request Timeout',
          description: 'The request took too long. Please try again.',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Error',
          description: error.message || 'Failed to process receipt. Please try again.',
          variant: 'destructive',
        })
      }
    } finally {
      setIsScanning(false)
    }
  }

  const handleReceiptClose = async () => {
    setScannedReceipt(null)
    await fetchData()
    setActiveSection('home')
  }

  const handleStartBadge = async (badgeId: string) => {
    try {
      const response = await fetch('/api/badges/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ badgeId }),
      })
      
      if (response.ok) {
        toast({
          title: 'Badge Started!',
          description: 'Start scanning receipts to earn this badge.',
        })
        
        await fetchData()
      }
    } catch (error) {
      console.error('Failed to start badge:', error)
      toast({
        title: 'Error',
        description: 'Failed to start badge. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="h-16 md:h-20 bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-50 border-b border-emerald-100/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-sm">
              <img src="/eco-logo-icon.svg" alt="Eco Logo" className="w-6 h-6 md:w-7 md:h-7" />
            </div>
            <div>
              <h1 className="font-semibold text-lg md:text-2xl text-gray-900 tracking-tight">EcoTrack</h1>
              <p className="hidden md:block text-xs text-emerald-600 font-medium">Carbon Footprint Tracker</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-emerald-700 text-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
            <span className="font-medium">Active Tracking</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="hidden md:block w-64 bg-white border-r border-gray-200 shadow-sm">
          <nav className="space-y-2 p-4">
            <button
              onClick={() => setActiveSection('home')}
              className={cn(
                "desktop-nav-button",
                activeSection === 'home' && "desktop-nav-button-active"
              )}
            >
              <Home className="h-5 w-5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveSection('scan')}
              className={cn(
                "desktop-nav-button",
                activeSection === 'scan' && "desktop-nav-button-active"
              )}
            >
              <ScanLine className="h-5 w-5" />
              <span>Scan Receipt</span>
            </button>

            <button
              onClick={() => setActiveSection('badges')}
              className={cn(
                "desktop-nav-button",
                activeSection === 'badges' && "desktop-nav-button-active"
              )}
            >
              <Award className="h-5 w-5" />
              <span>Badges</span>
            </button>

            <button
              onClick={() => setActiveSection('history')}
              className={cn(
                "desktop-nav-button",
                activeSection === 'history' && "desktop-nav-button-active"
              )}
            >
              <HistoryIcon className="h-5 w-5" />
              <span>History</span>
            </button>
          </nav>
        </aside>

        <main className="flex-1 overflow-auto bg-gray-50 pb-20 md:pb-0">
          {activeSection === 'home' && (
            <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2 md:mb-3 text-gray-900">Dashboard</h2>
                <p className="text-sm md:text-base text-muted-foreground">Monitor your carbon footprint and track your environmental impact</p>
              </div>

              <div className="desktop-card-elevated bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600 text-white overflow-hidden border-0 shadow-lg">
                <div className="p-6 md:p-8">
                  <div className="flex items-start justify-between mb-6 md:mb-8">
                    <div>
                      <p className="text-sm md:text-base opacity-95 mb-2 md:mb-3 font-medium">Total Carbon Footprint</p>
                      <h2 className="text-5xl md:text-7xl font-bold tracking-tight">
                        {(typeof stats.totalCO2 === 'number' ? stats.totalCO2 : 0).toFixed(1)}
                      </h2>
                      <p className="text-base md:text-lg opacity-95 mt-2 md:mt-3 font-medium">kg CO₂</p>
                    </div>
                    <div className="bg-white/25 p-4 md:p-5 rounded-2xl backdrop-blur-sm">
                      <TrendingDown className="h-8 w-8 md:h-12 md:w-12" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm md:text-base bg-white/20 rounded-2xl px-4 md:px-5 py-2.5 md:py-3 backdrop-blur-sm w-fit">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                    <span className="font-medium">Live tracking • Real-time updates</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 md:gap-6">
                <div className="desktop-card text-center p-4 md:p-6 hover:border-emerald-200 transition-all">
                  <div className="text-3xl md:text-5xl font-bold text-emerald-600 mb-1 md:mb-2">{stats.total}</div>
                  <div className="text-xs md:text-sm text-muted-foreground font-medium">Total Receipts</div>
                </div>
                <div className="desktop-card text-center p-4 md:p-6 hover:border-amber-200 transition-all">
                  <div className="text-3xl md:text-5xl font-bold text-amber-500 mb-1 md:mb-2">{stats.pending}</div>
                  <div className="text-xs md:text-sm text-muted-foreground font-medium">Pending</div>
                </div>
                <div className="desktop-card text-center p-4 md:p-6 hover:border-green-200 transition-all">
                  <div className="text-3xl md:text-5xl font-bold text-green-600 mb-1 md:mb-2">{stats.approved}</div>
                  <div className="text-xs md:text-sm text-muted-foreground font-medium">Approved</div>
                </div>
              </div>

              {items.length > 0 && (
                <div className="mt-6 md:mt-8">
                  <Recommendations items={items} totalCO2={stats.totalCO2} />
                </div>
              )}

              {items.length === 0 && (
                <div className="desktop-card text-center p-8 md:p-12 mt-6 md:mt-8 border-2 border-dashed border-emerald-200">
                  <div className="bg-emerald-50 w-20 h-20 md:w-24 md:h-24 rounded-3xl flex items-center justify-center mx-auto mb-4 md:mb-6">
                    <ScanLine className="h-10 w-10 md:h-12 md:w-12 text-emerald-600" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold mb-2 text-gray-900">Start Your Journey</h3>
                  <p className="text-sm md:text-base text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
                    Begin tracking your carbon footprint by scanning your first receipt. Every scan helps you understand your environmental impact.
                  </p>
                  <Button
                    onClick={() => setActiveSection('scan')}
                    size="lg"
                    className="h-11 md:h-12 px-6 md:px-8 text-sm md:text-base bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl shadow-sm"
                  >
                    <ScanLine className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                    Scan Receipt
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeSection === 'scan' && (
            <div className="max-w-2xl mx-auto p-4 md:p-8">
              {scannedReceipt ? (
                <>
                  <div className="text-center mb-6 md:mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold mb-2 md:mb-3 text-gray-900">Receipt Details</h2>
                    <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto">
                      Review your scanned receipt information
                    </p>
                  </div>
                  <ReceiptDisplay receipt={scannedReceipt} onClose={handleReceiptClose} />
                </>
              ) : (
                <>
                  <div className="text-center mb-6 md:mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold mb-2 md:mb-3 text-gray-900">Scan Receipt</h2>
                    <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto">
                      Scan e-Kassa QR code from your receipt to track your carbon footprint
                    </p>
                  </div>
                  <QRScanner onScan={handleScan} isScanning={isScanning} />
                </>
              )}
            </div>
          )}

          {activeSection === 'badges' && (
            <MilestonesView
              availableBadges={availableBadges}
              earnedBadges={earnedBadges}
              continuingBadges={continuingBadges}
              onStartBadge={handleStartBadge}
            />
          )}

          {activeSection === 'history' && (
            <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-4 md:space-y-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">Transaction History</h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  View all your scanned receipts and carbon footprint calculations
                </p>
              </div>
              <ScannedItemsList items={items.slice().reverse()} />
            </div>
          )}
        </main>
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200/50 flex items-center justify-around h-20 px-2 z-50">
        <button
          onClick={() => setActiveSection('home')}
          className={cn(
            "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all duration-300",
            activeSection === 'home' ? "text-emerald-600" : "text-gray-400"
          )}
        >
          <Home className={cn("h-6 w-6 transition-transform", activeSection === 'home' && "scale-110")} />
          <span className={cn("text-xs font-medium", activeSection === 'home' && "font-semibold text-emerald-600")}>Home</span>
        </button>

        <button
          onClick={() => setActiveSection('scan')}
          className={cn(
            "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all duration-300",
            activeSection === 'scan' ? "text-emerald-600" : "text-gray-400"
          )}
        >
          <ScanLine className={cn("h-6 w-6 transition-transform", activeSection === 'scan' && "scale-110")} />
          <span className={cn("text-xs font-medium", activeSection === 'scan' && "font-semibold text-emerald-600")}>Scan</span>
        </button>

        <button
          onClick={() => setActiveSection('badges')}
          className={cn(
            "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all duration-300",
            activeSection === 'badges' ? "text-emerald-600" : "text-gray-400"
          )}
        >
          <Award className={cn("h-6 w-6 transition-transform", activeSection === 'badges' && "scale-110")} />
          <span className={cn("text-xs font-medium", activeSection === 'badges' && "font-semibold text-emerald-600")}>Badges</span>
        </button>

        <button
          onClick={() => setActiveSection('history')}
          className={cn(
            "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all duration-300",
            activeSection === 'history' ? "text-emerald-600" : "text-gray-400"
          )}
        >
          <HistoryIcon className={cn("h-6 w-6 transition-transform", activeSection === 'history' && "scale-110")} />
          <span className={cn("text-xs font-medium", activeSection === 'history' && "font-semibold text-emerald-600")}>History</span>
        </button>
      </nav>

      <Toaster />
    </div>
  )
}
