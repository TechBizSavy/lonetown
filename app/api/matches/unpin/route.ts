import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { MatchEngine } from '@/lib/match-engine'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: { matchId: string } = await request.json()
    const { matchId } = body

    if (!matchId) {
      return NextResponse.json({ error: 'Match ID required' }, { status: 400 })
    }

    const success = await MatchEngine.unpinMatch(matchId, session.user.id)

    if (!success) {
      return NextResponse.json({ error: 'Failed to unpin match' }, { status: 400 })
    }

    return NextResponse.json({ message: 'Match unpinned successfully' })
  } catch (error) {
    console.error('Error unpinning match:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
