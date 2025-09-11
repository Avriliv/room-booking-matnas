'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Building2, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  UserPlus,
  Settings
} from 'lucide-react'
import Link from 'next/link'
import { Profile, Room, Booking } from '@/types'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalRooms: 0,
    totalBookings: 0,
    pendingApprovals: 0,
    todayBookings: 0
  })
  const [recentBookings, setRecentBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch users count
        const { count: totalUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })

        const { count: activeUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('active', true)

        // Fetch rooms count
        const { count: totalRooms } = await supabase
          .from('rooms')
          .select('*', { count: 'exact', head: true })

        // Fetch bookings count
        const { count: totalBookings } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })

        // Fetch pending approvals
        const { count: pendingApprovals } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending')

        // Fetch today's bookings
        const today = new Date()
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

        const { count: todayBookings } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .gte('start_time', startOfDay.toISOString())
          .lt('start_time', endOfDay.toISOString())
          .eq('status', 'approved')

        // Fetch recent bookings
        const { data: recentBookingsData } = await supabase
          .from('bookings')
          .select(`
            *,
            room:rooms(*),
            user:profiles(*)
          `)
          .order('created_at', { ascending: false })
          .limit(5)

        setStats({
          totalUsers: totalUsers || 0,
          activeUsers: activeUsers || 0,
          totalRooms: totalRooms || 0,
          totalBookings: totalBookings || 0,
          pendingApprovals: pendingApprovals || 0,
          todayBookings: todayBookings || 0
        })

        setRecentBookings(recentBookingsData || [])
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [supabase])

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
          <h1 className="text-3xl font-bold text-gray-900">ניהול מערכת</h1>
          <p className="mt-2 text-gray-600">
            דשבורד מנהל המערכת
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button asChild className="h-20">
            <Link href="/admin/users" className="flex flex-col items-center gap-2">
              <UserPlus className="h-6 w-6" />
              <span>ניהול משתמשים</span>
            </Link>
          </Button>
          
          <Button asChild className="h-20" variant="outline">
            <Link href="/admin/rooms" className="flex flex-col items-center gap-2">
              <Building2 className="h-6 w-6" />
              <span>ניהול חללים</span>
            </Link>
          </Button>
          
          <Button asChild className="h-20" variant="outline">
            <Link href="/admin/bookings" className="flex flex-col items-center gap-2">
              <Calendar className="h-6 w-6" />
              <span>ניהול הזמנות</span>
            </Link>
          </Button>
          
          <Button asChild className="h-20" variant="outline">
            <Link href="/admin/settings" className="flex flex-col items-center gap-2">
              <Settings className="h-6 w-6" />
              <span>הגדרות</span>
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">משתמשים פעילים</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeUsers}</div>
              <p className="text-xs text-muted-foreground">
                מתוך {stats.totalUsers} משתמשים רשומים
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">חללי עבודה</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRooms}</div>
              <p className="text-xs text-muted-foreground">
                חללים זמינים להזמנה
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">הזמנות היום</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayBookings}</div>
              <p className="text-xs text-muted-foreground">
                הזמנות מאושרות היום
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ממתין לאישור</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pendingApprovals}</div>
              <p className="text-xs text-muted-foreground">
                הזמנות ממתינות
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">סה&quot;כ הזמנות</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
              <p className="text-xs text-muted-foreground">
                הזמנות במערכת
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">זמינות</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalRooms > 0 ? Math.round(((stats.totalRooms - stats.todayBookings) / stats.totalRooms) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                אחוז זמינות היום
              </p>
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
            {recentBookings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                אין הזמנות במערכת
              </div>
            ) : (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{booking.title}</h4>
                      <p className="text-sm text-gray-600">
                        {booking.room?.name} • {booking.user?.display_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(booking.start_time), 'dd/MM/yyyy HH:mm', { locale: he })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={booking.status === 'approved' ? 'default' : 
                                booking.status === 'pending' ? 'secondary' : 'destructive'}
                      >
                        {booking.status === 'approved' ? 'מאושר' :
                         booking.status === 'pending' ? 'ממתין' :
                         booking.status === 'rejected' ? 'נדחה' : 'בוטל'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
