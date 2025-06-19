'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Heart, Brain, MessageSquare, Target, Star, Users, Loader2 } from 'lucide-react'

export default function Assessment() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    emotionalIntelligence: 50,
    communicationStyle: 50,
    conflictResolution: 50,
    relationshipGoals: 50,
    lifeValues: 50,
    personalityType: '',
    loveLanguage: '',
    attachmentStyle: ''
  })

  const steps = [
    {
      title: 'Emotional Intelligence',
      icon: <Heart className="w-6 h-6" />,
      description: 'How well do you understand and manage emotions?',
      fields: ['emotionalIntelligence']
    },
    {
      title: 'Communication Style',
      icon: <MessageSquare className="w-6 h-6" />,
      description: 'How do you prefer to communicate in relationships?',
      fields: ['communicationStyle']
    },
    {
      title: 'Conflict Resolution',
      icon: <Users className="w-6 h-6" />,
      description: 'How do you handle disagreements and conflicts?',
      fields: ['conflictResolution']
    },
    {
      title: 'Life Values',
      icon: <Star className="w-6 h-6" />,
      description: 'What matters most to you in life?',
      fields: ['lifeValues']
    },
    {
      title: 'Relationship Goals',
      icon: <Target className="w-6 h-6" />,
      description: 'What are you looking for in a relationship?',
      fields: ['relationshipGoals']
    },
    {
      title: 'Personality & Preferences',
      icon: <Brain className="w-6 h-6" />,
      description: 'Tell us about your personality and preferences',
      fields: ['personalityType', 'loveLanguage', 'attachmentStyle']
    }
  ]

  const handleSliderChange = (field: string, value: number[]) => {
    setFormData(prev => ({ ...prev, [field]: value[0] }))
  }

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        router.push('/dashboard')
      } else {
        console.error('Assessment submission failed')
      }
    } catch (error) {
      console.error('Error submitting assessment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    const step = steps[currentStep]

    switch (currentStep) {
      case 0: // Emotional Intelligence
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Emotional Intelligence</h3>
              <p className="text-gray-600 text-sm">Rate your ability to understand and manage emotions</p>
            </div>
            
            <div className="space-y-4">
              <Label>How well do you understand your own emotions? ({formData.emotionalIntelligence}%)</Label>
              <Slider
                value={[formData.emotionalIntelligence]}
                onValueChange={(value) => handleSliderChange('emotionalIntelligence', value)}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Need improvement</span>
                <span>Very strong</span>
              </div>
            </div>
          </div>
        )

      case 1: // Communication Style
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Communication Style</h3>
              <p className="text-gray-600 text-sm">How do you prefer to communicate?</p>
            </div>
            
            <div className="space-y-4">
              <Label>Communication openness and directness ({formData.communicationStyle}%)</Label>
              <Slider
                value={[formData.communicationStyle]}
                onValueChange={(value) => handleSliderChange('communicationStyle', value)}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Reserved, indirect</span>
                <span>Open, direct</span>
              </div>
            </div>
          </div>
        )

      case 2: // Conflict Resolution
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Conflict Resolution</h3>
              <p className="text-gray-600 text-sm">How do you handle disagreements?</p>
            </div>
            
            <div className="space-y-4">
              <Label>Conflict resolution approach ({formData.conflictResolution}%)</Label>
              <Slider
                value={[formData.conflictResolution]}
                onValueChange={(value) => handleSliderChange('conflictResolution', value)}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Avoid conflicts</span>
                <span>Address directly</span>
              </div>
            </div>
          </div>
        )

      case 3: // Life Values
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Life Values</h3>
              <p className="text-gray-600 text-sm">What matters most to you?</p>
            </div>
            
            <div className="space-y-4">
              <Label>Traditional vs. Progressive values ({formData.lifeValues}%)</Label>
              <Slider
                value={[formData.lifeValues]}
                onValueChange={(value) => handleSliderChange('lifeValues', value)}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Traditional</span>
                <span>Progressive</span>
              </div>
            </div>
          </div>
        )

      case 4: // Relationship Goals
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Relationship Goals</h3>
              <p className="text-gray-600 text-sm">What are you looking for?</p>
            </div>
            
            <div className="space-y-4">
              <Label>Relationship timeline and commitment level ({formData.relationshipGoals}%)</Label>
              <Slider
                value={[formData.relationshipGoals]}
                onValueChange={(value) => handleSliderChange('relationshipGoals', value)}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Casual, exploring</span>
                <span>Serious, committed</span>
              </div>
            </div>
          </div>
        )

      case 5: // Personality & Preferences
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Personality & Preferences</h3>
              <p className="text-gray-600 text-sm">Help us understand you better</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="personalityType">Personality Type (Optional)</Label>
                <Select onValueChange={(value) => handleSelectChange('personalityType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select if you know your type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INTJ">INTJ - The Architect</SelectItem>
                    <SelectItem value="INTP">INTP - The Thinker</SelectItem>
                    <SelectItem value="ENTJ">ENTJ - The Commander</SelectItem>
                    <SelectItem value="ENTP">ENTP - The Debater</SelectItem>
                    <SelectItem value="INFJ">INFJ - The Advocate</SelectItem>
                    <SelectItem value="INFP">INFP - The Mediator</SelectItem>
                    <SelectItem value="ENFJ">ENFJ - The Protagonist</SelectItem>
                    <SelectItem value="ENFP">ENFP - The Campaigner</SelectItem>
                    <SelectItem value="ISTJ">ISTJ - The Logistician</SelectItem>
                    <SelectItem value="ISFJ">ISFJ - The Protector</SelectItem>
                    <SelectItem value="ESTJ">ESTJ - The Executive</SelectItem>
                    <SelectItem value="ESFJ">ESFJ - The Consul</SelectItem>
                    <SelectItem value="ISTP">ISTP - The Virtuoso</SelectItem>
                    <SelectItem value="ISFP">ISFP - The Adventurer</SelectItem>
                    <SelectItem value="ESTP">ESTP - The Entrepreneur</SelectItem>
                    <SelectItem value="ESFP">ESFP - The Entertainer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="loveLanguage">Love Language</Label>
                <Select onValueChange={(value) => handleSelectChange('loveLanguage', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="How do you best receive love?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="words">Words of Affirmation</SelectItem>
                    <SelectItem value="acts">Acts of Service</SelectItem>
                    <SelectItem value="gifts">Receiving Gifts</SelectItem>
                    <SelectItem value="time">Quality Time</SelectItem>
                    <SelectItem value="touch">Physical Touch</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="attachmentStyle">Attachment Style</Label>
                <Select onValueChange={(value) => handleSelectChange('attachmentStyle', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Your attachment style in relationships" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="secure">Secure - Comfortable with intimacy</SelectItem>
                    <SelectItem value="anxious">Anxious - Seeks closeness, fears abandonment</SelectItem>
                    <SelectItem value="avoidant">Avoidant - Values independence</SelectItem>
                    <SelectItem value="disorganized">Disorganized - Mixed patterns</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (status === 'loading') {
    return <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-rose-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
    </div>
  }

  if (!session) {
    router.push('/auth/signin')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-rose-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-rose-600 rounded-full mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-rose-600 bg-clip-text text-transparent mb-2">
            Compatibility Assessment
          </h1>
          <p className="text-gray-600">Help us find your perfect match</p>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
            </span>
          </div>
          <Progress value={((currentStep + 1) / steps.length) * 100} className="h-2" />
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            {renderStepContent()}
          </CardContent>
        </Card>

        <div className="flex justify-between mt-6">
          <Button
            onClick={prevStep}
            disabled={currentStep === 0}
            variant="outline"
            className="border-purple-200 text-purple-600 hover:bg-purple-50"
          >
            Previous
          </Button>
          
          {currentStep === steps.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-700 hover:to-rose-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Complete Assessment'
              )}
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              className="bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-700 hover:to-rose-700 text-white"
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}