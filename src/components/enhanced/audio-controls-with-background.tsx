"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Play, Pause, Square, Volume2, Settings, SkipBack, SkipForward,
  Bookmark, Clock, Gauge, Headphones, Mic2, Volume1, VolumeX
} from "lucide-react"
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis-background"
import { BackgroundAudioController } from "@/components/enhanced/background-audio-controller"
import { cn } from "@/lib/utils"

interface AudioControlsProps {
  text: string
}

const SPEED_PRESETS = [
  { label: "0.5x", value: 0.5, icon: "🐌" },
  { label: "0.75x", value: 0.75, icon: "🚶" },
  { label: "1x", value: 1.0, icon: "🏃" },
  { label: "1.25x", value: 1.25, icon: "🏃‍♂️" },
  { label: "1.5x", value: 1.5, icon: "🏃‍♀️" },
  { label: "2x", value: 2.0, icon: "🚀" },
]

export function AudioControls({ text }: AudioControlsProps) {
  const [showSettings, setShowSettings] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragProgress, setDragProgress] = useState(0)
  const [bookmarks, setBookmarks] = useState<number[]>([])
  const [visualizerData, setVisualizerData] = useState<number[]>(new Array(15).fill(0))
  const [isMobile, setIsMobile] = useState(false)
  const [showBackgroundControls, setShowBackgroundControls] = useState(false)
  const progressBarRef = useRef<HTMLDivElement>(null)

  const {
    speak,
    pause,
    resume,
    stop,
    seekTo,
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
  } = useSpeechSynthesis({
    onStart: () => {
      console.log('Audio started - registering background support')
      // Register service worker for background audio
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw-background-audio.js')
          .then(registration => {
            console.log('Background audio service worker registered')
            
            // Send message to maintain audio
            if (registration.active) {
              registration.active.postMessage({
                type: 'MAINTAIN_AUDIO',
                shouldMaintain: true
              })
            }
          })
          .catch(err => console.log('Service worker registration failed:', err))
      }
    },
    onEnd: () => {
      console.log('Audio ended')
      // Stop maintaining background audio
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          if (registration.active) {
            registration.active.postMessage({
              type: 'MAINTAIN_AUDIO',
              shouldMaintain: false
            })
          }
        })
      }
    }
  })

  // Detect mobile and auto-show background controls
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      setShowBackgroundControls(mobile) // Auto-show on mobile
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Simulate audio visualizer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying && !isPaused) {
      interval = setInterval(() => {
        setVisualizerData(prev => 
          prev.map(() => Math.random() * 100)
        )
      }, 100)
    }
    return () => clearInterval(interval)
  }, [isPlaying, isPaused])

  // Listen for service worker messages
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handleServiceWorkerMessage = (event: MessageEvent) => {
        if (event.data.type === 'RESUME_AUDIO_IF_NEEDED') {
          console.log('Service worker requesting audio resume check')
          // Check if we should be playing but aren't
          if (isPlaying && isPaused && 'speechSynthesis' in window) {
            if (window.speechSynthesis.paused) {
              console.log('Resuming paused speech synthesis')
              window.speechSynthesis.resume()
            }
          }
        }
      }

      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage)
      
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage)
      }
    }
  }, [isPlaying, isPaused])

  if (!isSupported) {
    return (
      <Card className="p-4 text-center border-0 shadow-lg bg-gradient-to-br from-destructive/5 to-destructive/10">
        <div className="max-w-md mx-auto">
          <div className="p-4 rounded-full bg-destructive/10 w-fit mx-auto mb-4">
            <VolumeX className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Audio Not Supported</h3>
          <p className="text-sm text-muted-foreground">
            Text-to-speech is not supported in your current browser. Please try using Chrome, Firefox, or Safari.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <Badge variant="outline" className="text-xs">Chrome ✓</Badge>
            <Badge variant="outline" className="text-xs">Firefox ✓</Badge>
            <Badge variant="outline" className="text-xs">Safari ✓</Badge>
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
      speak(text)
    }
  }

  const handleStop = () => {
    stop()
    // Stop background audio maintenance
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        if (registration.active) {
          registration.active.postMessage({
            type: 'MAINTAIN_AUDIO',
            shouldMaintain: false
          })
        }
      })
    }
  }

  const handleSkip = (seconds: number) => {
    const wordsPerSecond = 3.3
    const charactersToSkip = Math.round(seconds * wordsPerSecond * 5)
    const newPosition = Math.max(0, Math.min(totalLength, currentPosition + charactersToSkip))
    seekTo(newPosition)
  }

  const addBookmark = () => {
    if (!bookmarks.includes(currentPosition)) {
      setBookmarks([...bookmarks, currentPosition].sort((a, b) => a - b))
    }
  }

  const jumpToBookmark = (position: number) => {
    seekTo(position)
  }

  const progress = totalLength > 0 ? (currentPosition / totalLength) * 100 : 0
  const displayProgress = isDragging ? dragProgress : progress

  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!totalLength || !progressBarRef.current) return

    const rect = progressBarRef.current.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const percentage = Math.max(0, Math.min(1, clickX / rect.width))
    const newPosition = Math.round(percentage * totalLength)
    seekTo(newPosition)
  }

  const getVoiceQuality = (voice: SpeechSynthesisVoice) => {
    const name = voice.name.toLowerCase()
    if (name.includes("neural") || name.includes("premium")) return "🌟"
    if (name.includes("enhanced") || name.includes("natural")) return "✨"
    return ""
  }

  const formatTime = (position: number, total: number) => {
    const percentage = total > 0 ? position / total : 0
    const estimatedSeconds = Math.round(percentage * (text.split(' ').length / 2.5))
    const minutes = Math.floor(estimatedSeconds / 60)
    const seconds = estimatedSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getVolumeIcon = () => {
    if (volume === 0) return VolumeX
    if (volume < 0.5) return Volume1
    return Volume2
  }

  const VolumeIcon = getVolumeIcon()

  return (
    <TooltipProvider>
      <div className="w-full max-w-4xl mx-auto space-y-4">
        {/* Background Audio Controls - Show by default on mobile */}
        {(showBackgroundControls || isMobile) && (
          <BackgroundAudioController
            isPlaying={isPlaying && !isPaused}
            onPlayStateChange={(playing) => {
              if (playing && !isPlaying) {
                speak(text)
              }
            }}
          />
        )}

        {/* Audio Visualizer - Desktop Only */}
        {!isMobile && (
          <Card className="p-4 border-0 shadow-lg bg-gradient-to-r from-primary/5 to-purple-500/5">
            <div className="flex items-center justify-center gap-1 h-16">
              {visualizerData.map((height, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-2 bg-gradient-to-t from-primary to-purple-500 rounded-full transition-all duration-150",
                    isPlaying && !isPaused ? "animate-pulse" : ""
                  )}
                  style={{ 
                    height: isPlaying && !isPaused ? `${Math.max(4, height * 0.6)}px` : '4px',
                    opacity: isPlaying && !isPaused ? Math.max(0.3, height / 100) : 0.3
                  }}
                />
              ))}
            </div>
          </Card>
        )}

        {/* Progress Bar */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {!isMobile && formatTime(currentPosition, totalLength)}
            </span>
            <span className="flex items-center gap-2">
              {!isMobile && "Progress: "}{Math.round(displayProgress)}%
              <Gauge className="h-4 w-4" />
            </span>
          </div>
          
          <div
            ref={progressBarRef}
            className="relative w-full bg-muted rounded-full h-4 cursor-pointer transition-all duration-200 group overflow-hidden hover:h-5"
            onClick={handleProgressClick}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent opacity-50" />
            
            <div
              className="relative bg-gradient-to-r from-primary to-purple-500 h-full rounded-full transition-all shadow-lg duration-300"
              style={{ width: `${displayProgress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
              
              <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full shadow-lg border-2 border-background transition-all duration-200 group-hover:scale-110" />
            </div>
            
            {bookmarks.map((bookmark, index) => (
              <button
                key={index}
                className="absolute top-1/2 transform -translate-y-1/2 w-2 h-6 bg-yellow-500 rounded-sm shadow-md hover:bg-yellow-400 transition-colors z-10"
                style={{ left: `${(bookmark / totalLength) * 100}%` }}
                onClick={(e) => {
                  e.stopPropagation()
                  jumpToBookmark(bookmark)
                }}
                title={`Bookmark ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Main Controls */}
        <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
          {/* Primary Controls */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <Button
              onClick={() => handleSkip(-10)}
              variant="outline"
              size={isMobile ? "sm" : "lg"}
              className={cn(
                "rounded-full border-2 hover:scale-110 transition-transform",
                isMobile ? "h-10 w-10" : "h-12 w-12"
              )}
              disabled={!isPlaying}
            >
              <SkipBack className={cn(isMobile ? "h-4 w-4" : "h-5 w-5")} />
            </Button>

            <Button 
              onClick={handlePlayPause} 
              size="lg" 
              className={cn(
                "rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 bg-gradient-to-br from-primary to-primary/80",
                isMobile ? "h-14 w-14" : "h-16 w-16"
              )}
            >
              {isPlaying && !isPaused ? 
                <Pause className={cn(isMobile ? "h-5 w-5" : "h-6 w-6")} /> : 
                <Play className={cn(isMobile ? "h-5 w-5 ml-0.5" : "h-6 w-6 ml-1")} />
              }
            </Button>

            <Button
              onClick={() => handleSkip(10)}
              variant="outline"
              size={isMobile ? "sm" : "lg"}
              className={cn(
                "rounded-full border-2 hover:scale-110 transition-transform",
                isMobile ? "h-10 w-10" : "h-12 w-12"
              )}
              disabled={!isPlaying}
            >
              <SkipForward className={cn(isMobile ? "h-4 w-4" : "h-5 w-5")} />
            </Button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-3 mb-6">
            <VolumeIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <Slider
              value={[volume * 100]}
              onValueChange={(value) => setVolume(value[0] / 100)}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground w-10">{Math.round(volume * 100)}%</span>
          </div>

          {/* Secondary Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Button
                onClick={handleStop}
                variant="outline"
                size="sm"
                className="h-10 w-10 rounded-full"
                disabled={!isPlaying}
              >
                <Square className="h-4 w-4" />
              </Button>

              <Button
                onClick={addBookmark}
                variant="outline"
                size="sm"
                className="h-10 w-10 rounded-full"
                disabled={!isPlaying}
              >
                <Bookmark className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {!isMobile && (
                <Button
                  onClick={() => setShowBackgroundControls(!showBackgroundControls)}
                  variant="outline"
                  size="sm"
                  className="h-10 px-3 rounded-full"
                  title="Background Audio Controls"
                >
                  🔋
                </Button>
              )}
              
              <Button 
                onClick={() => setShowSettings(!showSettings)} 
                variant="outline" 
                size="sm"
                className="h-10 w-10 rounded-full"
              >
                <Settings className={cn(
                  "h-4 w-4 transition-transform duration-300",
                  showSettings && "rotate-45"
                )} />
              </Button>
            </div>
          </div>

          {/* Speed Presets */}
          <div className="border-t border-border/50 pt-4">
            <div className="text-center mb-3">
              <span className="text-sm text-muted-foreground">Speed Control</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {SPEED_PRESETS.map((preset) => (
                <Button
                  key={preset.value}
                  variant={rate === preset.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRate(preset.value)}
                  className="h-8 text-xs"
                >
                  <span className="mr-1">{preset.icon}</span>
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Settings Panel */}
        {showSettings && (
          <Card className="p-6 border-0 shadow-xl bg-gradient-to-br from-card to-card/90 backdrop-blur-sm">
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                <Settings className="h-5 w-5" />
                Audio Settings
              </h4>
              
              <div className="space-y-6">
                {/* Voice Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Mic2 className="h-4 w-4" />
                    Voice Selection
                    <Badge variant="secondary" className="text-xs">
                      {voices.length} available
                    </Badge>
                  </label>
                  <Select
                    value={currentVoice?.name || ""}
                    onValueChange={(value) => {
                      const voice = voices.find((v) => v.name === value)
                      if (voice) setVoice(voice)
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a voice" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {voices.map((voice) => (
                        <SelectItem key={voice.name} value={voice.name}>
                          <div className="flex items-center gap-2">
                            <span>{getVoiceQuality(voice)}</span>
                            <span className="font-medium text-sm">{voice.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Speed Control */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Gauge className="h-4 w-4" />
                      Reading Speed
                    </label>
                    <Badge variant="outline" className="text-xs">
                      {rate.toFixed(1)}x
                    </Badge>
                  </div>
                  <Slider 
                    value={[rate]} 
                    onValueChange={(value) => setRate(value[0])} 
                    min={0.5} 
                    max={2} 
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>🐌 0.5x</span>
                    <span>🚶 1x</span>
                    <span>🚀 2x</span>
                  </div>
                </div>

                {/* Bookmarks */}
                {bookmarks.length > 0 && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Bookmark className="h-4 w-4" />
                      Bookmarks
                      <Badge variant="secondary" className="text-xs">
                        {bookmarks.length}
                      </Badge>
                    </label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {bookmarks.map((bookmark, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                          <span className="text-sm">Bookmark {index + 1}</span>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => jumpToBookmark(bookmark)}
                              className="h-6 px-2 text-xs"
                            >
                              Go
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setBookmarks(bookmarks.filter((_, i) => i !== index))}
                              className="h-6 px-2 text-xs text-destructive hover:text-destructive"
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Status Bar */}
        <Card className="p-4 border-0 shadow-lg bg-gradient-to-r from-card to-card/80 backdrop-blur-sm">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  isPlaying ? (isPaused ? "bg-yellow-500" : "bg-green-500 animate-pulse") : "bg-gray-400"
                )} />
                <span className="text-muted-foreground">
                  {isPlaying ? (isPaused ? "Paused" : "Playing") : "Ready"}
                </span>
              </div>
              
              {currentVoice && !isMobile && (
                <div className="flex items-center gap-2">
                  <Headphones className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground truncate max-w-32">
                    {getVoiceQuality(currentVoice)} {currentVoice.name}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {!isMobile && <span>Bookmarks: {bookmarks.length}</span>}
              <span>Speed: {rate}x</span>
              <span>Vol: {Math.round(volume * 100)}%</span>
            </div>
          </div>
        </Card>
      </div>
    </TooltipProvider>
  )
}