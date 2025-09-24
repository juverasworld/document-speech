"use client"

import React from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { 
  Download, 
  Share2, 
  Clock, 
  BarChart3,
  Target,
  TrendingUp,
  Award,
  BookOpen
} from "lucide-react"

interface ReadingStatsProps {
  totalCharacters: number
  totalWords: number
  totalSentences: number
  estimatedReadingTime: number
  currentProgress: number
  readingSpeed: number // words per minute
  timeSpent: number // seconds
}

export const ReadingStats: React.FC<ReadingStatsProps> = ({
  totalCharacters,
  totalWords,
  totalSentences,
  estimatedReadingTime,
  currentProgress,
  readingSpeed,
  timeSpent
}) => {
  const wordsCompleted = Math.round((currentProgress / 100) * totalWords)
  const efficiency = timeSpent > 0 ? Math.round((wordsCompleted / timeSpent) * 60) : 0
  
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.round(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getReadingLevel = () => {
    if (efficiency >= 200) return { level: "Expert", color: "text-purple-600", icon: Award }
    if (efficiency >= 150) return { level: "Advanced", color: "text-blue-600", icon: TrendingUp }
    if (efficiency >= 100) return { level: "Intermediate", color: "text-green-600", icon: Target }
    return { level: "Beginner", color: "text-orange-600", icon: BookOpen }
  }

  const readingLevel = getReadingLevel()
  const ReadingIcon = readingLevel.icon

  return (
    <Card className="p-6 bg-gradient-to-r from-card to-card/80 border-border/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Reading Analytics
        </h3>
        <Badge variant="outline" className={`${readingLevel.color} border-current`}>
          <ReadingIcon className="h-3 w-3 mr-1" />
          {readingLevel.level}
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 rounded-lg bg-muted/50">
          <div className="text-2xl font-bold text-foreground">{totalWords}</div>
          <div className="text-xs text-muted-foreground">Total Words</div>
        </div>
        
        <div className="text-center p-3 rounded-lg bg-muted/50">
          <div className="text-2xl font-bold text-primary">{wordsCompleted}</div>
          <div className="text-xs text-muted-foreground">Words Read</div>
        </div>
        
        <div className="text-center p-3 rounded-lg bg-muted/50">
          <div className="text-2xl font-bold text-foreground">{formatTime(timeSpent)}</div>
          <div className="text-xs text-muted-foreground">Time Spent</div>
        </div>
        
        <div className="text-center p-3 rounded-lg bg-muted/50">
          <div className="text-2xl font-bold text-primary">{efficiency}</div>
          <div className="text-xs text-muted-foreground">WPM Rate</div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{currentProgress.toFixed(1)}%</span>
          </div>
          <Progress value={currentProgress} className="h-2" />
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            {formatTime(estimatedReadingTime - (timeSpent * currentProgress / 100))} remaining
          </span>
        </div>
      </div>
    </Card>
  )
}

// Quick Actions Panel
export const QuickActions: React.FC<{
  onDownload?: () => void
  onShare?: () => void
  canDownload?: boolean
  canShare?: boolean
}> = ({ onDownload, onShare, canDownload = false, canShare = false }) => {
  const handleDownload = () => {
    if (onDownload) onDownload()
  }

  const handleShare = async () => {
    if (navigator.share && canShare) {
      try {
        await navigator.share({
          title: 'Document Reading Session',
          text: 'Check out this document reading experience!',
          url: window.location.href
        })
      } catch (error) {
        console.log('Share failed:', error)
        if (onShare) onShare()
      }
    } else if (onShare) {
      onShare()
    }
  }

  return (
    <Card className="p-4">
      <h4 className="text-sm font-medium mb-3">Quick Actions</h4>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={!canDownload}
          className="flex-1"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          disabled={!canShare}
          className="flex-1"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>
    </Card>
  )
}