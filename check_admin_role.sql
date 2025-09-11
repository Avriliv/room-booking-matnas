-- Check if avrimatnas@gmail.com is properly set as admin
SELECT 
  p.email,
  p.display_name,
  p.role,
  p.active,
  p.created_at
FROM profiles p
WHERE p.email = 'avrimatnas@gmail.com';

-- Also check if there's a user in auth.users
SELECT 
  u.email,
  u.email_confirmed_at,
  u.created_at
FROM auth.users u
WHERE u.email = 'avrimatnas@gmail.com';
