'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Heart,
  Users,
  Snowflake,
  Sparkles,
} from 'lucide-react'

// Define user state type
interface UserState {
  state: 'AVAILABLE' | 'MATCHED' | 'PINNED' | 'FROZEN'
  frozenUntil?: string
  canReceiveMatchAt?: string
  intentionalityScore: number
  totalMatches: number
}

export function UserStateIndicator() {
  const { data: session } = useSession()
  const [userState, setUserState] = useState<UserState | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user) {
      fetchUserState()
    }
  }, [session])

  const fetchUserState = async () => {
    try {
      const response = await fetch('/api/user/state')
      const data = (await response.json()) as { state: UserState }

      if (response.ok) {
        setUserState(data.state)
      }
    } catch (error) {
      console.error('Error fetching user state:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStateDisplay = () => {
    if (!userState) return null

    switch (userState.state) {
      case 'AVAILABLE':
        return {
          icon: <Sparkles className="w-5 h-5 mr-2 text-green-700" />,
          label: 'Available',
          color: 'bg-green-100 text-green-800 border-green-200',
          description: 'Ready for your next meaningful connection',
        }
      case 'MATCHED':
        return {
          icon: <Heart className="w-5 h-5 mr-2 text-purple-700" />,
          label: 'Matched',
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          description: 'Focus on building your current connection',
        }
      case 'PINNED':
        return {
          icon: <Users className="w-5 h-5 mr-2 text-blue-700" />,
          label: 'Pinned',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          description: 'Committed to your current match',
        }
      case 'FROZEN':
        const frozenUntil = userState.frozenUntil ? new Date(userState.frozenUntil) : null
        const timeRemaining = frozenUntil ? Math.max(0, frozenUntil.getTime() - Date.now()) : 0
        const hoursRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60))

        return {
          icon: <Snowflake className="w-5 h-5 mr-2 text-gray-600" />,
          label: 'Reflection Period',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          description: hoursRemaining > 0 ? `${hoursRemaining}h remaining` : 'Almost ready',
        }
      default:
        return null
    }
  }

  if (loading) {
    return (
      <Card className="p-4 border-muted text-muted-foreground">
        <CardContent>Loading status...</CardContent>
      </Card>
    )
  }

  const stateDisplay = getStateDisplay()
  if (!stateDisplay) return null

  return (
    <Card className={`border ${stateDisplay.color} rounded-xl p-4`}>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center text-lg font-medium">
          {stateDisplay.icon}
          {stateDisplay.label}
        </div>
        <div className="text-sm">{stateDisplay.description}</div>
        <div className="text-sm text-muted-foreground mt-2 flex gap-2">
          <Badge variant="outline">
            Score: {userState?.intentionalityScore.toFixed(0)}
          </Badge>
          <Badge variant="outline">
            Matches: {userState?.totalMatches}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
