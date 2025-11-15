'use client'

import { Card } from '@/components/ui/card'
import { Badge as BadgeUI } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScannedItem, Badge, Milestone } from '@/lib/data-store'
import { Leaf, TrendingDown, Clock, CheckCircle2, Award, ChevronRight } from 'lucide-react'

interface DashboardViewProps {
  stats: {
    total: number
    pending: number
    approved: number
    totalCO2: number
  }
  items: ScannedItem[]
  milestones: Milestone[]
  badges: Badge[]
  onBadgeClick: (badge: Badge) => void
}

export function DashboardView({ stats, items, milestones, badges, onBadgeClick }: DashboardViewProps) {
  const recentItems = items.slice().reverse().slice(0, 3)
  const earnedBadges = badges.filter(b => b.earnedAt)
  const nextMilestone = milestones.find(m => !m.completed)

  const displayCO2 = typeof stats.totalCO2 === 'number' ? stats.totalCO2 : 0

  return (
    <div className="space-y-4 p-4">
      {/* CO2 Impact Card */}
      <Card className="bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600 text-white p-6 border-0 shadow-md rounded-2xl">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm opacity-95 mb-1 font-medium">Total Carbon Footprint</p>
            <h2 className="text-4xl font-bold">{displayCO2.toFixed(1)}</h2>
            <p className="text-sm opacity-95 mt-1 font-medium">kg CO₂</p>
          </div>
          <div className="bg-white/25 p-3 rounded-2xl backdrop-blur-sm">
            <TrendingDown className="h-8 w-8" />
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm bg-white/20 rounded-2xl px-3 py-2 backdrop-blur-sm w-fit">
          <div className="w-2 h-2 rounded-full bg-white"></div>
          <span className="opacity-95 font-medium">Live tracking</span>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 text-center hover:shadow-md transition-all rounded-2xl">
          <div className="text-2xl font-bold text-emerald-600 mb-1">{stats.total}</div>
          <div className="text-xs text-muted-foreground font-medium">Total Scans</div>
        </Card>
        <Card className="p-4 text-center hover:shadow-md transition-all rounded-2xl">
          <div className="text-2xl font-bold text-amber-500 mb-1">{stats.pending}</div>
          <div className="text-xs text-muted-foreground font-medium">Pending</div>
        </Card>
        <Card className="p-4 text-center hover:shadow-md transition-all rounded-2xl">
          <div className="text-2xl font-bold text-green-600 mb-1">{stats.approved}</div>
          <div className="text-xs text-muted-foreground font-medium">Approved</div>
        </Card>
      </div>

      {/* Next Milestone */}
      {nextMilestone && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Award className="h-5 w-5 text-emerald-600" />
            <h3 className="font-semibold text-gray-900">Next Milestone</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>{nextMilestone.name}</span>
              <span className="text-muted-foreground">
                {nextMilestone.progress}/{nextMilestone.target}
              </span>
            </div>
            <Progress value={(nextMilestone.progress / nextMilestone.target) * 100} />
            <p className="text-xs text-muted-foreground">{nextMilestone.description}</p>
          </div>
        </Card>
      )}

      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Your Badges</h3>
            <span className="text-sm text-muted-foreground">{earnedBadges.length} earned</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {earnedBadges.slice(0, 4).map((badge) => (
              <button
                key={badge.id}
                onClick={() => onBadgeClick(badge)}
                className="flex flex-col items-center gap-2 p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
              >
                <div className="text-3xl">{badge.icon}</div>
                <span className="text-xs font-medium text-center leading-tight">{badge.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {recentItems.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Recent Activity</h3>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
          <Card className="divide-y">
            {recentItems.map((item) => (
              <div key={item.id} className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{item.name}</span>
                    {item.status === 'pending' ? (
                      <BadgeUI variant="outline" className="border-warning text-warning h-5 text-xs">
                        <Clock className="mr-1 h-3 w-3" />
                        Pending
                      </BadgeUI>
                    ) : (
                      <BadgeUI variant="outline" className="border-success text-success h-5 text-xs">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Approved
                      </BadgeUI>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{item.storeName}</p>
                </div>
                <div className="text-right">
                  {item.co2 !== null && item.co2 !== undefined && typeof item.co2 === 'number' ? (
                    <>
                      <div className="font-bold text-emerald-600">{item.co2.toFixed(1)}</div>
                      <div className="text-xs text-muted-foreground font-medium">kg CO₂</div>
                    </>
                  ) : (
                    <div className="text-xs text-muted-foreground">Calculating...</div>
                  )}
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* Empty State */}
      {items.length === 0 && (
        <Card className="p-8 text-center border-2 border-dashed border-emerald-200 rounded-2xl">
          <div className="flex flex-col items-center gap-4">
            <div className="bg-emerald-50 p-4 rounded-3xl">
              <Leaf className="h-12 w-12 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold mb-1 text-gray-900">Start Your Journey</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Scan your first receipt to begin tracking your carbon footprint
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
