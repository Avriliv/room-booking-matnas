-- סקריפט פשוט להגדרת עצמך כמנהל מערכת
-- הרץ את הסקריפט הזה ב-Supabase SQL Editor

-- 1. בדוק איזה משתמשים יש במערכת
SELECT id, email, display_name, role, active 
FROM profiles 
ORDER BY created_at DESC;

-- 2. הגדרת עצמך כמנהל מערכת
-- החלף את האימייל שלך כאן:
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'YOUR_EMAIL_HERE'; -- החלף באימייל שלך

-- 3. בדיקה שהתפקיד השתנה
SELECT email, display_name, role, active 
FROM profiles 
WHERE email = 'YOUR_EMAIL_HERE';

-- 4. אם אין לך רשומה ב-profiles, צור אחת:
-- (החלף את הפרטים שלך - השתמש ב-ID אמיתי מ-Supabase Auth)
INSERT INTO profiles (id, display_name, email, job_title, phone, role, active)
VALUES (
  '00000000-0000-0000-0000-000000000000', -- החלף ב-ID אמיתי
  'מנהל מערכת',
  'YOUR_EMAIL_HERE', -- החלף באימייל שלך
  'מנהל מערכת',
  '050-1234567',
  'admin',
  true
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  display_name = 'מנהל מערכת',
  job_title = 'מנהל מערכת';
