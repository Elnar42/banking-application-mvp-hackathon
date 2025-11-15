'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScannedItem } from '@/lib/data-store'
import { Clock, CheckCircle2, Leaf } from 'lucide-react'

interface ScannedItemsListProps {
  items: ScannedItem[]
}

export function ScannedItemsList({ items }: ScannedItemsListProps) {
  if (items.length === 0) {
    return (
        <Card className="p-8 text-center border-2 border-dashed border-emerald-200 rounded-2xl">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 flex items-center justify-center">
              <Leaf className="h-8 w-8 text-emerald-600" />
            </div>
            <p className="text-sm font-medium">No items scanned yet. Start scanning to track your carbon footprint!</p>
          </div>
        </Card>
    )
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Card key={item.id} className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{item.name}</h3>
                {item.status === 'pending' ? (
                  <Badge variant="outline" className="border-warning text-warning">
                    <Clock className="mr-1 h-3 w-3" />
                    Pending
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-success text-success">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Approved
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>{item.storeName}</span>
                <span>•</span>
                <span>{item.category}</span>
                <span>•</span>
                <span>Qty: {item.quantity}</span>
                <span>•</span>
                <span>₼{item.price.toFixed(2)}</span>
              </div>
            </div>
            <div className="text-right">
              {item.co2 !== null ? (
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-emerald-600">{item.co2.toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground font-medium">kg CO₂</div>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-muted-foreground">--</div>
                  <div className="text-xs text-muted-foreground">Calculating...</div>
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
