"use client"

import { MobileDebugInfo } from '@/components/mobileDebugInfo'
import { AudioControls } from '@/components/enhanced/audio-controls-simple-mobile'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function MobileTestPage() {
  const [testText] = useState("This is a test document for mobile responsiveness. It should display properly on all screen sizes and be fully functional on mobile devices.")

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Debug Info */}
      <div className="container mx-auto px-4 py-4">
        <MobileDebugInfo />
        
        {/* Responsive Test Cards */}
        <div className="grid gap-4 mb-6">
          <Card className="p-4">
            <h2 className="text-xl font-bold mb-2">Mobile Responsiveness Test</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-red-100 dark:bg-red-900 p-3 rounded text-center">
                <div className="block sm:hidden">📱 Mobile Only</div>
                <div className="hidden sm:block lg:hidden">📟 Tablet Only</div>
                <div className="hidden lg:block">🖥️ Desktop Only</div>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded text-center text-sm">
                Current breakpoint test
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded text-center text-xs sm:text-sm lg:text-base">
                Responsive text sizing
              </div>
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded text-center">
                <Button size="sm" className="w-full">
                  Responsive Button
                </Button>
              </div>
            </div>
          </Card>
          
          {/* Touch Test */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-2">Touch Test</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[1,2,3,4].map(i => (
                <Button 
                  key={i} 
                  variant="outline" 
                  className="h-12 touch-none"
                  onClick={() => alert(`Button ${i} tapped!`)}
                >
                  Tap {i}
                </Button>
              ))}
            </div>
          </Card>
        </div>
        
        {/* Audio Controls Test */}
        <div className="mb-6">
          <Card className="p-4 mb-4">
            <h2 className="text-xl font-bold mb-2">Audio Controls (Mobile Optimized)</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              This version should work properly on mobile devices
            </p>
          </Card>
          <AudioControls text={testText} />
        </div>
        
        {/* Viewport Check */}
        <Card className="p-4 text-center">
          <h3 className="text-lg font-semibold mb-2">Viewport Check</h3>
          <div className="text-sm">
            <div className="block sm:hidden text-green-600">✅ Mobile view active</div>
            <div className="hidden sm:block md:hidden text-blue-600">✅ Tablet view active</div>
            <div className="hidden md:block lg:hidden text-purple-600">✅ Desktop view active</div>
            <div className="hidden lg:block text-orange-600">✅ Large desktop view active</div>
          </div>
          
          <div className="mt-4 text-xs text-gray-500">
            Open browser dev tools and toggle device toolbar to test different screen sizes
          </div>
        </Card>
      </div>
    </div>
  )
}