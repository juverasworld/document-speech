export interface SavedDocument {
  id: string
  name: string
  content: string
  uploadDate: Date
  fileType: string
  fileSize: number
}

const STORAGE_KEY = "document-reader-saved-docs"

export const documentStorage = {
  // Save a document to localStorage
  saveDocument: (file: File, content: string): SavedDocument => {
    const savedDoc: SavedDocument = {
      id: crypto.randomUUID(),
      name: file.name,
      content,
      uploadDate: new Date(),
      fileType: file.type,
      fileSize: file.size,
    }

    const existingDocs = documentStorage.getAllDocuments()
    const updatedDocs = [savedDoc, ...existingDocs]

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDocs))
    return savedDoc
  },

  // Get all saved documents
  getAllDocuments: (): SavedDocument[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return []

      const docs = JSON.parse(stored)
      // Convert date strings back to Date objects
      return docs.map((doc: any) => ({
        ...doc,
        uploadDate: new Date(doc.uploadDate),
      }))
    } catch (error) {
      console.error("Error loading documents:", error)
      return []
    }
  },

  // Delete a document
  deleteDocument: (id: string): void => {
    const existingDocs = documentStorage.getAllDocuments()
    const updatedDocs = existingDocs.filter((doc) => doc.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDocs))
  },

  // Get a specific document
  getDocument: (id: string): SavedDocument | null => {
    const docs = documentStorage.getAllDocuments()
    return docs.find((doc) => doc.id === id) || null
  },
}
