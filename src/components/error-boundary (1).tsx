"use client"

import React from 'react'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  AlertTriangle, 
  RefreshCw, 
  Volume2, 
  VolumeX,
  Wifi,
  WifiOff,
  Download,
  Share2
} from "lucide-react"

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Audio Controls Error:', error, errorInfo)
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return (
        <FallbackComponent 
          error={this.state.error!} 
          retry={this.handleRetry}
        />
      )
    }

    return this.props.children
  }
}

// Default Error Fallback Component
const DefaultErrorFallback: React.FC<{ error: Error; retry: () => void }> = ({ error, retry }) => {
  const [showDetails, setShowDetails] = React.useState(false)
  
  return (
    <Card className="p-8 text-center bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
      <div className="space-y-6">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="h-10 w-10 text-red-500" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-red-900">
            Audio System Error
          </h3>
          <p className="text-red-700 text-sm max-w-md mx-auto">
            We encountered an issue with the text-to-speech system. This might be due to browser compatibility or system limitations.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={retry}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => setShowDetails(!showDetails)}
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            {showDetails ? 'Hide' : 'Show'} Details
          </Button>
        </div>

        {showDetails && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200 text-left">
            <h4 className="text-sm font-medium text-red-900 mb-2">Error Details:</h4>
            <pre className="text-xs text-red-700 overflow-auto max-h-32">
              {error.message}
            </pre>
          </div>
        )}

        <div className="text-xs text-red-600 space-y-1">
          <p>• Try refreshing the page</p>
          <p>• Check if your browser supports Web Speech API</p>
          <p>• Ensure you're using a modern browser (Chrome, Safari, Firefox)</p>
        </div>
      </div>
    </Card>
  )
}

// Browser Compatibility Checker
export const BrowserCompatibilityChecker: React.FC = () => {
  const [compatibility, setCompatibility] = React.useState({
    speechSynthesis: false,
    audioContext: false,
    mediaRecorder: false,
    webRTC: false
  })

  React.useEffect(() => {
    setCompatibility({
      speechSynthesis: 'speechSynthesis' in window,
      audioContext: 'AudioContext' in window || 'webkitAudioContext' in window,
      mediaRecorder: 'MediaRecorder' in window,
      webRTC: 'RTCPeerConnection' in window
    })
  }, [])

  const allSupported = Object.values(compatibility).every(Boolean)
  const criticalSupported = compatibility.speechSynthesis

  if (criticalSupported) {
    return null // Don't show if everything critical is supported
  }

  return (
    <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 mb-6">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-yellow-100 rounded-full">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
        </div>
        
        <div className="flex-1 space-y-3">
          <h4 className="font-semibold text-yellow-900">
            Browser Compatibility Notice
          </h4>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              {compatibility.speechSynthesis ? (
                <Volume2 className="h-4 w-4 text-green-600" />
              ) : (
                <VolumeX className="h-4 w-4 text-red-600" />
              )}
              <span className={compatibility.speechSynthesis ? 'text-green-700' : 'text-red-700'}>
                Text-to-Speech
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {compatibility.audioContext ? (
                <Wifi className="h-4 w-4 text-green-600" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-600" />
              )}
              <span className={compatibility.audioContext ? 'text-green-700' : 'text-red-700'}>
                Audio Context
              </span>
            </div>
          </div>

          {!criticalSupported && (
            <div className="text-sm text-yellow-700 space-y-1">
              <p>For the best experience, please use:</p>
              <ul className="list-disc list-inside ml-4 space-y-0.5">
                <li>Google Chrome 71+</li>
                <li>Safari 14.1+</li>
                <li>Firefox 62+</li>
                <li>Microsoft Edge 79+</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

// Loading States
export const AudioLoadingState: React.FC<{ message?: string }> = ({ 
  message = "Preparing audio system..." 
}) => {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto">
          <div className="w-full h-full border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">{message}</p>
          <p className="text-xs text-muted-foreground">This may take a moment...</p>
        </div>
      </div>
    </div>
  )
}

// Network Status Indicator
export const NetworkStatusIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = React.useState(true)
  const [wasOffline, setWasOffline] = React.useState(false)

  React.useEffect(() => {
    const updateNetworkStatus = () => {
      const online = navigator.onLine
      if (!online && isOnline) {
        setWasOffline(true)
      }
      setIsOnline(online)
    }

    window.addEventListener('online', updateNetworkStatus)
    window.addEventListener('offline', updateNetworkStatus)
    updateNetworkStatus()

    return () => {
      window.removeEventListener('online', updateNetworkStatus)
      window.removeEventListener('offline', updateNetworkStatus)
    }
  }, [isOnline])

  if (isOnline && !wasOffline) {
    return null // Don't show anything if always online
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-500 ${
      isOnline ? 'translate-y-0 opacity-100' : 'translate-y-0 opacity-100'
    }`}>
      <Badge 
        variant={isOnline ? "default" : "destructive"}
        className={`px-3 py-2 text-sm font-medium shadow-lg ${
          isOnline ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600'
        }`}
      >
        {isOnline ? (
          <><Wifi className="h-4 w-4 mr-2" />Back Online</>
        ) : (
          <><WifiOff className="h-4 w-4 mr-2" />Offline</>
        )}
      </Badge>
    </div>
  )
}

export default ErrorBoundary