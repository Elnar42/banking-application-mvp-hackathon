'use client'

import { useState, useEffect } from 'react'
import * as React from 'react'
import { Badge as BadgeType, Milestone } from '@/lib/data-store'
import { ShoppingBag, Heart, Leaf, Trophy, Zap, Star, Award, QrCode, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { BadgeBarcode } from '@/components/badge-barcode'

interface MilestonesViewProps {
  availableBadges: BadgeType[]
  earnedBadges: BadgeType[]
  continuingBadges: { badge: BadgeType; milestone: Milestone }[]
  onStartBadge: (badgeId: string) => void
}

export function MilestonesView({ availableBadges, earnedBadges, continuingBadges, onStartBadge }: MilestonesViewProps) {
  const [selectedBadge, setSelectedBadge] = useState<BadgeType | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [showBarcode, setShowBarcode] = useState(false)
  const [activeBadgeIds, setActiveBadgeIds] = useState<Set<string>>(new Set())
  const [badgeProgress, setBadgeProgress] = useState<Record<string, { current: number; target: number; progress: number; isInverted?: boolean }>>({})

  const badgeIcons: Record<string, { icon: React.ReactNode; gradient: string }> = {
    'b1': { 
      icon: <ShoppingBag className="h-12 w-12 text-white" />, 
      gradient: 'from-purple-500 via-pink-500 to-rose-500' 
    },
    'b2': { 
      icon: <Heart className="h-12 w-12 text-white" />, 
      gradient: 'from-cyan-400 via-blue-500 to-indigo-600' 
    },
    'b3': { 
      icon: <Trophy className="h-12 w-12 text-white" />, 
      gradient: 'from-amber-400 via-orange-500 to-red-500' 
    },
    'b4': { 
      icon: <Leaf className="h-12 w-12 text-white" />, 
      gradient: 'from-emerald-400 via-teal-500 to-cyan-500' 
    },
    'b5': { 
      icon: <Zap className="h-12 w-12 text-white" />, 
      gradient: 'from-yellow-400 via-amber-500 to-orange-500' 
    },
    'b6': { 
      icon: <Star className="h-12 w-12 text-white" />, 
      gradient: 'from-violet-500 via-purple-500 to-fuchsia-500' 
    },
    'b7': { 
      icon: <Award className="h-12 w-12 text-white" />, 
      gradient: 'from-blue-500 via-indigo-500 to-purple-600' 
    },
    'b8': { 
      icon: <Trophy className="h-12 w-12 text-white" />, 
      gradient: 'from-rose-500 via-pink-500 to-fuchsia-600' 
    },
  }

  const handleBadgeClick = (badge: BadgeType) => {
    setSelectedBadge(badge)
    setShowBarcode(false)
    setDialogOpen(true)
  }

  const handleBarcodeClick = (badge: BadgeType) => {
    setSelectedBadge(badge)
    setShowBarcode(true)
    setDialogOpen(true)
  }

  const handleStartBadge = async (badgeId: string) => {
    onStartBadge(badgeId)
    setActiveBadgeIds(prev => new Set(prev).add(badgeId))
    setTimeout(() => {
      fetchBadgeStatus(badgeId)
    }, 500)
  }

  const fetchBadgeStatus = async (badgeId: string) => {
    try {
      const response = await fetch('/api/badges/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ badgeId }),
      })
      const data = await response.json()
      if (data.isActive && data.progress) {
        setActiveBadgeIds(prev => new Set(prev).add(badgeId))
        setBadgeProgress(prev => ({
          ...prev,
          [badgeId]: data.progress,
        }))
      }
    } catch (error) {
      console.error('Failed to fetch badge status:', error)
    }
  }

  useEffect(() => {
    continuingBadges.forEach(({ badge, milestone }) => {
      setActiveBadgeIds(prev => new Set(prev).add(badge.id))
      const isInverted = milestone.id === 'm4' || milestone.id === 'm7'
      setBadgeProgress(prev => ({
        ...prev,
        [badge.id]: {
          current: milestone.current,
          target: milestone.target,
          progress: milestone.progress,
          isInverted,
        },
      }))
    })

    availableBadges.forEach(badge => {
      fetchBadgeStatus(badge.id)
    })

    const interval = setInterval(() => {
      activeBadgeIds.forEach(badgeId => {
        fetchBadgeStatus(badgeId)
      })
    }, 3000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableBadges.length, continuingBadges.length])

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-10">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2 text-gray-900">Available Badges</h2>
          <p className="text-base text-muted-foreground">
            Start working towards these rewards
          </p>
        </div>

        {availableBadges.filter(badge => !earnedBadges.find(earned => earned.id === badge.id)).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableBadges.filter(badge => !earnedBadges.find(earned => earned.id === badge.id)).map((badge) => {
              const config = badgeIcons[badge.id] || { 
                icon: <Star className="h-12 w-12 text-white" />, 
                gradient: 'from-gray-400 to-gray-600' 
              }
              
              const isActive = activeBadgeIds.has(badge.id)
              const progress = badgeProgress[badge.id]
              
              return (
                <div
                  key={badge.id}
                  onClick={() => handleBadgeClick(badge)}
                  className="desktop-card overflow-hidden cursor-pointer hover:shadow-lg transition-all"
                >
                  <div className={`bg-gradient-to-br ${config.gradient} p-8 flex flex-col items-center gap-4 h-56`}>
                    <div className="flex-1 flex items-center justify-center">
                      {config.icon}
                    </div>
                    <div className="text-center">
                      <h4 className="font-bold text-white text-lg mb-1">{badge.name}</h4>
                      <p className="text-sm text-white/90 line-clamp-2">{badge.description}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-white border-t">
                    {isActive && progress ? (() => {
                      const isInverted = progress.isInverted || false
                      let progressPercent = 0
                      let displayText = ''
                      
                      if (isInverted) {
                        if (progress.current <= progress.target) {
                          progressPercent = 100
                          displayText = `${progress.current.toFixed(1)} / ${progress.target} (Goal met!)`
                        } else {
                          const excess = progress.current - progress.target
                          const maxExpected = progress.target * 2
                          progressPercent = Math.max(0, 100 - (excess / (maxExpected - progress.target)) * 100)
                          displayText = `${progress.current.toFixed(1)} / ${progress.target}`
                        }
                      } else {
                        progressPercent = Math.min(100, (progress.current / progress.target) * 100)
                        displayText = `${progress.current} / ${progress.target}`
                      }
                      
                      return (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-muted-foreground font-medium text-xs">
                              {displayText}
                            </span>
                            <span className="font-bold text-emerald-600">
                              {progressPercent.toFixed(0)}%
                            </span>
                          </div>
                          <Progress 
                            value={progressPercent} 
                            className="h-3 bg-gray-200"
                          />
                          <p className="text-xs text-center text-emerald-600 font-medium mt-1">In Progress</p>
                        </div>
                      )
                    })() : (
                      <Button 
                        onClick={async (e) => {
                          e.stopPropagation()
                          await handleStartBadge(badge.id)
                        }}
                        size="lg" 
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl shadow-sm"
                      >
                        Start Badge
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="desktop-card p-8 text-center">
            <p className="text-muted-foreground">All badges have been earned!</p>
          </div>
        )}
      </div>

      {earnedBadges.length > 0 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-2 text-gray-900">Earned Badges</h2>
            <p className="text-base text-muted-foreground">
              Your achievements and rewards
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {earnedBadges.map((badge) => {
              const config = badgeIcons[badge.id] || { 
                icon: <Star className="h-12 w-12 text-white" />, 
                gradient: 'from-emerald-400 to-emerald-600' 
              }
              
              return (
                <div
                  key={badge.id}
                  onClick={() => handleBadgeClick(badge)}
                  className="desktop-card overflow-hidden cursor-pointer hover:shadow-lg transition-all"
                >
                  <div className={`bg-gradient-to-br ${config.gradient} p-8 flex flex-col items-center gap-4 h-56`}>
                    <div className="flex-1 flex items-center justify-center">
                      {config.icon}
                    </div>
                    <div className="text-center">
                      <h4 className="font-bold text-white text-lg mb-1">{badge.name}</h4>
                      <p className="text-sm text-white/90 line-clamp-2">{badge.description}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-emerald-50 border-t border-emerald-100">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <p className="text-sm font-medium text-emerald-700">
                        ✓ Earned {badge.earnedAt ? new Date(badge.earnedAt).toLocaleDateString() : ''}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleBarcodeClick(badge)
                        }}
                        className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                        title="View Barcode"
                      >
                        <QrCode className="h-4 w-4" />
                      </button>
                    </div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleBadgeClick(badge)
                      }}
                      variant="outline"
                      size="sm"
                      className="w-full text-xs bg-white hover:bg-emerald-50 border-emerald-200 rounded-xl"
                    >
                      View Benefits
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          {selectedBadge && (
            <>
              {showBarcode ? (
                <>
                  <DialogHeader className="flex-shrink-0">
                    <DialogTitle className="text-2xl font-bold">{selectedBadge.name} - Barcode</DialogTitle>
                  </DialogHeader>
                  <div className="py-6 flex items-center justify-center">
                    <BadgeBarcode 
                      badgeId={selectedBadge.id} 
                      badgeName={selectedBadge.name}
                    />
                  </div>
                  <Button
                    onClick={() => setShowBarcode(false)}
                    variant="outline"
                    className="mt-4"
                  >
                    View Benefits
                  </Button>
                </>
              ) : (
                <>
                  <DialogHeader className="flex-shrink-0">
                    <DialogTitle className="text-2xl font-bold">{selectedBadge.name}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 py-4 overflow-y-auto flex-1 min-h-0">
                    <div>
                      <h4 className="font-semibold mb-2 text-lg">Description</h4>
                      <p className="text-muted-foreground">{selectedBadge.description}</p>
                    </div>

                    {selectedBadge.discount && (
                      <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-5 border-2 border-emerald-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                            <Gift className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-emerald-700 text-lg">Special Discount</h4>
                            <p className="text-emerald-600 font-semibold text-base">{selectedBadge.discount}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedBadge.prizes && selectedBadge.prizes.length > 0 && (
                      <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                            <Trophy className="h-5 w-5 text-white" />
                          </div>
                          <h4 className="font-bold text-lg text-gray-900">Benefits & Rewards</h4>
                        </div>
                        <ul className="space-y-3">
                          {selectedBadge.prizes.map((prize, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-white text-xs font-bold">✓</span>
                              </div>
                              <span className="text-gray-700 font-medium flex-1">{prize}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedBadge.stores && selectedBadge.stores.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 text-lg">Participating Stores</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedBadge.stores.map((store, index) => (
                            <span
                              key={index}
                              className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium border border-emerald-200"
                            >
                              {store}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedBadge.earnedAt && (
                      <div className="pt-4 border-t">
                        <p className="text-sm text-muted-foreground mb-4">
                          Earned on {new Date(selectedBadge.earnedAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
