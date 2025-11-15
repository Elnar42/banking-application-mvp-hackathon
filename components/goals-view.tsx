'use client'

import { useState } from 'react'
import { Milestone } from '@/lib/data-store'
import { Lock, CheckCircle2, Target, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'

interface GoalsViewProps {
  milestones: Milestone[]
  onStartGoal: (milestoneId: string) => void
}

export function GoalsView({ milestones, onStartGoal }: GoalsViewProps) {
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleMilestoneClick = (milestone: Milestone) => {
    setSelectedMilestone(milestone)
    setDialogOpen(true)
  }

  const handleStartGoal = (milestoneId: string) => {
    onStartGoal(milestoneId)
  }

  // Separate milestones into active (started) and available (not started)
  const activeMilestones = milestones.filter(m => m.current > 0 || m.completed)
  const availableMilestones = milestones.filter(m => m.current === 0 && !m.completed)

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-10">
      {/* Active Goals Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Your Goals</h2>
          <p className="text-base text-muted-foreground">
            Complete milestones to earn rewards and badges
          </p>
        </div>

        {activeMilestones.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {activeMilestones.map((milestone) => {
              const progressPercent = (milestone.current / milestone.target) * 100
              
              return (
                <div
                  key={milestone.id}
                  onClick={() => handleMilestoneClick(milestone)}
                  className="desktop-card hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center",
                          milestone.completed 
                            ? "bg-emerald-100 text-emerald-600" 
                            : "bg-blue-100 text-blue-600"
                        )}>
                          {milestone.completed ? (
                            <CheckCircle2 className="h-6 w-6" />
                          ) : (
                            <Target className="h-6 w-6" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-lg">{milestone.name}</h4>
                            {milestone.completed && (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                                Completed
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">
                            {milestone.description}
                          </p>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium text-muted-foreground">
                                {milestone.current} / {milestone.target} receipts
                              </span>
                              <span className="font-bold text-emerald-600">
                                {progressPercent.toFixed(0)}%
                              </span>
                            </div>
                            <Progress value={progressPercent} className="h-2" />
                          </div>
                        </div>
                      </div>
                      <button className="text-muted-foreground group-hover:text-foreground transition-colors">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>

                    {!milestone.completed && (
                      <div className="pt-4 border-t flex items-center gap-2 text-sm text-emerald-600">
                        <TrendingUp className="h-4 w-4" />
                        <span className="font-medium">3 rewards • Tap to view details</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="desktop-card p-8 text-center">
            <p className="text-muted-foreground">Start a goal below to begin tracking your progress</p>
          </div>
        )}
      </div>

      {/* Available Goals Section */}
      {availableMilestones.length > 0 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Available Milestones</h2>
            <p className="text-base text-muted-foreground">
              Choose a goal to start working towards
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {availableMilestones.map((milestone) => (
              <div
                key={milestone.id}
                className="desktop-card hover:shadow-lg transition-all"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center">
                        <Lock className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg mb-1">{milestone.name}</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          {milestone.description}
                        </p>
                        <div className="text-sm text-muted-foreground">
                          Target: {milestone.target} receipts
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleStartGoal(milestone.id)}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      Start Goal
                    </Button>
                  </div>

                  <div className="pt-4 mt-4 border-t flex items-center gap-2 text-sm text-emerald-600">
                    <TrendingUp className="h-4 w-4" />
                    <span className="font-medium">3 rewards • Tap to view details</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Goal Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedMilestone && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">{selectedMilestone.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div>
                  <h4 className="font-semibold mb-2 text-lg">Description</h4>
                  <p className="text-muted-foreground">{selectedMilestone.description}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-lg">Progress</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        {selectedMilestone.current} / {selectedMilestone.target} receipts
                      </span>
                      <span className="font-bold text-emerald-600">
                        {((selectedMilestone.current / selectedMilestone.target) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <Progress 
                      value={(selectedMilestone.current / selectedMilestone.target) * 100} 
                      className="h-3"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-lg">Rewards & Benefits</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 mt-0.5">✓</span>
                      <span>Exclusive badge for your profile</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 mt-0.5">✓</span>
                      <span>Special discounts at participating stores</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 mt-0.5">✓</span>
                      <span>Recognition as an eco-conscious shopper</span>
                    </li>
                  </ul>
                </div>

                {selectedMilestone.completed && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Completed • Badge earned and ready to use
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
