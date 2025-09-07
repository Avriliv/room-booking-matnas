'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Clock,
  Calendar,
  User,
  Building2
} from 'lucide-react'
import { Booking } from '@/types'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'
import { toast } from 'sonner'

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roomFilter, setRoomFilter] = useState('all')
  const [rooms, setRooms] = useState<Room[]>([])
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch rooms for filter
      const { data: roomsData } = await supabase
        .from('rooms')
        .select('id, name')
        .order('name')

      setRooms(roomsData || [])

      // Fetch bookings
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select(`
          *,
          room:rooms(*),
          user:profiles(*)
        `)
        .order('created_at', { ascending: false })

      setBookings(bookingsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('שגיאה בטעינת הנתונים')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId)

      if (error) throw error

      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: newStatus as 'pending' | 'approved' | 'rejected' | 'cancelled', updated_at: new Date().toISOString() }
            : booking
        )
      )

      toast.success('סטטוס ההזמנה עודכן בהצלחה')
    } catch (error: unknown) {
      toast.error(error.message || 'שגיאה בעדכון סטטוס ההזמנה')
    }
  }

  const handleDeleteBooking = async (bookingId: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק את ההזמנה?')) return

    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId)

      if (error) throw error

      setBookings(prev => prev.filter(booking => booking.id !== bookingId))
      toast.success('הזמנה נמחקה בהצלחה')
    } catch (error: unknown) {
      toast.error(error.message || 'שגיאה במחיקת ההזמנה')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            מאושר
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            ממתין
          </Badge>
        )
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            נדחה
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge className="bg-gray-100 text-gray-800 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            בוטל
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.room?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter
    const matchesRoom = roomFilter === 'all' || booking.room_id === roomFilter
    
    return matchesSearch && matchesStatus && matchesRoom
  })

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
          <h1 className="text-3xl font-bold text-gray-900">ניהול הזמנות</h1>
          <p className="mt-2 text-gray-600">
            ניהול כל ההזמנות במערכת
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="חיפוש הזמנות..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="סטטוס" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל הסטטוסים</SelectItem>
                  <SelectItem value="pending">ממתין</SelectItem>
                  <SelectItem value="approved">מאושר</SelectItem>
                  <SelectItem value="rejected">נדחה</SelectItem>
                  <SelectItem value="cancelled">בוטל</SelectItem>
                </SelectContent>
              </Select>

              <Select value={roomFilter} onValueChange={setRoomFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="חלל" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל החללים</SelectItem>
                  {rooms.map(room => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={fetchData}>
                רענן
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bookings Table */}
        <Card>
          <CardHeader>
            <CardTitle>הזמנות ({filteredBookings.length})</CardTitle>
            <CardDescription>
              רשימת כל ההזמנות במערכת
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>הזמנה</TableHead>
                    <TableHead>חלל</TableHead>
                    <TableHead>משתמש</TableHead>
                    <TableHead>תאריך ושעה</TableHead>
                    <TableHead>סטטוס</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{booking.title}</div>
                          {booking.description && (
                            <div className="text-sm text-gray-500 line-clamp-1">
                              {booking.description}
                            </div>
                          )}
                          <div className="text-xs text-gray-400 mt-1">
                            {booking.attendee_count} משתתפים
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium">{booking.room?.name}</div>
                            <div className="text-sm text-gray-500">
                              {booking.room?.location}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium">{booking.user?.display_name}</div>
                            <div className="text-sm text-gray-500">
                              {booking.user?.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium">
                              {format(new Date(booking.start_time), 'dd/MM/yyyy', { locale: he })}
                            </div>
                            <div className="text-sm text-gray-500">
                              {format(new Date(booking.start_time), 'HH:mm', { locale: he })} - 
                              {format(new Date(booking.end_time), 'HH:mm', { locale: he })}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(booking.status)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {booking.status === 'pending' && (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => handleStatusChange(booking.id, 'approved')}
                                >
                                  <CheckCircle className="h-4 w-4 ml-2" />
                                  אישר
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleStatusChange(booking.id, 'rejected')}
                                >
                                  <XCircle className="h-4 w-4 ml-2" />
                                  דחה
                                </DropdownMenuItem>
                              </>
                            )}
                            {booking.status === 'approved' && (
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(booking.id, 'cancelled')}
                              >
                                <XCircle className="h-4 w-4 ml-2" />
                                בטל
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => handleDeleteBooking(booking.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 ml-2" />
                              מחק
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredBookings.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm || statusFilter !== 'all' || roomFilter !== 'all' 
                  ? 'לא נמצאו הזמנות התואמות לפילטרים' 
                  : 'אין הזמנות במערכת'
                }
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
