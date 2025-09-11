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
      // Mock data for demo purposes
      const mockReportData: ReportData = {
        totalBookings: 45,
        totalUsers: 5,
        totalRooms: 3,
        averageBookingsPerDay: 1.5,
        mostPopularRoom: 'חדר ישיבות מנהלים',
        peakHours: ['09:00-10:00', '14:00-15:00', '16:00-17:00'],
        bookingStatusBreakdown: {
          approved: 35,
          pending: 5,
          rejected: 3,
          cancelled: 2
        },
        roomUsage: [
          {
            roomName: 'חדר ישיבות מנהלים',
            bookingCount: 20,
            totalHours: 60
          },
          {
            roomName: 'חדר עבודה שקט',
            bookingCount: 15,
            totalHours: 30
          },
          {
            roomName: 'חדר אירועים',
            bookingCount: 10,
            totalHours: 40
          }
        ],
        recentBookings: [
          {
            id: '1',
            title: 'ישיבת צוות שבועית',
            roomName: 'חדר ישיבות מנהלים',
            userName: 'יוסי כהן',
            startTime: new Date().toISOString(),
            status: 'approved'
          },
          {
            id: '2',
            title: 'עבודה שקטה',
            roomName: 'חדר עבודה שקט',
            userName: 'שרה לוי',
            startTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
            status: 'pending'
          },
          {
            id: '3',
            title: 'אירוע חברתי',
            roomName: 'חדר אירועים',
            userName: 'מיכאל רוזן',
            startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            status: 'approved'
          }
        ]
      }

      setReportData(mockReportData)
    } catch (error) {
      console.error('Error fetching report data:', error)
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
