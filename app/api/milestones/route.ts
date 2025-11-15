import { NextResponse } from 'next/server'
import { dataStore } from '@/lib/data-store'

export async function GET() {
  const milestones = dataStore.getMilestones()
  return NextResponse.json({ milestones })
}
