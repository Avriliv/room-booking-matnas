'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
  TrendingUp, 
  Download, 
  Calendar, 
  Users, 
  Building2, 
  Clock,
  BarChart3,
  PieChart
} from 'lucide-react'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'
import { he } from 'date-fns/locale'

interface ReportData {
  totalBookings: number
  totalUsers: number
  totalRooms: number
  averageBookingsPerDay: number
  mostPopularRoom: string
  peakHours: string[]
  bookingStatusBreakdown: {
    approved: number
    pending: number
    rejected: number
    cancelled: number
  }
  roomUsage: Array<{
    roomName: string
    bookingCount: number
    totalHours: number
  }>
  recentBookings: Array<{
    id: string
    title: string
    roomName: string
    userName: string
    startTime: string
    status: string
  }>
}

export default function AdminReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30') // days
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchReportData()
  }, [dateRange])

  const fetchReportData = async () => {
    try {
      // Fetch real data from APIs
      const [bookingsResponse, usersResponse, roomsResponse] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/users'),
        fetch('/api/rooms')
      ])
      
      const bookings = bookingsResponse.ok ? (await bookingsResponse.json()).data || [] : []
      const users = usersResponse.ok ? (await usersResponse.json()).data || [] : []
      const rooms = roomsResponse.ok ? (await roomsResponse.json()).data || [] : []
      
      // Calculate report data
      const totalBookings = bookings.length
      const totalUsers = users.length
      const totalRooms = rooms.length
      const averageBookingsPerDay = totalBookings / parseInt(dateRange)
      
      // Find most popular room
      const roomBookingCounts = rooms.map((room: any) => ({
        name: room.name,
        count: bookings.filter((b: any) => b.room_id === room.id).length
      }))
      const mostPopularRoom = roomBookingCounts.reduce((max: any, current: any) => 
        current.count > max.count ? current : max, roomBookingCounts[0] || { name: 'אין נתונים', count: 0 }
      ).name
      
      // Calculate peak hours
      const hourCounts: { [key: string]: number } = {}
      bookings.forEach((booking: any) => {
        const hour = new Date(booking.start_time).getHours()
        const hourKey = `${hour.toString().padStart(2, '0')}:00-${(hour + 1).toString().padStart(2, '0')}:00`
        hourCounts[hourKey] = (hourCounts[hourKey] || 0) + 1
      })
      const peakHours = Object.entries(hourCounts)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 3)
        .map(([hour]) => hour)
      
      // Booking status breakdown
      const statusCounts = bookings.reduce((acc: any, booking: any) => {
        acc[booking.status] = (acc[booking.status] || 0) + 1
        return acc
      }, {} as { [key: string]: number })
      
      const bookingStatusBreakdown = {
        approved: statusCounts.approved || 0,
        pending: statusCounts.pending || 0,
        rejected: statusCounts.rejected || 0,
        cancelled: statusCounts.cancelled || 0
      }
      
      // Room usage
      const roomUsage = rooms.map((room: any) => {
        const roomBookings = bookings.filter((b: any) => b.room_id === room.id)
        const totalHours = roomBookings.reduce((total: number, booking: any) => {
          const start = new Date(booking.start_time)
          const end = new Date(booking.end_time)
          return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60)
        }, 0)
        
        return {
          roomName: room.name,
          bookingCount: roomBookings.length,
          totalHours: Math.round(totalHours)
        }
      }).sort((a: any, b: any) => b.bookingCount - a.bookingCount)
      
      // Recent bookings
      const recentBookings = bookings
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10)
        .map((booking: any) => {
          const room = rooms.find((r: any) => r.id === booking.room_id)
          const user = users.find((u: any) => u.id === booking.user_id)
          return {
            id: booking.id,
            title: booking.title,
            roomName: room?.name || 'חדר לא ידוע',
            userName: user?.display_name || 'משתמש לא ידוע',
            startTime: booking.start_time,
            status: booking.status
          }
        })
      
      const reportData: ReportData = {
        totalBookings,
        totalUsers,
        totalRooms,
        averageBookingsPerDay: Math.round(averageBookingsPerDay * 10) / 10,
        mostPopularRoom,
        peakHours,
        bookingStatusBreakdown,
        roomUsage,
        recentBookings
      }
      
      setReportData(reportData)
    } catch (error) {
      console.error('Error fetching report data:', error)
      // Set empty data if API fails
      setReportData({
        totalBookings: 0,
        totalUsers: 0,
        totalRooms: 0,
        averageBookingsPerDay: 0,
        mostPopularRoom: 'אין נתונים',
        peakHours: [],
        bookingStatusBreakdown: {
          approved: 0,
          pending: 0,
          rejected: 0,
          cancelled: 0
        },
        roomUsage: [],
        recentBookings: []
      })
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    if (!reportData) return

    const csvData = [
      ['דוח הזמנות', ''],
      ['תאריך יצירה', format(new Date(), 'dd/MM/yyyy HH:mm', { locale: he })],
      ['תקופה', `${dateRange} ימים אחרונים`],
      [''],
      ['סטטיסטיקות כלליות', ''],
      ['סה"כ הזמנות', reportData.totalBookings],
      ['סה"כ משתמשים', reportData.totalUsers],
      ['סה"כ חללים', reportData.totalRooms],
      ['ממוצע הזמנות ליום', reportData.averageBookingsPerDay.toFixed(2)],
      [''],
      ['שימוש בחללים', ''],
      ...reportData.roomUsage.map(room => [
        room.roomName,
        `${room.bookingCount} הזמנות`,
        `${room.totalHours.toFixed(1)} שעות`
      ])
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `report-${format(new Date(), 'yyyy-MM-dd')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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

  if (!reportData) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">שגיאה בטעינת הדוח</h2>
          <p className="text-gray-600">לא ניתן לטעון את נתוני הדוח</p>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">דוחות וסטטיסטיקות</h1>
            <p className="mt-2 text-gray-600">
              ניתוח נתונים ומדדי ביצועים
            </p>
          </div>
          
          <div className="flex gap-2">
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="7">7 ימים אחרונים</option>
              <option value="30">30 ימים אחרונים</option>
              <option value="90">90 ימים אחרונים</option>
            </select>
            
            <Button onClick={exportToCSV}>
              <Download className="h-4 w-4 ml-2" />
              ייצא CSV
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">סה&quot;כ הזמנות</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.totalBookings}</div>
              <p className="text-xs text-muted-foreground">
                ב-{dateRange} ימים אחרונים
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ממוצע ליום</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reportData.averageBookingsPerDay.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">
                הזמנות ביום
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">חלל פופולרי</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold truncate">
                {reportData.mostPopularRoom}
              </div>
              <p className="text-xs text-muted-foreground">
                הכי מבוקש
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">שעות שיא</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reportData.peakHours[0] || 'אין'}
              </div>
              <p className="text-xs text-muted-foreground">
                {reportData.peakHours.length > 1 && 
                  `${reportData.peakHours[1]}, ${reportData.peakHours[2]}`
                }
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Booking Status Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                פילוח סטטוס הזמנות
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">מאושרות</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ 
                          width: `${(reportData.bookingStatusBreakdown.approved / reportData.totalBookings) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">
                      {reportData.bookingStatusBreakdown.approved}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">ממתינות</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full" 
                        style={{ 
                          width: `${(reportData.bookingStatusBreakdown.pending / reportData.totalBookings) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">
                      {reportData.bookingStatusBreakdown.pending}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">נדחות</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ 
                          width: `${(reportData.bookingStatusBreakdown.rejected / reportData.totalBookings) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">
                      {reportData.bookingStatusBreakdown.rejected}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">מבוטלות</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gray-500 h-2 rounded-full" 
                        style={{ 
                          width: `${(reportData.bookingStatusBreakdown.cancelled / reportData.totalBookings) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">
                      {reportData.bookingStatusBreakdown.cancelled}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Room Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                שימוש בחללים
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reportData.roomUsage.slice(0, 5).map((room, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{room.roomName}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ 
                            width: `${(room.bookingCount / Math.max(...reportData.roomUsage.map(r => r.bookingCount))) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {room.bookingCount} הזמנות
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>הזמנות אחרונות</CardTitle>
            <CardDescription>
              ההזמנות האחרונות במערכת
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
                    <TableHead>תאריך</TableHead>
                    <TableHead>סטטוס</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.recentBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">{booking.title}</TableCell>
                      <TableCell>{booking.roomName}</TableCell>
                      <TableCell>{booking.userName}</TableCell>
                      <TableCell>
                        {format(new Date(booking.startTime), 'dd/MM/yyyy HH:mm', { locale: he })}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            booking.status === 'approved' ? 'default' :
                            booking.status === 'pending' ? 'secondary' : 'destructive'
                          }
                        >
                          {booking.status === 'approved' ? 'מאושר' :
                           booking.status === 'pending' ? 'ממתין' :
                           booking.status === 'rejected' ? 'נדחה' : 'בוטל'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
