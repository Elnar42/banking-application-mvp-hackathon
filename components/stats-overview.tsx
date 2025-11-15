'use client'

import { Card } from '@/components/ui/card'
import { Leaf, Clock, CheckCircle2, TrendingDown } from 'lucide-react'

interface StatsOverviewProps {
  stats: {
    total: number
    pending: number
    approved: number
    totalCO2: number
  }
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="p-4 hover:shadow-md transition-all rounded-2xl border-emerald-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">Total Scans</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100">
            <Leaf className="h-6 w-6 text-emerald-600" />
          </div>
        </div>
      </Card>

      <Card className="p-4 hover:shadow-md transition-all rounded-2xl border-emerald-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">Pending</p>
            <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100">
            <Clock className="h-6 w-6 text-amber-500" />
          </div>
        </div>
      </Card>

      <Card className="p-4 hover:shadow-md transition-all rounded-2xl border-emerald-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">Approved</p>
            <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </Card>

      <Card className="p-4 hover:shadow-md transition-all rounded-2xl border-emerald-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">Total CO₂</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalCO2.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground font-medium">kg</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100">
            <TrendingDown className="h-6 w-6 text-emerald-600" />
          </div>
        </div>
      </Card>
    </div>
  )
}
