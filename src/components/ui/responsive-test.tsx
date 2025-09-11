'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Monitor, Tablet, Smartphone, Eye, EyeOff } from 'lucide-react'

export function ResponsiveTest() {
  const [screenSize, setScreenSize] = useState('')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth
      if (width < 640) {
        setScreenSize('Mobile (< 640px)')
      } else if (width < 768) {
        setScreenSize('Small Tablet (640px - 767px)')
      } else if (width < 1024) {
        setScreenSize('Tablet (768px - 1023px)')
      } else if (width < 1280) {
        setScreenSize('Desktop (1024px - 1279px)')
      } else {
        setScreenSize('Large Desktop (1280px+)')
      }
    }

    updateScreenSize()
    window.addEventListener('resize', updateScreenSize)
    return () => window.removeEventListener('resize', updateScreenSize)
  }, [])

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
        >
          <Eye className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Responsive Test</CardTitle>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <EyeOff className="h-4 w-4" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center space-x-2">
            {window.innerWidth < 640 ? (
              <Smartphone className="h-4 w-4 text-blue-500" />
            ) : window.innerWidth < 1024 ? (
              <Tablet className="h-4 w-4 text-green-500" />
            ) : (
              <Monitor className="h-4 w-4 text-purple-500" />
            )}
            <span className="text-xs font-medium">{screenSize}</span>
          </div>
          <div className="text-xs text-gray-500">
            Width: {window.innerWidth}px
          </div>
          <div className="flex flex-wrap gap-1">
            <Badge variant={window.innerWidth >= 1280 ? 'default' : 'secondary'} className="text-xs">
              xl
            </Badge>
            <Badge variant={window.innerWidth >= 1024 ? 'default' : 'secondary'} className="text-xs">
              lg
            </Badge>
            <Badge variant={window.innerWidth >= 768 ? 'default' : 'secondary'} className="text-xs">
              md
            </Badge>
            <Badge variant={window.innerWidth >= 640 ? 'default' : 'secondary'} className="text-xs">
              sm
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
