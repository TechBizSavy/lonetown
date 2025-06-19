import { prisma } from './prisma'
import { CompatibilityAlgorithm } from './compatibility-algorithm'
import { UserState, MatchStatus } from '@prisma/client'

export class MatchEngine {
  
  /**
   * Create a new match between two users
   */
  static async createMatch(user1Id: string, user2Id: string): Promise<string | null> {
    try {
      const [user1, user2] = await Promise.all([
        prisma.user.findUnique({ where: { id: user1Id } }),
        prisma.user.findUnique({ where: { id: user2Id } })
      ])

      if (!user1 || !user2) return null
      if (user1.state !== 'AVAILABLE' || user2.state !== 'AVAILABLE') return null

      // Calculate compatibility scores
      const compatibility = CompatibilityAlgorithm.calculateCompatibility(user1, user2)

      // Create the match
      const match = await prisma.match.create({
        data: {
          user1Id,
          user2Id,
          compatibilityScore: compatibility.overall,
          emotionalMatch: compatibility.emotional,
          communicationMatch: compatibility.communication,
          valuesMatch: compatibility.values,
          personalityMatch: compatibility.personality,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }
      })

      // Update both users to MATCHED state
      await Promise.all([
        prisma.user.update({
          where: { id: user1Id },
          data: { 
            state: 'MATCHED',
            lastMatchAt: new Date(),
            totalMatches: { increment: 1 }
          }
        }),
        prisma.user.update({
          where: { id: user2Id },
          data: { 
            state: 'MATCHED',
            lastMatchAt: new Date(),
            totalMatches: { increment: 1 }
          }
        })
      ])

      return match.id
    } catch (error) {
      console.error('Error creating match:', error)
      return null
    }
  }

  /**
   * Generate match for a specific user (for testing purposes)
   */
  static async generateMatchForUser(userId: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (!user || user.state !== 'AVAILABLE') {
        console.log(`User ${userId} is not available for matching. Current state: ${user?.state}`)
        return false
      }

      // Get users this person has already been matched with
      const existingMatches = await prisma.match.findMany({
        where: {
          OR: [
            { user1Id: userId },
            { user2Id: userId }
          ]
        },
        select: { user1Id: true, user2Id: true }
      })

      const excludeUserIds = existingMatches.flatMap(match => 
        match.user1Id === userId ? [match.user2Id] : [match.user1Id]
      )

      // Find potential matches
      const potentialMatches = await prisma.user.findMany({
        where: {
          id: { notIn: [userId, ...excludeUserIds] },
          state: 'AVAILABLE',
          gender: user.interestedIn,
          interestedIn: user.gender,
          // Only match users who have completed assessment
          emotionalIntelligence: { gt: 0 }
        }
      })

      console.log(`Found ${potentialMatches.length} potential matches for user ${userId}`)

      if (potentialMatches.length === 0) {
        console.log('No potential matches found')
        return false
      }

      // Calculate compatibility scores for all potential matches
      const scoredMatches = potentialMatches.map(potentialMatch => ({
        userId: potentialMatch.id,
        compatibility: CompatibilityAlgorithm.calculateCompatibility(user, potentialMatch)
      }))

      // Sort by compatibility and get the best match
      const bestMatch = scoredMatches
        .sort((a, b) => b.compatibility.overall - a.compatibility.overall)[0]

      if (bestMatch && bestMatch.compatibility.overall > 50) {
        const matchId = await this.createMatch(userId, bestMatch.userId)
        console.log(`Created match ${matchId} between ${userId} and ${bestMatch.userId}`)
        return !!matchId
      }

      console.log('No suitable matches found with sufficient compatibility')
      return false
    } catch (error) {
      console.error(`Error generating match for user ${userId}:`, error)
      return false
    }
  }

  /**
   * Handle unpinning a match
   */
  static async unpinMatch(matchId: string, userId: string): Promise<boolean> {
    try {
      const match = await prisma.match.findUnique({
        where: { id: matchId },
        include: { user1: true, user2: true }
      })

      if (!match || match.status !== 'ACTIVE') return false
      if (match.user1Id !== userId && match.user2Id !== userId) return false

      const otherUserId = match.user1Id === userId ? match.user2Id : match.user1Id
      const unpinningUser = match.user1Id === userId ? match.user1 : match.user2
      const otherUser = match.user1Id === userId ? match.user2 : match.user1

      // Update match status
      await prisma.match.update({
        where: { id: matchId },
        data: {
          status: match.user1Id === userId ? 'UNPINNED_BY_USER1' : 'UNPINNED_BY_USER2',
          unpinnedBy: userId,
          unpinnedAt: new Date()
        }
      })

      // Put unpinning user in FROZEN state for 24 hours
      const frozenUntil = new Date(Date.now() + 24 * 60 * 60 * 1000)
      await prisma.user.update({
        where: { id: userId },
        data: {
          state: 'FROZEN',
          frozenUntil,
          intentionalityScore: { decrement: 5 } // Slight penalty for unpinning
        }
      })

      // Put other user back to AVAILABLE and set them up for a new match in 2 hours
      const canReceiveMatchAt = new Date(Date.now() + 2 * 60 * 60 * 1000)
      await prisma.user.update({
        where: { id: otherUserId },
        data: {
          state: 'AVAILABLE',
          canReceiveMatchAt
        }
      })

      // Generate feedback for the other user
      await this.generateMatchFeedback(matchId, otherUserId, unpinningUser, otherUser)

      return true
    } catch (error) {
      console.error('Error unpinning match:', error)
      return false
    }
  }

  /**
   * Generate personalized feedback for unsuccessful matches
   */
  private static async generateMatchFeedback(
    matchId: string, 
    recipientId: string, 
    unpinningUser: any, 
    recipient: any
  ) {
    const compatibility = CompatibilityAlgorithm.calculateCompatibility(unpinningUser, recipient)
    
    let feedbackType = 'general_mismatch'
    let feedback = 'Sometimes connections don\'t develop as expected, and that\'s perfectly normal.'
    
    // Generate specific insights based on compatibility scores
    const insights: any = {
      compatibilityScore: compatibility.overall,
      strengths: [],
      challenges: []
    }

    if (compatibility.emotional < 60) {
      feedbackType = 'emotional_mismatch'
      feedback = 'It seems like there might have been differences in emotional connection styles. Your next match will be selected with even better emotional compatibility in mind.'
      insights.challenges.push('Emotional communication styles differed')
    } else if (compatibility.communication < 60) {
      feedbackType = 'communication_style'
      feedback = 'Communication styles can make a big difference in connection. We\'ll focus on finding someone whose communication approach aligns better with yours.'
      insights.challenges.push('Communication approaches varied')
    } else if (compatibility.values < 60) {
      feedbackType = 'values_mismatch'
      feedback = 'Shared values are crucial for deep connections. Your next match will prioritize stronger values alignment.'
      insights.challenges.push('Different life values or priorities')
    } else {
      feedback = 'Sometimes great compatibility on paper doesn\'t translate to immediate chemistry, and that\'s completely normal. We\'ll keep refining to find your perfect match.'
      insights.strengths.push('Strong compatibility indicators')
    }

    // Add positive insights
    if (compatibility.emotional > 70) insights.strengths.push('Good emotional intelligence match')
    if (compatibility.values > 70) insights.strengths.push('Aligned life values')
    if (compatibility.communication > 70) insights.strengths.push('Compatible communication styles')

    await prisma.matchFeedback.create({
      data: {
        matchId,
        recipientId,
        feedbackType,
        feedback,
        insights
      }
    })
  }

  /**
   * Process daily match generation for all eligible users
   */
  static async processDailyMatches(): Promise<void> {
    try {
      // Get all users who can receive matches
      const eligibleUsers = await prisma.user.findMany({
        where: {
          state: 'AVAILABLE',
          emotionalIntelligence: { gt: 0 }, // Only users who completed assessment
          OR: [
            { canReceiveMatchAt: null },
            { canReceiveMatchAt: { lte: new Date() } }
          ]
        }
      })

      console.log(`Processing daily matches for ${eligibleUsers.length} eligible users`)

      for (const user of eligibleUsers) {
        await this.generateMatchForUser(user.id)
      }
    } catch (error) {
      console.error('Error processing daily matches:', error)
    }
  }

  /**
   * Check and update message milestones
   */
  static async checkMessageMilestones(matchId: string): Promise<void> {
    try {
      const match = await prisma.match.findUnique({
        where: { id: matchId },
        include: { messages: true }
      })

      if (!match) return

      const messageCount = match.messages.length
      const firstMessage = match.messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0]
      
      if (firstMessage && !match.firstMessageAt) {
        await prisma.match.update({
          where: { id: matchId },
          data: { firstMessageAt: firstMessage.createdAt }
        })
      }

      // Check for video call unlock (100 messages in 48 hours)
      if (!match.videoCallUnlocked && messageCount >= 100 && firstMessage) {
        const timeSinceFirst = Date.now() - firstMessage.createdAt.getTime()
        const fortyEightHours = 48 * 60 * 60 * 1000

        if (timeSinceFirst <= fortyEightHours) {
          await prisma.match.update({
            where: { id: matchId },
            data: {
              videoCallUnlocked: true,
              videoCallUnlockedAt: new Date()
            }
          })

          // Update user intentionality scores positively
          await Promise.all([
            prisma.user.update({
              where: { id: match.user1Id },
              data: { intentionalityScore: { increment: 10 } }
            }),
            prisma.user.update({
              where: { id: match.user2Id },
              data: { intentionalityScore: { increment: 10 } }
            })
          ])
        }
      }

      // Update match message count
      if (match.messageCount !== messageCount) {
        await prisma.match.update({
          where: { id: matchId },
          data: { messageCount }
        })
      }
    } catch (error) {
      console.error('Error checking message milestones:', error)
    }
  }

  /**
   * Clean up expired matches and frozen users
   */
  static async cleanupExpiredStates(): Promise<void> {
    try {
      const now = new Date()

      // Unfreeze users whose freeze period has expired
      await prisma.user.updateMany({
        where: {
          state: 'FROZEN',
          frozenUntil: { lte: now }
        },
        data: {
          state: 'AVAILABLE',
          frozenUntil: null
        }
      })

      // Mark expired matches as expired
      await prisma.match.updateMany({
        where: {
          status: 'ACTIVE',
          expiresAt: { lte: now }
        },
        data: { status: 'EXPIRED' }
      })

      // Update users from expired matches back to available
      const expiredMatches = await prisma.match.findMany({
        where: { status: 'EXPIRED' },
        select: { user1Id: true, user2Id: true }
      })

      for (const match of expiredMatches) {
        await Promise.all([
          prisma.user.update({
            where: { id: match.user1Id },
            data: { state: 'AVAILABLE' }
          }),
          prisma.user.update({
            where: { id: match.user2Id },
            data: { state: 'AVAILABLE' }
          })
        ])
      }
    } catch (error) {
      console.error('Error cleaning up expired states:', error)
    }
  }
}