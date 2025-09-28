'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Building2, Users, Clock, CheckCircle, AlertCircle, Shield, TrendingUp, UserCheck, UserX } from 'lucide-react'
import Link from 'next/link'
import { Room, Booking } from '@/types'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'
import { useAuth } from '@/hooks/use-auth'
import { AdminOnly, EditorOrAdmin } from '@/components/auth/permission-guard'
import { Loading, CardSkeleton, RoomCardSkeleton } from '@/components/ui/loading'
import { ErrorMessage, EmptyState } from '@/components/ui/error'
import { withFetchTimeout } from '@/lib/withTimeout'

export default function Dashboard() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const { user } = useAuth()

  const getRoomAvailability = useCallback((roomId: string) => {
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
  }, [bookings])

  // Memoize expensive calculations
  const roomStats = useMemo(() => {
    const totalRooms = rooms.length
    const busyRooms = rooms.filter(room => getRoomAvailability(room.id).status === 'busy').length
    const availableRooms = totalRooms - busyRooms
    const availabilityPercentage = totalRooms > 0 ? Math.round((availableRooms / totalRooms) * 100) : 0
    
    return {
      totalRooms,
      busyRooms,
      availableRooms,
      availabilityPercentage
    }
  }, [rooms, getRoomAvailability])

  useEffect(() => {
    let isMounted = true
    
    const fetchData = async () => {
      try {
        setError(null)
        console.log('[DASHBOARD] Fetching data...')
        
        // Fetch real data from API with timeout wrapper
        const [roomsResponse, bookingsResponse] = await Promise.all([
          withFetchTimeout(
            fetch('/api/rooms?active=true', { cache: 'no-store' }),
            5000
          ),
          withFetchTimeout(
            fetch('/api/bookings', { cache: 'no-store' }),
            5000
          )
        ])
        
        if (!isMounted) return
        
        if (roomsResponse.ok) {
          const roomsResult = await roomsResponse.json()
          setRooms(roomsResult.data || [])
          console.log('[DASHBOARD] Rooms loaded:', roomsResult.data?.length || 0)
        }
        
        if (bookingsResponse.ok) {
          const bookingsResult = await bookingsResponse.json()
          setBookings(bookingsResult.data || [])
          console.log('[DASHBOARD] Bookings loaded:', bookingsResult.data?.length || 0)
        }
      } catch (error) {
        if (!isMounted) return
        
        console.error('[DASHBOARD] Error fetching data:', error)
        if (error instanceof Error && error.message.includes('timed out')) {
          setError('הטעינה ארכה יותר מדי זמן. אנא נסה שוב.')
        } else {
          setError('שגיאה בטעינת הנתונים. אנא נסה שוב.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
          console.log('[DASHBOARD] Data loading completed')
        }
      }
    }

    fetchData()
    
    return () => {
      isMounted = false
    }
  }, [])


  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">דשבורד</h1>
              <p className="text-gray-600">טוען נתונים...</p>
            </div>
          </div>
          
          {/* Loading Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>

          {/* Loading Rooms */}
          <div>
            <h2 className="text-xl font-semibold mb-4">חללי עבודה</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <RoomCardSkeleton />
              <RoomCardSkeleton />
              <RoomCardSkeleton />
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (error) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">דשבורד</h1>
          </div>
          
          <ErrorMessage
            title="שגיאה בטעינת הנתונים"
            message={error}
            showRetry={true}
            onRetry={() => window.location.reload()}
            showHome={true}
          />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">דשבורד</h1>
          <p className="mt-2 text-gray-600">
            ברוכים הבאים למערכת הזמנת חללי עבודה - המחלקה לחינוך בלתי פורמלי מטה אשר
          </p>
        </div>

        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">
            {(() => {
              const hour = new Date().getHours()
              if (hour < 12) return 'בוקר טוב'
              if (hour < 17) return 'צהריים טובים'
              return 'ערב טוב'
            })()}, {user?.display_name || 'משתמש'}! 👋
          </h2>
          <p className="text-blue-100">
            {user?.job_title && (
              <span className="block text-sm mb-2">
                {user.job_title}
              </span>
            )}
            {user?.role === 'admin' && 'ברוכים הבאים לפאנל הניהול. כאן תוכלו לנהל את כל המערכת.'}
            {user?.role === 'editor' && 'ברוכים הבאים לפאנל העריכה. כאן תוכלו לנהל הזמנות ולאשר בקשות.'}
            {user?.role === 'user' && 'ברוכים הבאים למערכת ההזמנות. כאן תוכלו להזמין חללי עבודה.'}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Button asChild variant="ghost" className="h-auto p-0 w-full justify-start">
              <Link href="/rooms">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 w-full">
                  <CardTitle className="text-sm font-medium">חללים זמינים</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{roomStats.totalRooms}</div>
                  <p className="text-xs text-muted-foreground">
                    חללי עבודה פעילים
                  </p>
                </CardContent>
              </Link>
            </Button>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Button asChild variant="ghost" className="h-auto p-0 w-full justify-start">
              <Link href="/calendar">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 w-full">
                  <CardTitle className="text-sm font-medium">הזמנות היום</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{bookings.length}</div>
                  <p className="text-xs text-muted-foreground">
                    הזמנות מאושרות
                  </p>
                </CardContent>
              </Link>
            </Button>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Button asChild variant="ghost" className="h-auto p-0 w-full justify-start">
              <Link href="/my-bookings">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 w-full">
                  <CardTitle className="text-sm font-medium">חללים תפוסים</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{roomStats.busyRooms}</div>
                  <p className="text-xs text-muted-foreground">
                    כרגע בשימוש
                  </p>
                </CardContent>
              </Link>
            </Button>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Button asChild variant="ghost" className="h-auto p-0 w-full justify-start">
              <Link href="/calendar">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 w-full">
                  <CardTitle className="text-sm font-medium">זמינות</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{roomStats.availabilityPercentage}%</div>
                  <p className="text-xs text-muted-foreground">
                    אחוז זמינות
                  </p>
                </CardContent>
              </Link>
            </Button>
          </Card>
        </div>

        {/* Admin/Editor Stats */}
        <EditorOrAdmin>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <Button asChild variant="ghost" className="h-auto p-0 w-full justify-start">
                <Link href="/admin/approvals">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 w-full">
                    <CardTitle className="text-sm font-medium">הזמנות ממתינות</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">
                      {bookings.filter(b => b.status === 'pending').length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      דורשות אישור
                    </p>
                  </CardContent>
                </Link>
              </Button>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <Button asChild variant="ghost" className="h-auto p-0 w-full justify-start">
                <Link href="/admin/users">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 w-full">
                    <CardTitle className="text-sm font-medium">משתמשים פעילים</CardTitle>
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {user?.role === 'admin' ? '12' : '-'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      משתמשים במערכת
                    </p>
                  </CardContent>
                </Link>
              </Button>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <Button asChild variant="ghost" className="h-auto p-0 w-full justify-start">
                <Link href="/admin/reports">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 w-full">
                    <CardTitle className="text-sm font-medium">שימוש השבוע</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {bookings.length * 2}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      הזמנות השבוע
                    </p>
                  </CardContent>
                </Link>
              </Button>
            </Card>
          </div>
        </EditorOrAdmin>

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
                <Card key={room.id} className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
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
                        variant={availability.status === 'available' ? 'default' : 'destructive'}
                            className="flex items-center gap-1 backdrop-blur-sm bg-white/90"
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
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                        <Building2 className="h-16 w-16 text-blue-400" />
                      </div>
                    )}
                    
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-semibold text-gray-900 mb-1">{room.name}</CardTitle>
                          <CardDescription className="text-sm text-gray-600">
                            {room.location} • {room.capacity} מקומות
                          </CardDescription>
                        </div>
                      </div>
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

        {/* Admin Quick Actions */}
        <AdminOnly>
          <div>
            <h2 className="text-xl font-semibold mb-4">פעולות מהירות</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <Button asChild variant="ghost" className="h-auto p-0 w-full justify-start">
                  <Link href="/admin/rooms">
                    <CardContent className="p-6 w-full">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Building2 className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">ניהול חללים</h3>
                          <p className="text-sm text-gray-600">הוסף וערוך חללי עבודה</p>
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Button>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <Button asChild variant="ghost" className="h-auto p-0 w-full justify-start">
                  <Link href="/admin/users">
                    <CardContent className="p-6 w-full">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Users className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">ניהול משתמשים</h3>
                          <p className="text-sm text-gray-600">הוסף וערוך משתמשים</p>
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Button>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <Button asChild variant="ghost" className="h-auto p-0 w-full justify-start">
                  <Link href="/admin/settings">
                    <CardContent className="p-6 w-full">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Shield className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">הגדרות מערכת</h3>
                          <p className="text-sm text-gray-600">נהל הגדרות כלליות</p>
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Button>
              </Card>
            </div>
          </div>
        </AdminOnly>

        {/* Today's Bookings */}
        {bookings.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">הזמנות היום</h2>
              <Button asChild size="sm" variant="outline">
                <Link href="/calendar">
                  <Calendar className="ml-2 h-4 w-4" />
                  צפה בלוח שנה
                </Link>
              </Button>
            </div>
            <div className="space-y-2">
              {bookings.map((booking) => (
                <Card key={booking.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <Button asChild variant="ghost" className="h-auto p-0 w-full justify-start">
                    <Link href={`/rooms/${booking.room_id}`}>
                      <CardContent className="p-4 w-full">
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
                    </Link>
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
