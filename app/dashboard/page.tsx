'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Heart, 
  MessageCircle, 
  Video, 
  Sparkles, 
  Brain,
  Users,
  Coffee,
  Loader2,
  PinOff,
  Timer,
  RefreshCw
} from 'lucide-react'
import { MatchChat } from '@/components/match-chat'
import { MatchCompatibility } from '@/components/match-compatibility'
import { UserStateIndicator } from '@/components/user-state-indicator'

interface CurrentMatch {
  id: string
  user: {
    id: string
    firstName: string
    lastName: string
    profileImage?: string
    bio?: string
    age?: number
  }
  compatibilityScore: number
  messageCount: number
  videoCallUnlocked: boolean
  createdAt: string
  lastMessage?: {
    content: string
    createdAt: string
    senderId: string
  }
}

// API Response types
interface MatchResponse {
  match: CurrentMatch | null
  error?: string
}

interface GenerateMatchResponse {
  success?: boolean
  error?: string
}

interface UnpinMatchResponse {
  success?: boolean
  error?: string
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentMatch, setCurrentMatch] = useState<CurrentMatch | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showChat, setShowChat] = useState(false)
  const [showCompatibility, setShowCompatibility] = useState(false)
  const [unpinning, setUnpinning] = useState(false)
  const [generatingMatch, setGeneratingMatch] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      fetchCurrentMatch()
    }
  }, [session])

  const fetchCurrentMatch = async () => {
    try {
      const response = await fetch('/api/matches/current')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data: MatchResponse = await response.json()
      
      if (data.match) {
        setCurrentMatch(data.match)
        setError('')
      } else if (data.error) {
        setError(data.error)
      } else {
        setError('Failed to fetch match')
      }
    } catch (error) {
      console.error('Error fetching current match:', error)
      setError(error instanceof Error ? error.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateMatch = async () => {
    setGeneratingMatch(true)
    setError('')
    
    try {
      const response = await fetch('/api/matches/generate', {
        method: 'GET' // Using GET to trigger match generation for current user
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: GenerateMatchResponse = await response.json()
      
      if (data.success !== false) {
        // Wait a moment then refresh the current match
        setTimeout(() => {
          fetchCurrentMatch()
        }, 1000)
      } else {
        setError(data.error || 'Failed to generate match')
      }
    } catch (error) {
      console.error('Error generating match:', error)
      setError(error instanceof Error ? error.message : 'Network error while generating match')
    } finally {
      setGeneratingMatch(false)
    }
  }

  const handleUnpinMatch = async () => {
    if (!currentMatch) return
    
    setUnpinning(true)
    setError('')
    
    try {
      const response = await fetch('/api/matches/unpin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId: currentMatch.id })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: UnpinMatchResponse = await response.json()
      
      if (data.success !== false) {
        setCurrentMatch(null)
        // Show freeze state message
        setError('Taking a 24-hour reflection break. You\'ll be able to receive new matches after this period.')
      } else {
        setError(data.error || 'Failed to unpin match')
      }
    } catch (error) {
      console.error('Error unpinning match:', error)
      setError(error instanceof Error ? error.message : 'Network error')
    } finally {
      setUnpinning(false)
    }
  }

  const getVideoCallProgress = (): number => {
    if (!currentMatch) return 0
    return Math.min(100, (currentMatch.messageCount / 100) * 100)
  }

  const getTimeRemaining = (): number => {
    if (!currentMatch) return 0
    const matchDate = new Date(currentMatch.createdAt)
    const now = new Date()
    const diffHours = (now.getTime() - matchDate.getTime()) / (1000 * 60 * 60)
    return Math.max(0, 48 - diffHours)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading your connection...</p>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-rose-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-rose-600 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-rose-600 bg-clip-text text-transparent">
                  Lone Town
                </h1>
                <p className="text-sm text-gray-600">Mindful Dating</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <UserStateIndicator />
              <Button
                variant="outline"
                onClick={() => router.push('/auth/signin')}
                className="text-purple-600 border-purple-200 hover:bg-purple-50"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {!currentMatch ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-r from-purple-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Timer className="w-12 h-12 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              No Active Match
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              You're currently not matched with anyone. New matches are generated daily based on deep compatibility analysis.
            </p>
            
            {/* Add manual match generation button for testing */}
            <div className="mb-6">
              <Button
                onClick={handleGenerateMatch}
                disabled={generatingMatch}
                className="bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-700 hover:to-rose-700 text-white"
              >
                {generatingMatch ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Finding Your Match...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Find My Match
                  </>
                )}
              </Button>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 max-w-md mx-auto">
              <Coffee className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <p className="text-sm text-gray-600">
                Take this time to reflect on what you're looking for in a meaningful connection.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Match Profile */}
            <div className="lg:col-span-1">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-purple-100">
                      <AvatarImage src={currentMatch.user.profileImage} />
                      <AvatarFallback className="bg-gradient-to-r from-purple-600 to-rose-600 text-white text-2xl">
                        {currentMatch.user.firstName[0]}{currentMatch.user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {currentMatch.user.firstName} {currentMatch.user.lastName}
                    </h3>
                    {currentMatch.user.age && (
                      <p className="text-gray-600">{currentMatch.user.age} years old</p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-rose-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        <span className="font-medium text-gray-700">Compatibility</span>
                      </div>
                      <Badge className="bg-gradient-to-r from-purple-600 to-rose-600 text-white">
                        {currentMatch.compatibilityScore}%
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <MessageCircle className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-gray-700">Messages</span>
                      </div>
                      <Badge variant="outline" className="border-blue-200 text-blue-700">
                        {currentMatch.messageCount}
                      </Badge>
                    </div>

                    <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Video className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-gray-700">Video Call</span>
                        </div>
                        <Badge 
                          variant={currentMatch.videoCallUnlocked ? "default" : "outline"}
                          className={currentMatch.videoCallUnlocked 
                            ? "bg-green-600 text-white" 
                            : "border-green-200 text-green-700"
                          }
                        >
                          {currentMatch.videoCallUnlocked ? "Unlocked" : "Locked"}
                        </Badge>
                      </div>
                      {!currentMatch.videoCallUnlocked && (
                        <div className="mt-2">
                          <Progress value={getVideoCallProgress()} className="h-2" />
                          <p className="text-xs text-gray-600 mt-1">
                            {100 - currentMatch.messageCount} messages to unlock
                          </p>
                          <p className="text-xs text-gray-500">
                            {getTimeRemaining().toFixed(1)} hours remaining
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-3">
                    <Button
                      onClick={() => setShowChat(!showChat)}
                      className="w-full bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-700 hover:to-rose-700 text-white"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      {showChat ? "Hide Chat" : "Open Chat"}
                    </Button>

                    <Button
                      onClick={() => setShowCompatibility(!showCompatibility)}
                      variant="outline"
                      className="w-full border-purple-200 text-purple-600 hover:bg-purple-50"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      {showCompatibility ? "Hide Analysis" : "View Compatibility"}
                    </Button>

                    {currentMatch.videoCallUnlocked && (
                      <Button
                        variant="outline"
                        className="w-full border-green-200 text-green-600 hover:bg-green-50"
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Start Video Call
                      </Button>
                    )}

                    <Button
                      onClick={handleUnpinMatch}
                      disabled={unpinning}
                      variant="outline"
                      className="w-full border-red-200 text-red-600 hover:bg-red-50"
                    >
                      {unpinning ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <PinOff className="w-4 h-4 mr-2" />
                      )}
                      {unpinning ? "Unpinning..." : "Unpin Match"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-2">
              {showChat ? (
                <MatchChat matchId={currentMatch.id} />
              ) : showCompatibility ? (
                <MatchCompatibility 
                  user1={currentMatch.user}
                  compatibilityScore={currentMatch.compatibilityScore}
                />
              ) : (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-purple-600" />
                      <span>Your Connection</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart className="w-8 h-8 text-purple-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        Focus on One Connection
                      </h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        You're matched with {currentMatch.user.firstName}. Take time to build a meaningful connection through thoughtful conversation.
                      </p>
                      <div className="bg-gradient-to-r from-purple-50 to-rose-50 rounded-lg p-6 max-w-lg mx-auto">
                        <h4 className="font-semibold text-gray-800 mb-3">Mindful Dating Tips:</h4>
                        <ul className="text-sm text-gray-600 space-y-2 text-left">
                          <li>• Share genuine thoughts and feelings</li>
                          <li>• Ask meaningful questions</li>
                          <li>• Listen actively to their responses</li>
                          <li>• Be present in your conversations</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}