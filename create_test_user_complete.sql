-- Create complete test user (both auth.users and profiles)
-- This will create a user that can be used for testing bookings

-- First, create the user in auth.users
-- Note: This might need to be done through Supabase Dashboard or API
-- But let's try to create it directly

INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  confirmed_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440007',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'test@example.com',
  '$2a$10$test', -- This is a dummy password hash
  NOW(),
  NULL,
  '',
  NULL,
  '',
  NULL,
  '',
  '',
  NULL,
  NULL,
  '{"provider":"email","providers":["email"]}',
  '{}',
  FALSE,
  NOW(),
  NOW(),
  NULL,
  NULL,
  '',
  '',
  NULL,
  NOW(),
  '',
  0,
  NULL,
  '',
  NULL,
  FALSE,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Now create the profile
INSERT INTO profiles (id, email, display_name, role, active, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440007',
  'test@example.com',
  'משתמש בדיקה',
  'user',
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) 
DO UPDATE SET
  email = EXCLUDED.email,
  display_name = EXCLUDED.display_name,
  role = EXCLUDED.role,
  active = EXCLUDED.active,
  updated_at = NOW();

-- Verify both tables
SELECT 'auth.users' as table_name, id, email, created_at FROM auth.users WHERE id = '550e8400-e29b-41d4-a716-446655440007'
UNION ALL
SELECT 'profiles' as table_name, id, email, created_at FROM profiles WHERE id = '550e8400-e29b-41d4-a716-446655440007';
