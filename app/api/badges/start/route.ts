import { NextRequest, NextResponse } from 'next/server'
import { dataStore } from '@/lib/data-store'

export async function POST(request: NextRequest) {
  try {
    const { badgeId } = await request.json()

    if (!badgeId) {
      return NextResponse.json({ error: 'Badge ID is required' }, { status: 400 })
    }

    const started = dataStore.startBadge(badgeId)
    
    if (!started) {
      return NextResponse.json({ 
        success: false, 
        message: 'Badge is already active' 
      })
    }

    // Get updated progress
    const progress = dataStore.getBadgeProgress(badgeId)

    return NextResponse.json({ 
      success: true,
      progress 
    })
  } catch (error) {
    console.error('[v0] Start badge error:', error)
    return NextResponse.json({ error: 'Failed to start badge' }, { status: 500 })
  }
}
