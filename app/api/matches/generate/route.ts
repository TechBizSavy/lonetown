import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { MatchEngine } from '@/lib/match-engine'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Process daily matches for all users or specific user
    await MatchEngine.processDailyMatches()

    return NextResponse.json({ message: 'Daily matches processed' })
  } catch (error) {
    console.error('Error generating matches:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Add GET method to manually trigger match generation for testing
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate match specifically for the current user
    await MatchEngine.generateMatchForUser(session.user.id)

    return NextResponse.json({ message: 'Match generation attempted for current user' })
  } catch (error) {
    console.error('Error generating match for user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}