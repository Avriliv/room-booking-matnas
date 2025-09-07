'use client'

import { format, addHours, startOfDay, endOfDay, isSameHour } from 'date-fns'
import { he } from 'date-fns/locale'
import { Room, Booking } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Users } from 'lucide-react'

interface CalendarDayViewProps {
  date: Date
  rooms: Room[]
  bookings: Booking[]
  onDateClick: (date: Date) => void
  onRoomClick: (roomId: string) => void
}

export function CalendarDayView({ 
  date, 
  rooms, 
  bookings, 
  onDateClick, 
  onRoomClick 
}: CalendarDayViewProps) {
  const hours = Array.from({ length: 12 }, (_, i) => i + 7) // 7:00 to 18:00

  const getBookingForRoomAndHour = (roomId: string, hour: number) => {
    return bookings.find(booking => {
      if (booking.room_id !== roomId) return false
      
      const startHour = new Date(booking.start_time).getHours()
      const endHour = new Date(booking.end_time).getHours()
      
      return hour >= startHour && hour < endHour
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
      <div className="min-w-[800px]">
        {/* Header */}
        <div className="grid grid-cols-8 gap-1 border-b">
          <div className="p-3 font-medium text-sm text-gray-500">שעה</div>
          {rooms.map(room => (
            <div 
              key={room.id} 
              className="p-3 font-medium text-sm text-center cursor-pointer hover:bg-gray-50"
              onClick={() => onRoomClick(room.id)}
            >
              <div className="flex items-center justify-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: room.color }}
                />
                {room.name}
              </div>
            </div>
          ))}
        </div>

        {/* Time Slots */}
        <div className="grid grid-cols-8 gap-1">
          {hours.map(hour => (
            <div key={hour} className="contents">
              {/* Time Label */}
              <div className="p-3 text-sm text-gray-500 border-r">
                {format(new Date().setHours(hour, 0, 0, 0), 'HH:mm', { locale: he })}
              </div>

              {/* Room Columns */}
              {rooms.map(room => {
                const booking = getBookingForRoomAndHour(room.id, hour)
                
                return (
                  <div 
                    key={`${room.id}-${hour}`}
                    className="p-2 border-r border-b min-h-[60px] cursor-pointer hover:bg-gray-50"
                    onClick={() => onDateClick(new Date().setHours(hour, 0, 0, 0))}
                  >
                    {booking ? (
                      <div 
                        className="p-2 rounded text-xs font-medium"
                        style={getBookingStyle(booking)}
                      >
                        <div className="font-semibold truncate">
                          {booking.title}
                        </div>
                        <div className="opacity-90 truncate">
                          {booking.user?.display_name}
                        </div>
                        <div className="opacity-75 text-xs">
                          {format(new Date(booking.start_time), 'HH:mm', { locale: he })} - 
                          {format(new Date(booking.end_time), 'HH:mm', { locale: he })}
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-300">
                        <div className="text-xs">זמין</div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
