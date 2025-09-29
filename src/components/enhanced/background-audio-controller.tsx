"use client"

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { 
  Smartphone, 
  Battery, 
  Moon, 
  Sun, 
  Wifi, 
  AlertTriangle,
  CheckCircle,
  Settings,
  Info
} from 'lucide-react'

interface BackgroundAudioControllerProps {
  isPlaying: boolean
  onPlayStateChange: (playing: boolean) => void
}

export function BackgroundAudioController({ isPlaying, onPlayStateChange }: BackgroundAudioControllerProps) {
  const [wakeLockSupported, setWakeLockSupported] = useState(false)
  const [wakeLockActive, setWakeLockActive] = useState(false)
  const [keepScreenOn, setKeepScreenOn] = useState(false)
  const [backgroundPlayback, setBackgroundPlayback] = useState(true)
  const [pageVisible, setPageVisible] = useState(true)
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)
  const visibilityTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Check Wake Lock API support
  useEffect(() => {
    if ('wakeLock' in navigator) {
      setWakeLockSupported(true)
    }
  }, [])

  // Initialize Audio Context for background audio
  useEffect(() => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      setAudioContext(ctx)
      
      // Resume audio context on user interaction
      const resumeAudio = () => {
        if (ctx.state === 'suspended') {
          ctx.resume()
        }
      }
      
      document.addEventListener('touchstart', resumeAudio, { once: true })
      document.addEventListener('click', resumeAudio, { once: true })
      
      return () => {
        document.removeEventListener('touchstart', resumeAudio)
        document.removeEventListener('click', resumeAudio)
        ctx.close()
      }
    } catch (error) {
      console.warn('Audio Context not supported:', error)
    }
  }, [])

  // Handle Wake Lock
  const requestWakeLock = async () => {
    if (!wakeLockSupported || !keepScreenOn) return

    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen')
      setWakeLockActive(true)
      
      wakeLockRef.current.addEventListener('release', () => {
        setWakeLockActive(false)
      })
      
      console.log('Wake lock acquired successfully')
    } catch (error) {
      console.error('Failed to acquire wake lock:', error)
      setWakeLockActive(false)
    }
  }

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release()
      wakeLockRef.current = null
      setWakeLockActive(false)
    }
  }

  // Handle wake lock based on play state and user preference
  useEffect(() => {
    if (isPlaying && keepScreenOn) {
      requestWakeLock()
    } else {
      releaseWakeLock()
    }

    return () => {
      releaseWakeLock()
    }
  }, [isPlaying, keepScreenOn, wakeLockSupported])

  // Handle Page Visibility for background playback
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden
      setPageVisible(isVisible)
      
      if (!backgroundPlayback) return

      if (isVisible) {
        // Page became visible - clear any pending timeouts
        if (visibilityTimeoutRef.current) {
          clearTimeout(visibilityTimeoutRef.current)
          visibilityTimeoutRef.current = null
        }
        
        // Resume audio context if suspended
        if (audioContext?.state === 'suspended') {
          audioContext.resume()
        }
        
        // Trigger play state restoration
        if (isPlaying) {
          console.log('Page visible - ensuring audio continues')
          // Small delay to ensure proper restoration
          setTimeout(() => {
            onPlayStateChange(true)
          }, 100)
        }
      } else {
        // Page became hidden - set up background audio handling
        console.log('Page hidden - setting up background audio')
        
        // Delay before taking action to handle quick visibility changes
        visibilityTimeoutRef.current = setTimeout(() => {
          if (isPlaying && backgroundPlayback) {
            // Keep audio context running
            if (audioContext?.state !== 'running') {
              audioContext?.resume()
            }
            
            // Dispatch a custom event to maintain audio
            window.dispatchEvent(new CustomEvent('background-audio-maintain', {
              detail: { maintain: true }
            }))
          }
        }, 1000) // 1 second delay
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (visibilityTimeoutRef.current) {
        clearTimeout(visibilityTimeoutRef.current)
      }
    }
  }, [isPlaying, backgroundPlayback, audioContext, onPlayStateChange])

  // Handle app state changes (iOS/Android specific)
  useEffect(() => {
    const handleAppStateChange = () => {
      // For iOS Safari and other mobile browsers
      if ('serviceWorker' in navigator && backgroundPlayback) {
        // Register service worker for background processing
        navigator.serviceWorker.register('/sw-background-audio.js').catch(err => {
          console.log('Service worker registration failed:', err)
        })
      }
    }

    // Listen for app state changes
    window.addEventListener('pagehide', handleAppStateChange)
    window.addEventListener('beforeunload', handleAppStateChange)
    
    return () => {
      window.removeEventListener('pagehide', handleAppStateChange)
      window.removeEventListener('beforeunload', handleAppStateChange)
    }
  }, [backgroundPlayback])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      releaseWakeLock()
      if (visibilityTimeoutRef.current) {
        clearTimeout(visibilityTimeoutRef.current)
      }
    }
  }, [])

  return (
    <Card className="p-4 border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950">
      <div className="flex items-center gap-2 mb-4">
        <Smartphone className="h-5 w-5 text-orange-600" />
        <h3 className="font-semibold text-orange-800 dark:text-orange-200">
          Background Audio Settings
        </h3>
        <Badge variant={pageVisible ? "default" : "secondary"} className="ml-auto">
          {pageVisible ? "Active" : "Background"}
        </Badge>
      </div>

      <div className="space-y-4">
        {/* Background Playback Toggle */}
        <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              backgroundPlayback 
                ? "bg-green-100 dark:bg-green-900" 
                : "bg-gray-100 dark:bg-gray-700"
            }`}>
              {backgroundPlayback ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-gray-500" />
              )}
            </div>
            <div>
              <div className="font-medium text-sm">Background Playback</div>
              <div className="text-xs text-muted-foreground">
                Continue audio when screen is off
              </div>
            </div>
          </div>
          <Switch 
            checked={backgroundPlayback} 
            onCheckedChange={setBackgroundPlayback}
          />
        </div>

        {/* Wake Lock Toggle */}
        {wakeLockSupported && (
          <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                wakeLockActive 
                  ? "bg-blue-100 dark:bg-blue-900" 
                  : "bg-gray-100 dark:bg-gray-700"
              }`}>
                {wakeLockActive ? (
                  <Sun className="h-4 w-4 text-blue-600" />
                ) : (
                  <Moon className="h-4 w-4 text-gray-500" />
                )}
              </div>
              <div>
                <div className="font-medium text-sm flex items-center gap-2">
                  Keep Screen On
                  {wakeLockActive && (
                    <Badge variant="secondary" className="text-xs">
                      Active
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  Prevent screen from turning off (uses more battery)
                </div>
              </div>
            </div>
            <Switch 
              checked={keepScreenOn} 
              onCheckedChange={setKeepScreenOn}
            />
          </div>
        )}

        {/* Status Indicators */}
        <div className="grid grid-cols-2 gap-2">
          <div className={`p-2 rounded text-center text-xs ${
            pageVisible 
              ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
              : "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
          }`}>
            <div className="font-medium flex items-center justify-center gap-1">
              {pageVisible ? <CheckCircle className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
              {pageVisible ? "Page Active" : "Background"}
            </div>
          </div>
          <div className={`p-2 rounded text-center text-xs ${
            audioContext?.state === 'running'
              ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
              : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
          }`}>
            <div className="font-medium flex items-center justify-center gap-1">
              <Wifi className="h-3 w-3" />
              Audio Context
            </div>
          </div>
        </div>

        {/* Alerts and Tips */}
        {!wakeLockSupported && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Wake Lock not supported.</strong> Your device may turn off the screen during playback.
              Consider enabling "Keep Screen On" in your device settings.
            </AlertDescription>
          </Alert>
        )}

        {!pageVisible && backgroundPlayback && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Background mode active.</strong> Audio should continue playing even with screen off.
              If it stops, try enabling "Keep Screen On" or check your browser's background app settings.
            </AlertDescription>
          </Alert>
        )}

        {/* Browser-specific tips */}
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer font-medium mb-2">Browser-specific tips</summary>
          <div className="space-y-2 pl-2 border-l-2 border-gray-200 dark:border-gray-700">
            <div><strong>Safari (iOS):</strong> Add to Home Screen for better background support</div>
            <div><strong>Chrome (Android):</strong> Enable "Background App Refresh" in device settings</div>
            <div><strong>Firefox:</strong> May require manual resume after screen unlock</div>
            <div><strong>General:</strong> Keep the browser tab active and avoid switching apps</div>
          </div>
        </details>
      </div>
    </Card>
  )
}