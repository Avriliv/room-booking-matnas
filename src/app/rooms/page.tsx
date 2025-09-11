'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { MainLayout } from '@/components/layout/main-layout'
import { RoomCard } from '@/components/rooms/room-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loading, RoomCardSkeleton } from '@/components/ui/loading'
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
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch rooms from API
        const response = await fetch('/api/rooms')
        if (!response.ok) {
          throw new Error('שגיאה בטעינת החדרים')
        }
        const result = await response.json()
        const rooms = result.data || []
        
        // Fallback to mock data if API fails
        const mockRooms: Room[] = [
          {
            id: '1',
            name: 'חדר ישיבות מנהלים',
            description: 'חדר ישיבות מפואר עם ציוד מתקדם',
            capacity: 12,
            location: 'קומה 3, כנף צפון',
            equipment: ['מקרן', 'לוח חכם', 'מערכת שמע'],
            tags: ['ישיבות', 'מנהלים'],
            images: ['https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=200&fit=crop'],
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
          {
            id: '2',
            name: 'חדר עבודה שקט',
            description: 'חדר עבודה שקט לעבודה אישית',
            capacity: 4,
            location: 'קומה 2, כנף דרום',
            equipment: ['מחשב', 'מדפסת'],
            tags: ['עבודה', 'שקט'],
            images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=200&fit=crop'],
            requires_approval: false,
            bookable: true,
            time_slot_minutes: 30,
            min_duration_minutes: 30,
            max_duration_minutes: 120,
            color: '#10B981',
            cancellation_hours: 2,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '3',
            name: 'חדר אירועים',
            description: 'חדר גדול לאירועים וחגיגות',
            capacity: 50,
            location: 'קומה 1, אולם מרכזי',
            equipment: ['מערכת הגברה', 'תאורה', 'מסך גדול'],
            tags: ['אירועים', 'חגיגות', 'הרצאות'],
            images: ['https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=200&fit=crop'],
            requires_approval: true,
            bookable: true,
            time_slot_minutes: 60,
            min_duration_minutes: 120,
            max_duration_minutes: 480,
            color: '#F59E0B',
            cancellation_hours: 24,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]

        const mockBookings: Booking[] = [
          {
            id: '1',
            room_id: '1',
            user_id: 'user-1',
            title: 'ישיבת צוות שבועית',
            description: 'ישיבת צוות שבועית של המחלקה',
            start_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
            end_time: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours from now
            attendee_count: 8,
            attendees: ['user1@example.com', 'user2@example.com'],
            status: 'approved',
            requires_approval_snapshot: true,
            is_recurring: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            room: mockRooms[0],
            user: {
              id: 'user-1',
              display_name: 'יוסי כהן',
              email: 'yossi@example.com',
              role: 'admin',
              active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          }
        ]

        // Use real data if available, otherwise fallback to mock
        if (rooms.length > 0) {
          // Filter only active rooms
          const activeRooms = rooms.filter(room => room.active !== false)
          setRooms(activeRooms)
        } else {
          setRooms(mockRooms)
        }
        setBookings(mockBookings)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">חללי עבודה</h1>
          </div>
          
          {/* Loading Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="h-10 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
            <div className="h-10 w-32 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="h-10 w-20 bg-gray-200 rounded-md animate-pulse"></div>
          </div>

          {/* Loading Rooms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <RoomCardSkeleton />
            <RoomCardSkeleton />
            <RoomCardSkeleton />
            <RoomCardSkeleton />
            <RoomCardSkeleton />
            <RoomCardSkeleton />
          </div>
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
