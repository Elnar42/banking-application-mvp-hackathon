'use client'

import { useState } from 'react'
import { ScannedItem } from '@/lib/data-store'
import { Card } from '@/components/ui/card'
import { Lightbulb, TrendingDown, ShoppingBag, Leaf, X } from 'lucide-react'

interface RecommendationsProps {
  items: ScannedItem[]
  totalCO2: number
}

interface Recommendation {
  id: string
  title: string
  description: string
  impact: string
  category: string
  icon: React.ReactNode
  priority: 'high' | 'medium' | 'low'
}

export function Recommendations({ items, totalCO2 }: RecommendationsProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
  const [swipingId, setSwipingId] = useState<string | null>(null)
  const [swipeDistance, setSwipeDistance] = useState(0)
  const [touchStartX, setTouchStartX] = useState(0)

  const approvedItems = items.filter(item => item.status === 'approved' && item.co2 !== null)
  
  if (approvedItems.length === 0 && items.length === 0) {
    return null
  }
  
  if (approvedItems.length === 0 && items.length > 0) {
    return (
      <Card className="p-6 rounded-2xl border-emerald-100 bg-emerald-50/50">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
            <Lightbulb className="h-5 w-5 text-white" />
          </div>
          <h3 className="font-bold text-lg text-gray-900">Waiting for Approval</h3>
        </div>
        <p className="text-muted-foreground">
          Your receipts are being processed. Recommendations will appear once they're approved.
        </p>
      </Card>
    )
  }

  const categorySpending: Record<string, { count: number; totalCO2: number; totalPrice: number }> = {}
  const storeFrequency: Record<string, number> = {}
  const avgCO2PerItem = approvedItems.reduce((sum, item) => sum + (item.co2 || 0), 0) / approvedItems.length

  approvedItems.forEach(item => {
    const category = item.category || 'Other'
    if (!categorySpending[category]) {
      categorySpending[category] = { count: 0, totalCO2: 0, totalPrice: 0 }
    }
    categorySpending[category].count++
    categorySpending[category].totalCO2 += item.co2 || 0
    categorySpending[category].totalPrice += item.price

    storeFrequency[item.storeName] = (storeFrequency[item.storeName] || 0) + 1
  })

  const recommendations: Recommendation[] = []

  const highCO2Category = Object.entries(categorySpending)
    .sort((a, b) => b[1].totalCO2 - a[1].totalCO2)[0]
  
  if (highCO2Category && highCO2Category[1].totalCO2 > 20) {
    recommendations.push({
      id: 'r1',
      title: `Reduce ${highCO2Category[0]} Purchases`,
      description: `Your ${highCO2Category[0]} purchases contribute ${highCO2Category[1].totalCO2.toFixed(1)}kg CO₂. Consider eco-friendly alternatives.`,
      impact: `Save up to ${(highCO2Category[1].totalCO2 * 0.3).toFixed(1)}kg CO₂ monthly`,
      category: highCO2Category[0],
      icon: <ShoppingBag className="h-5 w-5" />,
      priority: 'high'
    })
  }

  if (avgCO2PerItem > 5) {
    recommendations.push({
      id: 'r2',
      title: 'Choose Lower Carbon Products',
      description: `Your average CO₂ per item is ${avgCO2PerItem.toFixed(1)}kg. Look for products with lower carbon footprints.`,
      impact: `Reduce footprint by up to ${(avgCO2PerItem * 0.4).toFixed(1)}kg per item`,
      category: 'General',
      icon: <TrendingDown className="h-5 w-5" />,
      priority: 'high'
    })
  }

  if (categorySpending['Electronics'] && categorySpending['Electronics'].count > 0) {
    recommendations.push({
      id: 'r3',
      title: 'Consider Refurbished Electronics',
      description: `Electronics have high carbon footprints. Consider buying refurbished or energy-efficient models.`,
      impact: `Save up to ${(categorySpending['Electronics'].totalCO2 * 0.5).toFixed(1)}kg CO₂`,
      category: 'Electronics',
      icon: <Leaf className="h-5 w-5" />,
      priority: 'medium'
    })
  }

  if (categorySpending['Food'] && categorySpending['Food'].count > 3) {
    recommendations.push({
      id: 'r4',
      title: 'Buy Local & Seasonal Food',
      description: `Choose locally sourced and seasonal produce to reduce transportation emissions.`,
      impact: `Reduce food footprint by up to ${(categorySpending['Food'].totalCO2 * 0.25).toFixed(1)}kg CO₂`,
      category: 'Food',
      icon: <Leaf className="h-5 w-5" />,
      priority: 'medium'
    })
  }

  const uniqueStores = Object.keys(storeFrequency).length
  if (uniqueStores < 3 && approvedItems.length > 5) {
    recommendations.push({
      id: 'r5',
      title: 'Explore Eco-Friendly Stores',
      description: `You shop at ${uniqueStores} store(s). Try eco-friendly stores for better carbon footprint options.`,
      impact: 'Access to lower-carbon products and exclusive eco discounts',
      category: 'Shopping',
      icon: <ShoppingBag className="h-5 w-5" />,
      priority: 'low'
    })
  }

  if (totalCO2 > 100) {
    recommendations.push({
      id: 'r6',
      title: 'Monthly Carbon Goal',
      description: `Your monthly footprint is ${totalCO2.toFixed(1)}kg CO₂. Aim to reduce it below 80kg for better environmental impact.`,
      impact: `Target reduction of ${(totalCO2 - 80).toFixed(1)}kg CO₂ to reach goal`,
      category: 'Overall',
      icon: <TrendingDown className="h-5 w-5" />,
      priority: 'high'
    })
  }

  if (categorySpending['Clothing'] && categorySpending['Clothing'].count > 2) {
    recommendations.push({
      id: 'r7',
      title: 'Choose Sustainable Fashion',
      description: `Consider buying second-hand, organic, or sustainably-made clothing to reduce your fashion footprint.`,
      impact: `Save up to ${(categorySpending['Clothing'].totalCO2 * 0.4).toFixed(1)}kg CO₂`,
      category: 'Clothing',
      icon: <Leaf className="h-5 w-5" />,
      priority: 'medium'
    })
  }

  if (recommendations.length === 0) {
    return (
      <Card className="p-6 rounded-2xl border-emerald-100 bg-emerald-50/50">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
            <Lightbulb className="h-5 w-5 text-white" />
          </div>
          <h3 className="font-bold text-lg text-gray-900">Great Progress!</h3>
        </div>
        <p className="text-muted-foreground">
          You're doing well with your carbon footprint. Keep tracking to get personalized recommendations!
        </p>
      </Card>
    )
  }

  const priorityOrder = { high: 0, medium: 1, low: 2 }
  const sortedRecommendations = recommendations.sort((a, b) => 
    priorityOrder[a.priority] - priorityOrder[b.priority]
  )

  const visibleRecommendations = sortedRecommendations.filter(rec => !dismissedIds.has(rec.id))

  if (visibleRecommendations.length === 0) {
    return null
  }

  const handleTouchStart = (e: React.TouchEvent, id: string) => {
    setTouchStartX(e.touches[0].clientX)
    setSwipingId(id)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swipingId) return
    const currentX = e.touches[0].clientX
    const distance = currentX - touchStartX
    setSwipeDistance(distance)
  }

  const handleTouchEnd = () => {
    if (Math.abs(swipeDistance) > 100) {
      setDismissedIds(prev => new Set(prev).add(swipingId!))
    }
    setSwipingId(null)
    setSwipeDistance(0)
    setTouchStartX(0)
  }

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => new Set(prev).add(id))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
          <Lightbulb className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-gray-900">Personalized Recommendations</h3>
          <p className="text-sm text-muted-foreground">Swipe to dismiss</p>
        </div>
      </div>

      <div className="space-y-3">
        {visibleRecommendations.slice(0, 4).map((rec) => (
          <div
            key={rec.id}
            className="relative overflow-hidden"
            onTouchStart={(e) => handleTouchStart(e, rec.id)}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              transform: swipingId === rec.id ? `translateX(${swipeDistance}px)` : 'translateX(0)',
              transition: swipingId === rec.id ? 'none' : 'transform 0.3s ease-out',
            }}
          >
            <Card 
              className={`p-5 rounded-2xl border transition-all hover:shadow-md ${
                rec.priority === 'high' 
                  ? 'border-emerald-300 bg-emerald-50/50' 
                  : rec.priority === 'medium'
                  ? 'border-emerald-200 bg-emerald-50/30'
                  : 'border-emerald-100 bg-white'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  rec.priority === 'high' 
                    ? 'bg-emerald-500' 
                    : rec.priority === 'medium'
                    ? 'bg-emerald-400'
                    : 'bg-emerald-300'
                }`}>
                  <div className="text-white">
                    {rec.icon}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                    <div className="flex items-center gap-2">
                      {rec.priority === 'high' && (
                        <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500 text-white rounded-full">
                          High Impact
                        </span>
                      )}
                      <button
                        onClick={() => handleDismiss(rec.id)}
                        className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                        aria-label="Dismiss recommendation"
                      >
                        <X className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                    {rec.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="font-medium text-emerald-700">{rec.impact}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {visibleRecommendations.length > 4 && (
        <div className="text-center pt-2">
          <p className="text-sm text-muted-foreground">
            +{visibleRecommendations.length - 4} more recommendations available
          </p>
        </div>
      )}
    </div>
  )
}
