import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { dataStore } from '@/lib/data-store'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get all badge templates from dataStore
    const allBadges = dataStore.getAllBadgeTemplates()
    
    // Get earned badges from database
    const { data: earnedBadgesData } = await supabase
      .from('badges')
      .select('id')
      .not('earned_at', 'is', null)

    const earnedIds = new Set((earnedBadgesData || []).map((b: any) => b.id))
    
    // Filter out earned badges
    const availableBadges = allBadges.filter(badge => !earnedIds.has(badge.id))

    return NextResponse.json({ badges: availableBadges })
  } catch (error) {
    console.error('[v0] API: Failed to fetch available badges:', error)
    // Fallback to dataStore
    const badges = dataStore.getAvailableBadges()
    return NextResponse.json({ badges })
  }
}
