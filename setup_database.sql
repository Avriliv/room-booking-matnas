-- Setup script for workspace-booking database
-- Run this in Supabase SQL Editor

-- 1. First, let's check if we have the basic tables
-- If not, create them:

-- Create profiles table (if not exists)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  display_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('admin', 'editor', 'user')) DEFAULT 'user',
  job_title TEXT,
  phone TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rooms table (if not exists)
CREATE TABLE IF NOT EXISTS rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  capacity INTEGER NOT NULL,
  location TEXT NOT NULL,
  equipment TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  color TEXT NOT NULL,
  requires_approval BOOLEAN DEFAULT false,
  bookable BOOLEAN DEFAULT true,
  time_slot_minutes INTEGER DEFAULT 30,
  min_duration_minutes INTEGER DEFAULT 30,
  max_duration_minutes INTEGER DEFAULT 240,
  cancellation_hours INTEGER DEFAULT 24,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add images column if it doesn't exist (for existing tables)
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Add active column if it doesn't exist (for existing tables)
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- Create bookings table (if not exists)
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

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view all rooms" ON rooms;
DROP POLICY IF EXISTS "Admins can manage rooms" ON rooms;
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can manage all bookings" ON bookings;

-- Create new policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view all rooms" ON rooms FOR SELECT USING (true);
CREATE POLICY "Admins can manage rooms" ON rooms FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bookings" ON bookings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all bookings" ON bookings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 2. Create demo rooms
INSERT INTO rooms (id, name, description, capacity, location, equipment, tags, images, color, requires_approval, bookable, time_slot_minutes, min_duration_minutes, max_duration_minutes, cancellation_hours, active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'חדר ישיבות מנהלים', 'חדר ישיבות מפואר עם ציוד מתקדם לניהול ישיבות', 12, 'קומה 2, חדר 201', '{"מסך 65 אינץ", "מערכת שמע", "לוח חכם", "מחשב נייד"}', '{"ישיבות", "מנהלים", "פגישות"}', '{}', '#3B82F6', true, true, 30, 60, 240, 24, true),
('550e8400-e29b-41d4-a716-446655440002', 'סטודיו הדרכה', 'חדר הדרכה גדול עם ציוד אודיו-ויזואלי מתקדם', 25, 'קומה 1, חדר 101', '{"מסך 75 אינץ", "מערכת שמע", "מיקרופון אלחוטי", "מצלמה"}', '{"הדרכה", "סמינרים", "הרצאות"}', '{}', '#10B981', false, true, 30, 30, 120, 2, true),
('550e8400-e29b-41d4-a716-446655440003', 'עמדת עבודה שקטה A', 'חדר עבודה שקט למיקוד ועבודה אישית', 4, 'קומה 3, חדר 301', '{"שולחן עבודה", "כיסא ארגונומי", "תאורה מתכווננת"}', '{"עבודה", "שקט", "מיקוד"}', '{}', '#8B5CF6', false, true, 30, 30, 120, 1, true),
('550e8400-e29b-41d4-a716-446655440004', 'עמדת עבודה שקטה B', 'חדר עבודה שקט נוסף למיקוד ועבודה אישית', 6, 'קומה 3, חדר 302', '{"שולחן עבודה", "כיסא ארגונומי", "תאורה מתכווננת"}', '{"עבודה", "שקט", "מיקוד"}', '{}', '#F59E0B', false, true, 30, 30, 120, 1, true),
('550e8400-e29b-41d4-a716-446655440005', 'פינת רגיעה', 'חדר רגיעה ונוחות לזמן הפסקה', 8, 'קומה 1, חדר 102', '{"ספות נוחות", "משחקי שולחן", "ספרים", "קפה"}', '{"הפסקה", "רגיעה", "נוחות"}', '{}', '#EF4444', false, true, 30, 30, 60, 1, true),
('550e8400-e29b-41d4-a716-446655440006', 'חדר ועדות', 'חדר ישיבות רשמי לוועדות ופגישות חשובות', 8, 'קומה 2, חדר 202', '{"שולחן ישיבות", "מסך 55 אינץ", "מערכת שמע", "מצלמה"}', '{"ועדות", "ישיבות", "רשמי"}', '{}', '#6B7280', true, true, 60, 120, 480, 48, true)
ON CONFLICT (id) DO NOTHING;

-- 3. Create a test user profile (this will be created automatically when user signs up)
-- But we can create some sample data for testing

-- Note: You'll need to create users through the Supabase Auth UI or through the app
-- The profiles will be created automatically when users sign up

-- 4. Create some sample bookings (only if users exist)
-- INSERT INTO bookings (user_id, room_id, title, description, start_time, end_time, status) VALUES
-- ('user-id-here', '550e8400-e29b-41d4-a716-446655440001', 'ישיבת מנהלים שבועית', 'ישיבת מנהלים שבועית לסקירת פעילות השבוע', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day' + INTERVAL '2 hours', 'approved');

-- 5. Create a function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, email, role)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'display_name', new.email), new.email, 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create trigger to automatically create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 7. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON bookings(start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_sAtatus ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_rooms_active ON rooms(active);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 9. Create Storage bucket for room images
INSERT INTO storage.buckets (id, name, public) VALUES ('room-images', 'room-images', true);

-- 10. Create storage policies
CREATE POLICY "Public read access for room images" ON storage.objects FOR SELECT USING (bucket_id = 'room-images');
CREATE POLICY "Authenticated users can upload room images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'room-images' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update room images" ON storage.objects FOR UPDATE USING (bucket_id = 'room-images' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete room images" ON storage.objects FOR DELETE USING (bucket_id = 'room-images' AND auth.role() = 'authenticated');

-- Success message
SELECT 'Database setup completed successfully! You can now use the application.' as message;
