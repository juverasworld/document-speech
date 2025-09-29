
// "use client"

// import { useState, useEffect } from "react"
// import { FileUpload } from "@/components/enhanced/file-upload"
// import { DocumentPreview } from "@/components/enhanced/document-preview"
// import { AudioControls } from "@/components/enhanced/audio-controls"
// import { DocumentLibrary } from "@/components/enhanced/document-library"
// import { SearchBar } from "@/components/enhanced/search-bar"
// import { StatsCard } from "@/components/enhanced/stats-card"
// import { Card } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { 
//   FileAudio, Upload, Play, Library, Settings, Moon, Sun, 
//   Sparkles, Zap, BookOpen, Clock, TrendingUp, Menu, X
// } from "lucide-react"
// import { documentStorage, type SavedDocument } from "@/lib/enhanced-document-storage"
// import { useTheme } from "next-themes"
// import { cn } from "@/lib/utils"

// export default function EnhancedDocumentReader() {
//   const [uploadedFile, setUploadedFile] = useState<File | null>(null)
//   const [extractedText, setExtractedText] = useState<string>("")
//   const [isProcessing, setIsProcessing] = useState(false)
//   const [selectedDocument, setSelectedDocument] = useState<SavedDocument | null>(null)
//   const [searchQuery, setSearchQuery] = useState("")
//   const [stats, setStats] = useState({ totalDocs: 0, totalWords: 0, totalReadTime: 0 })
//   const [activeTab, setActiveTab] = useState("upload")
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
//   const { theme, setTheme } = useTheme()

//   useEffect(() => {
//     updateStats()
//   }, [])

//   const updateStats = () => {
//     const docs = documentStorage.getAllDocuments()
//     const totalWords = docs.reduce((sum, doc) => sum + doc.wordCount, 0)
//     const avgWordsPerMinute = 200
//     const totalReadTime = Math.round(totalWords / avgWordsPerMinute)
    
//     setStats({
//       totalDocs: docs.length,
//       totalWords,
//       totalReadTime
//     })
//   }

//   const handleFileUpload = (file: File) => {
//     setUploadedFile(file)
//     setIsProcessing(true)
//     setSelectedDocument(null)
//     setActiveTab("upload")
//     setMobileMenuOpen(false)
//   }

//   const handleTextExtracted = (text: string) => {
//     setExtractedText(text)
//     setIsProcessing(false)

//     if (uploadedFile && text.trim()) {
//       const savedDoc = documentStorage.saveDocument(uploadedFile, text)
//       updateStats()
//       console.log("Document saved:", savedDoc.name)
//     }
//   }

//   const handleDocumentSelect = (document: SavedDocument) => {
//     setSelectedDocument(document)
//     setExtractedText(document.content)
//     setUploadedFile(null)
//     documentStorage.updateLastAccessed(document.id)
//     updateStats()
//     setMobileMenuOpen(false)
//   }

//   const handleSearch = (query: string) => {
//     setSearchQuery(query)
//   }

//   const steps = [
//     { icon: Upload, label: "Upload", completed: !!uploadedFile || !!selectedDocument, description: "Add your document" },
//     { icon: FileAudio, label: "Process", completed: !!extractedText, description: "Extract text content" },
//     { icon: Play, label: "Listen", completed: !!extractedText, description: "Enjoy audio playback" },
//   ]

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
//       {/* Background Elements */}
//       <div className="absolute inset-0 bg-grid-white/[0.02] bg-grid-16 pointer-events-none" />
//       <div className="absolute top-0 -right-4 w-48 h-48 sm:w-72 sm:h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
//       <div className="absolute top-0 -left-4 w-48 h-48 sm:w-72 sm:h-72 bg-purple-300/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
//       <div className="absolute -bottom-8 left-20 w-48 h-48 sm:w-72 sm:h-72 bg-blue-300/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />

//       {/* Header - Mobile Responsive */}
//       <header className="relative border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
//         <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3 sm:gap-4">
//               <div className="p-2 sm:p-3 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
//                 <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-primary-foreground" />
//               </div>
//               <div>
//                 <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
//                   Document Reader
//                 </h1>
//                 <p className="text-muted-foreground mt-1 text-sm sm:text-lg hidden sm:block">
//                   Transform your documents into immersive audio experiences
//                 </p>
//               </div>
//             </div>

//             {/* Mobile Menu Toggle */}
//             <div className="sm:hidden">
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//                 className="h-10 w-10 p-0"
//               >
//                 {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
//               </Button>
//             </div>
//           </div>

//           {/* Mobile Navigation */}
//           {mobileMenuOpen && (
//             <div className="sm:hidden mt-4 p-4 bg-card rounded-lg border shadow-lg">
//               <div className="space-y-3">
//                 <Button
//                   variant={activeTab === "upload" ? "default" : "ghost"}
//                   className="w-full justify-start"
//                   onClick={() => {
//                     setActiveTab("upload")
//                     setMobileMenuOpen(false)
//                   }}
//                 >
//                   <Upload className="h-4 w-4 mr-2" />
//                   Upload New Document
//                 </Button>
//                 <Button
//                   variant={activeTab === "library" ? "default" : "ghost"}
//                   className="w-full justify-start"
//                   onClick={() => {
//                     setActiveTab("library")
//                     setMobileMenuOpen(false)
//                   }}
//                 >
//                   <Library className="h-4 w-4 mr-2" />
//                   Document Library
//                   {stats.totalDocs > 0 && (
//                     <Badge variant="secondary" className="ml-auto">
//                       {stats.totalDocs}
//                     </Badge>
//                   )}
//                 </Button>
//               </div>
//             </div>
//           )}
//         </div>
//       </header>

//       <main className="relative container mx-auto px-4 sm:px-6 py-6 sm:py-12">
//         {/* Process Steps - Mobile Friendly */}
//         <div className="mb-6 sm:mb-8">
//           <div className="flex justify-center">
//             <div className="flex items-center gap-2 sm:gap-4 bg-card/50 backdrop-blur-sm rounded-full p-2 sm:p-3 border border-border/50">
//               {steps.map((step, index) => {
//                 const Icon = step.icon
//                 return (
//                   <div key={index} className="flex items-center gap-2 sm:gap-3">
//                     <div className={cn(
//                       "flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-all duration-200",
//                       step.completed 
//                         ? "bg-primary text-primary-foreground shadow-lg" 
//                         : "bg-muted text-muted-foreground"
//                     )}>
//                       <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
//                     </div>
//                     <div className="hidden sm:block">
//                       <p className={cn(
//                         "text-sm font-medium",
//                         step.completed ? "text-foreground" : "text-muted-foreground"
//                       )}>
//                         {step.label}
//                       </p>
//                       <p className="text-xs text-muted-foreground">{step.description}</p>
//                     </div>
//                     {index < steps.length - 1 && (
//                       <div className={cn(
//                         "w-8 sm:w-12 h-0.5 rounded transition-colors",
//                         steps[index + 1].completed ? "bg-primary" : "bg-border"
//                       )} />
//                     )}
//                   </div>
//                 )
//               })}
//             </div>
//           </div>
//         </div>
        
//         {/* Main Content - Responsive Layout */}
//         <div className="space-y-6 lg:space-y-8">
//           {/* Mobile/Tablet: Single Column Layout */}
//           <div className="lg:hidden space-y-6">
//             {/* Tabs */}
//             <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//               <TabsList className="grid w-full grid-cols-2 p-2 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl h-12 sm:h-14">
//                 <TabsTrigger 
//                   value="upload" 
//                   className="flex items-center gap-2 sm:gap-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-200 text-xs sm:text-sm"
//                 >
//                   <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
//                   <span>Upload</span>
//                 </TabsTrigger>
//                 <TabsTrigger 
//                   value="library" 
//                   className="flex items-center gap-2 sm:gap-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-200 text-xs sm:text-sm"
//                 >
//                   <Library className="h-3 w-3 sm:h-4 sm:w-4" />
//                   <span>Library</span>
//                   {stats.totalDocs > 0 && (
//                     <Badge variant="secondary" className="text-xs">
//                       {stats.totalDocs}
//                     </Badge>
//                   )}
//                 </TabsTrigger>
//               </TabsList>

//               <TabsContent value="upload" className="mt-6">
//                 <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
//                   <div className="p-4 sm:p-6">
//                     <div className="flex items-center gap-3 mb-4 sm:mb-6">
//                       <div className="p-2 rounded-lg bg-primary/10">
//                         <Upload className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
//                       </div>
//                       <div>
//                         <h2 className="text-lg sm:text-xl font-bold text-foreground">Upload Document</h2>
//                         <p className="text-muted-foreground text-sm">Start your listening journey</p>
//                       </div>
//                     </div>
//                     <FileUpload
//                       onFileUpload={handleFileUpload}
//                       onTextExtracted={handleTextExtracted}
//                       isProcessing={isProcessing}
//                     />
//                   </div>
//                 </Card>
//               </TabsContent>

//               <TabsContent value="library" className="mt-6">
//                 <div className="space-y-4 sm:space-y-6">
//                   <SearchBar onSearch={handleSearch} placeholder="Search your documents..." />
//                   <DocumentLibrary 
//                     onDocumentSelect={handleDocumentSelect} 
//                     selectedDocumentId={selectedDocument?.id}
//                     searchQuery={searchQuery}
//                     onStatsUpdate={updateStats}
//                   />
//                 </div>
//               </TabsContent>
//             </Tabs>

//             {/* Document Preview */}
//             <DocumentPreview
//               file={uploadedFile}
//               extractedText={extractedText}
//               isProcessing={isProcessing}
//               documentName={selectedDocument?.name}
//             />

//             {/* Audio Controls */}
//             {extractedText && (
//               <div className="space-y-4">
//                 <div className="flex items-center gap-3">
//                   <div className="p-2 rounded-lg bg-primary/10">
//                     <Play className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
//                   </div>
//                   <div>
//                     <h2 className="text-lg sm:text-xl font-bold text-foreground">Audio Controls</h2>
//                     <p className="text-muted-foreground text-sm">Control your listening experience</p>
//                   </div>
//                 </div>
//                 <AudioControls text={extractedText} />
//               </div>
//             )}
//           </div>

//           {/* Desktop: Multi-Column Layout */}
//           <div className="hidden lg:grid lg:grid-cols-3 gap-8">
//             {/* Left Column - Upload and Library */}
//             <div className="lg:col-span-2 space-y-8">
//               <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//                 <TabsList className="grid w-full grid-cols-2 p-2 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl h-14">
//                   <TabsTrigger 
//                     value="upload" 
//                     className="flex items-center gap-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-200"
//                   >
//                     <Upload className="h-4 w-4" />
//                     Upload New
//                   </TabsTrigger>
//                   <TabsTrigger 
//                     value="library" 
//                     className="flex items-center gap-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-200"
//                   >
//                     <Library className="h-4 w-4" />
//                     Document Library
//                     {stats.totalDocs > 0 && (
//                       <Badge variant="secondary" className="ml-2">
//                         {stats.totalDocs}
//                       </Badge>
//                     )}
//                   </TabsTrigger>
//                 </TabsList>

//                 <TabsContent value="upload" className="mt-8">
//                   <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
//                     <div className="p-8">
//                       <div className="flex items-center justify-between mb-6">
//                         <div className="flex items-center gap-3">
//                           <div className="p-2 rounded-lg bg-primary/10">
//                             <Upload className="h-5 w-5 text-primary" />
//                           </div>
//                           <div>
//                             <h2 className="text-2xl font-bold text-foreground">Upload Document</h2>
//                             <p className="text-muted-foreground mt-1">Start your listening journey</p>
//                           </div>
//                         </div>
//                         <Badge variant="outline" className="px-3 py-1">
//                           <Sparkles className="h-3 w-3 mr-1" />
//                           Smart Processing
//                         </Badge>
//                       </div>
//                       <FileUpload
//                         onFileUpload={handleFileUpload}
//                         onTextExtracted={handleTextExtracted}
//                         isProcessing={isProcessing}
//                       />
//                     </div>
//                   </Card>
//                 </TabsContent>

//                 <TabsContent value="library" className="mt-8">
//                   <div className="space-y-6">
//                     <SearchBar onSearch={handleSearch} placeholder="Search your documents..." />
//                     <DocumentLibrary 
//                       onDocumentSelect={handleDocumentSelect} 
//                       selectedDocumentId={selectedDocument?.id}
//                       searchQuery={searchQuery}
//                       onStatsUpdate={updateStats}
//                     />
//                   </div>
//                 </TabsContent>
//               </Tabs>

//               {/* Audio Controls */}
//               {extractedText && (
//                 <div className="space-y-4">
//                   <h2 className="text-2xl font-bold text-foreground">Audio Controls</h2>
//                   <AudioControls text={extractedText} />
//                 </div>
//               )}
//             </div>

//             {/* Right Column - Preview */}
//             <div className="lg:col-span-1">
//               <div className="sticky top-24">
//                 <DocumentPreview
//                   file={uploadedFile}
//                   extractedText={extractedText}
//                   isProcessing={isProcessing}
//                   documentName={selectedDocument?.name}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Enhanced Features Section - Responsive Grid */}
//         <div className="mt-12 sm:mt-20">
//           <div className="text-center mb-8 sm:mb-12">
//             <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-4">
//               Powerful Features
//             </h2>
//             <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto px-4">
//               Experience the next generation of document reading with advanced AI-powered features
//             </p>
//           </div>

//           <div className="grid gap-4 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
//             {[
//               {
//                 icon: Upload,
//                 title: "Smart Upload",
//                 description: "Drag & drop support for PDF, Word, and text files with intelligent processing and validation",
//                 badges: ["PDF", "DOCX", "TXT"],
//                 color: "from-blue-500 to-blue-600"
//               },
//               {
//                 icon: Zap,
//                 title: "AI Processing",
//                 description: "Advanced text extraction with OCR capabilities and intelligent content optimization",
//                 badges: ["Neural OCR"],
//                 color: "from-green-500 to-green-600"
//               },
//               {
//                 icon: Play,
//                 title: "Premium Audio",
//                 description: "High-quality text-to-speech with voice selection, speed control, and precise seeking",
//                 badges: ["Neural Voices", "Seeking"],
//                 color: "from-purple-500 to-purple-600"
//               },
//               {
//                 icon: Library,
//                 title: "Smart Library",
//                 description: "Organize, search, and manage your documents with intelligent categorization",
//                 badges: ["Search", "Auto-save"],
//                 color: "from-orange-500 to-orange-600"
//               },
//               {
//                 icon: Settings,
//                 title: "Customization",
//                 description: "Personalize your reading experience with themes, shortcuts, and accessibility options",
//                 badges: ["Themes", "A11y"],
//                 color: "from-red-500 to-red-600"
//               },
//               {
//                 icon: Sparkles,
//                 title: "Privacy First",
//                 description: "Your documents stay private with local processing and secure storage",
//                 badges: ["Local Storage"],
//                 color: "from-teal-500 to-teal-600"
//               }
//             ].map((feature, index) => {
//               const Icon = feature.icon
//               return (
//                 <Card key={index} className="group p-4 sm:p-6 lg:p-8 border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-card to-card/80 hover:scale-105 cursor-default">
//                   <div className={cn(
//                     "flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 bg-gradient-to-br",
//                     feature.color
//                   )}>
//                     <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
//                   </div>
//                   <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 sm:mb-3">{feature.title}</h3>
//                   <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-3 sm:mb-4">
//                     {feature.description}
//                   </p>
//                   <div className="flex flex-wrap gap-1 sm:gap-2">
//                     {feature.badges.map((badge, badgeIndex) => (
//                       <Badge key={badgeIndex} variant="secondary" className="text-xs">
//                         {badge}
//                       </Badge>
//                     ))}
//                   </div>
//                 </Card>
//               )
//             })}
//           </div>
//         </div>
//       </main>

//       <footer className="relative border-t border-border/50 bg-background/80 backdrop-blur-xl mt-12 sm:mt-20">
//         <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
//           <div className="text-center">
//             <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
//               Built with Next.js, Web Speech API & modern design principles • Privacy-focused & locally processed
//             </p>
//             <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
//               <Badge variant="outline" className="text-xs">Next.js 14</Badge>
//               <Badge variant="outline" className="text-xs">Web Speech API</Badge>
//               <Badge variant="outline" className="text-xs">TypeScript</Badge>
//               <Badge variant="outline" className="text-xs">Tailwind CSS</Badge>
//             </div>
//           </div>
//         </div>
//       </footer>
//     </div>
//   )
// }
"use client"

import { useState, useEffect } from "react"
import { FileUpload } from "@/components/enhanced/file-upload"
import { DocumentPreview } from "@/components/enhanced/document-preview-responsive"
import { AudioControls } from "@/components/enhanced/audio-control-responsive"
import { DocumentLibrary } from "@/components/enhanced/document-library"
import { SearchBar } from "@/components/enhanced/search-bar"
import { StatsCard } from "@/components/enhanced/stats-card"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  FileAudio, Upload, Play, Library, Settings, Moon, Sun, 
  Sparkles, Zap, BookOpen, Clock, TrendingUp, Menu, X
} from "lucide-react"
import { documentStorage, type SavedDocument } from "@/lib/enhanced-document-storage"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

export default function EnhancedDocumentReader() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [extractedText, setExtractedText] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<SavedDocument | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [stats, setStats] = useState({ totalDocs: 0, totalWords: 0, totalReadTime: 0 })
  const [activeTab, setActiveTab] = useState("upload")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    updateStats()
  }, [])

  const updateStats = () => {
    const docs = documentStorage.getAllDocuments()
    const totalWords = docs.reduce((sum, doc) => sum + doc.wordCount, 0)
    const avgWordsPerMinute = 200
    const totalReadTime = Math.round(totalWords / avgWordsPerMinute)
    
    setStats({
      totalDocs: docs.length,
      totalWords,
      totalReadTime
    })
  }

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
    setIsProcessing(true)
    setSelectedDocument(null)
    setActiveTab("upload")
    setMobileMenuOpen(false)
  }

  const handleTextExtracted = (text: string) => {
    setExtractedText(text)
    setIsProcessing(false)

    if (uploadedFile && text.trim()) {
      const savedDoc = documentStorage.saveDocument(uploadedFile, text)
      updateStats()
      console.log("Document saved:", savedDoc.name)
    }
  }

  const handleDocumentSelect = (document: SavedDocument) => {
    setSelectedDocument(document)
    setExtractedText(document.content)
    setUploadedFile(null)
    documentStorage.updateLastAccessed(document.id)
    updateStats()
    setMobileMenuOpen(false)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const steps = [
    { icon: Upload, label: "Upload", completed: !!uploadedFile || !!selectedDocument, description: "Add your document" },
    { icon: FileAudio, label: "Process", completed: !!extractedText, description: "Extract text content" },
    { icon: Play, label: "Listen", completed: !!extractedText, description: "Enjoy audio playback" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-grid-16 pointer-events-none" />
      <div className="absolute top-0 -right-4 w-48 h-48 sm:w-72 sm:h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
      <div className="absolute top-0 -left-4 w-48 h-48 sm:w-72 sm:h-72 bg-purple-300/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-48 h-48 sm:w-72 sm:h-72 bg-blue-300/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />

      {/* Header - Mobile Responsive */}
      <header className="relative border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Document Reader
                </h1>
                <p className="text-muted-foreground mt-1 text-sm sm:text-lg hidden sm:block">
                  Transform your documents into immersive audio experiences
                </p>
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="sm:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="h-10 w-10 p-0"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="sm:hidden mt-4 p-4 bg-card rounded-lg border shadow-lg">
              <div className="space-y-3">
                <Button
                  variant={activeTab === "upload" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    setActiveTab("upload")
                    setMobileMenuOpen(false)
                  }}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload New Document
                </Button>
                <Button
                  variant={activeTab === "library" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    setActiveTab("library")
                    setMobileMenuOpen(false)
                  }}
                >
                  <Library className="h-4 w-4 mr-2" />
                  Document Library
                  {stats.totalDocs > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                      {stats.totalDocs}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="relative container mx-auto px-4 sm:px-6 py-6 sm:py-12">
        {/* Process Steps - Mobile Friendly */}
        <div className="mb-6 sm:mb-8">
          <div className="flex justify-center">
            <div className="flex items-center gap-2 sm:gap-4 bg-card/50 backdrop-blur-sm rounded-full p-2 sm:p-3 border border-border/50">
              {steps.map((step, index) => {
                const Icon = step.icon
                return (
                  <div key={index} className="flex items-center gap-2 sm:gap-3">
                    <div className={cn(
                      "flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-all duration-200",
                      step.completed 
                        ? "bg-primary text-primary-foreground shadow-lg" 
                        : "bg-muted text-muted-foreground"
                    )}>
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="hidden sm:block">
                      <p className={cn(
                        "text-sm font-medium",
                        step.completed ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {step.label}
                      </p>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={cn(
                        "w-8 sm:w-12 h-0.5 rounded transition-colors",
                        steps[index + 1].completed ? "bg-primary" : "bg-border"
                      )} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        
        {/* Main Content - Responsive Layout */}
        <div className="space-y-6 lg:space-y-8">
          {/* Mobile/Tablet: Single Column Layout */}
          <div className="lg:hidden space-y-6">
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 p-2 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl h-12 sm:h-14">
                <TabsTrigger 
                  value="upload" 
                  className="flex items-center gap-2 sm:gap-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-200 text-xs sm:text-sm"
                >
                  <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Upload</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="library" 
                  className="flex items-center gap-2 sm:gap-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-200 text-xs sm:text-sm"
                >
                  <Library className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Library</span>
                  {stats.totalDocs > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {stats.totalDocs}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="mt-6">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
                  <div className="p-4 sm:p-6">
                    <div className="flex items-center gap-3 mb-4 sm:mb-6">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Upload className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl font-bold text-foreground">Upload Document</h2>
                        <p className="text-muted-foreground text-sm">Start your listening journey</p>
                      </div>
                    </div>
                    <FileUpload
                      onFileUpload={handleFileUpload}
                      onTextExtracted={handleTextExtracted}
                      isProcessing={isProcessing}
                    />
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="library" className="mt-6">
                <div className="space-y-4 sm:space-y-6">
                  <SearchBar onSearch={handleSearch} placeholder="Search your documents..." />
                  <DocumentLibrary 
                    onDocumentSelect={handleDocumentSelect} 
                    selectedDocumentId={selectedDocument?.id}
                    searchQuery={searchQuery}
                    onStatsUpdate={updateStats}
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* Document Preview */}
            <DocumentPreview
              file={uploadedFile}
              extractedText={extractedText}
              isProcessing={isProcessing}
              documentName={selectedDocument?.name}
            />

            {/* Audio Controls */}
            {extractedText && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Play className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-foreground">Audio Controls</h2>
                    <p className="text-muted-foreground text-sm">Control your listening experience</p>
                  </div>
                </div>
                <AudioControls text={extractedText} />
              </div>
            )}
          </div>

          {/* Desktop: Multi-Column Layout */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-8">
            {/* Left Column - Upload and Library */}
            <div className="lg:col-span-2 space-y-8">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 p-2 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl h-14">
                  <TabsTrigger 
                    value="upload" 
                    className="flex items-center gap-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-200"
                  >
                    <Upload className="h-4 w-4" />
                    Upload New
                  </TabsTrigger>
                  <TabsTrigger 
                    value="library" 
                    className="flex items-center gap-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-200"
                  >
                    <Library className="h-4 w-4" />
                    Document Library
                    {stats.totalDocs > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {stats.totalDocs}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="mt-8">
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
                    <div className="p-8">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Upload className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-foreground">Upload Document</h2>
                            <p className="text-muted-foreground mt-1">Start your listening journey</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="px-3 py-1">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Smart Processing
                        </Badge>
                      </div>
                      <FileUpload
                        onFileUpload={handleFileUpload}
                        onTextExtracted={handleTextExtracted}
                        isProcessing={isProcessing}
                      />
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="library" className="mt-8">
                  <div className="space-y-6">
                    <SearchBar onSearch={handleSearch} placeholder="Search your documents..." />
                    <DocumentLibrary 
                      onDocumentSelect={handleDocumentSelect} 
                      selectedDocumentId={selectedDocument?.id}
                      searchQuery={searchQuery}
                      onStatsUpdate={updateStats}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              {/* Audio Controls */}
              {extractedText && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">Audio Controls</h2>
                  <AudioControls text={extractedText} />
                </div>
              )}
            </div>

            {/* Right Column - Preview */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <DocumentPreview
                  file={uploadedFile}
                  extractedText={extractedText}
                  isProcessing={isProcessing}
                  documentName={selectedDocument?.name}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Features Section - Responsive Grid */}
        <div className="mt-12 sm:mt-20">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-4">
              Powerful Features
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto px-4">
              Experience the next generation of document reading with advanced AI-powered features
            </p>
          </div>

          <div className="grid gap-4 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Upload,
                title: "Smart Upload",
                description: "Drag & drop support for PDF, Word, and text files with intelligent processing and validation",
                badges: ["PDF", "DOCX", "TXT"],
                color: "from-blue-500 to-blue-600"
              },
              {
                icon: Zap,
                title: "AI Processing",
                description: "Advanced text extraction with OCR capabilities and intelligent content optimization",
                badges: ["Neural OCR"],
                color: "from-green-500 to-green-600"
              },
              {
                icon: Play,
                title: "Premium Audio",
                description: "High-quality text-to-speech with voice selection, speed control, and precise seeking",
                badges: ["Neural Voices", "Seeking"],
                color: "from-purple-500 to-purple-600"
              },
              {
                icon: Library,
                title: "Smart Library",
                description: "Organize, search, and manage your documents with intelligent categorization",
                badges: ["Search", "Auto-save"],
                color: "from-orange-500 to-orange-600"
              },
              {
                icon: Settings,
                title: "Customization",
                description: "Personalize your reading experience with themes, shortcuts, and accessibility options",
                badges: ["Themes", "A11y"],
                color: "from-red-500 to-red-600"
              },
              {
                icon: Sparkles,
                title: "Privacy First",
                description: "Your documents stay private with local processing and secure storage",
                badges: ["Local Storage"],
                color: "from-teal-500 to-teal-600"
              }
            ].map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="group p-4 sm:p-6 lg:p-8 border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-card to-card/80 hover:scale-105 cursor-default">
                  <div className={cn(
                    "flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 bg-gradient-to-br",
                    feature.color
                  )}>
                    <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 sm:mb-3">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-3 sm:mb-4">
                    {feature.description}
                  </p>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {feature.badges.map((badge, badgeIndex) => (
                      <Badge key={badgeIndex} variant="secondary" className="text-xs">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </main>

      <footer className="relative border-t border-border/50 bg-background/80 backdrop-blur-xl mt-12 sm:mt-20">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="text-center">
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
              Built with Next.js, Web Speech API & modern design principles • Privacy-focused & locally processed
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
              <Badge variant="outline" className="text-xs">Next.js 14</Badge>
              <Badge variant="outline" className="text-xs">Web Speech API</Badge>
              <Badge variant="outline" className="text-xs">TypeScript</Badge>
              <Badge variant="outline" className="text-xs">Tailwind CSS</Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}