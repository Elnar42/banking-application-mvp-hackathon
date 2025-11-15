import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: itemsData, error } = await supabase
      .from('scanned_items')
      .select('*')
      .order('scanned_at', { ascending: false })

    if (error) {
      console.error('[v0] API: Error fetching items:', error)
      return NextResponse.json({ items: [] })
    }

    // Transform database items to match ScannedItem interface
    const items = (itemsData || []).map((item: any) => ({
      id: item.id,
      qrCode: item.qr_code,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      price: parseFloat(item.price),
      co2: item.co2 ? parseFloat(item.co2) : null,
      status: item.status,
      scannedAt: new Date(item.scanned_at),
      approvedAt: item.approved_at ? new Date(item.approved_at) : undefined,
      storeName: item.store_name,
    }))

    return NextResponse.json({ items })
  } catch (error) {
    console.error('[v0] API: Failed to fetch items:', error)
    return NextResponse.json({ items: [] })
  }
}
