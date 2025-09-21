'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Building2, 
  Calendar,
  Mail
} from 'lucide-react'
import { Booking } from '@/types'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'
import { toast } from 'sonner'

export default function AdminApprovalsPage() {
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchPendingBookings()
  }, [])

  const fetchPendingBookings = async () => {
    try {
      // Fetch pending bookings from API
      const response = await fetch('/api/bookings?status=pending')
      if (response.ok) {
        const result = await response.json()
        setPendingBookings(result.data || [])
      } else {
        setPendingBookings([])
      }
    } catch (error) {
      console.error('Error fetching pending bookings:', error)
      setPendingBookings([])
    } finally {
      setLoading(false)
    }
  }


  const handleApprove = async (bookingId: string) => {
    try {
      setProcessing(bookingId)
      
      // Mock approve - just update local state
      setPendingBookings(prev => prev.filter(booking => booking.id !== bookingId))
      
      toast.success('הזמנה אושרה בהצלחה')
      
    } catch (error: unknown) {
      console.error('Error approving booking:', error instanceof Error ? error.message : 'Unknown error')
      toast.error('שגיאה באישור ההזמנה')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (bookingId: string) => {
    if (!rejectionReason.trim()) {
      toast.error('יש להזין סיבת דחייה')
      return
    }

    try {
      setProcessing(bookingId)
      
      // Mock reject - just update local state
      setPendingBookings(prev => prev.filter(booking => booking.id !== bookingId))
      
      toast.success('הזמנה נדחתה')
      setRejectionReason('')
      setSelectedBooking(null)
      
    } catch (error: unknown) {
      console.error('Error rejecting booking:', error instanceof Error ? error.message : 'Unknown error')
      toast.error('שגיאה בדחיית ההזמנה')
    } finally {
      setProcessing(null)
    }
  }

  const openRejectionDialog = (bookingId: string) => {
    setSelectedBooking(bookingId)
    setRejectionReason('')
  }

  const closeRejectionDialog = () => {
    setSelectedBooking(null)
    setRejectionReason('')
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

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">תור אישורים</h1>
          <p className="mt-2 text-gray-600">
            הזמנות הממתינות לאישור מנהל
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-600">
                    {pendingBookings.length}
                  </p>
                  <p className="text-sm text-gray-600">ממתין לאישור</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {pendingBookings.filter(b => b.requires_approval_snapshot).length}
                  </p>
                  <p className="text-sm text-gray-600">דורש אישור</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {pendingBookings.length > 0 ? 'דחוף' : 'רגיל'}
                  </p>
                  <p className="text-sm text-gray-600">עדיפות</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Bookings */}
        {pendingBookings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                אין הזמנות ממתינות
              </h3>
              <p className="text-gray-600">
                כל ההזמנות מאושרות או אין הזמנות חדשות
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingBookings.map((booking) => (
              <Card key={booking.id} className="border-l-4 border-l-yellow-500">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {booking.title}
                          </h3>
                          
                          {booking.description && (
                            <p className="text-gray-600 mb-3">
                              {booking.description}
                            </p>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">חלל:</span>
                              <span>{booking.room?.name}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">מזמין:</span>
                              <span>{booking.user?.display_name}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">תאריך:</span>
                              <span>
                                {format(new Date(booking.start_time), 'dd/MM/yyyy', { locale: he })}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">שעה:</span>
                              <span>
                                {format(new Date(booking.start_time), 'HH:mm', { locale: he })} - 
                                {format(new Date(booking.end_time), 'HH:mm', { locale: he })}
                              </span>
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <Badge variant="secondary">
                              {booking.attendee_count} משתתפים
                            </Badge>
                            {booking.attendees.length > 0 && (
                              <Badge variant="outline">
                                {booking.attendees.length} משתתפים נוספים
                              </Badge>
                            )}
                            {booking.requires_approval_snapshot && (
                              <Badge className="bg-yellow-100 text-yellow-800">
                                דורש אישור
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={() => handleApprove(booking.id)}
                        disabled={processing === booking.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {processing === booking.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                        ) : (
                          <CheckCircle className="h-4 w-4 ml-2" />
                        )}
                        אישר
                      </Button>
                      
                      <Button
                        onClick={() => openRejectionDialog(booking.id)}
                        disabled={processing === booking.id}
                        variant="destructive"
                      >
                        <XCircle className="h-4 w-4 ml-2" />
                        דחה
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Rejection Dialog */}
        {selectedBooking && (
          <Card className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <CardContent className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">דחיית הזמנה</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="rejectionReason">סיבת הדחייה *</Label>
                  <Textarea
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="הזן סיבה לדחיית ההזמנה..."
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={closeRejectionDialog}>
                    ביטול
                  </Button>
                  <Button 
                    onClick={() => handleReject(selectedBooking)}
                    disabled={!rejectionReason.trim() || processing === selectedBooking}
                    variant="destructive"
                  >
                    {processing === selectedBooking ? 'דוחה...' : 'דחה'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
