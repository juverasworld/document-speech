// "use client"

// import type React from "react"

// import { useState, useEffect } from "react"
// import { Button } from "@/components/ui/button"
// import { Card } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { FileText, Trash2, Play, Calendar } from "lucide-react"
// import { documentStorage, type SavedDocument } from "@/lib/document-storage"
// import { cn } from "@/lib/utils"

// interface DocumentLibraryProps {
//   onDocumentSelect: (document: SavedDocument) => void
//   selectedDocumentId?: string
// }

// export function DocumentLibrary({ onDocumentSelect, selectedDocumentId }: DocumentLibraryProps) {
//   const [savedDocuments, setSavedDocuments] = useState<SavedDocument[]>([])

//   useEffect(() => {
//     loadDocuments()
//   }, [])

//   const loadDocuments = () => {
//     const docs = documentStorage.getAllDocuments()
//     setSavedDocuments(docs)
//   }

//   const handleDelete = (id: string, event: React.MouseEvent) => {
//     event.stopPropagation()
//     documentStorage.deleteDocument(id)
//     loadDocuments()
//   }

//   const formatFileSize = (bytes: number): string => {
//     if (bytes === 0) return "0 Bytes"
//     const k = 1024
//     const sizes = ["Bytes", "KB", "MB", "GB"]
//     const i = Math.floor(Math.log(bytes) / Math.log(k))
//     return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
//   }

//   const getFileTypeIcon = (fileType: string) => {
//     if (fileType.includes("pdf")) return "📄"
//     if (fileType.includes("word")) return "📝"
//     if (fileType.includes("text")) return "📃"
//     return "📄"
//   }

//   if (savedDocuments.length === 0) {
//     return (
//       <Card className="p-6 text-center">
//         <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
//         <h3 className="font-semibold text-foreground mb-2">No Saved Documents</h3>
//         <p className="text-sm text-muted-foreground">
//           Upload and process documents to see them saved here for future listening.
//         </p>
//       </Card>
//     )
//   }

//   return (
//     <Card className="p-6">
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-lg font-semibold text-foreground">Document Library</h3>
//         <Badge variant="secondary">{savedDocuments.length} saved</Badge>
//       </div>

//       <ScrollArea className="h-[400px] pr-4">
//         <div className="space-y-3">
//           {savedDocuments.map((doc) => (
//             <Card
//               key={doc.id}
//               className={cn(
//                 "p-4 cursor-pointer transition-colors hover:bg-muted/50",
//                 selectedDocumentId === doc.id && "ring-2 ring-primary bg-primary/5",
//               )}
//               onClick={() => onDocumentSelect(doc)}
//             >
//               <div className="flex items-start justify-between gap-3">
//                 <div className="flex items-start gap-3 flex-1 min-w-0">
//                   <div className="text-2xl">{getFileTypeIcon(doc.fileType)}</div>
//                   <div className="flex-1 min-w-0">
//                     <h4 className="font-medium text-foreground truncate" title={doc.name}>
//                       {doc.name}
//                     </h4>
//                     <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
//                       <Calendar className="h-3 w-3" />
//                       <span>{doc.uploadDate.toLocaleDateString()}</span>
//                       <span>•</span>
//                       <span>{formatFileSize(doc.fileSize)}</span>
//                     </div>
//                     <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
//                       {doc.content.substring(0, 100)}...
//                     </p>
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-1">
//                   <Button
//                     size="sm"
//                     variant="ghost"
//                     onClick={(e) => {
//                       e.stopPropagation()
//                       onDocumentSelect(doc)
//                     }}
//                     className="h-8 w-8 p-0"
//                   >
//                     <Play className="h-3 w-3" />
//                   </Button>
//                   <Button
//                     size="sm"
//                     variant="ghost"
//                     onClick={(e) => handleDelete(doc.id, e)}
//                     className="h-8 w-8 p-0 text-destructive hover:text-destructive"
//                   >
//                     <Trash2 className="h-3 w-3" />
//                   </Button>
//                 </div>
//               </div>
//             </Card>
//           ))}
//         </div>
//       </ScrollArea>
//     </Card>
//   )
// }
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  FileText, Trash2, Play, Calendar, Clock, Eye, Search,
  MoreVertical, Download, Share2, Star, Archive,
  SortAsc, SortDesc, Filter, Grid, List,
  Library
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { documentStorage, type SavedDocument } from "@/lib/enhanced-storage"
import { cn } from "@/lib/utils"

interface DocumentLibraryProps {
  onDocumentSelect: (document: SavedDocument) => void
  selectedDocumentId?: string
  searchQuery?: string
  onStatsUpdate?: () => void
}

type SortOption = "name" | "date" | "size" | "words"
type ViewMode = "grid" | "list"

export function DocumentLibrary({ 
  onDocumentSelect, 
  selectedDocumentId, 
  searchQuery = "",
  onStatsUpdate 
}: DocumentLibraryProps) {
  const [savedDocuments, setSavedDocuments] = useState<SavedDocument[]>([])
  const [sortBy, setSortBy] = useState<SortOption>("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = () => {
    const docs = documentStorage.getAllDocuments()
    setSavedDocuments(docs)
  }

  const handleDelete = (id: string, event: React.MouseEvent) => {
    event.stopPropagation()
    documentStorage.deleteDocument(id)
    loadDocuments()
    onStatsUpdate?.()
  }

  const handleBulkDelete = () => {
    selectedDocs.forEach(id => documentStorage.deleteDocument(id))
    setSelectedDocs(new Set())
    loadDocuments()
    onStatsUpdate?.()
  }

  const toggleDocSelection = (id: string) => {
    const newSelected = new Set(selectedDocs)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedDocs(newSelected)
  }

  const filteredAndSortedDocuments = savedDocuments
    .filter(doc => 
      searchQuery === "" || 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      let aValue: any
      let bValue: any
      
      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case "date":
          aValue = new Date(a.uploadDate).getTime()
          bValue = new Date(b.uploadDate).getTime()
          break
        case "size":
          aValue = a.fileSize
          bValue = b.fileSize
          break
        case "words":
          aValue = a.wordCount
          bValue = b.wordCount
          break
        default:
          return 0
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileTypeIcon = (fileType: string) => {
    if (fileType.includes("pdf")) return "📄"
    if (fileType.includes("word")) return "📝"
    if (fileType.includes("text")) return "📃"
    return "📄"
  }

  const getRelativeTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return date.toLocaleDateString()
  }

  if (savedDocuments.length === 0) {
    return (
      <Card className="p-12 text-center border-0 shadow-lg bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
        <div className="max-w-md mx-auto">
          <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-6">
            <FileText className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-3">No Documents Yet</h3>
          <p className="text-muted-foreground leading-relaxed">
            Upload your first document to start building your personal library. 
            All documents are saved locally and processed securely.
          </p>
          <div className="flex justify-center gap-2 mt-6">
            <Badge variant="outline">Local Storage</Badge>
            <Badge variant="outline">Privacy First</Badge>
            <Badge variant="outline">Secure Processing</Badge>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80 backdrop-blur-sm overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Library className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">Document Library</h3>
              <p className="text-muted-foreground mt-1">
                {filteredAndSortedDocuments.length} of {savedDocuments.length} documents
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {selectedDocs.size > 0 && (
              <Badge variant="destructive" className="mr-2">
                {selectedDocs.size} selected
              </Badge>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="h-9 w-9 p-0"
            >
              {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 px-3">
                  <Filter className="h-4 w-4 mr-2" />
                  Sort
                  {sortOrder === "asc" ? <SortAsc className="h-4 w-4 ml-2" /> : <SortDesc className="h-4 w-4 ml-2" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setSortBy("date")}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Date {sortBy === "date" && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("name")}>
                  <FileText className="h-4 w-4 mr-2" />
                  Name {sortBy === "name" && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("size")}>
                  <Archive className="h-4 w-4 mr-2" />
                  Size {sortBy === "size" && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("words")}>
                  <Eye className="h-4 w-4 mr-2" />
                  Words {sortBy === "words" && "✓"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
                  {sortOrder === "asc" ? <SortDesc className="h-4 w-4 mr-2" /> : <SortAsc className="h-4 w-4 mr-2" />}
                  {sortOrder === "asc" ? "Descending" : "Ascending"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedDocs.size > 0 && (
          <Card className="p-3 mb-4 bg-primary/5 border border-primary/20">
            <div className="flex items-center justify-between">
              <span className="text-sm text-primary font-medium">
                {selectedDocs.size} document{selectedDocs.size > 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDocs(new Set())}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Search Results */}
        {searchQuery && (
          <div className="mb-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Search className="h-4 w-4" />
              <span>
                Found {filteredAndSortedDocuments.length} result{filteredAndSortedDocuments.length !== 1 ? 's' : ''} for "{searchQuery}"
              </span>
            </div>
          </div>
        )}

        {/* Documents List/Grid */}
        <ScrollArea className="h-[500px] pr-4">
          {viewMode === "list" ? (
            <div className="space-y-3">
              {filteredAndSortedDocuments.map((doc) => (
                <Card
                  key={doc.id}
                  className={cn(
                    "p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] group border-0 bg-gradient-to-r from-background to-background/80",
                    selectedDocumentId === doc.id && "ring-2 ring-primary bg-primary/5",
                    selectedDocs.has(doc.id) && "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  )}
                  onClick={() => onDocumentSelect(doc)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* Checkbox for selection */}
                      <div className="pt-1">
                        <input
                          type="checkbox"
                          checked={selectedDocs.has(doc.id)}
                          onChange={(e) => {
                            e.stopPropagation()
                            toggleDocSelection(doc.id)
                          }}
                          className="w-4 h-4 text-primary"
                        />
                      </div>
                      
                      {/* File Icon */}
                      <div className="text-3xl mt-1">
                        {getFileTypeIcon(doc.fileType)}
                      </div>
                      
                      {/* Document Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors" title={doc.name}>
                          {doc.name}
                        </h4>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{getRelativeTime(new Date(doc.uploadDate))}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Archive className="h-3 w-3" />
                            <span>{formatFileSize(doc.fileSize)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{doc.wordCount} words</span>
                          </div>
                          {doc.lastAccessed && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>Read {getRelativeTime(new Date(doc.lastAccessed))}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {doc.content.substring(0, 150)}...
                        </p>
                        
                        {/* Tags */}
                        <div className="flex items-center gap-2 mt-3">
                          <Badge variant="secondary" className="text-xs">
                            {doc.fileType.split('/')[1] || 'document'}
                          </Badge>
                          {doc.readingTime && (
                            <Badge variant="outline" className="text-xs">
                              ~{doc.readingTime}min read
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDocumentSelect(doc)
                        }}
                        className="h-8 w-8 p-0 hover:bg-primary hover:text-primary-foreground"
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => e.stopPropagation()}
                            className="h-8 w-8 p-0"
                          >
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            onDocumentSelect(doc)
                          }}>
                            <Play className="h-4 w-4 mr-2" />
                            Listen
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Star className="h-4 w-4 mr-2" />
                            Favorite
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={(e) => handleDelete(doc.id, e)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            // Grid view
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAndSortedDocuments.map((doc) => (
                <Card
                  key={doc.id}
                  className={cn(
                    "p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group border-0 bg-gradient-to-br from-background to-background/80",
                    selectedDocumentId === doc.id && "ring-2 ring-primary bg-primary/5"
                  )}
                  onClick={() => onDocumentSelect(doc)}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="text-4xl">{getFileTypeIcon(doc.fileType)}</div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => e.stopPropagation()}
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => handleDelete(doc.id, e)} className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors" title={doc.name}>
                        {doc.name}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                        {doc.content.substring(0, 100)}...
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{getRelativeTime(new Date(doc.uploadDate))}</span>
                      <span>{doc.wordCount} words</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {filteredAndSortedDocuments.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No documents found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or upload a new document.
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}