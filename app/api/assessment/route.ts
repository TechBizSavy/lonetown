import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const assessmentSchema = z.object({
  emotionalIntelligence: z.number().min(0).max(100),
  communicationStyle: z.number().min(0).max(100),
  conflictResolution: z.number().min(0).max(100),
  relationshipGoals: z.number().min(0).max(100),
  lifeValues: z.number().min(0).max(100),
  personalityType: z.string().optional(),
  loveLanguage: z.string().optional(),
  attachmentStyle: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    } 

    const body = await request.json()
    const data = assessmentSchema.parse(body)

    // Update user's assessment scores
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        emotionalIntelligence: data.emotionalIntelligence,
        communicationStyle: data.communicationStyle,
        conflictResolution: data.conflictResolution,
        relationshipGoals: data.relationshipGoals,
        lifeValues: data.lifeValues,
        personalityType: data.personalityType,
        loveLanguage: data.loveLanguage,
        attachmentStyle: data.attachmentStyle,
        state: 'AVAILABLE' // Make user available for matching after assessment
      }
    })

    return NextResponse.json({
      message: 'Assessment completed successfully',
      user: {
        id: updatedUser.id,
        state: updatedUser.state
      }
    })
  } catch (error) {
    console.error('Assessment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}