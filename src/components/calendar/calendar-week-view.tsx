'use client'

import { format, addDays, startOfWeek, endOfWeek, isSameDay, isSameWeek } from 'date-fns'
import { he } from 'date-fns/locale'
import { Room, Booking } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Users } from 'lucide-react'

interface CalendarWeekViewProps {
  date: Date
  rooms: Room[]
  bookings: Booking[]
  onDateClick: (date: Date) => void
  onRoomClick: (roomId: string) => void
}

export function CalendarWeekView({ 
  date, 
  rooms, 
  bookings, 
  onDateClick, 
  onRoomClick 
}: CalendarWeekViewProps) {
  const weekStart = startOfWeek(date, { weekStartsOn: 0 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const getBookingsForRoomAndDate = (roomId: string, day: Date) => {
    return bookings.filter(booking => {
      if (booking.room_id !== roomId) return false
      return isSameDay(new Date(booking.start_time), day)
    })
  }

  const getBookingStyle = (booking: Booking) => {
    const room = rooms.find(r => r.id === booking.room_id)
    return {
      backgroundColor: room?.color || '#3B82F6',
      color: 'white'
    }
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[1000px]">
        {/* Header */}
        <div className="grid grid-cols-8 gap-1 border-b">
          <div className="p-3 font-medium text-sm text-gray-500">חלל</div>
          {weekDays.map(day => (
            <div key={day.toISOString()} className="p-3 text-center">
              <div className="text-sm font-medium text-gray-900">
                {format(day, 'dd', { locale: he })}
              </div>
              <div className="text-xs text-gray-500">
                {format(day, 'EEE', { locale: he })}
              </div>
            </div>
          ))}
        </div>

        {/* Room Rows */}
        {rooms.map(room => (
          <div key={room.id} className="grid grid-cols-8 gap-1 border-b">
            {/* Room Name */}
            <div 
              className="p-3 font-medium text-sm cursor-pointer hover:bg-gray-50"
              onClick={() => onRoomClick(room.id)}
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: room.color }}
                />
                {room.name}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {room.capacity} מקומות
              </div>
            </div>

            {/* Day Columns */}
            {weekDays.map(day => {
              const dayBookings = getBookingsForRoomAndDate(room.id, day)
              
              return (
                <div 
                  key={`${room.id}-${day.toISOString()}`}
                  className="p-2 min-h-[100px] cursor-pointer hover:bg-gray-50"
                  onClick={() => onDateClick(day)}
                >
                  <div className="space-y-1">
                    {dayBookings.map(booking => (
                      <div 
                        key={booking.id}
                        className="p-2 rounded text-xs font-medium"
                        style={getBookingStyle(booking)}
                      >
                        <div className="font-semibold truncate">
                          {booking.title}
                        </div>
                        <div className="opacity-90 truncate">
                          {format(new Date(booking.start_time), 'HH:mm', { locale: he })} - 
                          {format(new Date(booking.end_time), 'HH:mm', { locale: he })}
                        </div>
                        <div className="opacity-75 text-xs truncate">
                          {booking.user?.display_name}
                        </div>
                      </div>
                    ))}
                    
                    {dayBookings.length === 0 && (
                      <div className="h-full flex items-center justify-center text-gray-300">
                        <div className="text-xs">זמין</div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
