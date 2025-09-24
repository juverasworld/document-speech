"use client"

import { useState, useEffect, useCallback, useRef } from "react"

interface UseSpeechSynthesisOptions {
  rate?: number
  pitch?: number
  volume?: number
  voice?: SpeechSynthesisVoice | null
}

interface SpeakOptions {
  loop?: boolean
  onProgress?: (position: number) => void
  onComplete?: () => void
}

interface UseSpeechSynthesisReturn {
  speak: (text: string, options?: SpeakOptions) => void
  pause: () => void
  resume: () => void
  stop: () => void
  seekTo: (position: number) => void
  skipSentence: (direction: number) => void
  isSupported: boolean
  isPlaying: boolean
  isPaused: boolean
  voices: SpeechSynthesisVoice[]
  currentVoice: SpeechSynthesisVoice | null
  setVoice: (voice: SpeechSynthesisVoice) => void
  rate: number
  setRate: (rate: number) => void
  pitch: number
  setPitch: (pitch: number) => void
  volume: number
  setVolume: (volume: number) => void
  currentPosition: number
  totalLength: number
  currentSentence: number
  totalSentences: number
  estimatedTimeRemaining: number
  progressPercentage: number
}

// Enhanced text chunking for better seeking
function chunkText(text: string): Array<{ content: string; start: number; end: number }> {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
  const chunks = []
  let position = 0
  
  for (const sentence of sentences) {
    const trimmed = sentence.trim()
    if (trimmed) {
      const start = text.indexOf(trimmed, position)
      const end = start + trimmed.length
      chunks.push({ content: trimmed, start, end })
      position = end
    }
  }
  
  return chunks
}

// Estimate reading time based on text length and speech rate
function estimateReadingTime(text: string, rate: number): number {
  // Average words per minute for speech synthesis: 150-200 WPM
  const wordsPerMinute = 175 * rate
  const wordCount = text.split(/\s+/).length
  return (wordCount / wordsPerMinute) * 60
}

export function useSpeechSynthesisEnhanced(
  options: UseSpeechSynthesisOptions = {}
): UseSpeechSynthesisReturn {
  const [isSupported, setIsSupported] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [currentVoice, setCurrentVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [rate, setRate] = useState(options.rate || 1)
  const [pitch, setPitch] = useState(options.pitch || 1)
  const [volume, setVolume] = useState(options.volume || 0.8)
  const [currentPosition, setCurrentPosition] = useState(0)
  const [totalLength, setTotalLength] = useState(0)
  const [currentSentence, setCurrentSentence] = useState(1)
  const [totalSentences, setTotalSentences] = useState(0)
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(0)
  const [progressPercentage, setProgressPercentage] = useState(0)

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const textRef = useRef<string>("")
  const chunksRef = useRef<Array<{ content: string; start: number; end: number }>>([])
  const currentChunkIndexRef = useRef(0)
  const startTimeRef = useRef<number>(0)
  const speakOptionsRef = useRef<SpeakOptions>({})
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Enhanced voice loading with better filtering and sorting
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSupported(true)

      const loadVoices = () => {
        const availableVoices = speechSynthesis.getVoices()
        
        // Enhanced voice filtering with better quality detection
        const qualityVoices = availableVoices.filter((voice) => {
          const name = voice.name.toLowerCase()
          const lang = voice.lang.toLowerCase()

          // Filter for English voices
          const isEnglish = lang.startsWith("en") || lang.includes("us") || lang.includes("gb")
          
          // Quality indicators
          const qualityIndicators = [
            "neural", "premium", "enhanced", "natural", "wavenet",
            "standard", "microsoft", "google", "apple", "amazon"
          ]
          
          const hasQualityIndicator = qualityIndicators.some(indicator => 
            name.includes(indicator)
          )
          
          // Exclude low-quality or novelty voices
          const excludeIndicators = [
            "compact", "novelty", "whisper", "bad", "poor"
          ]
          
          const shouldExclude = excludeIndicators.some(indicator => 
            name.includes(indicator)
          )
          
          return isEnglish && (hasQualityIndicator || availableVoices.length < 20) && !shouldExclude
        })

        // Enhanced sorting by quality
        const sortedVoices = (qualityVoices.length > 0 ? qualityVoices : availableVoices)
          .sort((a, b) => {
            const aName = a.name.toLowerCase()
            const bName = b.name.toLowerCase()
            
            // Priority order
            const priorities = [
              "neural", "premium", "wavenet", "enhanced", 
              "natural", "microsoft", "google", "apple"
            ]
            
            for (const priority of priorities) {
              const aHas = aName.includes(priority)
              const bHas = bName.includes(priority)
              
              if (aHas && !bHas) return -1
              if (!aHas && bHas) return 1
            }
            
            return a.name.localeCompare(b.name)
          })

        setVoices(sortedVoices)

        // Auto-select best available voice
        if (sortedVoices.length > 0 && !currentVoice) {
          const bestVoice = sortedVoices.find(voice => 
            voice.name.toLowerCase().includes("neural") ||
            voice.name.toLowerCase().includes("premium")
          ) || sortedVoices[0]
          
          setCurrentVoice(bestVoice)
        }
      }

      // Load voices immediately and on voices changed
      loadVoices()
      speechSynthesis.addEventListener("voiceschanged", loadVoices)

      return () => {
        speechSynthesis.removeEventListener("voiceschanged", loadVoices)
      }
    }
  }, [])

  // Progress tracking
  const startProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }
    
    progressIntervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000
      const estimatedTotal = estimateReadingTime(textRef.current, rate)
      const remaining = Math.max(0, estimatedTotal - elapsed)
      const percentage = totalLength > 0 ? (currentPosition / totalLength) * 100 : 0
      
      setEstimatedTimeRemaining(remaining)
      setProgressPercentage(percentage)
      
      // Call progress callback if provided
      if (speakOptionsRef.current.onProgress) {
        speakOptionsRef.current.onProgress(currentPosition)
      }
    }, 500)
  }, [currentPosition, rate, totalLength])

  const stopProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
  }, [])

  const speak = useCallback(
    (text: string, options: SpeakOptions = {}) => {
      if (!isSupported || !text.trim()) return

      // Cancel any existing speech
      speechSynthesis.cancel()
      stopProgressTracking()

      // Setup references
      textRef.current = text
      speakOptionsRef.current = options
      chunksRef.current = chunkText(text)
      currentChunkIndexRef.current = 0
      
      setTotalLength(text.length)
      setCurrentPosition(0)
      setTotalSentences(chunksRef.current.length)
      setCurrentSentence(1)
      startTimeRef.current = Date.now()
      
      const speakChunk = (chunkIndex: number) => {
        if (chunkIndex >= chunksRef.current.length) {
          // Completed all chunks
          setIsPlaying(false)
          setIsPaused(false)
          setCurrentPosition(text.length)
          stopProgressTracking()
          
          if (options.onComplete) {
            options.onComplete()
          }
          
          // Handle loop mode
          if (options.loop) {
            setTimeout(() => speak(text, options), 1000)
          }
          return
        }

        const chunk = chunksRef.current[chunkIndex]
        const utterance = new SpeechSynthesisUtterance(chunk.content)
        
        utterance.rate = rate
        utterance.pitch = pitch
        utterance.volume = volume

        if (currentVoice) {
          utterance.voice = currentVoice
        }

        utterance.onstart = () => {
          if (chunkIndex === 0) {
            setIsPlaying(true)
            setIsPaused(false)
            startProgressTracking()
          }
          setCurrentSentence(chunkIndex + 1)
        }

        utterance.onend = () => {
          setCurrentPosition(chunk.end)
          currentChunkIndexRef.current = chunkIndex + 1
          speakChunk(chunkIndex + 1)
        }

        utterance.onerror = (event) => {
          console.error("Speech synthesis error:", event.error)
          setIsPlaying(false)
          setIsPaused(false)
          stopProgressTracking()
        }

        utterance.onpause = () => {
          setIsPaused(true)
          stopProgressTracking()
        }

        utterance.onresume = () => {
          setIsPaused(false)
          startProgressTracking()
        }

        utterance.onboundary = (event) => {
          if (event.name === "word" || event.name === "sentence") {
            setCurrentPosition(chunk.start + event.charIndex)
          }
        }

        utteranceRef.current = utterance
        speechSynthesis.speak(utterance)
      }

      speakChunk(0)
    },
    [isSupported, rate, pitch, volume, currentVoice, startProgressTracking, stopProgressTracking]
  )

  const pause = useCallback(() => {
    if (isSupported && isPlaying && !isPaused) {
      speechSynthesis.pause()
    }
  }, [isSupported, isPlaying, isPaused])

  const resume = useCallback(() => {
    if (isSupported && isPlaying && isPaused) {
      speechSynthesis.resume()
    }
  }, [isSupported, isPlaying, isPaused])

  const stop = useCallback(() => {
    if (isSupported) {
      speechSynthesis.cancel()
      setIsPlaying(false)
      setIsPaused(false)
      setCurrentPosition(0)
      setCurrentSentence(1)
      setEstimatedTimeRemaining(0)
      stopProgressTracking()
      currentChunkIndexRef.current = 0
    }
  }, [isSupported, stopProgressTracking])

  const seekTo = useCallback(
    (position: number) => {
      if (!isSupported || !textRef.current || !chunksRef.current.length) return

      const text = textRef.current
      const seekPosition = Math.max(0, Math.min(position, text.length))
      
      // Find the chunk that contains this position
      const targetChunkIndex = chunksRef.current.findIndex(
        chunk => seekPosition >= chunk.start && seekPosition <= chunk.end
      )
      
      if (targetChunkIndex === -1) return

      // Cancel current speech
      speechSynthesis.cancel()
      stopProgressTracking()
      
      // Update position and sentence
      setCurrentPosition(seekPosition)
      setCurrentSentence(targetChunkIndex + 1)
      currentChunkIndexRef.current = targetChunkIndex
      
      // If we were playing, continue from new position
      if (isPlaying) {
        const remainingText = text.substring(chunksRef.current[targetChunkIndex].start)
        const newChunks = chunkText(remainingText)
        
        // Adjust chunk positions
        const adjustedChunks = newChunks.map(chunk => ({
          ...chunk,
          start: chunk.start + chunksRef.current[targetChunkIndex].start,
          end: chunk.end + chunksRef.current[targetChunkIndex].start
        }))
        
        chunksRef.current = adjustedChunks
        currentChunkIndexRef.current = 0
        
        // Continue speaking from new position
        speak(remainingText, speakOptionsRef.current)
      }
    },
    [isSupported, isPlaying, speak, stopProgressTracking]
  )

  const skipSentence = useCallback(
    (direction: number) => {
      if (!chunksRef.current.length) return
      
      const newIndex = Math.max(0, Math.min(
        currentChunkIndexRef.current + direction,
        chunksRef.current.length - 1
      ))
      
      if (newIndex !== currentChunkIndexRef.current) {
        const targetChunk = chunksRef.current[newIndex]
        seekTo(targetChunk.start)
      }
    },
    [seekTo]
  )

  const setVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setCurrentVoice(voice)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopProgressTracking()
      if (isSupported) {
        speechSynthesis.cancel()
      }
    }
  }, [isSupported, stopProgressTracking])

  return {
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
    pitch,
    setPitch,
    volume,
    setVolume,
    currentPosition,
    totalLength,
    currentSentence,
    totalSentences,
    estimatedTimeRemaining,
    progressPercentage,
  }
}