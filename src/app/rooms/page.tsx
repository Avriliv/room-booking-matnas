'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { MainLayout } from '@/components/layout/main-layout'
import { RoomCard } from '@/components/rooms/room-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Filter, Grid, List } from 'lucide-react'
import { Room, Booking } from '@/types'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [capacityFilter, setCapacityFilter] = useState('all')
  const [tagFilter, setTagFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
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

  const getRoomAvailability = (roomId: string) => {
    const now = new Date()
    const roomBookings = bookings.filter(booking => booking.room_id === roomId)
    
    for (const booking of roomBookings) {
      const startTime = new Date(booking.start_time)
      const endTime = new Date(booking.end_time)
      
      if (now >= startTime && now <= endTime) {
        return { status: 'busy' as const, booking }
      }
    }
    
    return { status: 'available' as const, booking: null }
  }

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCapacity = capacityFilter === 'all' || 
                           (capacityFilter === 'small' && room.capacity <= 4) ||
                           (capacityFilter === 'medium' && room.capacity > 4 && room.capacity <= 10) ||
                           (capacityFilter === 'large' && room.capacity > 10)
    
    const matchesTag = tagFilter === 'all' || room.tags.includes(tagFilter)
    
    return matchesSearch && matchesCapacity && matchesTag
  })

  const allTags = Array.from(new Set(rooms.flatMap(room => room.tags)))

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
          <h1 className="text-3xl font-bold text-gray-900">חללי עבודה</h1>
          <p className="mt-2 text-gray-600">
            בחר חלל עבודה המתאים לצרכים שלך
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="חיפוש חללים..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            
            <Select value={capacityFilter} onValueChange={setCapacityFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="קיבולת" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הקיבולות</SelectItem>
                <SelectItem value="small">קטן (1-4)</SelectItem>
                <SelectItem value="medium">בינוני (5-10)</SelectItem>
                <SelectItem value="large">גדול (10+)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={tagFilter} onValueChange={setTagFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="תג" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל התגים</SelectItem>
                {allTags.map(tag => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Rooms Grid/List */}
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            : "space-y-4"
        }>
          {filteredRooms.map((room) => {
            const availability = getRoomAvailability(room.id)
            return (
              <RoomCard
                key={room.id}
                room={room}
                availability={availability.status}
                currentBooking={availability.booking}
              />
            )
          })}
        </div>

        {filteredRooms.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Filter className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              לא נמצאו חללים
            </h3>
            <p className="text-gray-600">
              נסה לשנות את הפילטרים או לחפש משהו אחר
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
