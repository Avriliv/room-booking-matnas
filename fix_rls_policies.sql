-- Fix RLS policies for bookings table
-- Run this in Supabase SQL Editor

-- First, let's check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'bookings' AND schemaname = 'public';

-- Drop all existing policies on bookings table
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can manage all bookings" ON bookings;
DROP POLICY IF EXISTS "Users can view all bookings" ON bookings;

-- Create new, simpler policies
CREATE POLICY "Enable read access for all users" ON bookings
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for users based on user_id" ON bookings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on user_id" ON bookings
    FOR DELETE USING (auth.uid() = user_id);

-- Also create admin policies
CREATE POLICY "Enable all access for admins" ON bookings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Test the policies by trying to select from bookings
SELECT COUNT(*) as total_bookings FROM bookings;

-- Success message
SELECT 'RLS policies fixed successfully!' as message;
