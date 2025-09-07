export interface Profile {
  id: string
  display_name: string
  email: string
  role: 'admin' | 'editor' | 'user'
  job_title?: string | null
  phone?: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export interface Room {
  id: string
  name: string
  description?: string
  capacity: number
  location: string
  equipment: string[]
  tags: string[]
  photo_urls: string[]
  requires_approval: boolean
  bookable: boolean
  time_slot_minutes: number
  min_duration_minutes: number
  max_duration_minutes: number
  color: string
  cancellation_hours: number
  created_at: string
  updated_at: string
}

export interface RoomBlock {
  id: string
  room_id: string
  title: string
  description?: string
  start_time: string
  end_time: string
  is_recurring: boolean
  recurrence_rule?: Record<string, unknown>
  created_at: string
}

export interface Booking {
  id: string
  room_id: string
  user_id: string
  title: string
  description?: string
  start_time: string
  end_time: string
  attendee_count: number
  attendees: string[]
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  requires_approval_snapshot: boolean
  is_recurring: boolean
  recurrence_rule?: Record<string, unknown>
  parent_booking_id?: string
  cancellation_reason?: string
  cancelled_at?: string
  cancelled_by?: string
  approved_by?: string
  approved_at?: string
  rejection_reason?: string
  admin_notes?: string
  created_at: string
  updated_at: string
  // Joined data
  room?: Room
  user?: Profile
}

export interface BookingFormData {
  room_id: string
  title: string
  description?: string
  start_time: string
  end_time: string
  attendee_count: number
  attendees: string[]
  is_recurring: boolean
  recurrence_rule?: Record<string, unknown>
}

export interface ProfileFormData {
  display_name: string
  email: string
  job_title?: string
  phone?: string
  role: 'admin' | 'editor' | 'user'
  active: boolean
}

export interface RoomFormData {
  name: string
  description?: string
  capacity: number
  location: string
  equipment: string[]
  tags: string[]
  requires_approval: boolean
  bookable: boolean
  time_slot_minutes: number
  min_duration_minutes: number
  max_duration_minutes: number
  color: string
  cancellation_hours: number
}

export interface AuditLog {
  id: string
  user_id?: string
  action: string
  entity_type: string
  entity_id?: string
  details?: Record<string, unknown>
  created_at: string
  user?: Profile
}

export interface OrgSettings {
  name: string
  workWeek: number[]
  workHours: {
    start: string
    end: string
  }
  timezone: string
  bookingWindowDays: number
  defaultCancellationHours: number
  timeSlotMinutes: number
}
