'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Building2, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Room, Booking } from '@/types'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'

export default function Dashboard() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch rooms
        const { data: roomsData } = await supabase
          .from('rooms')
          .select('*')
          .eq('bookable', true)
          .order('name')

        // Fetch today's bookings
        const today = new Date()
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

        const { data: bookingsData } = await supabase
          .from('bookings')
          .select(`
            *,
            room:rooms(*),
            user:profiles(*)
          `)
          .gte('start_time', startOfDay.toISOString())
          .lt('start_time', endOfDay.toISOString())
          .eq('status', 'approved')
          .order('start_time')

        setRooms(roomsData || [])
        setBookings(bookingsData || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    )
  }

  const getRoomAvailability = (roomId: string) => {
    const now = new Date()
    const roomBookings = bookings.filter(booking => booking.room_id === roomId)
    
    for (const booking of roomBookings) {
      const startTime = new Date(booking.start_time)
      const endTime = new Date(booking.end_time)
      
      if (now >= startTime && now <= endTime) {
        return { status: 'busy', booking }
      }
    }
    
    return { status: 'available', booking: null }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">דשבורד</h1>
          <p className="mt-2 text-gray-600">
            ברוכים הבאים למערכת הזמנת חללי עבודה
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">חללים זמינים</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rooms.length}</div>
              <p className="text-xs text-muted-foreground">
                חללי עבודה פעילים
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">הזמנות היום</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookings.length}</div>
              <p className="text-xs text-muted-foreground">
                הזמנות מאושרות
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">חללים תפוסים</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {rooms.filter(room => getRoomAvailability(room.id).status === 'busy').length}
              </div>
              <p className="text-xs text-muted-foreground">
                כרגע בשימוש
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">זמינות</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round((rooms.filter(room => getRoomAvailability(room.id).status === 'available').length / rooms.length) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">
                אחוז זמינות
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Rooms Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">חללי עבודה</h2>
            <Button asChild>
              <Link href="/calendar">
                <Calendar className="ml-2 h-4 w-4" />
                לוח שנה
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => {
              const availability = getRoomAvailability(room.id)
              return (
                <Card key={room.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{room.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {room.location} • {room.capacity} מקומות
                        </CardDescription>
                      </div>
                      <Badge 
                        variant={availability.status === 'available' ? 'default' : 'destructive'}
                        className="flex items-center gap-1"
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
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {room.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {room.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-1">
                        {room.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {availability.status === 'busy' && availability.booking && (
                        <div className="mt-2 p-2 bg-gray-50 rounded-md">
                          <p className="text-sm font-medium">
                            {availability.booking.title}
                          </p>
                          <p className="text-xs text-gray-600">
                            {format(new Date(availability.booking.start_time), 'HH:mm', { locale: he })} - 
                            {format(new Date(availability.booking.end_time), 'HH:mm', { locale: he })}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button asChild size="sm" className="flex-1">
                          <Link href={`/rooms/${room.id}`}>
                            צפה
                          </Link>
                        </Button>
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/calendar?room=${room.id}`}>
                            הזמן
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Today's Bookings */}
        {bookings.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">הזמנות היום</h2>
            <div className="space-y-2">
              {bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{booking.title}</h3>
                        <p className="text-sm text-gray-600">
                          {booking.room?.name} • {booking.user?.display_name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {format(new Date(booking.start_time), 'HH:mm', { locale: he })} - 
                          {format(new Date(booking.end_time), 'HH:mm', { locale: he })}
                        </p>
                        <p className="text-xs text-gray-500">
                          {booking.attendee_count} משתתפים
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
