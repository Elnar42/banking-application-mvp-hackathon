import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: badgesData, error } = await supabase
      .from('badges')
      .select('*')
      .not('earned_at', 'is', null)
      .order('earned_at', { ascending: false })

    if (error) {
      console.error('[v0] API: Error fetching badges:', error)
      return NextResponse.json({ badges: [] })
    }

    // Transform database badges to match Badge interface
    const badges = (badgesData || []).map((badge: any) => ({
      id: badge.id,
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      earnedAt: badge.earned_at ? new Date(badge.earned_at) : undefined,
      stores: badge.stores || [],
      discount: badge.discount,
      prizes: badge.prizes || [],
    }))

    return NextResponse.json({ badges })
  } catch (error) {
    console.error('[v0] API: Failed to fetch badges:', error)
    return NextResponse.json({ badges: [] })
  }
}
