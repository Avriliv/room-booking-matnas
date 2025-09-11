-- Fix admin role for avrimatnas@gmail.com
-- First, make sure the user exists in auth.users
-- If not, you'll need to create it through the app or Supabase dashboard

-- Update the profile to be admin
UPDATE profiles 
SET 
  role = 'admin',
  active = true,
  updated_at = NOW()
WHERE email = 'avrimatnas@gmail.com';

-- If the profile doesn't exist, create it
INSERT INTO profiles (id, email, display_name, role, active, created_at, updated_at)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'display_name', 'מנהל מערכת'),
  'admin',
  true,
  NOW(),
  NOW()
FROM auth.users u
WHERE u.email = 'avrimatnas@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM profiles p WHERE p.email = 'avrimatnas@gmail.com'
);

-- Verify the result
SELECT 
  p.email,
  p.display_name,
  p.role,
  p.active
FROM profiles p
WHERE p.email = 'avrimatnas@gmail.com';
