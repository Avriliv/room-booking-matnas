'use client'

import { format, addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameDay, isSameMonth } from 'date-fns'
import { he } from 'date-fns/locale'
import { Room, Booking } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Users } from 'lucide-react'

interface CalendarMonthViewProps {
  date: Date
  rooms: Room[]
  bookings: Booking[]
  onDateClick: (date: Date) => void
  onRoomClick: (roomId: string) => void
}

export function CalendarMonthView({ 
  date, 
  rooms, 
  bookings, 
  onDateClick, 
  onRoomClick 
}: CalendarMonthViewProps) {
  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  
  const days = []
  let currentDay = calendarStart
  
  while (currentDay <= calendarEnd) {
    days.push(currentDay)
    currentDay = addDays(currentDay, 1)
  }

  const getBookingsForDate = (day: Date) => {
    return bookings.filter(booking => 
      isSameDay(new Date(booking.start_time), day)
    )
  }

  const getBookingStyle = (booking: Booking) => {
    const room = rooms.find(r => r.id === booking.room_id)
    return {
      backgroundColor: room?.color || '#3B82F6',
      color: 'white'
    }
  }

  const weekDays = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש']

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Header */}
        <div className="grid grid-cols-7 gap-1 border-b">
          {weekDays.map(day => (
            <div key={day} className="p-3 text-center font-medium text-sm text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map(day => {
            const dayBookings = getBookingsForDate(day)
            const isCurrentMonth = isSameMonth(day, date)
            const isToday = isSameDay(day, new Date())
            
            return (
              <div 
                key={day.toISOString()}
                className={`p-2 min-h-[120px] border-b border-r cursor-pointer hover:bg-gray-50 ${
                  !isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                } ${isToday ? 'bg-blue-50' : ''}`}
                onClick={() => onDateClick(day)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${isToday ? 'text-blue-600' : ''}`}>
                    {format(day, 'd', { locale: he })}
                  </span>
                  {isToday && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </div>

                <div className="space-y-1">
                  {dayBookings.slice(0, 3).map(booking => (
                    <div 
                      key={booking.id}
                      className="p-1 rounded text-xs font-medium truncate"
                      style={getBookingStyle(booking)}
                    >
                      <div className="truncate">
                        {booking.title}
                      </div>
                      <div className="opacity-75 text-xs truncate">
                        {format(new Date(booking.start_time), 'HH:mm', { locale: he })}
                      </div>
                    </div>
                  ))}
                  
                  {dayBookings.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayBookings.length - 3} נוספים
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
