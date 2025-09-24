// // "use client"

// // import { useState } from "react"
// // import { FileUpload } from "@/components/file-upload"
// // import { DocumentPreview } from "@/components/document-preview"
// // import { AudioControls } from "@/components/audio-controls"
// // import { DocumentLibrary } from "@/components/document-library"
// // import { Card } from "@/components/ui/card"
// // import { Badge } from "@/components/ui/badge"
// // import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// // import { FileAudio, Upload, Play, Library } from "lucide-react"
// // import { documentStorage, type SavedDocument } from "@/lib/document-storage"

// // export default function DocumentReader() {
// //   const [uploadedFile, setUploadedFile] = useState<File | null>(null)
// //   const [extractedText, setExtractedText] = useState<string>("")
// //   const [isProcessing, setIsProcessing] = useState(false)
// //   const [selectedDocument, setSelectedDocument] = useState<SavedDocument | null>(null)

// //   const handleFileUpload = (file: File) => {
// //     setUploadedFile(file)
// //     setIsProcessing(true)
// //     // Clear any previously selected document when uploading new file
// //     setSelectedDocument(null)
// //   }

// //   const handleTextExtracted = (text: string) => {
// //     setExtractedText(text)
// //     setIsProcessing(false)

// //     if (uploadedFile && text.trim()) {
// //       const savedDoc = documentStorage.saveDocument(uploadedFile, text)
// //       console.log("[v0] Document saved:", savedDoc.name)
// //     }
// //   }

// //   const handleDocumentSelect = (document: SavedDocument) => {
// //     setSelectedDocument(document)
// //     setExtractedText(document.content)
// //     setUploadedFile(null) // Clear uploaded file when selecting from library
// //     console.log("[v0] Loaded document:", document.name)
// //   }

// //   const steps = [
// //     { icon: Upload, label: "Upload", completed: !!uploadedFile || !!selectedDocument },
// //     { icon: FileAudio, label: "Process", completed: !!extractedText },
// //     { icon: Play, label: "Listen", completed: !!extractedText },
// //   ]

// //   return (
// //     <div className="min-h-screen bg-background">
// //       <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
// //         <div className="container mx-auto px-4 py-6">
// //           <div className="flex items-center justify-between">
// //             <div>
// //               <h1 className="text-3xl font-bold text-foreground text-balance">Document Reader</h1>
// //               <p className="text-muted-foreground mt-2 text-pretty">
// //                 Upload your documents and listen to them with text-to-speech
// //               </p>
// //             </div>

// //             {/* Progress Steps */}
// //             <div className="hidden md:flex items-center gap-4">
// //               {steps.map((step, index) => (
// //                 <div key={step.label} className="flex items-center gap-2">
// //                   <div
// //                     className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
// //                       step.completed ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
// //                     }`}
// //                   >
// //                     <step.icon className="h-4 w-4" />
// //                     {step.label}
// //                   </div>
// //                   {index < steps.length - 1 && <div className="w-8 h-px bg-border" />}
// //                 </div>
// //               ))}
// //             </div>
// //           </div>
// //         </div>
// //       </header>

// //       <main className="container mx-auto px-4 py-8">
// //         <div className="grid gap-8 lg:grid-cols-2">
// //           {/* Left Column - Upload and Library */}
// //           <div className="space-y-6">
// //             <Tabs defaultValue="upload" className="w-full">
// //               <TabsList className="grid w-full grid-cols-2">
// //                 <TabsTrigger value="upload" className="flex items-center gap-2">
// //                   <Upload className="h-4 w-4" />
// //                   Upload New
// //                 </TabsTrigger>
// //                 <TabsTrigger value="library" className="flex items-center gap-2">
// //                   <Library className="h-4 w-4" />
// //                   Saved Documents
// //                 </TabsTrigger>
// //               </TabsList>

// //               <TabsContent value="upload" className="mt-6">
// //                 <Card className="p-6">
// //                   <div className="flex items-center justify-between mb-4">
// //                     <h2 className="text-xl font-semibold text-foreground">Upload Document</h2>
// //                     <Badge variant="secondary" className="text-xs">
// //                       Step 1
// //                     </Badge>
// //                   </div>
// //                   <FileUpload
// //                     onFileUpload={handleFileUpload}
// //                     onTextExtracted={handleTextExtracted}
// //                     isProcessing={isProcessing}
// //                   />
// //                 </Card>
// //               </TabsContent>

// //               <TabsContent value="library" className="mt-6">
// //                 <DocumentLibrary onDocumentSelect={handleDocumentSelect} selectedDocumentId={selectedDocument?.id} />
// //               </TabsContent>
// //             </Tabs>

// //             {/* Audio Controls */}
// //             {extractedText && (
// //               <Card className="p-6">
// //                 <div className="flex items-center justify-between mb-4">
// //                   <h2 className="text-xl font-semibold text-foreground">Audio Controls</h2>
// //                   <Badge variant="secondary" className="text-xs">
// //                     Step 3
// //                   </Badge>
// //                 </div>
// //                 <AudioControls text={extractedText} />
// //               </Card>
// //             )}
// //           </div>

// //           {/* Right Column - Preview */}
// //           <div>
// //             <Card className="p-6 h-full">
// //               <div className="flex items-center justify-between mb-4">
// //                 <h2 className="text-xl font-semibold text-foreground">Document Preview</h2>
// //                 <div className="flex items-center gap-2">
// //                   <Badge variant="secondary" className="text-xs">
// //                     Step 2
// //                   </Badge>
// //                   {selectedDocument && (
// //                     <Badge variant="outline" className="text-xs">
// //                       From Library
// //                     </Badge>
// //                   )}
// //                 </div>
// //               </div>
// //               <DocumentPreview
// //                 file={uploadedFile}
// //                 extractedText={extractedText}
// //                 isProcessing={isProcessing}
// //                 documentName={selectedDocument?.name}
// //               />
// //             </Card>
// //           </div>
// //         </div>

// //         {/* Features Section */}
// //         <div className="mt-16 grid gap-6 md:grid-cols-3">
// //           <Card className="p-6 text-center">
// //             <Upload className="h-8 w-8 text-primary mx-auto mb-3" />
// //             <h3 className="font-semibold text-foreground mb-2">Easy Upload</h3>
// //             <p className="text-sm text-muted-foreground">
// //               Drag & drop or click to upload PDF, Word, or text files up to 10MB
// //             </p>
// //           </Card>

// //           <Card className="p-6 text-center">
// //             <FileAudio className="h-8 w-8 text-primary mx-auto mb-3" />
// //             <h3 className="font-semibold text-foreground mb-2">Smart Processing</h3>
// //             <p className="text-sm text-muted-foreground">Advanced text extraction from various document formats</p>
// //           </Card>

// //           <Card className="p-6 text-center">
// //             <Play className="h-8 w-8 text-primary mx-auto mb-3" />
// //             <h3 className="font-semibold text-foreground mb-2">Natural Speech</h3>
// //             <p className="text-sm text-muted-foreground">
// //               High-quality text-to-speech with customizable voice and speed
// //             </p>
// //           </Card>
// //         </div>
// //       </main>

// //       <footer className="border-t border-border bg-card/50 mt-16">
// //         <div className="container mx-auto px-4 py-6 text-center">
// //           <p className="text-sm text-muted-foreground">
// //             Built with Next.js and Web Speech API • No data stored on servers
// //           </p>
// //         </div>
// //       </footer>
// //     </div>
// //   )
// // }
// "use client"

// import { useState, useEffect } from "react"
// import { FileUpload } from "@/components/file-upload"
// import { DocumentPreview } from "@/components/document-preview"
// import { AudioControls } from "@/components/audio-controls"
// import { DocumentLibrary } from "@/components/document-library"
// import { SearchBar } from "@/components/search-bar"
// import { StatsCard } from "@/components/stats-card"
// import { Card } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { 
//   FileAudio, Upload, Play, Library, Settings, Moon, Sun, 
//   Sparkles, Zap, BookOpen, Clock, TrendingUp 
// } from "lucide-react"
// import { documentStorage, type SavedDocument } from "@/lib/enhanced-storage"
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
//       <div className="absolute top-0 -right-4 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
//       <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
//       <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-300/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />

//       {/* Header */}
//       <header className="relative border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
//         <div className="container mx-auto px-6 py-8">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
//                 <BookOpen className="h-8 w-8 text-primary-foreground" />
//               </div>
//               <div>
//                 <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
//                   Document Reader
//                 </h1>
//                 <p className="text-muted-foreground mt-1 text-lg">
//                   Transform your documents into immersive audio experiences
//                 </p>
//               </div>
//             </div>

//             <div className="flex items-center gap-4">
//               {/* Theme Toggle */}
//               <Button
//                 variant="outline"
//                 size="icon"
//                 onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
//                 className="rounded-full w-12 h-12 border-2"
//               >
//                 <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
//                 <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
//               </Button>

//               {/* Progress Steps */}
//               <div className="hidden lg:flex items-center gap-6 bg-card/50 backdrop-blur-sm rounded-2xl p-4 border border-border/50">
//                 {steps.map((step, index) => (
//                   <div key={step.label} className="flex items-center gap-3">
//                     <div className="flex items-center gap-3">
//                       <div
//                         className={cn(
//                           "relative p-3 rounded-xl transition-all duration-300",
//                           step.completed
//                             ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25"
//                             : "bg-muted text-muted-foreground"
//                         )}
//                       >
//                         <step.icon className="h-5 w-5" />
//                         {step.completed && (
//                           <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
//                             <div className="w-2 h-2 bg-white rounded-full" />
//                           </div>
//                         )}
//                       </div>
//                       <div className="hidden xl:block">
//                         <div className={cn(
//                           "font-medium transition-colors",
//                           step.completed ? "text-foreground" : "text-muted-foreground"
//                         )}>
//                           {step.label}
//                         </div>
//                         <div className="text-xs text-muted-foreground mt-0.5">
//                           {step.description}
//                         </div>
//                       </div>
//                     </div>
//                     {index < steps.length - 1 && (
//                       <div className={cn(
//                         "w-12 h-0.5 transition-colors",
//                         steps[index + 1].completed ? "bg-primary" : "bg-border"
//                       )} />
//                     )}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </header>

//       <main className="relative container mx-auto px-6 py-12">
//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
//           <StatsCard
//             icon={Library}
//             label="Documents"
//             value={stats.totalDocs.toString()}
//             change="+2 this week"
//             trend="up"
//           />
//           <StatsCard
//             icon={Zap}
//             label="Total Words"
//             value={stats.totalWords.toLocaleString()}
//             change="Ready to read"
//             trend="neutral"
//           />
//           <StatsCard
//             icon={Clock}
//             label="Reading Time"
//             value={`${stats.totalReadTime}min`}
//             change="Estimated"
//             trend="neutral"
//           />
//         </div>

//         <div className="grid gap-8 xl:grid-cols-3">
//           {/* Left Column - Upload and Library */}
//           <div className="xl:col-span-2 space-y-8">
//             <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//               <TabsList className="grid w-full grid-cols-2 p-2 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl h-14">
//                 <TabsTrigger 
//                   value="upload" 
//                   className="flex items-center gap-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-200"
//                 >
//                   <Upload className="h-4 w-4" />
//                   <span className="hidden sm:inline">Upload New</span>
//                   <span className="sm:hidden">Upload</span>
//                 </TabsTrigger>
//                 <TabsTrigger 
//                   value="library" 
//                   className="flex items-center gap-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-200"
//                 >
//                   <Library className="h-4 w-4" />
//                   <span className="hidden sm:inline">Document Library</span>
//                   <span className="sm:hidden">Library</span>
//                   {stats.totalDocs > 0 && (
//                     <Badge variant="secondary" className="ml-2">
//                       {stats.totalDocs}
//                     </Badge>
//                   )}
//                 </TabsTrigger>
//               </TabsList>

//               <TabsContent value="upload" className="mt-8">
//                 <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
//                   <div className="p-8">
//                     <div className="flex items-center justify-between mb-6">
//                       <div className="flex items-center gap-3">
//                         <div className="p-2 rounded-lg bg-primary/10">
//                           <Upload className="h-5 w-5 text-primary" />
//                         </div>
//                         <div>
//                           <h2 className="text-2xl font-bold text-foreground">Upload Document</h2>
//                           <p className="text-muted-foreground mt-1">Start your listening journey</p>
//                         </div>
//                       </div>
//                       <Badge variant="outline" className="px-3 py-1">
//                         <Sparkles className="h-3 w-3 mr-1" />
//                         Smart Processing
//                       </Badge>
//                     </div>
//                     <FileUpload
//                       onFileUpload={handleFileUpload}
//                       onTextExtracted={handleTextExtracted}
//                       isProcessing={isProcessing}
//                     />
//                   </div>
//                 </Card>
//               </TabsContent>

//               <TabsContent value="library" className="mt-8">
//                 <div className="space-y-6">
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

//             {/* Audio Controls */}
//             {extractedText && (
//               <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
//                 <div className="p-8">
//                   <div className="flex items-center justify-between mb-6">
//                     <div className="flex items-center gap-3">
//                       <div className="p-2 rounded-lg bg-primary/10">
//                         <Play className="h-5 w-5 text-primary" />
//                       </div>
//                       <div>
//                         <h2 className="text-2xl font-bold text-foreground">Audio Controls</h2>
//                         <p className="text-muted-foreground mt-1">Customize your listening experience</p>
//                       </div>
//                     </div>
//                     <Badge variant="outline" className="px-3 py-1">
//                       <TrendingUp className="h-3 w-3 mr-1" />
//                       Advanced
//                     </Badge>
//                   </div>
//                   <AudioControls text={extractedText} />
//                 </div>
//               </Card>
//             )}
//           </div>

//           {/* Right Column - Preview */}
//           <div className="xl:col-span-1">
//             <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-card to-card/80 backdrop-blur-sm h-fit sticky top-24">
//               <div className="p-8">
//                 <div className="flex items-center justify-between mb-6">
//                   <div className="flex items-center gap-3">
//                     <div className="p-2 rounded-lg bg-primary/10">
//                       <FileAudio className="h-5 w-5 text-primary" />
//                     </div>
//                     <div>
//                       <h2 className="text-xl font-bold text-foreground">Document Preview</h2>
//                       <p className="text-muted-foreground text-sm mt-1">View your content</p>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     {selectedDocument && (
//                       <Badge variant="secondary" className="text-xs">
//                         From Library
//                       </Badge>
//                     )}
//                   </div>
//                 </div>
//                 <DocumentPreview
//                   file={uploadedFile}
//                   extractedText={extractedText}
//                   isProcessing={isProcessing}
//                   documentName={selectedDocument?.name}
//                 />
//               </div>
//             </Card>
//           </div>
//         </div>

//         {/* Enhanced Features Section */}
//         <div className="mt-20">
//           <div className="text-center mb-12">
//             <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-4">
//               Powerful Features
//             </h2>
//             <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
//               Experience the next generation of document reading with advanced AI-powered features
//             </p>
//           </div>

//           <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
//             <Card className="group p-8 border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-card to-card/80 hover:scale-105 cursor-default">
//               <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 mb-6 group-hover:scale-110 transition-transform duration-300">
//                 <Upload className="h-8 w-8 text-white" />
//               </div>
//               <h3 className="text-xl font-bold text-foreground mb-3">Smart Upload</h3>
//               <p className="text-muted-foreground leading-relaxed">
//                 Drag & drop support for PDF, Word, and text files with intelligent processing and validation
//               </p>
//               <div className="mt-4 flex gap-2">
//                 <Badge variant="secondary" className="text-xs">PDF</Badge>
//                 <Badge variant="secondary" className="text-xs">DOCX</Badge>
//                 <Badge variant="secondary" className="text-xs">TXT</Badge>
//               </div>
//             </Card>

//             <Card className="group p-8 border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-card to-card/80 hover:scale-105 cursor-default">
//               <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 mb-6 group-hover:scale-110 transition-transform duration-300">
//                 <Zap className="h-8 w-8 text-white" />
//               </div>
//               <h3 className="text-xl font-bold text-foreground mb-3">AI Processing</h3>
//               <p className="text-muted-foreground leading-relaxed">
//                 Advanced text extraction with OCR capabilities and intelligent content optimization
//               </p>
//               <div className="mt-4">
//                 <Badge variant="secondary" className="text-xs">Neural OCR</Badge>
//               </div>
//             </Card>

//             <Card className="group p-8 border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-card to-card/80 hover:scale-105 cursor-default">
//               <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 mb-6 group-hover:scale-110 transition-transform duration-300">
//                 <Play className="h-8 w-8 text-white" />
//               </div>
//               <h3 className="text-xl font-bold text-foreground mb-3">Premium Audio</h3>
//               <p className="text-muted-foreground leading-relaxed">
//                 High-quality text-to-speech with voice selection, speed control, and precise seeking
//               </p>
//               <div className="mt-4 flex gap-2">
//                 <Badge variant="secondary" className="text-xs">Neural Voices</Badge>
//                 <Badge variant="secondary" className="text-xs">Seeking</Badge>
//               </div>
//             </Card>

//             <Card className="group p-8 border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-card to-card/80 hover:scale-105 cursor-default">
//               <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 mb-6 group-hover:scale-110 transition-transform duration-300">
//                 <Library className="h-8 w-8 text-white" />
//               </div>
//               <h3 className="text-xl font-bold text-foreground mb-3">Smart Library</h3>
//               <p className="text-muted-foreground leading-relaxed">
//                 Organize, search, and manage your documents with intelligent categorization
//               </p>
//               <div className="mt-4 flex gap-2">
//                 <Badge variant="secondary" className="text-xs">Search</Badge>
//                 <Badge variant="secondary" className="text-xs">Auto-save</Badge>
//               </div>
//             </Card>

//             <Card className="group p-8 border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-card to-card/80 hover:scale-105 cursor-default">
//               <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 mb-6 group-hover:scale-110 transition-transform duration-300">
//                 <Settings className="h-8 w-8 text-white" />
//               </div>
//               <h3 className="text-xl font-bold text-foreground mb-3">Customization</h3>
//               <p className="text-muted-foreground leading-relaxed">
//                 Personalize your reading experience with themes, shortcuts, and accessibility options
//               </p>
//               <div className="mt-4 flex gap-2">
//                 <Badge variant="secondary" className="text-xs">Themes</Badge>
//                 <Badge variant="secondary" className="text-xs">A11y</Badge>
//               </div>
//             </Card>

//             <Card className="group p-8 border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-card to-card/80 hover:scale-105 cursor-default">
//               <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 mb-6 group-hover:scale-110 transition-transform duration-300">
//                 <Sparkles className="h-8 w-8 text-white" />
//               </div>
//               <h3 className="text-xl font-bold text-foreground mb-3">Privacy First</h3>
//               <p className="text-muted-foreground leading-relaxed">
//                 Your documents stay private with local processing and secure storage
//               </p>
//               <div className="mt-4">
//                 <Badge variant="secondary" className="text-xs">Local Storage</Badge>
//               </div>
//             </Card>
//           </div>
//         </div>
//       </main>

//       <footer className="relative border-t border-border/50 bg-background/80 backdrop-blur-xl mt-20">
//         <div className="container mx-auto px-6 py-8">
//           <div className="text-center">
//             <p className="text-muted-foreground">
//               Built with Next.js, Web Speech API & modern design principles • Privacy-focused & locally processed
//             </p>
//             <div className="flex items-center justify-center gap-4 mt-4">
//               <Badge variant="outline">Next.js 14</Badge>
//               <Badge variant="outline">Web Speech API</Badge>
//               <Badge variant="outline">TypeScript</Badge>
//               <Badge variant="outline">Tailwind CSS</Badge>
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
import { DocumentPreview } from "@/components/enhanced/document-preview"
import { AudioControls } from "@/components/enhanced/audio-controls"
import { DocumentLibrary } from "@/components/enhanced/document-library"
import { SearchBar } from "@/components/enhanced/search-bar"
import { StatsCard } from "@/components/enhanced/stats-card"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  FileAudio, Upload, Play, Library, Settings, Moon, Sun, 
  Sparkles, Zap, BookOpen, Clock, TrendingUp 
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
      <div className="absolute top-0 -right-4 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-300/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />

      {/* Header */}
      <header className="relative border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                <BookOpen className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Document Reader
                </h1>
                <p className="text-muted-foreground mt-1 text-lg">
                  Transform your documents into immersive audio experiences
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-full w-12 h-12 border-2"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>

              {/* Progress Steps */}
              <div className="hidden lg:flex items-center gap-6 bg-card/50 backdrop-blur-sm rounded-2xl p-4 border border-border/50">
                {steps.map((step, index) => (
                  <div key={step.label} className="flex items-center gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "relative p-3 rounded-xl transition-all duration-300",
                          step.completed
                            ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        <step.icon className="h-5 w-5" />
                        {step.completed && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full" />
                          </div>
                        )}
                      </div>
                      <div className="hidden xl:block">
                        <div className={cn(
                          "font-medium transition-colors",
                          step.completed ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {step.label}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {step.description}
                        </div>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={cn(
                        "w-12 h-0.5 transition-colors",
                        steps[index + 1].completed ? "bg-primary" : "bg-border"
                      )} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative container mx-auto px-6 py-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatsCard
            icon={Library}
            label="Documents"
            value={stats.totalDocs.toString()}
            change="+2 this week"
            trend="up"
          />
          <StatsCard
            icon={Zap}
            label="Total Words"
            value={stats.totalWords.toLocaleString()}
            change="Ready to read"
            trend="neutral"
          />
          <StatsCard
            icon={Clock}
            label="Reading Time"
            value={`${stats.totalReadTime}min`}
            change="Estimated"
            trend="neutral"
          />
        </div>

        <div className="grid gap-8 xl:grid-cols-3">
          {/* Left Column - Upload and Library */}
          <div className="xl:col-span-2 space-y-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 p-2 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl h-14">
                <TabsTrigger 
                  value="upload" 
                  className="flex items-center gap-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-200"
                >
                  <Upload className="h-4 w-4" />
                  <span className="hidden sm:inline">Upload New</span>
                  <span className="sm:hidden">Upload</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="library" 
                  className="flex items-center gap-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-200"
                >
                  <Library className="h-4 w-4" />
                  <span className="hidden sm:inline">Document Library</span>
                  <span className="sm:hidden">Library</span>
                  {stats.totalDocs > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {stats.totalDocs}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="mt-8">
                <div className="  bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3 ">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Upload className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-foreground">Upload Document</h2>
                          <p className="text-muted-foreground mt-1">Start your listening journey</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="px-3 py-1 md:flex hidden ">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Smart Processing
                      </Badge>
                    </div>
                    <div className="p-0">

                    <FileUpload
                      onFileUpload={handleFileUpload}
                      onTextExtracted={handleTextExtracted}
                      isProcessing={isProcessing}
                    />
                    </div>
                  </div>
                </div>
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
              <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Play className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">Audio Controls</h2>
                        <p className="text-muted-foreground mt-1">Customize your listening experience</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="px-3 py-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Advanced
                    </Badge>
                  </div>
                  <AudioControls text={extractedText} />
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Preview */}
          <div className="xl:col-span-1">
            <Card className="overflow-hidden border-0  bg-gradient-to-br from-card to-card/80 backdrop-blur-sm h-fit sticky top-24">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileAudio className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">Document Preview</h2>
                      <p className="text-muted-foreground text-sm mt-1">View your content</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedDocument && (
                      <Badge variant="secondary" className="text-xs">
                        From Library
                      </Badge>
                    )}
                  </div>
                </div>
                <DocumentPreview
                  file={uploadedFile}
                  extractedText={extractedText}
                  isProcessing={isProcessing}
                  documentName={selectedDocument?.name}
                />
              </div>
            </Card>
          </div>
        </div>

        {/* Enhanced Features Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-4">
              Powerful Features
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Experience the next generation of document reading with advanced AI-powered features
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="group p-8 border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-card to-card/80 hover:scale-105 cursor-default">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Upload className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Smart Upload</h3>
              <p className="text-muted-foreground leading-relaxed">
                Drag & drop support for PDF, Word, and text files with intelligent processing and validation
              </p>
              <div className="mt-4 flex gap-2">
                <Badge variant="secondary" className="text-xs">PDF</Badge>
                <Badge variant="secondary" className="text-xs">DOCX</Badge>
                <Badge variant="secondary" className="text-xs">TXT</Badge>
              </div>
            </Card>

            <Card className="group p-8 border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-card to-card/80 hover:scale-105 cursor-default">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">AI Processing</h3>
              <p className="text-muted-foreground leading-relaxed">
                Advanced text extraction with OCR capabilities and intelligent content optimization
              </p>
              <div className="mt-4">
                <Badge variant="secondary" className="text-xs">Neural OCR</Badge>
              </div>
            </Card>

            <Card className="group p-8 border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-card to-card/80 hover:scale-105 cursor-default">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Play className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Premium Audio</h3>
              <p className="text-muted-foreground leading-relaxed">
                High-quality text-to-speech with voice selection, speed control, and precise seeking
              </p>
              <div className="mt-4 flex gap-2">
                <Badge variant="secondary" className="text-xs">Neural Voices</Badge>
                <Badge variant="secondary" className="text-xs">Seeking</Badge>
              </div>
            </Card>

            <Card className="group p-8 border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-card to-card/80 hover:scale-105 cursor-default">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Library className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Smart Library</h3>
              <p className="text-muted-foreground leading-relaxed">
                Organize, search, and manage your documents with intelligent categorization
              </p>
              <div className="mt-4 flex gap-2">
                <Badge variant="secondary" className="text-xs">Search</Badge>
                <Badge variant="secondary" className="text-xs">Auto-save</Badge>
              </div>
            </Card>

            <Card className="group p-8 border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-card to-card/80 hover:scale-105 cursor-default">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Settings className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Customization</h3>
              <p className="text-muted-foreground leading-relaxed">
                Personalize your reading experience with themes, shortcuts, and accessibility options
              </p>
              <div className="mt-4 flex gap-2">
                <Badge variant="secondary" className="text-xs">Themes</Badge>
                <Badge variant="secondary" className="text-xs">A11y</Badge>
              </div>
            </Card>

            <Card className="group p-8 border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-card to-card/80 hover:scale-105 cursor-default">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Privacy First</h3>
              <p className="text-muted-foreground leading-relaxed">
                Your documents stay private with local processing and secure storage
              </p>
              <div className="mt-4">
                <Badge variant="secondary" className="text-xs">Local Storage</Badge>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <footer className="relative border-t border-border/50 bg-background/80 backdrop-blur-xl mt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <p className="text-muted-foreground">
              Built with Next.js, Web Speech API & modern design principles • Privacy-focused & locally processed
            </p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <Badge variant="outline">Next.js 14</Badge>
              <Badge variant="outline">Web Speech API</Badge>
              <Badge variant="outline">TypeScript</Badge>
              <Badge variant="outline">Tailwind CSS</Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}