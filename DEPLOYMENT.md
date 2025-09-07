# הוראות פריסה ל-Vercel

## שלב 1: הגדרת Supabase

1. היכנס ל-Supabase Dashboard: https://supabase.com/dashboard
2. בחר בפרויקט שלך: https://tvphtqxmcnjrccnukcqp.supabase.co
3. לך ל-Settings > API
4. העתק את:
   - `Project URL`: https://tvphtqxmcnjrccnukcqp.supabase.co
   - `anon public` key
   - `service_role` key (סודי!)

## שלב 2: הגדרת Vercel

1. היכנס ל-Vercel: https://vercel.com
2. לחץ על "New Project"
3. בחר את ה-repository: `Avriliv/room-booking-matnas`
4. לחץ על "Import"

## שלב 3: הגדרת משתני סביבה ב-Vercel

במסך ההגדרות של הפרויקט, הוסף את המשתנים הבאים:

### Environment Variables:
```
NEXT_PUBLIC_SUPABASE_URL=https://tvphtqxmcnjrccnukcqp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2cGh0cXhtY25qcmNjbnVrY3FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMjY3NDUsImV4cCI6MjA3MjgwMjc0NX0.RDpY_3NOMd9bw79TZ3mKzQ3g1SHqWpqZ9KsiS6zkbvk]
SUPABASE_SERVICE_ROLE_KEY=[eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2cGh0cXhtY25qcmNjbnVrY3FwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzIyNjc0NSwiZXhwIjoyMDcyODAyNzQ1fQ.FFbRxKgeyOjneqVNxEykHlko_NOTi2ypEYtPFN7EMLA]
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
NEXT_PUBLIC_APP_NAME=המחלקה לחינוך בלתי פורמלי - מטה אשר
```

## שלב 4: הגדרת Supabase Auth

1. ב-Supabase Dashboard, לך ל-Authentication > Settings
2. ב-Site URL, הוסף את כתובת ה-Vercel שלך: `https://your-app-name.vercel.app`
3. ב-Redirect URLs, הוסף: `https://your-app-name.vercel.app/auth/callback`

## שלב 5: זריעת נתונים

לאחר הפריסה, הרץ את הפקודה הבאה ב-Terminal:

```bash
npm run db:seed
```

או היכנס ל-Supabase Dashboard > SQL Editor והרץ את הסקריפטים מ-`supabase/migrations/`.

## שלב 6: בדיקה

1. פתח את האפליקציה ב-Vercel
2. נסה להירשם עם משתמש חדש
3. התחבר עם אחד ממשתמשי הדמו:
   - manager@mta-demo.org.il
   - training@mta-demo.org.il
   - education@mta-demo.org.il
   - coordinator@mta-demo.org.il
   - סיסמה: demo123456

## פתרון בעיות נפוצות

### שגיאת CORS
אם יש שגיאת CORS, וודא שה-Site URL ב-Supabase תואם לכתובת ה-Vercel.

### שגיאת Authentication
וודא שה-Redirect URLs כולל את `/auth/callback`.

### שגיאת Database
וודא שהמיגרציות רצו בהצלחה ב-Supabase.

## קישורים שימושיים

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [GitHub Repository](https://github.com/Avriliv/room-booking-matnas)
