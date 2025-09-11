-- Fix bookings table if it exists but has issues
-- Run this in Supabase SQL Editor

-- First, let's check if the table exists and what columns it has
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- If the table doesn't exist, create it
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  attendee_count INTEGER DEFAULT 1,
  attendees TEXT[] DEFAULT '{}',
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')) DEFAULT 'pending',
  requires_approval_snapshot BOOLEAN DEFAULT false,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule JSONB,
  parent_booking_id UUID REFERENCES bookings(id),
  cancellation_reason TEXT,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancelled_by UUID REFERENCES profiles(id),
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS if not already enabled
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can manage all bookings" ON bookings;

-- Create new policies
CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bookings" ON bookings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all bookings" ON bookings FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Success message
SELECT 'Bookings table fixed successfully!' as message;
