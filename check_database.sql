-- Check what tables exist in the database
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'rooms', 'bookings')
ORDER BY table_name;

-- Check if bookings table has the right structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND table_schema = 'public'
ORDER BY ordinal_position;
