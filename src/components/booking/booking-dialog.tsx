'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Clock, Users, Building2, Plus, X } from 'lucide-react'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'
import { Room, BookingFormData } from '@/types'
import { toast } from 'sonner'

interface BookingDialogProps {
  open: boolean
  onClose: () => void
  defaultDate?: Date | null
  defaultRoom?: string | null
  onSubmit: (booking: BookingFormData) => void
}

export function BookingDialog({ 
  open, 
  onClose, 
  defaultDate, 
  defaultRoom, 
  onSubmit 
}: BookingDialogProps) {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<BookingFormData>({
    room_id: defaultRoom || '',
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    attendee_count: 1,
    attendees: [],
    is_recurring: false,
    recurrence_rule: null
  })
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(defaultDate || undefined)
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [newAttendee, setNewAttendee] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (open) {
      fetchRooms()
    }
  }, [open])

  useEffect(() => {
    if (defaultDate) {
      setSelectedDate(defaultDate)
    }
    if (defaultRoom) {
      setFormData(prev => ({ ...prev, room_id: defaultRoom }))
    }
  }, [defaultDate, defaultRoom])

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms?active=true')
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'שגיאה בטעינת החדרים')
      }

      setRooms(result.data || [])
    } catch (error) {
      console.error('Error fetching rooms:', error)
      toast.error('שגיאה בטעינת החדרים')
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.room_id) {
      newErrors.room_id = 'יש לבחור חלל'
    }
    if (!formData.title.trim()) {
      newErrors.title = 'יש להזין כותרת'
    }
    if (!selectedDate) {
      newErrors.date = 'יש לבחור תאריך'
    }
    if (!startTime) {
      newErrors.startTime = 'יש להזין שעת התחלה'
    }
    if (!endTime) {
      newErrors.endTime = 'יש להזין שעת סיום'
    }
    if (startTime && endTime && startTime >= endTime) {
      newErrors.endTime = 'שעת הסיום חייבת להיות אחרי שעת ההתחלה'
    }
    if (formData.attendee_count < 1) {
      newErrors.attendee_count = 'מספר משתתפים חייב להיות לפחות 1'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    if (!selectedDate) return

    const startDateTime = new Date(selectedDate)
    const [startHour, startMinute] = startTime.split(':').map(Number)
    startDateTime.setHours(startHour, startMinute, 0, 0)

    const endDateTime = new Date(selectedDate)
    const [endHour, endMinute] = endTime.split(':').map(Number)
    endDateTime.setHours(endHour, endMinute, 0, 0)

    const bookingData: BookingFormData = {
      ...formData,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString()
    }

    try {
      setLoading(true)
      await onSubmit(bookingData)
      onClose()
      resetForm()
    } catch (error) {
      console.error('Error creating booking:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      room_id: '',
      title: '',
      description: '',
      start_time: '',
      end_time: '',
      attendee_count: 1,
      attendees: [],
      is_recurring: false,
      recurrence_rule: null
    })
    setSelectedDate(undefined)
    setStartTime('')
    setEndTime('')
    setNewAttendee('')
    setErrors({})
  }

  const addAttendee = () => {
    if (newAttendee.trim() && !formData.attendees.includes(newAttendee.trim())) {
      setFormData(prev => ({
        ...prev,
        attendees: [...prev.attendees, newAttendee.trim()]
      }))
      setNewAttendee('')
    }
  }

  const removeAttendee = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.filter((_, i) => i !== index)
    }))
  }

  const selectedRoom = rooms.find(room => room.id === formData.room_id)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>הזמנה חדשה</DialogTitle>
          <DialogDescription>
            הזמן חלל עבודה חדש
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Room Selection */}
          <div className="space-y-2">
            <Label htmlFor="room">חלל *</Label>
            <Select 
              value={formData.room_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, room_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר חלל" />
              </SelectTrigger>
              <SelectContent>
                {rooms.map(room => (
                  <SelectItem key={room.id} value={room.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: room.color }}
                      />
                      {room.name} ({room.capacity} מקומות)
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.room_id && (
              <p className="text-sm text-red-600">{errors.room_id}</p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">כותרת *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="לדוגמה: ישיבת צוות שבועית"
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">תיאור</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="תיאור קצר של ההזמנה"
              rows={3}
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>תאריך *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: he }) : 'בחר תאריך'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.date && (
                <p className="text-sm text-red-600">{errors.date}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>שעת התחלה *</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
              {errors.startTime && (
                <p className="text-sm text-red-600">{errors.startTime}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>שעת סיום *</Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
              {errors.endTime && (
                <p className="text-sm text-red-600">{errors.endTime}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="attendee_count">מספר משתתפים *</Label>
              <Input
                id="attendee_count"
                type="number"
                min="1"
                max={selectedRoom?.capacity || 100}
                value={formData.attendee_count}
                onChange={(e) => setFormData(prev => ({ ...prev, attendee_count: parseInt(e.target.value) || 1 }))}
              />
              {errors.attendee_count && (
                <p className="text-sm text-red-600">{errors.attendee_count}</p>
              )}
            </div>
          </div>

          {/* Attendees */}
          <div className="space-y-2">
            <Label>משתתפים</Label>
            <div className="flex gap-2">
              <Input
                value={newAttendee}
                onChange={(e) => setNewAttendee(e.target.value)}
                placeholder="שם משתתף"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAttendee())}
              />
              <Button type="button" onClick={addAttendee} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {formData.attendees.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.attendees.map((attendee, index) => (
                  <div key={index} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                    <span className="text-sm">{attendee}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttendee(index)}
                      className="h-4 w-4 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Room Info */}
          {selectedRoom && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">פרטי החלל</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">קיבולת:</span>
                  <span className="mr-2">{selectedRoom.capacity} מקומות</span>
                </div>
                <div>
                  <span className="text-gray-600">מיקום:</span>
                  <span className="mr-2">{selectedRoom.location}</span>
                </div>
                {selectedRoom.requires_approval && (
                  <div className="col-span-2 text-yellow-600 font-medium">
                    ⚠️ חלל זה דורש אישור מנהל
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              ביטול
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'יוצר הזמנה...' : 'צור הזמנה'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
