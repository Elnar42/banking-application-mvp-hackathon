import { NextRequest, NextResponse } from 'next/server'
import { dataStore } from '@/lib/data-store'

export async function POST(request: NextRequest) {
  try {
    const { badgeId } = await request.json()

    if (!badgeId) {
      return NextResponse.json({ error: 'Badge ID is required' }, { status: 400 })
    }

    const isActive = dataStore.isBadgeActive(badgeId)
    const progress = dataStore.getBadgeProgress(badgeId)

    return NextResponse.json({ 
      isActive,
      progress 
    })
  } catch (error) {
    console.error('[v0] Badge status error:', error)
    return NextResponse.json({ error: 'Failed to get badge status' }, { status: 500 })
  }
}
