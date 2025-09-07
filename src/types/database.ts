export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string
          email: string
          role: 'admin' | 'editor' | 'user'
          job_title: string | null
          phone: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name: string
          email: string
          role: 'admin' | 'editor' | 'user'
          job_title?: string | null
          phone?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          email?: string
          role?: 'admin' | 'editor' | 'user'
          job_title?: string | null
          phone?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      rooms: {
        Row: {
          id: string
          name: string
          description: string | null
          capacity: number
          location: string
          equipment: string[]
          tags: string[]
          images: string[]
          color: string
          requires_approval: boolean
          cancellation_hours: number
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          capacity: number
          location: string
          equipment?: string[]
          tags?: string[]
          images?: string[]
          color: string
          requires_approval?: boolean
          cancellation_hours?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          capacity?: number
          location?: string
          equipment?: string[]
          tags?: string[]
          images?: string[]
          color?: string
          requires_approval?: boolean
          cancellation_hours?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          user_id: string
          room_id: string
          title: string
          description: string | null
          start_time: string
          end_time: string
          status: 'pending' | 'approved' | 'rejected' | 'cancelled'
          recurrence_rule: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          room_id: string
          title: string
          description?: string | null
          start_time: string
          end_time: string
          status?: 'pending' | 'approved' | 'rejected' | 'cancelled'
          recurrence_rule?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          room_id?: string
          title?: string
          description?: string | null
          start_time?: string
          end_time?: string
          status?: 'pending' | 'approved' | 'rejected' | 'cancelled'
          recurrence_rule?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      room_blocks: {
        Row: {
          id: string
          room_id: string
          title: string
          description: string | null
          start_time: string
          end_time: string
          is_recurring: boolean
          recurrence_rule: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          room_id: string
          title: string
          description?: string | null
          start_time: string
          end_time: string
          is_recurring?: boolean
          recurrence_rule?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          title?: string
          description?: string | null
          start_time?: string
          end_time?: string
          is_recurring?: boolean
          recurrence_rule?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      audit_log: {
        Row: {
          id: string
          user_id: string
          action: string
          table_name: string
          record_id: string
          details: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          table_name: string
          record_id: string
          details?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          table_name?: string
          record_id?: string
          details?: Json | null
          created_at?: string
        }
      }
      org_settings: {
        Row: {
          id: string
          key: string
          value: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
