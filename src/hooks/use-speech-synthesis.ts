"use client"

import { useState, useEffect, useCallback, useRef } from "react"

interface UseSpeechSynthesisOptions {
  rate?: number
  pitch?: number
  volume?: number
  voice?: SpeechSynthesisVoice | null
}

interface UseSpeechSynthesisReturn {
  speak: (text: string) => void
  pause: () => void
  resume: () => void
  stop: () => void
  seekTo: (position: number) => void
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
}

export function useSpeechSynthesis(options: UseSpeechSynthesisOptions = {}): UseSpeechSynthesisReturn {
  const [isSupported, setIsSupported] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [currentVoice, setCurrentVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [rate, setRate] = useState(options.rate || 1)
  const [pitch, setPitch] = useState(options.pitch || 1)
  const [volume, setVolume] = useState(options.volume || 1)
  const [currentPosition, setCurrentPosition] = useState(0)
  const [totalLength, setTotalLength] = useState(0)

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const textRef = useRef<string>("")

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSupported(true)

      const loadVoices = () => {
        const availableVoices = speechSynthesis.getVoices()

        const naturalVoices = availableVoices.filter((voice) => {
          const name = voice.name.toLowerCase()
          const lang = voice.lang.toLowerCase()

          return (
            (lang.startsWith("en") || lang.includes("us") || lang.includes("gb")) &&
            (name.includes("neural") ||
              name.includes("premium") ||
              name.includes("enhanced") ||
              name.includes("natural") ||
              name.includes("samantha") ||
              name.includes("alex") ||
              name.includes("karen") ||
              name.includes("daniel") ||
              name.includes("fiona") ||
              name.includes("moira") ||
              name.includes("tessa") ||
              name.includes("veena") ||
              name.includes("rishi") ||
              name.includes("microsoft") ||
              name.includes("google")) &&
            !name.includes("compact") &&
            !name.includes("novelty")
          )
        })

        const voicesToUse =
          naturalVoices.length > 0
            ? naturalVoices
            : availableVoices.filter((voice) => voice.lang.toLowerCase().startsWith("en"))

        const sortedVoices = voicesToUse.sort((a, b) => {
          const aName = a.name.toLowerCase()
          const bName = b.name.toLowerCase()

          if (aName.includes("neural") && !bName.includes("neural")) return -1
          if (!aName.includes("neural") && bName.includes("neural")) return 1
          if (aName.includes("premium") && !bName.includes("premium")) return -1
          if (!aName.includes("premium") && bName.includes("premium")) return 1

          return a.name.localeCompare(b.name)
        })

        setVoices(sortedVoices.length > 0 ? sortedVoices : availableVoices)

        if ((sortedVoices.length > 0 || availableVoices.length > 0) && !currentVoice) {
          const bestVoice =
            sortedVoices[0] || availableVoices.find((voice) => voice.lang.startsWith("en")) || availableVoices[0]
          setCurrentVoice(bestVoice)
        }
      }

      loadVoices()
      speechSynthesis.addEventListener("voiceschanged", loadVoices)

      return () => {
        speechSynthesis.removeEventListener("voiceschanged", loadVoices)
      }
    }
  }, [currentVoice])

  const speak = useCallback(
    (text: string) => {
      if (!isSupported || !text.trim()) return

      speechSynthesis.cancel()

      textRef.current = text
      setTotalLength(text.length)
      setCurrentPosition(0)

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = rate
      utterance.pitch = pitch
      utterance.volume = volume

      if (currentVoice) {
        utterance.voice = currentVoice
      }

      utterance.onstart = () => {
        setIsPlaying(true)
        setIsPaused(false)
      }

      utterance.onend = () => {
        setIsPlaying(false)
        setIsPaused(false)
        setCurrentPosition(0)
      }

      utterance.onerror = () => {
        setIsPlaying(false)
        setIsPaused(false)
        setCurrentPosition(0)
      }

      utterance.onpause = () => {
        setIsPaused(true)
      }

      utterance.onresume = () => {
        setIsPaused(false)
      }

      utterance.onboundary = (event) => {
        if (event.name === "word") {
          setCurrentPosition(event.charIndex)
        }
      }

      utteranceRef.current = utterance
      speechSynthesis.speak(utterance)
    },
    [isSupported, rate, pitch, volume, currentVoice],
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
    }
  }, [isSupported])

  const setVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setCurrentVoice(voice)
  }, [])

  const seekTo = useCallback(
    (position: number) => {
      if (!isSupported || !textRef.current) {
        console.log("[v0] SeekTo failed: not supported or no text")
        return
      }

      const text = textRef.current
      const seekPosition = Math.max(0, Math.min(position, text.length))

      console.log("[v0] Seeking to position:", seekPosition, "of", text.length)

      // Find word boundary (go back to nearest space)
      let adjustedPosition = seekPosition
      while (adjustedPosition > 0 && text[adjustedPosition] !== " " && text[adjustedPosition] !== "\n") {
        adjustedPosition--
      }

      console.log("[v0] Adjusted position to word boundary:", adjustedPosition)

      const remainingText = text.substring(adjustedPosition)

      if (remainingText.trim()) {
        // Cancel current speech
        speechSynthesis.cancel()
        setCurrentPosition(adjustedPosition)

        console.log("[v0] Starting speech from position:", adjustedPosition)
        console.log("[v0] Remaining text length:", remainingText.length)

        // Create new utterance for remaining text
        const utterance = new SpeechSynthesisUtterance(remainingText)
        utterance.rate = rate
        utterance.pitch = pitch
        utterance.volume = volume

        if (currentVoice) {
          utterance.voice = currentVoice
        }

        utterance.onstart = () => {
          console.log("[v0] Seek utterance started")
          setIsPlaying(true)
          setIsPaused(false)
        }

        utterance.onend = () => {
          console.log("[v0] Seek utterance ended")
          setIsPlaying(false)
          setIsPaused(false)
          setCurrentPosition(text.length) // Set to end of text
        }

        utterance.onerror = (event) => {
          console.log("[v0] Seek utterance error:", event.error)
          setIsPlaying(false)
          setIsPaused(false)
        }

        utterance.onpause = () => {
          setIsPaused(true)
        }

        utterance.onresume = () => {
          setIsPaused(false)
        }

        utterance.onboundary = (event) => {
          if (event.name === "word") {
            setCurrentPosition(adjustedPosition + event.charIndex)
          }
        }

        utteranceRef.current = utterance
        speechSynthesis.speak(utterance)
      } else {
        console.log("[v0] No remaining text to speak")
        setIsPlaying(false)
        setCurrentPosition(text.length)
      }
    },
    [isSupported, rate, pitch, volume, currentVoice],
  )

  return {
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
    pitch,
    setPitch,
    volume,
    setVolume,
    currentPosition,
    totalLength,
  }
}
