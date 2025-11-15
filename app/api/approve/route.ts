import { NextRequest, NextResponse } from 'next/server'
import { dataStore } from '@/lib/data-store'

// Mock CO2 calculation based on category
function calculateCO2(category: string, quantity: number, price: number) {
  const emissionFactors: Record<string, number> = {
    Food: 2.5,
    Electronics: 15.0,
    Clothing: 8.0,
    'Home & Garden': 5.0,
    Transport: 3.0,
  }

  const factor = emissionFactors[category] || 5.0
  return factor * quantity * (price / 10)
}

export async function POST(request: NextRequest) {
  try {
    const { itemId } = await request.json()

    const items = dataStore.getItems()
    const item = items.find((i) => i.id === itemId)

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // Calculate CO2
    const co2 = calculateCO2(item.category, item.quantity, item.price)

    // Approve item
    const updatedItem = dataStore.approveItem(itemId, co2)

    return NextResponse.json({ success: true, item: updatedItem })
  } catch (error) {
    console.error('[v0] Approve error:', error)
    return NextResponse.json({ error: 'Failed to approve item' }, { status: 500 })
  }
}
