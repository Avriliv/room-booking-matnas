# 🚨 תיקון מהיר - בעיית אימות

## 🔍 **הבעיה:**
המשתמש מבקש התחברות כל הזמן גם אחרי שהתחבר.

## 🛠️ **התיקון המיידי:**

### **1. הרץ את ה-RLS Policies ב-Supabase:**
```sql
-- לך ל-Supabase Dashboard → SQL Editor
-- והרץ את הקוד הבא:

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can manage all bookings" ON bookings;
DROP POLICY IF EXISTS "Enable read access for all users" ON bookings;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON bookings;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON bookings;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON bookings;
DROP POLICY IF EXISTS "Enable all access for admins" ON bookings;

-- Create new policies
CREATE POLICY "Users can view own bookings" ON bookings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all bookings" ON bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'editor')
        )
    );

CREATE POLICY "Users can create bookings" ON bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings" ON bookings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can update all bookings" ON bookings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'editor')
        )
    );

CREATE POLICY "Users can delete own bookings" ON bookings
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete all bookings" ON bookings
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'editor')
        )
    );
```

### **2. בדוק את ה-Allowed URLs ב-Supabase:**
1. לך ל-Supabase Dashboard
2. Authentication → URL Configuration
3. הוסף בדיוק: `https://room-booking-matnas-jwl3.vercel.app`
4. הוסף גם: `http://localhost:3000` (לפיתוח)

### **3. בדוק את ה-Environment Variables ב-Vercel:**
1. לך ל-Vercel Dashboard
2. Project Settings → Environment Variables
3. וודא שיש:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### **4. בדוק בדפדפן:**
1. פתח את http://localhost:3000
2. פתח את DevTools → Console
3. תראה את ה-Auth Debug box בפינה הימנית העליונה
4. בדוק מה כתוב שם

### **5. אם עדיין לא עובד:**
1. נקה את ה-localStorage: `localStorage.clear()`
2. נקה את ה-cookies
3. רענן את הדף
4. נסה להתחבר שוב

## 🔍 **מה לבדוק:**

### **ב-Console:**
```
[AUTH] Getting user...
[AUTH] User found, fetching profile...
[AUTH] Profile loaded successfully
```

### **ב-Auth Debug Box:**
```json
{
  "session": {
    "exists": true,
    "user_id": "some-uuid",
    "access_token": "present"
  },
  "user": {
    "exists": true,
    "id": "some-uuid"
  },
  "profile": {
    "exists": true,
    "role": "admin"
  }
}
```

## 🚨 **אם עדיין לא עובד:**

1. **בדוק את ה-Supabase logs** - Authentication → Logs
2. **בדוק את ה-Network tab** - איזה בקשות נכשלות
3. **בדוק את ה-Console** - איזה שגיאות יש

---

**🎯 הסיבה הסבירה ביותר: RLS policies לא נכונות!**
