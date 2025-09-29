"use client"

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'

export function MobileDebugInfo() {
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    const info = {
      // Screen info
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
      
      // Device detection
      isMobile: window.innerWidth < 768,
      isTouch: 'ontouchstart' in window,
      userAgent: navigator.userAgent,
      
      // Viewport meta tag check
      hasViewportMeta: !!document.querySelector('meta[name="viewport"]'),
      viewportContent: document.querySelector('meta[name="viewport"]')?.getAttribute('content') || 'Not found',
      
      // CSS classes applied
      bodyClasses: document.body.className,
      htmlClasses: document.documentElement.className,
    }
    
    setDebugInfo(info)
    
    // Log to console for debugging
    console.log('📱 Mobile Debug Info:', info)
  }, [])

  if (!debugInfo.screenWidth) return null

  return (
    <Card className="p-4 mb-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
      <h3 className="font-bold text-blue-800 dark:text-blue-200 mb-2">📱 Mobile Debug Info</h3>
      <div className="text-sm space-y-1 text-blue-700 dark:text-blue-300">
        <div><strong>Screen:</strong> {debugInfo.screenWidth}×{debugInfo.screenHeight}</div>
        <div><strong>Window:</strong> {debugInfo.windowWidth}×{debugInfo.windowHeight}</div>
        <div><strong>Device Pixel Ratio:</strong> {debugInfo.devicePixelRatio}</div>
        <div><strong>Detected as Mobile:</strong> {debugInfo.isMobile ? '✅ Yes' : '❌ No'}</div>
        <div><strong>Touch Device:</strong> {debugInfo.isTouch ? '✅ Yes' : '❌ No'}</div>
        <div><strong>Viewport Meta Tag:</strong> {debugInfo.hasViewportMeta ? '✅ Present' : '❌ MISSING'}</div>
        {debugInfo.hasViewportMeta && (
          <div><strong>Viewport Content:</strong> {debugInfo.viewportContent}</div>
        )}
        <details className="mt-2">
          <summary className="cursor-pointer font-medium">User Agent</summary>
          <div className="text-xs mt-1 break-all">{debugInfo.userAgent}</div>
        </details>
      </div>
      
      {!debugInfo.hasViewportMeta && (
        <div className="mt-3 p-2 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded text-red-800 dark:text-red-200 text-sm">
          <strong>⚠️ CRITICAL ISSUE:</strong> Missing viewport meta tag! Add this to your HTML head:
          <code className="block mt-1 text-xs bg-red-200 dark:bg-red-800 p-1 rounded">
            &lt;meta name="viewport" content="width=device-width, initial-scale=1.0"&gt;
          </code>
        </div>
      )}
    </Card>
  )
}