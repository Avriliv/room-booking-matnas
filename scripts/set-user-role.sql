-- סקריפט להגדרת תפקידים למשתמשים
-- הרץ את הסקריפט הזה ב-Supabase SQL Editor

-- 1. הגדרת משתמש כמנהל מערכת
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-admin@email.com';

-- 2. הגדרת משתמש כעורך
UPDATE profiles 
SET role = 'editor' 
WHERE email = 'your-editor@email.com';

-- 3. הגדרת משתמש כמשתמש רגיל
UPDATE profiles 
SET role = 'user' 
WHERE email = 'your-user@email.com';

-- 4. בדיקת התפקידים
SELECT email, display_name, role, active 
FROM profiles 
ORDER BY role, display_name;

-- 5. יצירת משתמש מנהל ראשון (אם אין)
-- החלף את הפרטים שלך:
INSERT INTO profiles (id, display_name, email, job_title, phone, role, active)
VALUES (
  'your-user-id-here', -- ID של המשתמש מ-Supabase Auth
  'מנהל מערכת',
  'admin@example.com',
  'מנהל מערכת',
  '050-1234567',
  'admin',
  true
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  display_name = 'מנהל מערכת',
  job_title = 'מנהל מערכת';
