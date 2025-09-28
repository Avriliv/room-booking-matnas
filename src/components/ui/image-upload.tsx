'use client'

import { useState, useRef } from 'react'
import { Button } from './button'
import { Card, CardContent } from './card'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

interface ImageUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
  className?: string
}

export function ImageUpload({ 
  images, 
  onImagesChange, 
  maxImages = 5, 
  className = '' 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Ensure images is always an array
  const safeImages = images || []

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return

    const fileArray = Array.from(files)
    const validFiles = fileArray.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)
      const isValidSize = file.size <= 5 * 1024 * 1024 // 5MB
      
      if (!isValidType) {
        toast.error('סוג קובץ לא נתמך. אנא העלה תמונה בפורמט JPEG, PNG, WebP או GIF')
        return false
      }
      
      if (!isValidSize) {
        toast.error('גודל הקובץ גדול מדי. מקסימום 5MB')
        return false
      }
      
      return true
    })

    if (validFiles.length === 0) return

    if (safeImages.length + validFiles.length > maxImages) {
      toast.error(`ניתן להעלות מקסימום ${maxImages} תמונות`)
      return
    }

    setUploading(true)

    try {
      const uploadPromises = validFiles.map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', 'rooms')

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'שגיאה בהעלאת הקובץ')
        }

        return result.url
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      onImagesChange([...safeImages, ...uploadedUrls])
      toast.success(`${uploadedUrls.length} תמונות הועלו בהצלחה`)
    } catch (error) {
      console.error('Error uploading images:', error)
      toast.error('שגיאה בהעלאת התמונות')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = async (index: number) => {
    const imageToRemove = safeImages[index]
    
    try {
      // Extract path from URL for deletion
      const url = new URL(imageToRemove)
      const path = url.pathname.split('/').slice(2).join('/') // Remove /storage/v1/object/
      
      await fetch(`/api/upload?path=${encodeURIComponent(path)}`, {
        method: 'DELETE'
      })
    } catch (error) {
      console.error('Error deleting image:', error)
    }

    onImagesChange(safeImages.filter((_, i) => i !== index))
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">תמונות</label>
        <span className="text-xs text-gray-500">
          {safeImages.length}/{maxImages}
        </span>
      </div>

      {/* Upload Button */}
      <Card 
        className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="p-6 text-center">
          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-1">
            {uploading ? 'מעלה תמונות...' : 'לחץ להעלאת תמונות'}
          </p>
          <p className="text-xs text-gray-500">
            JPEG, PNG, WebP או GIF (מקסימום 5MB)
          </p>
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Image Preview */}
      {safeImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {safeImages.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`תמונה ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-1 left-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {safeImages.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">אין תמונות</p>
        </div>
      )}
    </div>
  )
}
