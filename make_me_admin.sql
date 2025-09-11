-- Make avrimatnas@gmail.com an admin
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'avrimatnas@gmail.com';

-- Check the result
SELECT email, display_name, role 
FROM profiles 
WHERE email = 'avrimatnas@gmail.com';
