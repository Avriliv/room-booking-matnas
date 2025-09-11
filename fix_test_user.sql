-- Fix test user profile
-- The user exists in auth.users but not in profiles table

-- First, check if user exists in auth.users
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  u.created_at
FROM auth.users u
WHERE u.id = '550e8400-e29b-41d4-a716-446655440007';

-- Create profile for existing user
INSERT INTO profiles (id, email, display_name, role, active, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440007',
  'test@example.com',
  'משתמש בדיקה',
  'user',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) 
DO UPDATE SET
  email = EXCLUDED.email,
  display_name = EXCLUDED.display_name,
  role = EXCLUDED.role,
  active = EXCLUDED.active,
  updated_at = NOW();

-- Verify the result
SELECT 
  p.id,
  p.email,
  p.display_name,
  p.role,
  p.active
FROM profiles p
WHERE p.id = '550e8400-e29b-41d4-a716-446655440007';
