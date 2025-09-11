-- Create a test user manually
-- This will create a user in auth.users table

-- First, let's create a user in auth.users
-- Note: This needs to be done through Supabase Dashboard or API
-- Go to Authentication > Users > Add user
-- Email: test@example.com
-- Password: password123

-- Then create the profile
INSERT INTO profiles (id, display_name, email, role, job_title, phone, active)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'משתמש בדיקה',
  'test@example.com',
  'admin',
  'מנהל בדיקה',
  '050-1234567',
  true
) ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  job_title = EXCLUDED.job_title,
  phone = EXCLUDED.phone,
  active = EXCLUDED.active;

-- Success message
SELECT 'Test user created successfully!' as message;