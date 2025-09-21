'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertCircle, Users, MapPin, Clock } from 'lucide-react'
import Link from 'next/link'
import { Room } from '@/types'

interface RoomCardProps {
  room: Room
  availability: 'available' | 'busy' | 'blocked'
  currentBooking?: Record<string, unknown>
  onBook?: () => void
  onView?: () => void
}

export function RoomCard({ 
  room, 
  availability, 
  currentBooking, 
  onBook, 
  onView 
}: RoomCardProps) {
  const getAvailabilityColor = () => {
    switch (availability) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'busy':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'blocked':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getAvailabilityText = () => {
    switch (availability) {
      case 'available':
        return 'זמין'
      case 'busy':
        return 'תפוס'
      case 'blocked':
        return 'חסום'
      default:
        return 'לא זמין'
    }
  }

  const getAvailabilityIcon = () => {
    switch (availability) {
      case 'available':
        return <CheckCircle className="h-3 w-3" />
      case 'busy':
        return <AlertCircle className="h-3 w-3" />
      case 'blocked':
        return <Clock className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  return (
    <Card className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
      <CardHeader className="p-0">
        {/* Room Image */}
        {room.images && room.images.length > 0 ? (
          <div className="relative h-48 overflow-hidden">
            <img
              src={room.images[0]}
              alt={room.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute top-3 right-3">
              <Badge 
                variant="outline"
                className={`${getAvailabilityColor()} flex items-center gap-1 backdrop-blur-sm bg-white/90`}
              >
                {getAvailabilityIcon()}
                {getAvailabilityText()}
              </Badge>
            </div>
            <div className="absolute bottom-3 right-3">
              <div 
                className="w-4 h-4 rounded-full shadow-lg" 
                style={{ backgroundColor: room.color }}
              />
            </div>
          </div>
        ) : (
          <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center relative">
            <Users className="h-16 w-16 text-blue-400" />
            <div className="absolute top-3 right-3">
              <Badge 
                variant="outline"
                className={`${getAvailabilityColor()} flex items-center gap-1 backdrop-blur-sm bg-white/90`}
              >
                {getAvailabilityIcon()}
                {getAvailabilityText()}
              </Badge>
            </div>
          </div>
        )}
        
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                {room.name}
              </CardTitle>
              <CardDescription className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {room.location}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {room.capacity} מקומות
                </span>
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {room.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {room.description}
            </p>
          )}
          
          {/* Equipment */}
          {room.equipment.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">ציוד:</p>
              <div className="flex flex-wrap gap-1">
                {room.equipment.slice(0, 3).map((item) => (
                  <Badge key={item} variant="secondary" className="text-xs">
                    {item}
                  </Badge>
                ))}
                {room.equipment.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{room.equipment.length - 3} נוספים
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {room.tags.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">תגים:</p>
              <div className="flex flex-wrap gap-1">
                {room.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {room.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{room.tags.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Current Booking Info */}
          {availability === 'busy' && currentBooking && (
            <div className="mt-2 p-2 bg-gray-50 rounded-md">
              <p className="text-sm font-medium text-gray-900">
                {currentBooking.title}
              </p>
              <p className="text-xs text-gray-600">
                {currentBooking.user?.display_name || 'משתמש'}
              </p>
            </div>
          )}

          {/* Approval Required */}
          {room.requires_approval && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-xs text-yellow-800 font-medium">
                דורש אישור מנהל
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button 
              asChild 
              size="sm" 
              className="flex-1"
              onClick={onView}
            >
              <Link href={`/rooms/${room.id}`}>
                צפה
              </Link>
            </Button>
            <Button 
              asChild 
              size="sm" 
              variant="outline"
              disabled={availability !== 'available'}
              onClick={onBook}
            >
              <Link href={`/calendar?room=${room.id}`}>
                הזמן
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
