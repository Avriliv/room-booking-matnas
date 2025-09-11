'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Clock, 
  Users, 
  Building2, 
  Edit, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  MoreHorizontal
} from 'lucide-react'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Booking } from '@/types'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'
import { toast } from 'sonner'

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // Try to fetch from API first
        try {
          const response = await fetch('/api/bookings?userId=mock-user')
          const result = await response.json()
          
          if (response.ok) {
            setBookings(result.data || [])
            return
          }
        } catch (apiError) {
          console.log('API not available, using mock data')
        }

        // Fallback to mock data if API fails
        const mockBookings: Booking[] = [
          {
            id: '1',
            room_id: '1',
            user_id: 'mock-user',
            title: 'ישיבת צוות שבועית',
            description: 'ישיבת צוות שבועית של המחלקה',
            start_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
            end_time: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
            attendee_count: 8,
            attendees: ['user1@example.com', 'user2@example.com'],
            status: 'approved',
            requires_approval_snapshot: true,
            is_recurring: false,
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
            room: {
              id: '1',
              name: 'חדר ישיבות מנהלים',
              description: 'חדר ישיבות מפואר',
              capacity: 12,
              location: 'קומה 3, כנף צפון',
              equipment: ['מקרן', 'לוח חכם'],
              tags: ['ישיבות', 'מנהלים'],
              images: [],
              requires_approval: true,
              bookable: true,
              time_slot_minutes: 30,
              min_duration_minutes: 60,
              max_duration_minutes: 240,
              color: '#3B82F6',
              cancellation_hours: 4,
              active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            user: {
              id: 'mock-user',
              display_name: 'משתמש דמה',
              email: 'demo@example.com',
              role: 'admin',
              active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          }
        ]

        setBookings(mockBookings)
      } catch (error) {
        console.error('Error fetching bookings:', error)
        toast.error('שגיאה בטעינת ההזמנות')
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            מאושר
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            ממתין לאישור
          </Badge>
        )
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            נדחה
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            בוטל
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary">
            {status}
          </Badge>
        )
    }
  }

  const canCancel = (booking: Booking) => {
    const now = new Date()
    const startTime = new Date(booking.start_time)
    const hoursUntilStart = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60)
    
    return booking.status === 'approved' && hoursUntilStart > (booking.room?.cancellation_hours || 0)
  }

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const response = await fetch('/api/bookings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: bookingId,
          status: 'cancelled',
          cancellation_reason: 'בוטל על ידי המשתמש'
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'שגיאה בביטול ההזמנה')
      }

      // Update local state
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'cancelled', cancelled_at: new Date().toISOString() }
            : booking
        )
      )

      toast.success(result.message || 'ההזמנה בוטלה בהצלחה')
    } catch (error: unknown) {
      console.error('Error cancelling booking:', error)
      toast.error((error as Error).message || 'אירעה שגיאה בביטול ההזמנה')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, 'dd/MM/yyyy', { locale: he })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, 'HH:mm', { locale: he })
  }

  const isPast = (dateString: string) => {
    return new Date(dateString) < new Date()
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

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">הזמנות שלי</h1>
          <p className="mt-2 text-gray-600">
            ניהול כל ההזמנות שלך
          </p>
        </div>

        {bookings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                אין הזמנות
              </h3>
              <p className="text-gray-600 mb-4">
                עדיין לא יצרת הזמנות. התחל להזמין חללי עבודה.
              </p>
              <Button asChild>
                <Link href="/rooms">
                  <Building2 className="ml-2 h-4 w-4" />
                  צפה בחללים
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className={isPast(booking.start_time) ? 'opacity-60' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{booking.title}</h3>
                        {getStatusBadge(booking.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          <span>{booking.room?.name}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(booking.start_time)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>
                            {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                          </span>
                        </div>
                      </div>

                      {booking.description && (
                        <p className="text-sm text-gray-600 mt-2">
                          {booking.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{booking.attendee_count} משתתפים</span>
                        </div>
                        
                        {booking.attendees.length > 0 && (
                          <div>
                            <span>משתתפים: </span>
                            <span>{booking.attendees.join(', ')}</span>
                          </div>
                        )}
                      </div>

                      {booking.rejection_reason && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-sm text-red-800 font-medium">סיבת דחייה:</p>
                          <p className="text-sm text-red-700">{booking.rejection_reason}</p>
                        </div>
                      )}

                      {booking.cancellation_reason && (
                        <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
                          <p className="text-sm text-gray-800 font-medium">סיבת ביטול:</p>
                          <p className="text-sm text-gray-700">{booking.cancellation_reason}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {canCancel(booking) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelBooking(booking.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 ml-1" />
                          ביטול
                        </Button>
                      )}
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 ml-2" />
                            עריכה
                          </DropdownMenuItem>
                          {canCancel(booking) && (
                            <DropdownMenuItem 
                              onClick={() => handleCancelBooking(booking.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 ml-2" />
                              ביטול
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
