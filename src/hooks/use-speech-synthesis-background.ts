"use client"

import { useCallback, useEffect, useRef, useState } from "react"

interface UseSpeechSynthesisOptions {
  onEnd?: () => void
  onError?: (error: SpeechSynthesisErrorEvent) => void
  onPause?: () => void
  onResume?: () => void
  onStart?: () => void
  onBoundary?: (event: SpeechSynthesisEvent) => void
}

export function useSpeechSynthesis(options: UseSpeechSynthesisOptions = {}) {
  const [isSupported, setIsSupported] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [currentVoice, setCurrentVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [rate, setRate] = useState(1.0)
  const [volume, setVolume] = useState(1.0)
  const [pitch, setPitch] = useState(1.0)
  const [currentPosition, setCurrentPosition] = useState(0)
  const [totalLength, setTotalLength] = useState(0)
  const [currentText, setCurrentText] = useState("")

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const backgroundTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const resumePositionRef = useRef<number>(0)
  const wasPlayingRef = useRef<boolean>(false)

  // Check if speech synthesis is supported
  useEffect(() => {
    const supported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
    setIsSupported(supported)
    
    if (supported) {
      const updateVoices = () => {
        const availableVoices = speechSynthesis.getVoices()
        setVoices(availableVoices)
        
        // Set default voice (prefer English voices)
        if (!currentVoice && availableVoices.length > 0) {
          const englishVoice = availableVoices.find(voice => 
            voice.lang.startsWith('en') && !voice.name.toLowerCase().includes('google')
          ) || availableVoices[0]
          setCurrentVoice(englishVoice)
        }
      }

      // Load voices
      updateVoices()
      speechSynthesis.onvoiceschanged = updateVoices
    }
  }, [])

  // Background audio maintenance
  useEffect(() => {
    const handleBackgroundAudio = (event: CustomEvent) => {
      if (event.detail.maintain && isPlaying && !isPaused) {
        // Keep the synthesis active
        console.log('Maintaining background audio')
        
        // Resume if paused by system
        if (speechSynthesis.paused && !isPaused) {
          speechSynthesis.resume()
        }
        
        // Create a maintenance loop
        const maintainAudio = () => {
          if (speechSynthesis.paused && isPlaying && !isPaused) {
            speechSynthesis.resume()
          }
          
          if (document.hidden && isPlaying) {
            backgroundTimeoutRef.current = setTimeout(maintainAudio, 1000)
          }
        }
        
        maintainAudio()
      }
    }

    window.addEventListener('background-audio-maintain', handleBackgroundAudio as EventListener)
    
    return () => {
      window.removeEventListener('background-audio-maintain', handleBackgroundAudio as EventListener)
      if (backgroundTimeoutRef.current) {
        clearTimeout(backgroundTimeoutRef.current)
      }
    }
  }, [isPlaying, isPaused])

  // Page visibility handling for background playback
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page going to background
        wasPlayingRef.current = isPlaying && !isPaused
        console.log('Page hidden, was playing:', wasPlayingRef.current)
      } else {
        // Page coming to foreground
        console.log('Page visible, was playing:', wasPlayingRef.current)
        
        // Small delay to ensure proper restoration
        setTimeout(() => {
          if (wasPlayingRef.current && speechSynthesis.paused) {
            console.log('Resuming speech synthesis')
            speechSynthesis.resume()
          } else if (wasPlayingRef.current && !isPlaying && currentText) {
            // Re-start if completely stopped
            console.log('Restarting speech synthesis from position:', resumePositionRef.current)
            const textFromPosition = currentText.slice(resumePositionRef.current)
            if (textFromPosition.trim()) {
              speakText(textFromPosition)
            }
          }
        }, 500)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isPlaying, isPaused, currentText])

  // Progress tracking
  useEffect(() => {
    if (isPlaying && !isPaused) {
      intervalRef.current = setInterval(() => {
        setCurrentPosition(prev => {
          const newPos = Math.min(prev + 10, totalLength)
          resumePositionRef.current = newPos
          return newPos
        })
      }, 100)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, isPaused, totalLength])

  const speakText = useCallback((text: string, fromPosition: number = 0) => {
    if (!isSupported || !text.trim()) return

    // Stop current speech
    speechSynthesis.cancel()

    // Get text from position
    const textToSpeak = fromPosition > 0 ? text.slice(fromPosition) : text
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak)
    utterance.voice = currentVoice
    utterance.rate = rate
    utterance.volume = volume
    utterance.pitch = pitch

    utterance.onstart = () => {
      setIsPlaying(true)
      setIsPaused(false)
      setCurrentText(text)
      setTotalLength(text.length)
      setCurrentPosition(fromPosition)
      resumePositionRef.current = fromPosition
      options.onStart?.()
      console.log('Speech started')
    }

    utterance.onend = () => {
      setIsPlaying(false)
      setIsPaused(false)
      setCurrentPosition(totalLength)
      resumePositionRef.current = totalLength
      options.onEnd?.()
      console.log('Speech ended')
    }

    utterance.onpause = () => {
      setIsPaused(true)
      options.onPause?.()
      console.log('Speech paused')
    }

    utterance.onresume = () => {
      setIsPaused(false)
      options.onResume?.()
      console.log('Speech resumed')
    }

    utterance.onerror = (error) => {
      console.error('Speech synthesis error:', error)
      setIsPlaying(false)
      setIsPaused(false)
      options.onError?.(error)
    }

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        setCurrentPosition(fromPosition + event.charIndex)
        resumePositionRef.current = fromPosition + event.charIndex
      }
      options.onBoundary?.(event)
    }

    utteranceRef.current = utterance
    speechSynthesis.speak(utterance)
  }, [isSupported, currentVoice, rate, volume, pitch, totalLength, options])

  const speak = useCallback((text: string) => {
    speakText(text, 0)
  }, [speakText])

  const pause = useCallback(() => {
    if (isSupported && speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause()
    }
  }, [isSupported])

  const resume = useCallback(() => {
    if (isSupported && speechSynthesis.paused) {
      speechSynthesis.resume()
    }
  }, [isSupported])

  const stop = useCallback(() => {
    if (isSupported) {
      speechSynthesis.cancel()
      setIsPlaying(false)
      setIsPaused(false)
      setCurrentPosition(0)
      resumePositionRef.current = 0
    }
  }, [isSupported])

  const seekTo = useCallback((position: number) => {
    if (!isSupported || !currentText || position < 0 || position > totalLength) return
    
    const wasCurrentlyPlaying = isPlaying && !isPaused
    speechSynthesis.cancel()
    
    setCurrentPosition(position)
    resumePositionRef.current = position
    
    if (wasCurrentlyPlaying) {
      // Resume from new position
      setTimeout(() => {
        speakText(currentText, position)
      }, 100)
    }
  }, [isSupported, currentText, totalLength, isPlaying, isPaused, speakText])

  const setVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setCurrentVoice(voice)
  }, [])

  return {
    isSupported,
    isPlaying,
    isPaused,
    voices,
    currentVoice,
    rate,
    volume,
    pitch,
    currentPosition,
    totalLength,
    speak,
    pause,
    resume,
    stop,
    seekTo,
    setVoice,
    setRate,
    setVolume,
    setPitch,
  }
}