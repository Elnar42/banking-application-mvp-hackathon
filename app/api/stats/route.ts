import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Fetch all approved items from database
    const { data: itemsData, error } = await supabase
      .from('scanned_items')
      .select('*')

    if (error) {
      console.error('[v0] API: Error fetching stats:', error)
      return NextResponse.json({ stats: { total: 0, pending: 0, approved: 0, totalCO2: 0 } })
    }

    const items = itemsData || []
    
    // Calculate stats from database
    const total = items.length
    const pending = items.filter((i: any) => i.status === 'pending').length
    const approved = items.filter((i: any) => i.status === 'approved').length
    
    // Calculate total CO2 from approved items
    const totalCO2 = items
      .filter((i: any) => i.status === 'approved' && i.co2 !== null && i.co2 !== undefined)
      .reduce((sum: number, item: any) => sum + (parseFloat(item.co2) || 0), 0)

    const stats = {
      total,
      pending,
      approved,
      totalCO2: parseFloat(totalCO2.toFixed(2)),
    }

    console.log('[v0] API: Stats calculated from database:', stats)
    return NextResponse.json({ stats })
  } catch (error) {
    console.error('[v0] API: Failed to calculate stats:', error)
    return NextResponse.json({ stats: { total: 0, pending: 0, approved: 0, totalCO2: 0 } })
  }
}
