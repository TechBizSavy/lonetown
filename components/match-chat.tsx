'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Send, MessageCircle, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Message {
  id: string
  content: string
  senderId: string
  createdAt: string
  isRead: boolean
}

interface MatchChatProps {
  matchId: string
}

// API Response types
interface MessagesResponse {
  messages: Message[]
  error?: string
}

interface SendMessageResponse {
  message: Message
  error?: string
}

export function MatchChat({ matchId }: MatchChatProps) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string>('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMessages()
  }, [matchId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/matches/${matchId}/messages`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data: MessagesResponse = await response.json()
      
      if (data.messages) {
        setMessages(data.messages)
        setError('')
      } else if (data.error) {
        setError(data.error)
        setMessages([])
      } else {
        setMessages([])
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
      setError(error instanceof Error ? error.message : 'Failed to load messages')
      setMessages([])
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)
    setError('')
    
    try {
      const response = await fetch(`/api/matches/${matchId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage.trim() })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: SendMessageResponse = await response.json()
      
      if (data.message) {
        setMessages(prev => [...prev, data.message])
        setNewMessage('')
      } else if (data.error) {
        setError(data.error)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setError(error instanceof Error ? error.message : 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const formatMessageTime = (timestamp: string): string => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    } catch (error) {
      console.error('Error formatting time:', error)
      return 'Unknown time'
    }
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl h-[600px] flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5 text-purple-600" />
            <span>Conversation</span>
          </div>
          <Badge variant="outline" className="border-purple-200 text-purple-700">
            {messages.length} messages
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {error && (
          <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
        
        <ScrollArea className="flex-1 px-6" ref={scrollRef}>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-rose-600 rounded-full animate-pulse mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Loading messages...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-2">Start your conversation</p>
                <p className="text-sm text-gray-500">Send the first message to begin building your connection</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {messages.map((message) => {
                const isOwn = message.senderId === session?.user?.id
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className={`text-sm ${isOwn ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                          {isOwn ? 'You' : 'Them'}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`rounded-lg px-3 py-2 ${
                        isOwn 
                          ? 'bg-gradient-to-r from-purple-600 to-rose-600 text-white' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <div className={`flex items-center space-x-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <Clock className="w-3 h-3 opacity-70" />
                          <span className="text-xs opacity-70">
                            {formatMessageTime(message.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>

        <div className="border-t border-gray-100 p-4">
          <form onSubmit={sendMessage} className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
              disabled={sending}
            />
            <Button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-700 hover:to-rose-700 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Exchange 100 messages in 48 hours to unlock video calling
          </p>
        </div>
      </CardContent>
    </Card>
  )
}