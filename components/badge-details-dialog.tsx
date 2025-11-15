'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/lib/data-store'
import { MapPin, Gift } from 'lucide-react'

interface BadgeDetailsDialogProps {
  badge: Badge | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BadgeDetailsDialog({ badge, open, onOpenChange }: BadgeDetailsDialogProps) {
  if (!badge) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-4 flex justify-center">
            <div className="text-6xl">{badge.icon}</div>
          </div>
          <DialogTitle className="text-center text-2xl">{badge.name}</DialogTitle>
          <DialogDescription className="text-center">
            {badge.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {badge.discount && (
            <div className="rounded-lg bg-accent/10 p-4">
              <div className="flex items-start gap-3">
                <Gift className="mt-0.5 h-5 w-5 text-accent" />
                <div>
                  <h3 className="font-semibold">Special Offer</h3>
                  <p className="text-sm text-muted-foreground">{badge.discount}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">Redeem at these stores:</h3>
            </div>
            <ul className="space-y-2">
              {badge.stores.map((store, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {store}
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4 text-center text-xs text-muted-foreground">
            Earned on {new Date(badge.earnedAt).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
