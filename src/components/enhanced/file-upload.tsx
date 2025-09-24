"use client"

import { useCallback, useState, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  Upload, FileText, AlertCircle, CheckCircle2, 
  FileIcon, Image, Film, Music, Archive, X,
  Sparkles, Zap, ShieldCheck
} from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onFileUpload: (file: File) => void
  onTextExtracted: (text: string) => void
  isProcessing: boolean
}

interface ProcessingStage {
  name: string
  completed: boolean
  current: boolean
}

export function FileUpload({ onFileUpload, onTextExtracted, isProcessing }: FileUploadProps) {
  const [error, setError] = useState<string>("")
  const [progress, setProgress] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [processingStages, setProcessingStages] = useState<ProcessingStage[]>([
    { name: "Analyzing file", completed: false, current: false },
    { name: "Extracting text", completed: false, current: false },
    { name: "Processing content", completed: false, current: false },
    { name: "Optimizing for audio", completed: false, current: false },
  ])

  useEffect(() => {
    if (isProcessing) {
      simulateProgress()
    } else {
      setProgress(0)
      setProcessingStages(prev => prev.map(stage => ({ ...stage, completed: false, current: false })))
    }
  }, [isProcessing])

  const simulateProgress = () => {
    let currentProgress = 0
    let stageIndex = 0
    
    const updateProgress = () => {
      currentProgress += Math.random() * 15 + 5
      setProgress(Math.min(currentProgress, 95))
      
      const newStageIndex = Math.floor((currentProgress / 100) * processingStages.length)
      if (newStageIndex !== stageIndex && newStageIndex < processingStages.length) {
        setProcessingStages(prev => prev.map((stage, index) => ({
          ...stage,
          completed: index < newStageIndex,
          current: index === newStageIndex
        })))
        stageIndex = newStageIndex
      }
      
      if (currentProgress < 95) {
        setTimeout(updateProgress, 200 + Math.random() * 300)
      }
    }
    
    updateProgress()
  }

  const extractTextFromFile = async (file: File): Promise<string> => {
    const fileType = file.type
    const fileName = file.name.toLowerCase()

    try {
      if (fileType === "text/plain" || fileName.endsWith(".txt")) {
        return await file.text()
      }

      if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
        try {
          const pdf2md = await import("@opendocsg/pdf2md")
          const arrayBuffer = await file.arrayBuffer()
          const result = await pdf2md.default(arrayBuffer)
          return result
        } catch (pdfError) {
          throw new Error(
            "PDF processing failed. Please try converting your PDF to a text file or try a different PDF."
          )
        }
      }

      if (
        fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        fileName.endsWith(".docx")
      ) {
        const mammoth = await import("mammoth")
        const arrayBuffer = await file.arrayBuffer()
        const result = await mammoth.extractRawText({ arrayBuffer })
        return result.value
      }

      throw new Error("Unsupported file format. Please upload PDF, Word (.docx), or text files.")
    } catch (err) {
      throw new Error(`Failed to extract text: ${err instanceof Error ? err.message : "Unknown error"}`)
    }
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: any[]) => {
      // Handle rejected files
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0]
        if (rejection.errors.some((e: any) => e.code === 'file-too-large')) {
          setError("File is too large. Please select a file smaller than 10MB.")
        } else if (rejection.errors.some((e: any) => e.code === 'file-invalid-type')) {
          setError("Invalid file type. Please upload PDF, Word (.docx), or text files.")
        } else {
          setError("Unable to process this file. Please try a different file.")
        }
        return
      }

      const file = acceptedFiles[0]
      if (!file) return

      setError("")
      setUploadedFiles([file])
      onFileUpload(file)

      try {
        const text = await extractTextFromFile(file)
        if (!text.trim()) {
          throw new Error("No text content found in the document")
        }
        
        // Complete all stages
        setProcessingStages(prev => prev.map(stage => ({ ...stage, completed: true, current: false })))
        setProgress(100)
        
        setTimeout(() => {
          onTextExtracted(text)
        }, 500)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to process file")
        setUploadedFiles([])
      }
    },
    [onFileUpload, onTextExtracted]
  )

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
    setError("")
  }

  const getFileIcon = (file: File) => {
    const type = file.type.toLowerCase()
    const name = file.name.toLowerCase()
    
    if (type.includes('pdf') || name.endsWith('.pdf')) return <FileText className="h-6 w-6 text-red-500" />
    if (type.includes('word') || name.endsWith('.docx')) return <FileText className="h-6 w-6 text-blue-500" />
    if (type.includes('text') || name.endsWith('.txt')) return <FileIcon className="h-6 w-6 text-gray-500" />
    return <FileIcon className="h-6 w-6 text-muted-foreground" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      "text/plain": [".txt"],
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: isProcessing,
  })

  return (
    <div className="space-y-6  w-full">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed cursor-pointer transition-all duration-300 overflow-hidden w-full",
          "hover:border-primary/50 hover:bg-primary/5",
          isDragActive && !isDragReject && "border-primary bg-primary/10 scale-105",
          isDragReject && "border-destructive bg-destructive/10",
          isProcessing && "pointer-events-none opacity-75",
          "group"
        )}
      >
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <input {...getInputProps()} />
        <div className="relative p-12 text-center">
          <div className="flex flex-col items-center gap-6">
            {/* Upload Icon */}
            <div className={cn(
              "relative p-4 rounded-full transition-all duration-300",
              isDragActive ? "bg-primary/20 scale-110" : "bg-primary/10 group-hover:bg-primary/15 group-hover:scale-105"
            )}>
              <Upload className={cn(
                "h-8 w-8 transition-colors duration-300",
                isDragActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
              )} />
              {/* Floating elements */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full opacity-60 animate-pulse" />
              <div className="absolute -bottom-1 -left-2 w-3 h-3 bg-purple-500 rounded-full opacity-40 animate-bounce" />
            </div>

            {/* Text */}
            <div className="space-y-2">
              <h3 className={cn(
                "text-xl font-semibold transition-colors duration-300",
                isDragActive ? "text-primary" : "text-foreground group-hover:text-primary"
              )}>
                {isDragActive ? (
                  isDragReject ? "Invalid file type" : "Drop your document here"
                ) : "Upload your document"}
              </h3>
              <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed">
                {isDragActive ? (
                  isDragReject ? "Please select a supported file type" : "Release to process your document"
                ) : "Drag & drop or click to select • PDF, Word, or Text files • Max 10MB"}
              </p>
            </div>

            {/* Supported Formats */}
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-xs px-3 py-1 bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                <FileText className="h-3 w-3 mr-1" />
                PDF
              </Badge>
              <Badge variant="outline" className="text-xs px-3 py-1 bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400">
                <FileText className="h-3 w-3 mr-1" />
                DOCX
              </Badge>
              <Badge variant="outline" className="text-xs px-3 py-1 bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-900/20 dark:border-gray-800 dark:text-gray-400">
                <FileIcon className="h-3 w-3 mr-1" />
                TXT
              </Badge>
            </div>

            {/* Browse Button */}
            {!isDragActive && (
              <Button variant="outline" disabled={isProcessing} className="mt-4 px-6 py-2 rounded-full">
                <FileText className="h-4 w-4 mr-2" />
                Choose File
              </Button>
            )}
          </div>
        </div>
        
        {/* Security Badge */}
        <div className="absolute top-4 right-4">
          <Badge variant="outline" className="text-xs px-2 py-1 bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
            <ShieldCheck className="h-3 w-3 mr-1" />
            Secure
          </Badge>
        </div>
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <Card className="p-4 bg-card/50 backdrop-blur-sm border border-border/50">
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Uploaded Files
          </h4>
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                <div className="flex items-center gap-3">
                  {getFileIcon(file)}
                  <div>
                    <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                    </p>
                  </div>
                </div>
                {!isProcessing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Processing Status */}
      {isProcessing && (
        <Card className="p-6 bg-gradient-to-r from-primary/5 to-blue-500/5 border border-primary/20">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-medium text-foreground flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary animate-pulse" />
                Processing Document
              </h4>
              <Badge variant="outline" className="px-3 py-1 bg-primary/10 border-primary/30 text-primary">
                {Math.round(progress)}%
              </Badge>
            </div>
            
            <Progress value={progress} className="h-2" />
            
            <div className="space-y-2">
              {processingStages.map((stage, index) => (
                <div key={index} className="flex items-center gap-3 text-sm">
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                    stage.completed
                      ? "bg-green-500 border-green-500"
                      : stage.current
                      ? "border-primary bg-primary/20"
                      : "border-muted-foreground/30"
                  )}>
                    {stage.completed && <CheckCircle2 className="h-3 w-3 text-white" />}
                    {stage.current && <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />}
                  </div>
                  <span className={cn(
                    "transition-colors duration-300",
                    stage.completed
                      ? "text-green-600 dark:text-green-400"
                      : stage.current
                      ? "text-primary font-medium"
                      : "text-muted-foreground"
                  )}>
                    {stage.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="p-4 bg-destructive/5 border border-destructive/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-destructive mb-1">Processing Error</p>
              <p className="text-sm text-destructive/80">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setError("")} 
                className="mt-2 h-8 text-xs border-destructive/30 hover:bg-destructive hover:text-destructive-foreground"
              >
                Dismiss
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Help Text */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Your documents are processed locally and never uploaded to external servers.
        </p>
      </div>
    </div>
  )
}