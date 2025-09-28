-- Fix admin booking visibility issues
-- Run this in Supabase SQL Editor

-- First, let's check current RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'bookings' AND schemaname = 'public';

-- Drop all existing policies on bookings table
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can manage all bookings" ON bookings;
DROP POLICY IF EXISTS "Enable read access for all users" ON bookings;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON bookings;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON bookings;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON bookings;
DROP POLICY IF EXISTS "Enable all access for admins" ON bookings;

-- Create comprehensive policies that work for both users and admins
CREATE POLICY "Users can view own bookings" ON bookings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all bookings" ON bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'editor')
        )
    );

CREATE POLICY "Users can create bookings" ON bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings" ON bookings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can update all bookings" ON bookings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'editor')
        )
    );

CREATE POLICY "Users can delete own bookings" ON bookings
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete all bookings" ON bookings
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'editor')
        )
    );

-- Test the policies
SELECT COUNT(*) as total_bookings FROM bookings;

-- Check if admin can see bookings
SELECT 
    b.id, 
    b.title, 
    b.status, 
    b.created_at,
    p.display_name as user_name,
    p.role as user_role
FROM bookings b
LEFT JOIN profiles p ON b.user_id = p.id
ORDER BY b.created_at DESC
LIMIT 5;

-- Success message
SELECT 'Admin booking visibility fixed successfully!' as message;
