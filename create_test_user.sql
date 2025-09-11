-- Create a test user for workspace-booking
-- Run this in Supabase SQL Editor

-- This will create a user in the auth.users table
-- Note: You'll need to set a password for this user in the Supabase Dashboard

-- First, let's create a user in auth.users (this needs to be done through Supabase Dashboard or API)
-- But we can prepare the profile data

-- Create a test profile (this will be linked to a user when they sign up)
-- The profile will be created automatically by the trigger when a user signs up

-- If you want to create a user manually, go to:
-- 1. Supabase Dashboard > Authentication > Users
-- 2. Click "Add user"
-- 3. Enter email: test@example.com
-- 4. Enter password: password123
-- 5. Click "Create user"

-- The profile will be created automatically by the trigger

-- Or you can use the app to sign up:
-- 1. Go to http://localhost:3000
-- 2. Click "אין לך חשבון? הרשם כאן"
-- 3. Enter email and password
-- 4. The profile will be created automatically

-- To create an admin user, after creating the user, run:
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';

-- Success message
SELECT 'Test user setup instructions completed! Use the Supabase Dashboard or the app to create a user.' as message;


