"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  Settings, 
  SkipBack, 
  SkipForward,
  Repeat,
  Shuffle,
  Download,
  Share,
  Clock,
  Wand2
} from "lucide-react"
import { useSpeechSynthesisEnhanced } from "@/hooks/use-speech-synthesis-enhanced"

interface AudioControlsEnhancedProps {
  text: string
  onProgressUpdate?: (progress: number) => void
}

export function AudioControlsEnhanced({ text, onProgressUpdate }: AudioControlsEnhancedProps) {
  const [showSettings, setShowSettings] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragProgress, setDragProgress] = useState(0)
  const [autoPlay, setAutoPlay] = useState(false)
  const [loopMode, setLoopMode] = useState(false)
  const progressBarRef = useRef<HTMLDivElement>(null)

  const {
    speak,
    pause,
    resume,
    stop,
    seekTo,
    skipSentence,
    isSupported,
    isPlaying,
    isPaused,
    voices,
    currentVoice,
    setVoice,
    rate,
    setRate,
    volume,
    setVolume,
    currentPosition,
    totalLength,
    currentSentence,
    totalSentences,
    estimatedTimeRemaining,
    progressPercentage
  } = useSpeechSynthesisEnhanced()

  // Update parent component with progress changes
  useEffect(() => {
    if (onProgressUpdate && progressPercentage >= 0) {
      onProgressUpdate(progressPercentage)
    }
  }, [progressPercentage, onProgressUpdate])

  if (!isSupported) {
    return (
      <Card className="p-8 text-center bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <Volume2 className="h-8 w-8 text-red-500" />
          </div>
          <div>
            <h3 className="font-semibold text-red-900 mb-2">Text-to-Speech Unavailable</h3>
            <p className="text-sm text-red-700">Your browser doesn't support text-to-speech functionality. Please try using a modern browser like Chrome, Safari, or Firefox.</p>
          </div>
        </div>
      </Card>
    )
  }

  const handlePlayPause = () => {
    if (isPlaying) {
      if (isPaused) {
        resume()
      } else {
        pause()
      }
    } else {
      speak(text, { loop: loopMode })
    }
  }

  const handleStop = () => {
    stop()
  }

  const progress = progressPercentage
  const displayProgress = isDragging ? dragProgress : progress

  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`
    }
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.round(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleProgressInteraction = (event: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
    if (!totalLength || !progressBarRef.current) return

    const rect = progressBarRef.current.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const percentage = Math.max(0, Math.min(1, clickX / rect.width))
    const newPosition = Math.round(percentage * totalLength)

    if (isDragging) {
      setDragProgress(percentage * 100)
    } else {
      seekTo(newPosition)
    }
  }

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !totalLength) return

    setIsDragging(true)
    const rect = progressBarRef.current.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const percentage = Math.max(0, Math.min(1, clickX / rect.width))
    setDragProgress(percentage * 100)

    const handleMouseMove = (e: MouseEvent) => {
      if (!progressBarRef.current || !totalLength) return
      const rect = progressBarRef.current.getBoundingClientRect()
      const moveX = e.clientX - rect.left
      const percentage = Math.max(0, Math.min(1, moveX / rect.width))
      setDragProgress(percentage * 100)
    }

    const handleMouseUp = (e: MouseEvent) => {
      setIsDragging(false)
      const newPosition = Math.round((dragProgress / 100) * totalLength)
      seekTo(newPosition)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  const getVoiceInfo = (voice: SpeechSynthesisVoice) => {
    const name = voice.name.toLowerCase()
    let quality = "Standard"
    let emoji = "🎤"
    
    if (name.includes("neural") || name.includes("premium")) {
      quality = "Neural"
      emoji = "🌟"
    } else if (name.includes("enhanced") || name.includes("natural")) {
      quality = "Enhanced"
      emoji = "✨"
    }
    
    return { quality, emoji }
  }

  const quickSpeedOptions = [
    { value: 0.5, label: "0.5x", desc: "Slow" },
    { value: 0.75, label: "0.75x", desc: "Relaxed" },
    { value: 1, label: "1x", desc: "Normal" },
    { value: 1.25, label: "1.25x", desc: "Fast" },
    { value: 1.5, label: "1.5x", desc: "Faster" },
    { value: 2, label: "2x", desc: "Rapid" }
  ]

  return (
    <div className="space-y-6">
      {/* Enhanced Progress Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Progress</span>
          </div>
          <div className="flex items-center gap-4 text-muted-foreground">
            {totalSentences > 0 && (
              <span>Sentence {currentSentence} of {totalSentences}</span>
            )}
            <span>{Math.round(displayProgress)}%</span>
          </div>
        </div>
        
        {/* Enhanced Progress Bar */}
        <div
          ref={progressBarRef}
          className={`relative w-full bg-gradient-to-r from-muted via-muted to-muted rounded-full transition-all duration-200 select-none cursor-pointer group ${
            isDragging ? "h-4" : "h-3 hover:h-4"
          }`}
          onMouseDown={handleMouseDown}
          title="Click or drag to seek to position"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Progress fill */}
          <div
            className={`relative bg-gradient-to-r from-primary to-primary/80 h-full rounded-full transition-all shadow-sm ${
              isDragging ? "duration-75" : "duration-300"
            }`}
            style={{ width: `${displayProgress}%` }}
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-primary rounded-full blur-sm opacity-50" />
            
            {/* Handle */}
            <div
              className={`absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 rounded-full shadow-lg border-2 border-background transition-all duration-200 ${
                isDragging ? "w-5 h-5 bg-primary shadow-primary/50" : "w-4 h-4 bg-primary group-hover:w-5 group-hover:h-5"
              }`}
            >
              <div className="absolute inset-0.5 bg-primary-foreground/20 rounded-full" />
            </div>
          </div>
        </div>
        
        {/* Enhanced Progress Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            {isDragging ? (
              <>Seeking...</>
            ) : (
              <>Position: {Math.round((displayProgress / 100) * totalLength)} / {totalLength} chars</>
            )}
          </span>
          {estimatedTimeRemaining > 0 && (
            <span>~{formatTime(estimatedTimeRemaining)} remaining</span>
          )}
        </div>
      </div>

      {/* Enhanced Main Controls */}
      <div className="flex items-center gap-4">
        {/* Skip Back */}
        <Button
          onClick={() => skipSentence(-1)}
          variant="outline"
          size="lg"
          className="h-12 w-12 rounded-full bg-background/50 hover:bg-background border-border/50 hover:scale-105 transition-all duration-200"
          disabled={!isPlaying || currentSentence <= 1}
          title="Previous sentence"
        >
          <SkipBack className="h-4 w-4" />
        </Button>

        {/* Play/Pause */}
        <Button 
          onClick={handlePlayPause} 
          size="lg" 
          className="h-16 w-16 rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        >
          {isPlaying && !isPaused ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6 ml-0.5" />
          )}
        </Button>

        {/* Stop */}
        <Button
          onClick={handleStop}
          variant="outline"
          size="lg"
          className="h-12 w-12 rounded-full bg-background/50 hover:bg-background border-border/50 hover:scale-105 transition-all duration-200"
          disabled={!isPlaying}
          title="Stop"
        >
          <Square className="h-4 w-4" />
        </Button>

        {/* Skip Forward */}
        <Button
          onClick={() => skipSentence(1)}
          variant="outline"
          size="lg"
          className="h-12 w-12 rounded-full bg-background/50 hover:bg-background border-border/50 hover:scale-105 transition-all duration-200"
          disabled={!isPlaying || currentSentence >= totalSentences}
          title="Next sentence"
        >
          <SkipForward className="h-4 w-4" />
        </Button>

        {/* Volume Control */}
        <div className="flex-1 flex items-center gap-3">
          <Volume2 className="h-5 w-5 text-muted-foreground" />
          <Slider
            value={[volume * 100]}
            onValueChange={(value) => setVolume(value[0] / 100)}
            max={100}
            step={5}
            className="flex-1"
          />
          <Badge variant="outline" className="w-12 text-center">
            {Math.round(volume * 100)}%
          </Badge>
        </div>

        {/* Settings Toggle */}
        <Button 
          onClick={() => setShowSettings(!showSettings)} 
          variant="outline" 
          size="lg"
          className={`h-12 w-12 rounded-full transition-all duration-200 hover:scale-105 ${
            showSettings ? "bg-primary/10 border-primary/30 text-primary" : "bg-background/50 hover:bg-background border-border/50"
          }`}
        >
          <Settings className={`h-5 w-5 ${showSettings ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Enhanced Settings Panel */}
      {showSettings && (
        <Card className="p-6 space-y-6 bg-gradient-to-br from-card to-card/50 border-border/50">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" />
              Audio Settings
            </h4>
            <Badge variant="secondary" className="text-xs">
              {voices.length} voices available
            </Badge>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Voice Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Voice Selection
              </label>
              <Select
                value={currentVoice?.name || ""}
                onValueChange={(value) => {
                  const voice = voices.find((v) => v.name === value)
                  if (voice) setVoice(voice)
                }}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {voices.map((voice) => {
                    const { quality, emoji } = getVoiceInfo(voice)
                    return (
                      <SelectItem key={voice.name} value={voice.name}>
                        <div className="flex items-center gap-3 w-full">
                          <span>{emoji}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{voice.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {quality} • {voice.lang}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              <div className="text-xs text-muted-foreground">
                🌟 Neural • ✨ Enhanced • 🎤 Standard
              </div>
            </div>

            {/* Speed Control */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Playback Speed
                </label>
                <Badge variant="outline">{rate.toFixed(2)}x</Badge>
              </div>
              
              {/* Quick Speed Buttons */}
              <div className="grid grid-cols-3 gap-1 mb-2">
                {quickSpeedOptions.map((option) => (
                  <Button
                    key={option.value}
                    onClick={() => setRate(option.value)}
                    variant={rate === option.value ? "default" : "outline"}
                    size="sm"
                    className="text-xs h-8"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
              
              <Slider 
                value={[rate]} 
                onValueChange={(value) => setRate(value[0])} 
                min={0.25} 
                max={3} 
                step={0.05} 
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0.25x</span>
                <span>1x</span>
                <span>3x</span>
              </div>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="grid gap-4 md:grid-cols-2 pt-4 border-t border-border/50">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Repeat className="h-4 w-4" />
                  Loop Mode
                </label>
                <p className="text-xs text-muted-foreground">Automatically restart when finished</p>
              </div>
              <Switch
                checked={loopMode}
                onCheckedChange={setLoopMode}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Auto-play
                </label>
                <p className="text-xs text-muted-foreground">Start playing when document loads</p>
              </div>
              <Switch
                checked={autoPlay}
                onCheckedChange={setAutoPlay}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Enhanced Status */}
      <div className="text-center p-4 rounded-lg bg-muted/30 border border-border/50">
        <p className="text-sm text-muted-foreground">
          {isPlaying ? (
            isPaused ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                Paused
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Playing...
              </span>
            )
          ) : (
            <span className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full" />
              Ready to play
            </span>
          )}
          {currentVoice && (
            <span className="ml-3 text-xs">
              • {getVoiceInfo(currentVoice).emoji} {currentVoice.name}
            </span>
          )}
        </p>
      </div>
    </div>
  )
}