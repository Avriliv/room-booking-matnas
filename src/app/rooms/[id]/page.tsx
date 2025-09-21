'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowRight, 
  Users, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  Image as ImageIcon,
  Wifi,
  Monitor,
  Coffee,
  BookOpen
} from 'lucide-react'
import Link from 'next/link'
import { Room, Booking } from '@/types'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'
import Image from 'next/image'

export default function RoomPage() {
  const params = useParams()
  const router = useRouter()
  const [room, setRoom] = useState<Room | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        // Fetch room data from API
        const roomId = params.id as string
        const response = await fetch(`/api/rooms/${roomId}`)
        
        if (!response.ok) {
          throw new Error('שגיאה בטעינת פרטי החדר')
        }
        
        const result = await response.json()
        const room = result.data
        
        if (!room) {
          throw new Error('חדר לא נמצא')
        }
        
        setRoom(room)
        
        // Fetch bookings for this room
        const bookingsResponse = await fetch(`/api/bookings?roomId=${roomId}`)
        if (bookingsResponse.ok) {
          const bookingsResult = await bookingsResponse.json()
          setBookings(bookingsResult.data || [])
        }
      } catch (error) {
        console.error('Error fetching room data:', error)
        // If API fails, redirect to rooms page
        router.push('/rooms')
      } finally {
        setLoading(false)
      }
    }

    fetchRoomData()
  }, [params.id, router])

  const getRoomAvailability = () => {
    const now = new Date()
    
    for (const booking of bookings) {
      const startTime = new Date(booking.start_time)
      const endTime = new Date(booking.end_time)
      
      if (now >= startTime && now <= endTime) {
        return { status: 'busy' as const, booking }
      }
    }
    
    return { status: 'available' as const, booking: null }
  }

  const getEquipmentIcon = (equipment: string) => {
    const lower = equipment.toLowerCase()
    if (lower.includes('wifi') || lower.includes('רשת')) return <Wifi className="h-4 w-4" />
    if (lower.includes('מסך') || lower.includes('monitor')) return <Monitor className="h-4 w-4" />
    if (lower.includes('קפה') || lower.includes('coffee')) return <Coffee className="h-4 w-4" />
    if (lower.includes('ספר') || lower.includes('book')) return <BookOpen className="h-4 w-4" />
    return <CheckCircle className="h-4 w-4" />
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    )
  }

  if (!room) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">חלל לא נמצא</h2>
          <Button asChild>
            <Link href="/rooms">
              <ArrowRight className="ml-2 h-4 w-4" />
              חזור לחללים
            </Link>
          </Button>
        </div>
      </MainLayout>
    )
  }

  const availability = getRoomAvailability()

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/rooms">
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: room.color }}
                />
                {room.name}
              </h1>
              <p className="text-gray-600 mt-1">{room.location}</p>
            </div>
          </div>
          <Badge 
            variant="outline"
            className={`${
              availability.status === 'available' 
                ? 'bg-green-100 text-green-800 border-green-200' 
                : 'bg-red-100 text-red-800 border-red-200'
            } flex items-center gap-1`}
          >
            {availability.status === 'available' ? (
              <>
                <CheckCircle className="h-3 w-3" />
                זמין
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3" />
                תפוס
              </>
            )}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photos */}
            {room.photo_urls.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    תמונות
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {room.photo_urls.map((url, index) => (
                      <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                        <Image
                          src={url}
                          alt={`${room.name} - תמונה ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            {room.description && (
              <Card>
                <CardHeader>
                  <CardTitle>תיאור</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{room.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Equipment */}
            <Card>
              <CardHeader>
                <CardTitle>ציוד זמין</CardTitle>
                <CardDescription>
                  כל הציוד הזמין בחלל זה
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {room.equipment.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      {getEquipmentIcon(item)}
                      <span className="text-sm font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            {room.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>תגים</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {room.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>פרטי החלל</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">קיבולת</p>
                    <p className="text-2xl font-bold">{room.capacity} מקומות</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">מיקום</p>
                    <p className="text-sm text-gray-600">{room.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">משך הזמנה מינימלי</p>
                    <p className="text-sm text-gray-600">{room.min_duration_minutes} דקות</p>
                  </div>
                </div>

                {room.requires_approval && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 font-medium">
                      דורש אישור מנהל
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Booking Actions */}
            <Card>
              <CardHeader>
                <CardTitle>הזמנה</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  asChild 
                  className="w-full"
                  disabled={availability.status !== 'available'}
                >
                  <Link href={`/calendar?room=${room.id}`}>
                    <Calendar className="ml-2 h-4 w-4" />
                    הזמן חלל זה
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="w-full">
                  <Link href="/calendar">
                    <Calendar className="ml-2 h-4 w-4" />
                    לוח שנה מלא
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Today's Schedule */}
            {bookings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>לוח זמנים היום</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium text-sm">{booking.title}</p>
                        <p className="text-xs text-gray-600">
                          {format(new Date(booking.start_time), 'HH:mm', { locale: he })} - 
                          {format(new Date(booking.end_time), 'HH:mm', { locale: he })}
                        </p>
                        <p className="text-xs text-gray-500">
                          {booking.user?.display_name}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
