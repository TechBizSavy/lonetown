/**
 * Lone Town Compatibility Algorithm
 * 
 * This algorithm uses a multi-dimensional approach to match users based on:
 * 1. Emotional Intelligence Compatibility
 * 2. Communication Style Harmony
 * 3. Values Alignment
 * 4. Personality Complement/Match
 * 5. Relationship Goals Alignment
 * 6. Attachment Style Compatibility
 * 
 * Each dimension is weighted differently, and the algorithm considers both
 * similarity (for values/goals) and complementarity (for personality traits).
 */

import { User } from '@prisma/client'

interface CompatibilityScores {
  overall: number
  emotional: number
  communication: number
  values: number
  personality: number
  breakdown: {
    emotionalIntelligence: number
    communicationHarmony: number
    valuesAlignment: number
    personalityComplement: number
    relationshipGoalsMatch: number
    attachmentCompatibility: number
  }
}

// Weights for different compatibility dimensions
const WEIGHTS = {
  emotional: 0.25,
  communication: 0.20,
  values: 0.25,
  personality: 0.15,
  goals: 0.10,
  attachment: 0.05
}

export class CompatibilityAlgorithm {
  
  /**
   * Calculate comprehensive compatibility between two users
   */
  static calculateCompatibility(user1: User, user2: User): CompatibilityScores {
    const emotional = this.calculateEmotionalCompatibility(user1, user2)
    const communication = this.calculateCommunicationCompatibility(user1, user2)
    const values = this.calculateValuesCompatibility(user1, user2)
    const personality = this.calculatePersonalityCompatibility(user1, user2)
    const goals = this.calculateGoalsCompatibility(user1, user2)
    const attachment = this.calculateAttachmentCompatibility(user1, user2)

    const overall = (
      emotional * WEIGHTS.emotional +
      communication * WEIGHTS.communication +
      values * WEIGHTS.values +
      personality * WEIGHTS.personality +
      goals * WEIGHTS.goals +
      attachment * WEIGHTS.attachment
    )

    return {
      overall: Math.round(overall),
      emotional: Math.round(emotional),
      communication: Math.round(communication),
      values: Math.round(values),
      personality: Math.round(personality),
      breakdown: {
        emotionalIntelligence: Math.round(emotional),
        communicationHarmony: Math.round(communication),
        valuesAlignment: Math.round(values),
        personalityComplement: Math.round(personality),
        relationshipGoalsMatch: Math.round(goals),
        attachmentCompatibility: Math.round(attachment)
      }
    }
  }

  /**
   * Emotional Intelligence Compatibility
   * Higher scores indicate better emotional understanding and empathy
   */
  private static calculateEmotionalCompatibility(user1: User, user2: User): number {
    const avgEI = (user1.emotionalIntelligence + user2.emotionalIntelligence) / 2
    const eiDifference = Math.abs(user1.emotionalIntelligence - user2.emotionalIntelligence)
    
    // Prefer similar emotional intelligence levels, but reward high average
    const similarityBonus = Math.max(0, 100 - eiDifference * 2)
    const levelBonus = avgEI * 0.5
    
    return Math.min(100, similarityBonus + levelBonus)
  }

  /**
   * Communication Style Compatibility
   * Considers both conflict resolution and general communication patterns
   */
  private static calculateCommunicationCompatibility(user1: User, user2: User): number {
    const commStyleDiff = Math.abs(user1.communicationStyle - user2.communicationStyle)
    const conflictDiff = Math.abs(user1.conflictResolution - user2.conflictResolution)
    
    // Communication styles can be different but should be complementary
    const styleScore = this.calculateComplementaryScore(user1.communicationStyle, user2.communicationStyle)
    const conflictScore = Math.max(0, 100 - conflictDiff * 1.5)
    
    return (styleScore + conflictScore) / 2
  }

  /**
   * Values Compatibility - High similarity preferred
   */
  private static calculateValuesCompatibility(user1: User, user2: User): number {
    const valuesDiff = Math.abs(user1.lifeValues - user2.lifeValues)
    return Math.max(0, 100 - valuesDiff * 1.2)
  }

  /**
   * Personality Compatibility - Balance between similarity and complementarity
   */
  private static calculatePersonalityCompatibility(user1: User, user2: User): number {
    // This would be expanded based on actual personality type systems
    // For now, using a placeholder that considers complementary traits
    if (!user1.personalityType || !user2.personalityType) return 50
    
    // Simple MBTI-style compatibility (would be more sophisticated in production)
    return this.calculatePersonalityTypeCompatibility(user1.personalityType, user2.personalityType)
  }

  /**
   * Relationship Goals Compatibility
   */
  private static calculateGoalsCompatibility(user1: User, user2: User): number {
    const goalsDiff = Math.abs(user1.relationshipGoals - user2.relationshipGoals)
    return Math.max(0, 100 - goalsDiff * 1.5)
  }

  /**
   * Attachment Style Compatibility
   */
  private static calculateAttachmentCompatibility(user1: User, user2: User): number {
    if (!user1.attachmentStyle || !user2.attachmentStyle) return 50
    
    const compatibilityMatrix: { [key: string]: { [key: string]: number } } = {
      'secure': { 'secure': 95, 'anxious': 80, 'avoidant': 75, 'disorganized': 60 },
      'anxious': { 'secure': 80, 'anxious': 40, 'avoidant': 30, 'disorganized': 45 },
      'avoidant': { 'secure': 75, 'anxious': 30, 'avoidant': 60, 'disorganized': 50 },
      'disorganized': { 'secure': 60, 'anxious': 45, 'avoidant': 50, 'disorganized': 35 }
    }
    
    return compatibilityMatrix[user1.attachmentStyle]?.[user2.attachmentStyle] || 50
  }

  /**
   * Calculate complementary score for traits that benefit from differences
   */
  private static calculateComplementaryScore(score1: number, score2: number): number {
    const difference = Math.abs(score1 - score2)
    const average = (score1 + score2) / 2
    
    // Sweet spot around 20-40 point differences with high averages
    if (difference >= 20 && difference <= 40 && average >= 60) {
      return 90 + (average - 60) * 0.2
    } else if (difference < 10) {
      // Very similar scores are also good
      return 85 + average * 0.15
    } else {
      // Penalize extreme differences or low averages
      return Math.max(30, 80 - difference * 0.8 - Math.max(0, 60 - average) * 0.5)
    }
  }

  /**
   * Simple personality type compatibility (placeholder for more sophisticated system)
   */
  private static calculatePersonalityTypeCompatibility(type1: string, type2: string): number {
    // This is a simplified version - in production, this would use
    // sophisticated personality psychology research
    const compatibilityMap: { [key: string]: string[] } = {
      'INTJ': ['ENFP', 'ENTP', 'INFJ'],
      'INFP': ['ENFJ', 'ENTJ', 'INFJ'],
      'ENFP': ['INTJ', 'INFJ', 'ISFJ'],
      'ENFJ': ['INFP', 'ISFP', 'INTJ'],
      // ... would include all 16 types
    }
    
    if (compatibilityMap[type1]?.includes(type2)) {
      return 85
    } else if (type1 === type2) {
      return 75
    } else {
      return 55
    }
  }

  /**
   * Generate daily matches for a user based on compatibility scores
   */
  static async generateDailyMatches(userId: string, excludeUserIds: string[] = []): Promise<string[]> {
    const { prisma } = await import('./prisma')
    
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })
    
    if (!user) return []
    
    // Get potential matches (available users of preferred gender)
    const potentialMatches = await prisma.user.findMany({
      where: {
        id: { notIn: [userId, ...excludeUserIds] },
        state: 'AVAILABLE',
        gender: user.interestedIn,
        interestedIn: user.gender
      }
    })
    
    // Calculate compatibility scores for all potential matches
    const scoredMatches = potentialMatches.map(potentialMatch => ({
      userId: potentialMatch.id,
      compatibility: this.calculateCompatibility(user, potentialMatch)
    }))
    
    // Sort by compatibility and return top matches
    return scoredMatches
      .sort((a, b) => b.compatibility.overall - a.compatibility.overall)
      .slice(0, 5)
      .map(match => match.userId)
  }
}