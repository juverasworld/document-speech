"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  FileText, File, AlertCircle, Library, Eye, Search,
  Maximize2, Minimize2, Copy, Download, Share2,
  BookOpen, Clock, BarChart3, Type, Zap, X
} from "lucide-react"
import { cn } from "@/lib/utils"

interface DocumentPreviewProps {
  file: File | null
  extractedText: string
  isProcessing: boolean
  documentName?: string
}

export function DocumentPreview({ file, extractedText, isProcessing, documentName }: DocumentPreviewProps) {
  const [pdfUrl, setPdfUrl] = useState<string>("")
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [readingProgress, setReadingProgress] = useState(0)
  const [stats, setStats] = useState({
    characters: 0,
    words: 0,
    paragraphs: 0,
    readingTime: 0
  })

  useEffect(() => {
    if (file && file.type === "application/pdf") {
      const url = URL.createObjectURL(file)
      setPdfUrl(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setPdfUrl("")
    }
  }, [file])

  useEffect(() => {
    if (extractedText) {
      const words = extractedText.split(/\s+/).length
      const characters = extractedText.length
      const paragraphs = extractedText.split(/\n\s*\n/).length
      const readingTime = Math.ceil(words / 200)
      
      setStats({ characters, words, paragraphs, readingTime })
    }
  }, [extractedText])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(extractedText)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  const highlightSearchTerm = (text: string, term: string) => {
    if (!term) return text
    const regex = new RegExp(`(${term})`, 'gi')
    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$1</mark>')
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget
    const scrollTop = element.scrollTop
    const scrollHeight = element.scrollHeight - element.clientHeight
    const progress = (scrollTop / scrollHeight) * 100
    setReadingProgress(isNaN(progress) ? 0 : progress)
  }

  if (!file && !isProcessing && !documentName) {
    return (
      <Card className="min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] border-0 shadow-lg bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
        <div className="flex flex-col items-center justify-center h-full text-center p-4 sm:p-6 lg:p-8">
          <div className="relative mb-6 sm:mb-8">
            <div className="p-4 sm:p-6 rounded-full bg-gradient-to-br from-primary/10 to-primary/5">
              <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-primary" />
            </div>
            <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 bg-blue-500/20 rounded-full animate-pulse" />
            <div className="absolute -bottom-1 -left-2 sm:-left-3 w-3 h-3 sm:w-4 sm:h-4 bg-purple-500/20 rounded-full animate-bounce" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-3">Ready for Your Document</h3>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md leading-relaxed px-4">
            Upload a new document or select from your saved library to begin your listening experience
          </p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-4 sm:mt-6">
            <Badge variant="outline" className="px-2 sm:px-3 py-1 text-xs">
              <Eye className="h-3 w-3 mr-1" />
              Preview
            </Badge>
            <Badge variant="outline" className="px-2 sm:px-3 py-1 text-xs">
              <BarChart3 className="h-3 w-3 mr-1" />
              Analytics
            </Badge>
            <Badge variant="outline" className="px-2 sm:px-3 py-1 text-xs">
              <Search className="h-3 w-3 mr-1" />
              Search
            </Badge>
          </div>
        </div>
      </Card>
    )
  }

  if (isProcessing) {
    return (
      <Card className="min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] border-0 shadow-lg bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
        <div className="flex flex-col items-center justify-center h-full text-center p-4 sm:p-6 lg:p-8">
          <div className="relative mb-6 sm:mb-8">
            <div className="p-4 sm:p-6 rounded-full bg-gradient-to-br from-primary/10 to-primary/5">
              <Zap className="h-12 w-12 sm:h-16 sm:w-16 text-primary animate-pulse" />
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-3">Processing Document...</h3>
          <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-md px-4">
            Extracting and optimizing text content for the best listening experience
          </p>
          <div className="w-full max-w-sm px-4">
            <Progress value={65} className="h-2" />
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">Analyzing content structure...</p>
          </div>
        </div>
      </Card>
    )
  }

  if (!extractedText) {
    return (
      <Card className="min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] border-0 shadow-lg bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
        <div className="flex flex-col items-center justify-center h-full text-center p-4 sm:p-6 lg:p-8">
          <div className="p-4 sm:p-6 rounded-full bg-destructive/10 mb-4 sm:mb-6">
            <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 text-destructive" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-3">Processing Failed</h3>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md leading-relaxed px-4">
            Unable to extract readable text from this document. Please try a different file or format.
          </p>
          <div className="flex justify-center gap-2 mt-4 sm:mt-6">
            <Badge variant="outline" className="text-destructive border-destructive/30 text-xs">
              Text Extraction Failed
            </Badge>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Document Info Card - Mobile Optimized */}
      <Card className="p-3 sm:p-4 border-0 shadow-lg bg-gradient-to-r from-card to-card/80 backdrop-blur-sm">
        <div className="flex items-start sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
            {documentName ? (
              <div className="p-2 rounded-lg bg-purple-500/10 flex-shrink-0">
                <Library className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
              </div>
            ) : (
              <div className="p-2 rounded-lg bg-blue-500/10 flex-shrink-0">
                <File className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm sm:text-base text-foreground truncate" title={documentName || file?.name}>
                {documentName || file?.name}
              </p>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1 text-xs sm:text-sm text-muted-foreground">
                {file?.size && (
                  <span>{(file.size / 1024).toFixed(1)} KB</span>
                )}
                <span>{stats.words} words</span>
                <span className="hidden xs:inline">{stats.readingTime}min read</span>
                {documentName && <span className="text-purple-500">Library</span>}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="h-8 px-2 sm:px-3 text-xs"
            >
              <Copy className="h-3 w-3 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Copy</span>
            </Button>
            
            {/* Mobile: Dialog for expanded view */}
            <div className="sm:hidden">
              <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                    <Maximize2 className="h-3 w-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] h-[95vh] p-0">
                  <DialogHeader className="p-4 pb-0">
                    <DialogTitle className="flex items-center gap-2 text-lg">
                      <FileText className="h-5 w-5" />
                      Document Content
                    </DialogTitle>
                  </DialogHeader>
                  <div className="flex-1 p-4 pt-2">
                    <ExpandedTextContent 
                      extractedText={extractedText}
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                      highlightSearchTerm={highlightSearchTerm}
                      handleScroll={handleScroll}
                      stats={stats}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            {/* Desktop: Toggle expanded state */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="hidden sm:flex h-8 w-8 p-0"
            >
              {isExpanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
            </Button>
          </div>
        </div>
        
        {/* Reading Progress */}
        {readingProgress > 0 && (
          <div className="mt-3 sm:mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">Reading Progress</span>
              <span className="text-primary font-medium">{Math.round(readingProgress)}%</span>
            </div>
            <Progress value={readingProgress} className="h-1 sm:h-2" />
          </div>
        )}
      </Card>

      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <Card className="p-2 sm:p-3 text-center border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <Type className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 mx-auto mb-1" />
          <p className="text-sm sm:text-lg font-bold text-blue-700 dark:text-blue-300">{stats.words > 999 ? `${(stats.words/1000).toFixed(1)}k` : stats.words.toLocaleString()}</p>
          <p className="text-xs text-blue-600 dark:text-blue-400">Words</p>
        </Card>
        <Card className="p-2 sm:p-3 text-center border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mx-auto mb-1" />
          <p className="text-sm sm:text-lg font-bold text-green-700 dark:text-green-300">{stats.paragraphs}</p>
          <p className="text-xs text-green-600 dark:text-green-400">Paragraphs</p>
        </Card>
        <Card className="p-2 sm:p-3 text-center border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500 mx-auto mb-1" />
          <p className="text-sm sm:text-lg font-bold text-purple-700 dark:text-purple-300">{stats.characters > 999 ? `${(stats.characters/1000).toFixed(1)}k` : stats.characters.toLocaleString()}</p>
          <p className="text-xs text-purple-600 dark:text-purple-400">Characters</p>
        </Card>
        <Card className="p-2 sm:p-3 text-center border-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
          <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500 mx-auto mb-1" />
          <p className="text-sm sm:text-lg font-bold text-orange-700 dark:text-orange-300">{stats.readingTime}min</p>
          <p className="text-xs text-orange-600 dark:text-orange-400">Est. Time</p>
        </Card>
      </div>

      {/* PDF Viewer - Only show on larger screens */}
      {file?.type === "application/pdf" && pdfUrl && (
        <Card className="overflow-hidden border-0 shadow-lg hidden sm:block">
          <div className="p-3 sm:p-4 border-b bg-muted/50">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              PDF Preview
            </h4>
          </div>
          <iframe 
            src={pdfUrl} 
            className="w-full h-64 sm:h-96" 
            title="PDF Preview"
            style={{ border: 'none' }}
          />
        </Card>
      )}

      {/* Text Content */}
      <Card className={cn(
        "overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card to-card/80 backdrop-blur-sm",
        isExpanded && "hidden sm:block fixed inset-4 z-50 max-w-none max-h-none"
      )}>
        <div className="p-3 sm:p-4 border-b bg-muted/50 flex items-center justify-between">
          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
            {documentName ? (
              <>
                <Library className="h-4 w-4" />
                <span className="hidden sm:inline">Document Content</span>
                <span className="sm:hidden">Content</span>
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Extracted Text</span>
                <span className="sm:hidden">Text</span>
              </>
            )}
          </h4>
          
          {/* Search - Hide on mobile in compact view */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search text..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-7 pr-3 py-1 text-xs border rounded-md bg-background text-foreground w-24 lg:w-32 focus:w-32 lg:focus:w-40 transition-all"
              />
            </div>
            {isExpanded && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        <ScrollArea 
          className={cn(
            "p-3 sm:p-6",
            isExpanded ? "h-[calc(100vh-200px)]" : "h-48 sm:h-64 lg:max-h-96"
          )}
          onScrollCapture={handleScroll}
        >
          <div className="prose prose-sm max-w-none text-foreground">
            {extractedText.split("\n").map((paragraph, index) => {
              const processedParagraph = searchTerm 
                ? highlightSearchTerm(paragraph, searchTerm)
                : paragraph
                
              return (
                <p
                  key={index}
                  className={cn(
                    "text-xs sm:text-sm text-foreground leading-relaxed mb-3 sm:mb-4 last:mb-0 transition-all duration-200",
                    paragraph.trim() === "" && "mb-1 sm:mb-2",
                    searchTerm && paragraph.toLowerCase().includes(searchTerm.toLowerCase()) && "bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded-md border-l-4 border-yellow-400"
                  )}
                  dangerouslySetInnerHTML={{ __html: processedParagraph || "\u00A0" }}
                />
              )
            })}
          </div>
        </ScrollArea>
        
        {/* Footer */}
        <div className="p-2 sm:p-3 border-t bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2 sm:gap-4">
            <span>{stats.words} words</span>
            <span className="hidden sm:inline">{stats.characters} chars</span>
            <span className="hidden sm:inline">~{stats.readingTime} min</span>
          </div>
          {searchTerm && (
            <span className="text-primary truncate max-w-24">
              "{searchTerm}"
            </span>
          )}
        </div>
      </Card>
    </div>
  )
}

// Expanded Text Content Component
function ExpandedTextContent({ 
  extractedText, searchTerm, setSearchTerm, highlightSearchTerm, handleScroll, stats 
}: any) {
  return (
    <div className="h-full flex flex-col">
      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search in document..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Text Content */}
      <ScrollArea className="flex-1" onScrollCapture={handleScroll}>
        <div className="prose prose-sm max-w-none text-foreground pr-4">
          {extractedText.split("\n").map((paragraph: string, index: number) => {
            const processedParagraph = searchTerm 
              ? highlightSearchTerm(paragraph, searchTerm)
              : paragraph
              
            return (
              <p
                key={index}
                className={cn(
                  "text-sm text-foreground leading-relaxed mb-4 last:mb-0 transition-all duration-200",
                  paragraph.trim() === "" && "mb-2",
                  searchTerm && paragraph.toLowerCase().includes(searchTerm.toLowerCase()) && "bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded-md border-l-4 border-yellow-400"
                )}
                dangerouslySetInnerHTML={{ __html: processedParagraph || "\u00A0" }}
              />
            )
          })}
        </div>
      </ScrollArea>

      {/* Stats Footer */}
      <div className="mt-4 p-3 border-t bg-muted/30 rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>{stats.words} words</span>
            <span>{stats.characters} characters</span>
            <span>~{stats.readingTime} min read</span>
          </div>
          {searchTerm && (
            <span className="text-primary">
              Searching: "{searchTerm}"
            </span>
          )}
        </div>
      </div>
    </div>
  )
}