'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Brain, 
  Heart, 
  MessageSquare, 
  Target, 
  Users, 
  Sparkles,
  TrendingUp,
  Star
} from 'lucide-react'

interface User {
  id: string
  firstName: string
  lastName: string
  profileImage?: string
  bio?: string
  age?: number
}

interface MatchCompatibilityProps {
  user1: User
  compatibilityScore: number
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function MatchCompatibility({ user1, compatibilityScore }: MatchCompatibilityProps) {
  // Mock compatibility breakdown - in production, this would come from the API
  const compatibilityBreakdown = {
    emotional: 85,
    communication: 78,
    values: 92,
    personality: 74,
    goals: 88,
    lifestyle: 82
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreDescription = (score: number) => {
    if (score >= 90) return 'Excellent Match'
    if (score >= 80) return 'Very Good Match'
    if (score >= 70) return 'Good Match'
    if (score >= 60) return 'Fair Match'
    return 'Needs Attention'
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-purple-600" />
          <span>Compatibility Analysis</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl font-bold text-white">{compatibilityScore}%</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Overall Compatibility
          </h3>
          <Badge 
            className={`${getScoreColor(compatibilityScore)} bg-transparent border-2`}
            variant="outline"
          >
            {getScoreDescription(compatibilityScore)}
          </Badge>
        </div>

        {/* Compatibility Breakdown */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Detailed Analysis</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium">Emotional Connection</span>
                  </div>
                  <span className={`text-sm font-semibold ${getScoreColor(compatibilityBreakdown.emotional)}`}>
                    {compatibilityBreakdown.emotional}%
                  </span>
                </div>
                <Progress value={compatibilityBreakdown.emotional} className="h-2" />
              </div>

              <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">Communication</span>
                  </div>
                  <span className={`text-sm font-semibold ${getScoreColor(compatibilityBreakdown.communication)}`}>
                    {compatibilityBreakdown.communication}%
                  </span>
                </div>
                <Progress value={compatibilityBreakdown.communication} className="h-2" />
              </div>

              <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">Core Values</span>
                  </div>
                  <span className={`text-sm font-semibold ${getScoreColor(compatibilityBreakdown.values)}`}>
                    {compatibilityBreakdown.values}%
                  </span>
                </div>
                <Progress value={compatibilityBreakdown.values} className="h-2" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium">Personality</span>
                  </div>
                  <span className={`text-sm font-semibold ${getScoreColor(compatibilityBreakdown.personality)}`}>
                    {compatibilityBreakdown.personality}%
                  </span>
                </div>
                <Progress value={compatibilityBreakdown.personality} className="h-2" />
              </div>

              <div className="p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium">Relationship Goals</span>
                  </div>
                  <span className={`text-sm font-semibold ${getScoreColor(compatibilityBreakdown.goals)}`}>
                    {compatibilityBreakdown.goals}%
                  </span>
                </div>
                <Progress value={compatibilityBreakdown.goals} className="h-2" />
              </div>

              <div className="p-3 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-teal-600" />
                    <span className="text-sm font-medium">Lifestyle</span>
                  </div>
                  <span className={`text-sm font-semibold ${getScoreColor(compatibilityBreakdown.lifestyle)}`}>
                    {compatibilityBreakdown.lifestyle}%
                  </span>
                </div>
                <Progress value={compatibilityBreakdown.lifestyle} className="h-2" />
              </div>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="bg-gradient-to-r from-purple-50 to-rose-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3">Key Insights</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <p><strong>Shared Values:</strong> You both prioritize family, personal growth, and authenticity in relationships.</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <p><strong>Communication Styles:</strong> Both prefer deep, meaningful conversations over small talk.</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <p><strong>Emotional Intelligence:</strong> High empathy and emotional awareness on both sides.</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
              <p><strong>Growth Area:</strong> Explore your different approaches to conflict resolution.</p>
            </div>
          </div>
        </div>

        {/* Match Potential */}
        <div className="text-center bg-white/60 backdrop-blur-sm rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-2">Match Potential</h4>
          <p className="text-sm text-gray-600 mb-3">
            Based on your compatibility scores, you have strong potential for a meaningful connection.
            Focus on building trust through open communication and shared experiences.
          </p>
          <div className="flex justify-center space-x-4 text-xs text-gray-500">
            <span>💝 Emotional Bond: Strong</span>
            <span>🎯 Shared Goals: Excellent</span>
            <span>🗣️ Communication: Good</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}