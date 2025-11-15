'use client'

import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge as BadgeUI } from '@/components/ui/badge'
import { Milestone, Badge } from '@/lib/data-store'
import { Trophy, CheckCircle2 } from 'lucide-react'

interface MilestonesSectionProps {
  milestones: Milestone[]
  badges: Badge[]
  onBadgeClick: (badge: Badge) => void
}

export function MilestonesSection({ milestones, badges, onBadgeClick }: MilestonesSectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Milestones</h2>
        <p className="text-sm text-muted-foreground">Track your progress and earn badges</p>
      </div>

      <div className="space-y-3">
        {milestones.map((milestone) => {
          const progress = (milestone.current / milestone.target) * 100

          return (
            <Card key={milestone.id} className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{milestone.name}</h3>
                      {milestone.completed && (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{milestone.description}</p>
                  </div>
                  <Trophy className={`h-5 w-5 ${milestone.completed ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {milestone.current} / {milestone.target} receipts
                    </span>
                    <span className="font-semibold">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {badges.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Earned Badges</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {badges.map((badge) => (
              <Card
                key={badge.id}
                className="cursor-pointer p-4 transition-all hover:shadow-md"
                onClick={() => onBadgeClick(badge)}
              >
                <div className="flex items-start gap-3">
                  <div className="text-4xl">{badge.icon}</div>
                  <div className="flex-1 space-y-1">
                    <h3 className="font-semibold">{badge.name}</h3>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                    <BadgeUI variant="secondary" className="mt-2 text-xs">
                      Click for details
                    </BadgeUI>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
