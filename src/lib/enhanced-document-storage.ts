export interface SavedDocument {
  id: string
  name: string
  content: string
  uploadDate: Date
  lastAccessed?: Date
  fileType: string
  fileSize: number
  wordCount: number
  readingTime: number // in minutes
  tags?: string[]
  favorite?: boolean
}

const STORAGE_KEY = "document-reader-enhanced-docs"
const CACHE_KEY = "document-reader-cache"

class DocumentStorageClass {
  private cache: Map<string, SavedDocument> = new Map()
  private initialized = false

  // Initialize cache
  private init() {
    if (this.initialized) return
    
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const parsedCache = JSON.parse(cached)
        this.cache = new Map(parsedCache.map((doc: any) => [doc.id, {
          ...doc,
          uploadDate: new Date(doc.uploadDate),
          lastAccessed: doc.lastAccessed ? new Date(doc.lastAccessed) : undefined
        }]))
      }
    } catch (error) {
      console.warn('Failed to load document cache:', error)
    }
    
    this.initialized = true
  }

  // Update cache
  private updateCache() {
    try {
      const cacheArray = Array.from(this.cache.values())
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheArray))
    } catch (error) {
      console.error('Failed to update cache:', error)
    }
  }

  // Calculate reading time based on word count
  private calculateReadingTime(wordCount: number): number {
    const averageWordsPerMinute = 200
    return Math.ceil(wordCount / averageWordsPerMinute)
  }

  // Extract basic analytics from content
  private analyzeContent(content: string) {
    const words = content.trim().split(/\s+/)
    const wordCount = words.length
    const readingTime = this.calculateReadingTime(wordCount)
    
    return {
      wordCount,
      readingTime
    }
  }

  // Save a document to localStorage with enhanced features
  saveDocument(file: File, content: string, tags: string[] = []): SavedDocument {
    this.init()
    
    const analysis = this.analyzeContent(content)
    
    const savedDoc: SavedDocument = {
      id: crypto.randomUUID(),
      name: file.name,
      content,
      uploadDate: new Date(),
      lastAccessed: new Date(),
      fileType: file.type,
      fileSize: file.size,
      wordCount: analysis.wordCount,
      readingTime: analysis.readingTime,
      tags,
      favorite: false,
    }

    // Add to cache
    this.cache.set(savedDoc.id, savedDoc)
    
    // Save to localStorage
    const existingDocs = this.getAllDocuments()
    const updatedDocs = [savedDoc, ...existingDocs.filter(doc => doc.id !== savedDoc.id)]

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDocs))
      this.updateCache()
    } catch (error) {
      console.error('Failed to save document:', error)
      // Remove from cache if save failed
      this.cache.delete(savedDoc.id)
      throw new Error('Failed to save document. Storage may be full.')
    }
    
    return savedDoc
  }

  // Get all saved documents with enhanced sorting
  getAllDocuments(): SavedDocument[] {
    this.init()
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return []

      const docs = JSON.parse(stored)
      const processedDocs = docs.map((doc: any) => ({
        ...doc,
        uploadDate: new Date(doc.uploadDate),
        lastAccessed: doc.lastAccessed ? new Date(doc.lastAccessed) : undefined,
        wordCount: doc.wordCount || this.analyzeContent(doc.content).wordCount,
        readingTime: doc.readingTime || this.analyzeContent(doc.content).readingTime,
        tags: doc.tags || [],
        favorite: doc.favorite || false,
      }))
      
      // Update cache
      processedDocs.forEach((doc: SavedDocument) => {
        this.cache.set(doc.id, doc)
      })
      this.updateCache()
      
      return processedDocs
    } catch (error) {
      console.error('Error loading documents:', error)
      return []
    }
  }

  // Delete a document
  deleteDocument(id: string): void {
    this.init()
    
    const existingDocs = this.getAllDocuments()
    const updatedDocs = existingDocs.filter((doc) => doc.id !== id)
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDocs))
      this.cache.delete(id)
      this.updateCache()
    } catch (error) {
      console.error('Failed to delete document:', error)
    }
  }

  // Get a specific document (with caching)
  getDocument(id: string): SavedDocument | null {
    this.init()
    
    // Check cache first
    const cached = this.cache.get(id)
    if (cached) return cached
    
    // Fallback to full load
    const docs = this.getAllDocuments()
    return docs.find((doc) => doc.id === id) || null
  }

  // Update last accessed time
  updateLastAccessed(id: string): void {
    this.init()
    
    const docs = this.getAllDocuments()
    const docIndex = docs.findIndex(doc => doc.id === id)
    
    if (docIndex !== -1) {
      docs[docIndex].lastAccessed = new Date()
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(docs))
        this.cache.set(id, docs[docIndex])
        this.updateCache()
      } catch (error) {
        console.error('Failed to update last accessed:', error)
      }
    }
  }

  // Toggle favorite status
  toggleFavorite(id: string): void {
    this.init()
    
    const docs = this.getAllDocuments()
    const docIndex = docs.findIndex(doc => doc.id === id)
    
    if (docIndex !== -1) {
      docs[docIndex].favorite = !docs[docIndex].favorite
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(docs))
        this.cache.set(id, docs[docIndex])
        this.updateCache()
      } catch (error) {
        console.error('Failed to toggle favorite:', error)
      }
    }
  }

  // Add tags to document
  updateTags(id: string, tags: string[]): void {
    this.init()
    
    const docs = this.getAllDocuments()
    const docIndex = docs.findIndex(doc => doc.id === id)
    
    if (docIndex !== -1) {
      docs[docIndex].tags = tags
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(docs))
        this.cache.set(id, docs[docIndex])
        this.updateCache()
      } catch (error) {
        console.error('Failed to update tags:', error)
      }
    }
  }

  // Search documents
  searchDocuments(query: string): SavedDocument[] {
    const docs = this.getAllDocuments()
    const lowerQuery = query.toLowerCase()
    
    return docs.filter(doc => 
      doc.name.toLowerCase().includes(lowerQuery) ||
      doc.content.toLowerCase().includes(lowerQuery) ||
      (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
    )
  }

  // Get statistics
  getStatistics() {
    const docs = this.getAllDocuments()
    
    const totalDocs = docs.length
    const totalWords = docs.reduce((sum, doc) => sum + (doc.wordCount || 0), 0)
    const totalReadingTime = docs.reduce((sum, doc) => sum + (doc.readingTime || 0), 0)
    const favoriteCount = docs.filter(doc => doc.favorite).length
    const recentCount = docs.filter(doc => {
      const dayAgo = new Date()
      dayAgo.setDate(dayAgo.getDate() - 1)
      return new Date(doc.uploadDate) > dayAgo
    }).length
    
    return {
      totalDocs,
      totalWords,
      totalReadingTime,
      favoriteCount,
      recentCount
    }
  }

  // Export documents
  exportDocuments(): string {
    const docs = this.getAllDocuments()
    return JSON.stringify(docs, null, 2)
  }

  // Import documents
  importDocuments(jsonString: string): number {
    try {
      const importedDocs: SavedDocument[] = JSON.parse(jsonString)
      const existingDocs = this.getAllDocuments()
      
      let importedCount = 0
      
      importedDocs.forEach(doc => {
        // Check if document already exists
        if (!existingDocs.find(existing => existing.id === doc.id)) {
          // Ensure proper date objects
          doc.uploadDate = new Date(doc.uploadDate)
          if (doc.lastAccessed) {
            doc.lastAccessed = new Date(doc.lastAccessed)
          }
          
          existingDocs.push(doc)
          this.cache.set(doc.id, doc)
          importedCount++
        }
      })
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existingDocs))
      this.updateCache()
      
      return importedCount
    } catch (error) {
      console.error('Failed to import documents:', error)
      throw new Error('Invalid import format')
    }
  }

  // Clear all documents
  clearAllDocuments(): void {
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(CACHE_KEY)
      this.cache.clear()
    } catch (error) {
      console.error('Failed to clear documents:', error)
    }
  }

  // Get storage usage
  getStorageUsage(): { used: number; available: number; percentage: number } {
    try {
      const totalStorage = 5 * 1024 * 1024 // 5MB typical localStorage limit
      const currentData = localStorage.getItem(STORAGE_KEY) || ''
      const used = new Blob([currentData]).size
      const available = totalStorage - used
      const percentage = (used / totalStorage) * 100
      
      return { used, available, percentage }
    } catch (error) {
      return { used: 0, available: 0, percentage: 0 }
    }
  }
}

export const documentStorage = new DocumentStorageClass()