// Utility functions for enhanced document reader

// Text processing utilities
export const textUtils = {
  // Extract reading statistics from text
  getTextStats: (text: string) => {
    if (!text || text.trim().length === 0) {
      return {
        characters: 0,
        words: 0,
        sentences: 0,
        paragraphs: 0,
        averageWordsPerSentence: 0,
        readabilityScore: 0
      }
    }

    const characters = text.length
    const words = text.trim().split(/\s+/).filter(word => word.length > 0).length
    const sentences = (text.match(/[.!?]+/g) || []).length
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length
    const averageWordsPerSentence = sentences > 0 ? Math.round(words / sentences) : 0
    
    // Simple readability score (Flesch Reading Ease approximation)
    const averageSentenceLength = sentences > 0 ? words / sentences : 0
    const syllables = textUtils.countSyllables(text)
    const averageSyllablesPerWord = words > 0 ? syllables / words : 0
    
    const readabilityScore = Math.max(0, Math.min(100, 
      206.835 - (1.015 * averageSentenceLength) - (84.6 * averageSyllablesPerWord)
    ))

    return {
      characters,
      words,
      sentences,
      paragraphs,
      averageWordsPerSentence,
      readabilityScore: Math.round(readabilityScore)
    }
  },

  // Count syllables in text (approximation)
  countSyllables: (text: string): number => {
    return text.toLowerCase()
      .replace(/[^a-z]/g, ' ')
      .split(' ')
      .filter(word => word.length > 0)
      .reduce((total, word) => {
        // Simple syllable counting heuristic
        const vowels = word.match(/[aeiouy]+/g) || []
        let syllableCount = vowels.length
        
        // Adjust for common patterns
        if (word.endsWith('e') && syllableCount > 1) syllableCount--
        if (word.match(/le$/)) syllableCount++
        
        return total + Math.max(1, syllableCount)
      }, 0)
  },

  // Estimate reading time based on text and speed
  estimateReadingTime: (text: string, wordsPerMinute: number = 200): number => {
    const words = textUtils.getTextStats(text).words
    return Math.ceil(words / wordsPerMinute) // in minutes
  },

  // Split text into chunks for better TTS processing
  chunkText: (text: string, maxChunkSize: number = 500): Array<{
    content: string
    start: number
    end: number
    type: 'sentence' | 'paragraph' | 'chunk'
  }> => {
    const chunks = []
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
    let currentChunk = ''
    let startPos = 0
    
    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim()
      if (trimmedSentence.length === 0) continue
      
      if (currentChunk.length + trimmedSentence.length > maxChunkSize && currentChunk.length > 0) {
        // Finalize current chunk
        const actualStart = text.indexOf(currentChunk.trim(), startPos)
        chunks.push({
          content: currentChunk.trim(),
          start: actualStart,
          end: actualStart + currentChunk.trim().length,
          type: currentChunk.includes('\n\n') ? 'paragraph' : 'chunk'
        })
        
        startPos = actualStart + currentChunk.trim().length
        currentChunk = trimmedSentence
      } else {
        currentChunk += (currentChunk ? ' ' : '') + trimmedSentence
      }
    }
    
    // Add final chunk
    if (currentChunk.trim()) {
      const actualStart = text.indexOf(currentChunk.trim(), startPos)
      chunks.push({
        content: currentChunk.trim(),
        start: actualStart,
        end: actualStart + currentChunk.trim().length,
        type: 'chunk'
      })
    }
    
    return chunks
  },

  // Clean text for better TTS processing
  cleanTextForSpeech: (text: string): string => {
    return text
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      // Handle common abbreviations
      .replace(/\b(Mr|Mrs|Ms|Dr|Prof)\.\s/g, '$1 ')
      // Handle numbers
      .replace(/\b(\d+)\.(\d+)\b/g, '$1 point $2')
      // Handle URLs (basic)
      .replace(/https?:\/\/[^\s]+/g, 'link')
      // Handle email addresses
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, 'email address')
      .trim()
  }
}

// Voice utilities
export const voiceUtils = {
  // Rate voices by quality
  rateVoiceQuality: (voice: SpeechSynthesisVoice): number => {
    const name = voice.name.toLowerCase()
    let score = 0
    
    // Premium indicators
    if (name.includes('neural')) score += 100
    if (name.includes('premium')) score += 90
    if (name.includes('wavenet')) score += 85
    if (name.includes('enhanced')) score += 70
    if (name.includes('natural')) score += 60
    if (name.includes('standard')) score += 40
    
    // Brand bonuses
    if (name.includes('microsoft')) score += 20
    if (name.includes('google')) score += 25
    if (name.includes('amazon')) score += 22
    if (name.includes('apple')) score += 18
    
    // Language preference for English
    if (voice.lang.startsWith('en-US')) score += 15
    else if (voice.lang.startsWith('en-GB')) score += 12
    else if (voice.lang.startsWith('en')) score += 8
    
    // Penalize poor quality indicators
    if (name.includes('compact')) score -= 30
    if (name.includes('poor')) score -= 50
    if (name.includes('robotic')) score -= 40
    
    return Math.max(0, score)
  },

  // Get best available voices
  getBestVoices: (voices: SpeechSynthesisVoice[], limit: number = 10): SpeechSynthesisVoice[] => {
    return voices
      .map(voice => ({ voice, score: voiceUtils.rateVoiceQuality(voice) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.voice)
  },

  // Get voice category
  getVoiceCategory: (voice: SpeechSynthesisVoice): {
    category: 'neural' | 'premium' | 'enhanced' | 'standard'
    emoji: string
    description: string
  } => {
    const name = voice.name.toLowerCase()
    
    if (name.includes('neural')) {
      return {
        category: 'neural',
        emoji: '🤖',
        description: 'AI Neural Voice'
      }
    }
    
    if (name.includes('premium') || name.includes('wavenet')) {
      return {
        category: 'premium',
        emoji: '⭐',
        description: 'Premium Quality'
      }
    }
    
    if (name.includes('enhanced') || name.includes('natural')) {
      return {
        category: 'enhanced',
        emoji: '✨',
        description: 'Enhanced Voice'
      }
    }
    
    return {
      category: 'standard',
      emoji: '🎤',
      description: 'Standard Voice'
    }
  }
}

// Performance utilities
export const performanceUtils = {
  // Debounce function for performance optimization
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    immediate?: boolean
  ): T => {
    let timeout: NodeJS.Timeout | null = null
    
    return ((...args: Parameters<T>) => {
      const later = () => {
        timeout = null
        if (!immediate) func(...args)
      }
      
      const callNow = immediate && !timeout
      
      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(later, wait)
      
      if (callNow) func(...args)
    }) as T
  },

  // Throttle function for performance optimization
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): T => {
    let inThrottle: boolean
    
    return ((...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }) as T
  },

  // Measure performance of async functions
  measureAsync: async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
    const start = performance.now()
    try {
      const result = await fn()
      const end = performance.now()
      console.log(`⚡ ${name}: ${(end - start).toFixed(2)}ms`)
      return result
    } catch (error) {
      const end = performance.now()
      console.error(`❌ ${name} failed after ${(end - start).toFixed(2)}ms:`, error)
      throw error
    }
  }
}

// Storage utilities
export const storageUtils = {
  // Safe localStorage operations with fallbacks
  setItem: (key: string, value: any): boolean => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.warn('localStorage setItem failed:', error)
      return false
    }
  },

  getItem: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue ?? null
    } catch (error) {
      console.warn('localStorage getItem failed:', error)
      return defaultValue ?? null
    }
  },

  removeItem: (key: string): boolean => {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.warn('localStorage removeItem failed:', error)
      return false
    }
  },

  // Get storage usage information
  getStorageInfo: () => {
    try {
      const total = 5 * 1024 * 1024 // 5MB typical limit
      let used = 0
      
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length + key.length
        }
      }
      
      return {
        used,
        total,
        available: total - used,
        percentage: Math.round((used / total) * 100)
      }
    } catch (error) {
      return {
        used: 0,
        total: 0,
        available: 0,
        percentage: 0
      }
    }
  }
}

// Format utilities
export const formatUtils = {
  // Format time duration
  formatDuration: (seconds: number): string => {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`
    }
    
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.round(seconds % 60)
    
    if (minutes < 60) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }
    
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    
    return `${hours}:${remainingMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  },

  // Format file size
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 B'
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  },

  // Format number with commas
  formatNumber: (num: number): string => {
    return num.toLocaleString()
  },

  // Format percentage
  formatPercentage: (value: number, decimals: number = 1): string => {
    return `${value.toFixed(decimals)}%`
  }
}