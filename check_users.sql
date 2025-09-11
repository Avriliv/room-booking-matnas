-- Check if users exist in auth.users table
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC;

-- Check if profiles exist
SELECT id, email, display_name, role 
FROM profiles 
ORDER BY created_at DESC;
