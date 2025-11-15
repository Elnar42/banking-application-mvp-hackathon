'use client'

import { useState, useEffect } from 'react'
import { ScannedItem } from '@/lib/data-store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatsOverview } from '@/components/stats-overview'
import { ArrowLeft, CheckCircle2, Clock } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'

export default function AdminDashboard() {
  const [items, setItems] = useState<ScannedItem[]>([])
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, totalCO2: 0 })
  const { toast } = useToast()

  const fetchData = async () => {
    try {
      const [itemsRes, statsRes] = await Promise.all([
        fetch('/api/items'),
        fetch('/api/stats'),
      ])

      const itemsData = await itemsRes.json()
      const statsData = await statsRes.json()

      setItems(itemsData.items)
      setStats(statsData.stats)
    } catch (error) {
      console.error('[v0] Failed to fetch data:', error)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 2000)
    return () => clearInterval(interval)
  }, [])

  const handleApprove = async (itemId: string) => {
    try {
      const response = await fetch('/api/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'Item Approved',
          description: `CO₂ calculated: ${data.item.co2.toFixed(1)} kg`,
        })
        fetchData()
      } else {
        toast({
          title: 'Approval Failed',
          description: data.error || 'Failed to approve item',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('[v0] Approval failed:', error)
      toast({
        title: 'Error',
        description: 'Failed to approve item',
        variant: 'destructive',
      })
    }
  }

  const pendingItems = items.filter((item) => item.status === 'pending')
  const approvedItems = items.filter((item) => item.status === 'approved')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="container flex h-16 items-center gap-4 px-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="hover:bg-blue-50">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to App
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <img src="/eco-logo-icon.svg" alt="Eco Logo" className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">Approve items and manage CO₂ data</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container max-w-6xl px-4 py-8">
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">System Overview</h2>
            <p className="text-muted-foreground">Monitor and approve carbon footprint calculations</p>
          </div>

          <StatsOverview stats={stats} />

          {/* Pending Items */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              <h2 className="text-lg font-semibold">Pending Approvals</h2>
              <Badge variant="outline" className="border-warning text-warning">
                {pendingItems.length}
              </Badge>
            </div>

            {pendingItems.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                No pending items to approve
              </Card>
            ) : (
              <div className="space-y-3">
                {pendingItems.map((item) => (
                  <Card key={item.id} className="p-5 hover:shadow-md transition-shadow border-gray-200">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="font-medium">{item.storeName}</span>
                            <span>•</span>
                            <span>{item.category}</span>
                            <span>•</span>
                            <span>Qty: {item.quantity}</span>
                            <span>•</span>
                            <span className="font-semibold text-gray-700">₼{item.price.toFixed(2)}</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Scanned: {new Date(item.scannedAt).toLocaleString()}
                        </p>
                      </div>
                      <Button onClick={() => handleApprove(item.id)} size="sm" className="bg-emerald-500 hover:bg-emerald-600 rounded-2xl">
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Approved Items */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <h2 className="text-lg font-semibold">Approved Items</h2>
              <Badge variant="outline" className="border-success text-success">
                {approvedItems.length}
              </Badge>
            </div>

            {approvedItems.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                No approved items yet
              </Card>
            ) : (
              <div className="space-y-3">
                {approvedItems.slice().reverse().map((item) => (
                  <Card key={item.id} className="p-5 hover:shadow-md transition-shadow border-gray-200">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="font-medium">{item.storeName}</span>
                            <span>•</span>
                            <span>{item.category}</span>
                            <span>•</span>
                            <span>Qty: {item.quantity}</span>
                            <span>•</span>
                            <span className="font-semibold text-gray-700">₼{item.price.toFixed(2)}</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Approved: {item.approvedAt && new Date(item.approvedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-emerald-600">{item.co2?.toFixed(1)}</div>
                        <div className="text-xs text-muted-foreground font-medium">kg CO₂</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Toaster component for notifications */}
      <Toaster />
    </div>
  )
}
