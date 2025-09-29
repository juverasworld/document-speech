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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Play, Pause, Square, Volume2, Settings, SkipBack, SkipForward,
  Repeat, Shuffle, Bookmark, Download, Share2, Clock,
  Gauge, Headphones, Mic2, Brain, Zap, Volume1, VolumeX, Menu
} from "lucide-react"
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis"
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
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [visualizerData, setVisualizerData] = useState<number[]>(new Array(20).fill(0))
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
  } = useSpeechSynthesis()

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

  if (!isSupported) {
    return (
      <Card className="p-4 sm:p-8 text-center border-0 shadow-lg bg-gradient-to-br from-destructive/5 to-destructive/10">
        <div className="max-w-md mx-auto">
          <div className="p-3 sm:p-4 rounded-full bg-destructive/10 w-fit mx-auto mb-4">
            <VolumeX className="h-6 w-6 sm:h-8 sm:w-8 text-destructive" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">Audio Not Supported</h3>
          <p className="text-sm sm:text-base text-muted-foreground">
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

    const handleMouseUp = () => {
      setIsDragging(false)
      const newPosition = Math.round((dragProgress / 100) * totalLength)
      seekTo(newPosition)

      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
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
      <div className="space-y-4 sm:space-y-6">
        {/* Audio Visualizer - Hidden on very small screens */}
        <Card className="p-3 sm:p-4 border-0 shadow-lg bg-gradient-to-r from-primary/5 to-purple-500/5 hidden xs:block">
          <div className="flex items-center justify-center gap-1 h-12 sm:h-16">
            {visualizerData.slice(0, window.innerWidth < 640 ? 15 : 20).map((height, index) => (
              <div
                key={index}
                className={cn(
                  "w-1.5 sm:w-2 bg-gradient-to-t from-primary to-purple-500 rounded-full transition-all duration-150",
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

        {/* Progress Bar - Mobile Optimized */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
            <span className="flex items-center gap-1 sm:gap-2">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">{formatTime(currentPosition, totalLength)}</span>
            </span>
            <span className="flex items-center gap-1 sm:gap-2">
              <span className="hidden sm:inline">Progress:</span>
              {Math.round(displayProgress)}%
              <Gauge className="h-3 w-3 sm:h-4 sm:w-4" />
            </span>
          </div>
          
          <div
            ref={progressBarRef}
            className={cn(
              "relative w-full bg-muted rounded-full h-3 sm:h-4 cursor-pointer transition-all duration-200 group overflow-hidden",
              isDragging ? "h-4 sm:h-5 bg-muted/80" : "hover:h-4 sm:hover:h-5"
            )}
            onMouseDown={handleMouseDown}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent opacity-50" />
            
            <div
              className={cn(
                "relative bg-gradient-to-r from-primary to-purple-500 h-full rounded-full transition-all shadow-lg",
                isDragging ? "duration-75" : "duration-300"
              )}
              style={{ width: `${displayProgress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
              
              <div
                className={cn(
                  "absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 rounded-full shadow-lg border-2 border-background transition-all duration-200",
                  isDragging ? "w-4 h-4 sm:w-5 sm:h-5 bg-primary scale-110" : "w-3 h-3 sm:w-4 sm:h-4 bg-primary group-hover:scale-110"
                )}
              />
            </div>
            
            {bookmarks.map((bookmark, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <button
                    className="absolute top-1/2 transform -translate-y-1/2 w-1.5 sm:w-2 h-4 sm:h-6 bg-yellow-500 rounded-sm shadow-md hover:bg-yellow-400 transition-colors z-10"
                    style={{ left: `${(bookmark / totalLength) * 100}%` }}
                    onClick={(e) => {
                      e.stopPropagation()
                      jumpToBookmark(bookmark)
                    }}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Bookmark {index + 1}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{isDragging ? "Seeking..." : "Tap to seek"}</span>
            <span className="hidden sm:inline">
              {totalLength > 0 ? `${Math.round((displayProgress / 100) * totalLength)}/${totalLength} chars` : ""}
            </span>
          </div>
        </div>

        {/* Main Controls - Mobile First */}
        <Card className="p-4 sm:p-6 border-0 shadow-lg bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
          {/* Primary Controls */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4">
            <Button
              onClick={() => handleSkip(-10)}
              variant="outline"
              size="sm"
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-full border-2 hover:scale-110 transition-transform"
              disabled={!isPlaying}
            >
              <SkipBack className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>

            <Button 
              onClick={handlePlayPause} 
              size="lg" 
              className="h-14 w-14 sm:h-16 sm:w-16 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 bg-gradient-to-br from-primary to-primary/80"
            >
              {isPlaying && !isPaused ? 
                <Pause className="h-5 w-5 sm:h-6 sm:w-6" /> : 
                <Play className="h-5 w-5 sm:h-6 sm:w-6 ml-0.5" />
              }
            </Button>

            <Button
              onClick={() => handleSkip(10)}
              variant="outline"
              size="sm"
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-full border-2 hover:scale-110 transition-transform"
              disabled={!isPlaying}
            >
              <SkipForward className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>

          {/* Secondary Controls - Mobile Layout */}
          <div className="space-y-4">
            {/* Volume Control - Full Width on Mobile */}
            <div className="flex items-center gap-2 sm:gap-3">
              <VolumeIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Slider
                value={[volume * 100]}
                onValueChange={(value) => setVolume(value[0] / 100)}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-xs sm:text-sm text-muted-foreground w-8 sm:w-10">{Math.round(volume * 100)}%</span>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleStop}
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-full"
                  disabled={!isPlaying}
                >
                  <Square className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>

                <Button
                  onClick={addBookmark}
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-full"
                  disabled={!isPlaying}
                >
                  <Bookmark className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>

              {/* Settings - Mobile Sheet, Desktop Inline */}
              <div className="sm:hidden">
                <Sheet open={showSettings} onOpenChange={setShowSettings}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 w-8 rounded-full">
                      <Settings className="h-3 w-3" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[80vh]">
                    <SheetHeader>
                      <SheetTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Audio Settings
                      </SheetTitle>
                      <SheetDescription>
                        Customize your listening experience
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-6">
                      <MobileSettingsContent 
                        voices={voices}
                        currentVoice={currentVoice}
                        setVoice={setVoice}
                        rate={rate}
                        setRate={setRate}
                        bookmarks={bookmarks}
                        setBookmarks={setBookmarks}
                        jumpToBookmark={jumpToBookmark}
                        getVoiceQuality={getVoiceQuality}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
              
              <div className="hidden sm:block">
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
          </div>

          {/* Speed Presets - Responsive */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 pt-4 border-t border-border/50">
            <span className="text-xs sm:text-sm text-muted-foreground mr-2">Speed:</span>
            {SPEED_PRESETS.map((preset) => (
              <Button
                key={preset.value}
                variant={rate === preset.value ? "default" : "outline"}
                size="sm"
                onClick={() => setRate(preset.value)}
                className="h-7 sm:h-8 px-2 sm:px-3 rounded-full text-xs"
              >
                <span className="mr-1">{preset.icon}</span>
                <span className="hidden xs:inline">{preset.label}</span>
              </Button>
            ))}
          </div>
        </Card>

        {/* Desktop Settings Panel */}
        {showSettings && (
          <div className="hidden sm:block">
            <Card className="p-6 border-0 shadow-xl bg-gradient-to-br from-card to-card/90 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Audio Settings
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-xs"
                >
                  {showAdvanced ? "Simple" : "Advanced"}
                </Button>
              </div>

              <DesktopSettingsContent 
                voices={voices}
                currentVoice={currentVoice}
                setVoice={setVoice}
                rate={rate}
                setRate={setRate}
                bookmarks={bookmarks}
                setBookmarks={setBookmarks}
                jumpToBookmark={jumpToBookmark}
                getVoiceQuality={getVoiceQuality}
                showAdvanced={showAdvanced}
              />
            </Card>
          </div>
        )}

        {/* Status Bar - Responsive */}
        <Card className="p-3 sm:p-4 border-0 shadow-lg bg-gradient-to-r from-card to-card/80 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  isPlaying ? (isPaused ? "bg-yellow-500" : "bg-green-500 animate-pulse") : "bg-gray-400"
                )} />
                <span className="text-muted-foreground">
                  {isPlaying ? (isPaused ? "Paused" : "Playing") : "Ready"}
                </span>
              </div>
              
              {currentVoice && (
                <div className="hidden sm:flex items-center gap-2">
                  <Headphones className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground truncate max-w-32">
                    {getVoiceQuality(currentVoice)} {currentVoice.name}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
              <span className="hidden xs:inline">Speed: {rate}x</span>
              <span>{Math.round(volume * 100)}%</span>
            </div>
          </div>
        </Card>

        {/* Keyboard Shortcuts - Collapsible */}
        <Card className="p-4 border-0 shadow-lg bg-gradient-to-br from-muted/50 to-muted/30">
          <details className="text-sm">
            <summary className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors font-medium">
              Keyboard Shortcuts
            </summary>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div><kbd className="px-1 py-0.5 bg-muted rounded text-xs">Space</kbd> <span className="hidden sm:inline">Play/Pause</span></div>
              <div><kbd className="px-1 py-0.5 bg-muted rounded text-xs">S</kbd> <span className="hidden sm:inline">Stop</span></div>
              <div><kbd className="px-1 py-0.5 bg-muted rounded text-xs">←</kbd> <span className="hidden sm:inline">Skip back</span></div>
              <div><kbd className="px-1 py-0.5 bg-muted rounded text-xs">→</kbd> <span className="hidden sm:inline">Skip forward</span></div>
              <div><kbd className="px-1 py-0.5 bg-muted rounded text-xs">↑</kbd> <span className="hidden sm:inline">Volume up</span></div>
              <div><kbd className="px-1 py-0.5 bg-muted rounded text-xs">↓</kbd> <span className="hidden sm:inline">Volume down</span></div>
              <div><kbd className="px-1 py-0.5 bg-muted rounded text-xs">B</kbd> <span className="hidden sm:inline">Bookmark</span></div>
              <div><kbd className="px-1 py-0.5 bg-muted rounded text-xs">?</kbd> <span className="hidden sm:inline">Show help</span></div>
            </div>
          </details>
        </Card>
      </div>
    </TooltipProvider>
  )
}

// Mobile Settings Component
function MobileSettingsContent({ 
  voices, currentVoice, setVoice, rate, setRate, bookmarks, setBookmarks, 
  jumpToBookmark, getVoiceQuality 
}: any) {
  return (
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
            const voice = voices.find((v: any) => v.name === value)
            if (voice) setVoice(voice)
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a voice" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {voices.map((voice: any) => (
              <SelectItem key={voice.name} value={voice.name}>
                <div className="flex items-center gap-2">
                  <span>{getVoiceQuality(voice)}</span>
                  <span className="font-medium">{voice.name}</span>
                  <Badge variant="outline" className="text-xs ml-auto">
                    {voice.lang}
                  </Badge>
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
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <Bookmark className="h-4 w-4" />
          Bookmarks
          <Badge variant="secondary" className="text-xs">
            {bookmarks.length}
          </Badge>
        </label>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {bookmarks.length > 0 ? (
            bookmarks.map((bookmark: number, index: number) => (
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
                    onClick={() => setBookmarks(bookmarks.filter((_: any, i: number) => i !== index))}
                    className="h-6 px-2 text-xs text-destructive hover:text-destructive"
                  >
                    ×
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground italic">No bookmarks yet</p>
          )}
        </div>
      </div>
    </div>
  )
}

// Desktop Settings Component
function DesktopSettingsContent({ 
  voices, currentVoice, setVoice, rate, setRate, bookmarks, setBookmarks, 
  jumpToBookmark, getVoiceQuality, showAdvanced 
}: any) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
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
            const voice = voices.find((v: any) => v.name === value)
            if (voice) setVoice(voice)
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a voice" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {voices.map((voice: any) => (
              <SelectItem key={voice.name} value={voice.name}>
                <div className="flex items-center gap-2">
                  <span>{getVoiceQuality(voice)}</span>
                  <span className="font-medium">{voice.name}</span>
                  <Badge variant="outline" className="text-xs ml-auto">
                    {voice.lang}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          🌟 Premium/Neural • ✨ Enhanced • Choose your preferred voice
        </p>
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

      {showAdvanced && (
        <>
          {/* Bookmarks */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              Bookmarks
              <Badge variant="secondary" className="text-xs">
                {bookmarks.length}
              </Badge>
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {bookmarks.length > 0 ? (
                bookmarks.map((bookmark: number, index: number) => (
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
                        onClick={() => setBookmarks(bookmarks.filter((_: any, i: number) => i !== index))}
                        className="h-6 px-2 text-xs text-destructive hover:text-destructive"
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic">No bookmarks yet</p>
              )}
            </div>
          </div>

          {/* Additional Controls */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Advanced Features
            </label>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Download Audio (Coming Soon)
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Share2 className="h-4 w-4 mr-2" />
                Share Position (Coming Soon)
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}