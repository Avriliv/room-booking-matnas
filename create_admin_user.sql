-- Create admin user for avrimatnas@gmail.com
-- This script will create the user in auth.users and profiles table

-- First, check if user exists in auth.users
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  u.created_at
FROM auth.users u
WHERE u.email = 'avrimatnas@gmail.com';

-- If user doesn't exist, you need to create it through Supabase Dashboard
-- Go to Authentication > Users > Add user
-- Email: avrimatnas@gmail.com
-- Password: (choose a password)
-- Auto Confirm User: Yes

-- Then run this to create/update the profile:
INSERT INTO profiles (id, email, display_name, role, active, created_at, updated_at)
SELECT 
  u.id,
  u.email,
  'אברי מנהל מערכת',
  'admin',
  true,
  NOW(),
  NOW()
FROM auth.users u
WHERE u.email = 'avrimatnas@gmail.com'
ON CONFLICT (id) 
DO UPDATE SET
  role = 'admin',
  active = true,
  updated_at = NOW();

-- Verify the result
SELECT 
  p.email,
  p.display_name,
  p.role,
  p.active,
  p.created_at
FROM profiles p
WHERE p.email = 'avrimatnas@gmail.com';
