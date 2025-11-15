import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { dataStore, Badge, Milestone } from '@/lib/data-store'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get active badges from database
    const { data: activeData } = await supabase
      .from('active_badges')
      .select('badge_id')

    const activeBadgeIds = (activeData || []).map((item: any) => item.badge_id)
    
    // Get earned badges from database
    const { data: earnedBadgesData } = await supabase
      .from('badges')
      .select('id')
      .not('earned_at', 'is', null)

    const earnedIds = new Set((earnedBadgesData || []).map((b: any) => b.id))
    
    // Filter active badges that aren't earned yet
    const continuingBadgeIds = activeBadgeIds.filter((id: string) => !earnedIds.has(id))
    
    // Get badge templates and milestones
    const allBadges = dataStore.getAllBadgeTemplates()
    const milestones = dataStore.getMilestones()
    
    const continuingBadges = continuingBadgeIds
      .map((badgeId: string) => {
        const badge = allBadges.find(b => b.id === badgeId)
        const milestone = milestones.find(m => m.badgeId === badgeId)
        return badge && milestone ? { badge, milestone } : null
      })
      .filter((item): item is { badge: Badge; milestone: Milestone } => item !== null)

    return NextResponse.json({ badges: continuingBadges })
  } catch (error) {
    console.error('[v0] API: Failed to fetch continuing badges:', error)
    // Fallback to dataStore
    const continuingBadges = dataStore.getContinuingBadges()
    return NextResponse.json({ badges: continuingBadges })
  }
}
