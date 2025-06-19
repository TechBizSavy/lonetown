import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get current active match
    const match = await prisma.match.findFirst({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ],
        status: 'ACTIVE'
      },
      include: {
        user1: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
            bio: true,
            age: true
          }
        },
        user2: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
            bio: true,
            age: true
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    if (!match) {
      return NextResponse.json({ match: null })
    }

    const otherUser = match.user1Id === userId ? match.user2 : match.user1
    const lastMessage = match.messages[0]

    return NextResponse.json({
      match: {
        id: match.id,
        user: otherUser,
        compatibilityScore: match.compatibilityScore,
        messageCount: match.messageCount,
        videoCallUnlocked: match.videoCallUnlocked,
        createdAt: match.createdAt,
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          createdAt: lastMessage.createdAt,
          senderId: lastMessage.senderId
        } : null
      }
    })
  } catch (error) {
    console.error('Error fetching current match:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}