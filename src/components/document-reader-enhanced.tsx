"use client"

import { useState } from "react"
import { FileUpload } from "@/components/file-upload"
import { DocumentPreview } from "@/components/document-preview"
import { AudioControlsEnhanced } from "@/components/audio-controls-enhanced"
import { DocumentLibrary } from "@/components/document-library"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileAudio, Upload, Play, Library, Sparkles } from "lucide-react"
import { documentStorage, type SavedDocument } from "@/lib/document-storage"

export default function DocumentReaderEnhanced() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [extractedText, setExtractedText] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<SavedDocument | null>(null)

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
    setIsProcessing(true)
    setSelectedDocument(null)
  }

  const handleTextExtracted = (text: string) => {
    setExtractedText(text)
    setIsProcessing(false)

    if (uploadedFile && text.trim()) {
      const savedDoc = documentStorage.saveDocument(uploadedFile, text)
      console.log("Document saved:", savedDoc.name)
    }
  }

  const handleDocumentSelect = (document: SavedDocument) => {
    setSelectedDocument(document)
    setExtractedText(document.content)
    setUploadedFile(null)
    console.log("Loaded document:", document.name)
  }

  const steps = [
    { icon: Upload, label: "Upload", completed: !!uploadedFile || !!selectedDocument },
    { icon: FileAudio, label: "Process", completed: !!extractedText },
    { icon: Play, label: "Listen", completed: !!extractedText },
  ]

  const getStepVariant = (step: typeof steps[0], index: number) => {
    if (step.completed) return "default"
    if (index === 0 && (!uploadedFile && !selectedDocument)) return "secondary"
    if (index === 1 && !extractedText) return "secondary"
    return "secondary"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Enhanced Header with Gradient */}
      <header className="border-b border-border/40 bg-card/60 backdrop-blur-xl sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10 ring-1 ring-primary/20">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Document Reader
                </h1>
              </div>
              <p className="text-muted-foreground text-lg max-w-md">
                Transform your documents into immersive audio experiences with AI-powered text-to-speech
              </p>
            </div>

            {/* Enhanced Progress Steps */}
            <div className="hidden lg:flex items-center gap-3">
              {steps.map((step, index) => {
                const StepIcon = step.icon
                return (
                  <div key={step.label} className="flex items-center gap-3">
                    <div
                      className={`flex items-center gap-3 px-4 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                        step.completed
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-105"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      <div className={`p-1 rounded-full ${
                        step.completed ? "bg-primary-foreground/20" : "bg-transparent"
                      }`}>
                        <StepIcon className="h-4 w-4" />
                      </div>
                      {step.label}
                      {step.completed && (
                        <div className="w-2 h-2 bg-primary-foreground rounded-full animate-pulse" />
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-12 h-0.5 rounded-full transition-all duration-500 ${
                        step.completed ? "bg-primary/60" : "bg-border/40"
                      }`} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-2 xl:gap-12">
          {/* Enhanced Left Column */}
          <div className="space-y-8">
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/50 backdrop-blur-sm">
                <TabsTrigger value="upload" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <Upload className="h-4 w-4" />
                  Upload New
                </TabsTrigger>
                <TabsTrigger value="library" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <Library className="h-4 w-4" />
                  Saved Documents
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="mt-8">
                <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-foreground flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-primary/10">
                        <Upload className="h-5 w-5 text-primary" />
                      </div>
                      Upload Document
                    </h2>
                    <Badge variant="outline" className="px-3 py-1 text-xs font-medium">
                      Step 1
                    </Badge>
                  </div>
                  <FileUpload
                    onFileUpload={handleFileUpload}
                    onTextExtracted={handleTextExtracted}
                    isProcessing={isProcessing}
                  />
                </Card>
              </TabsContent>

              <TabsContent value="library" className="mt-8">
                <DocumentLibrary 
                  onDocumentSelect={handleDocumentSelect} 
                  selectedDocumentId={selectedDocument?.id} 
                />
              </TabsContent>
            </Tabs>

            {/* Enhanced Audio Controls */}
            {extractedText && (
              <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-foreground flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <Play className="h-5 w-5 text-primary" />
                    </div>
                    Audio Controls
                  </h2>
                  <Badge variant="outline" className="px-3 py-1 text-xs font-medium">
                    Step 3
                  </Badge>
                </div>
                <AudioControlsEnhanced text={extractedText} />
              </Card>
            )}
          </div>

          {/* Enhanced Right Column */}
          <div>
            <Card className="p-8 h-full min-h-[600px] bg-card/50 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-foreground flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <FileAudio className="h-5 w-5 text-primary" />
                  </div>
                  Document Preview
                </h2>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="px-3 py-1 text-xs font-medium">
                    Step 2
                  </Badge>
                  {selectedDocument && (
                    <Badge variant="secondary" className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary border-primary/20">
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
            </Card>
          </div>
        </div>

        {/* Enhanced Features Section */}
        <div className="mt-24">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-foreground mb-4">Powerful Features</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the future of document consumption with our advanced text-to-speech technology
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Upload,
                title: "Smart Upload",
                description: "Drag & drop or click to upload PDF, Word, or text files up to 10MB with intelligent format detection",
                gradient: "from-blue-500/20 to-cyan-500/20"
              },
              {
                icon: FileAudio,
                title: "AI Processing",
                description: "Advanced text extraction with OCR support and automatic content optimization for speech synthesis",
                gradient: "from-purple-500/20 to-pink-500/20"
              },
              {
                icon: Play,
                title: "Premium Speech",
                description: "High-quality text-to-speech with neural voices, speed control, and precise seeking functionality",
                gradient: "from-orange-500/20 to-red-500/20"
              }
            ].map((feature, index) => {
              const FeatureIcon = feature.icon
              return (
                <Card key={index} className={`p-8 text-center bg-gradient-to-br ${feature.gradient} border-border/50 hover:shadow-xl transition-all duration-500 hover:scale-105 group`}>
                  <div className="mb-6 flex justify-center">
                    <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                      <FeatureIcon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  </div>
                  <h4 className="font-semibold text-foreground mb-3 text-xl">{feature.title}</h4>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </Card>
              )
            })}
          </div>
        </div>
      </main>

      {/* Enhanced Footer */}
      <footer className="border-t border-border/40 bg-card/30 backdrop-blur-sm mt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Built with Next.js, Web Speech API, and modern React patterns
            </p>
            <p className="text-xs text-muted-foreground/70">
              🔒 Privacy-first • No data stored on servers • Runs entirely in your browser
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}