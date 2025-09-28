'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useTransition } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { useAuth } from '@/hooks/use-auth'
import { Navigation } from '@/components/layout/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Clock,
  Users,
  Building2
} from 'lucide-react'
import { Room, Booking } from '@/types'
import { format, addDays, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameDay, isSameWeek, isSameMonth } from 'date-fns'
import { he } from 'date-fns/locale'
import { CalendarDayView } from '@/components/calendar/calendar-day-view'
import { CalendarWeekView } from '@/components/calendar/calendar-week-view'
import { CalendarMonthView } from '@/components/calendar/calendar-month-view'
import { BookingDialog } from '@/components/booking/booking-dialog'
import { toast } from 'sonner'

export default function CalendarPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { user } = useAuth()
  const [rooms, setRooms] = useState<Room[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'day' | 'week' | 'month'>('week')
  const [selectedRoom, setSelectedRoom] = useState<string>('all')
  const [showBookingDialog, setShowBookingDialog] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
  const fetchData = async () => {
    try {
      // Fetch rooms
      const roomsResponse = await fetch('/api/rooms?active=true')
      const roomsResult = await roomsResponse.json()
      
      if (!roomsResponse.ok) {
        throw new Error(roomsResult.error || 'שגיאה בטעינת החדרים')
      }

      setRooms(roomsResult.data || [])

      // Fetch bookings for the current period
      await fetchBookings()
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('שגיאה בטעינת הנתונים')
    } finally {
      setLoading(false)
    }
  }

    fetchData()
  }, [])

  useEffect(() => {
    // Check for room parameter in URL
    const roomParam = searchParams.get('room')
    if (roomParam && roomParam !== 'all') {
      setSelectedRoom(roomParam)
      setSelectedRoomId(roomParam)
    }
  }, [searchParams])

  const fetchBookings = async () => {
    try {
      const bookingsResponse = await fetch('/api/bookings')
      const bookingsResult = await bookingsResponse.json()
      
      if (!bookingsResponse.ok) {
        throw new Error(bookingsResult.error || 'שגיאה בטעינת ההזמנות')
      }

      setBookings(bookingsResult.data || [])
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast.error('שגיאה בטעינת ההזמנות')
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [currentDate, view, selectedRoom, supabase])

  const navigateDate = (direction: 'prev' | 'next') => {
    let newDate: Date

    switch (view) {
      case 'day':
        newDate = direction === 'prev' ? subDays(currentDate, 1) : addDays(currentDate, 1)
        break
      case 'week':
        newDate = direction === 'prev' ? subDays(currentDate, 7) : addDays(currentDate, 7)
        break
      case 'month':
        newDate = direction === 'prev' ? subDays(currentDate, 30) : addDays(currentDate, 30)
        break
      default:
        newDate = direction === 'prev' ? subDays(currentDate, 7) : addDays(currentDate, 7)
    }

    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Fast navigation function
  const navigateTo = (path: string) => {
    startTransition(() => {
      router.push(path)
    })
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setShowBookingDialog(true)
  }

  const handleRoomClick = (roomId: string) => {
    setSelectedRoomId(roomId)
    setShowBookingDialog(true)
  }

  const filteredBookings = selectedRoom === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.room_id === selectedRoom)

  const getDateRangeText = () => {
    switch (view) {
      case 'day':
        return format(currentDate, 'dd/MM/yyyy', { locale: he })
      case 'week':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
        return `${format(weekStart, 'dd/MM', { locale: he })} - ${format(weekEnd, 'dd/MM/yyyy', { locale: he })}`
      case 'month':
        return format(currentDate, 'MMMM yyyy', { locale: he })
      default:
        return format(currentDate, 'dd/MM/yyyy', { locale: he })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">לוח שנה</h1>
            <p className="mt-2 text-gray-600">
              ניהול הזמנות חללי עבודה
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowBookingDialog(true)}>
              <Plus className="h-4 w-4 ml-2" />
              הזמנה חדשה
            </Button>
          </div>
        </div>

        {/* Controls */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Date Navigation */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateDate('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToToday}
                  className="min-w-[100px]"
                >
                  היום
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateDate('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Date Display */}
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-gray-400" />
                <span className="font-medium">{getDateRangeText()}</span>
              </div>

              {/* View Toggle */}
              <Tabs value={view} onValueChange={(value) => setView(value as 'day' | 'week' | 'month')}>
                <TabsList>
                  <TabsTrigger value="day">יום</TabsTrigger>
                  <TabsTrigger value="week">שבוע</TabsTrigger>
                  <TabsTrigger value="month">חודש</TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Room Filter */}
              <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="בחר חלל" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל החללים</SelectItem>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Views */}
        <Card>
          <CardContent className="p-0">
            {view === 'day' && (
              <CalendarDayView
                date={currentDate}
                rooms={rooms}
                bookings={filteredBookings}
                onDateClick={handleDateClick}
                onRoomClick={handleRoomClick}
              />
            )}
            
            {view === 'week' && (
              <CalendarWeekView
                date={currentDate}
                rooms={rooms}
                bookings={filteredBookings}
                onDateClick={handleDateClick}
                onRoomClick={handleRoomClick}
              />
            )}
            
            {view === 'month' && (
              <CalendarMonthView
                date={currentDate}
                rooms={rooms}
                bookings={filteredBookings}
                onDateClick={handleDateClick}
                onRoomClick={handleRoomClick}
              />
            )}
          </CardContent>
        </Card>

        {/* Booking Dialog */}
        <BookingDialog
          open={showBookingDialog}
          onClose={() => {
            setShowBookingDialog(false)
            setSelectedDate(null)
            setSelectedRoomId(null)
          }}
          defaultDate={selectedDate}
          defaultRoom={selectedRoomId}
          onSubmit={async (bookingData) => {
            try {
              const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  ...bookingData,
                  user_id: user?.id || 'mock-user'
                })
              })

              const result = await response.json()

              if (!response.ok) {
                throw new Error(result.error || 'שגיאה ביצירת ההזמנה')
              }

              setBookings(prev => [result.data, ...prev])
              toast.success(result.message || 'הזמנה נוצרה בהצלחה!')
              
              setShowBookingDialog(false)
              setSelectedDate(null)
              setSelectedRoomId(null)
            } catch (error: unknown) {
              console.error('Error creating booking:', error)
              toast.error('שגיאה ביצירת ההזמנה')
            }
          }}
        />
      </div>
      </main>
    </div>
  )
}
