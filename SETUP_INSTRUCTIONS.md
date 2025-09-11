# 🚀 הוראות הגדרת האפליקציה

## שלב 1: הגדרת סביבה

### 1.1 יצירת קובץ `.env.local`

צור קובץ `.env.local` בתיקיית השורש של הפרויקט עם התוכן הבא:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3001
NODE_ENV=development
```

### 1.2 הגדרת OAuth Providers (אופציונלי)

האפליקציה תומכת בהתחברות עם:
- **Google** - חינם עד 100,000 בקשות בחודש
- **Microsoft/Outlook** - חינם עד 100,000 בקשות בחודש

**מדריכי הגדרה:**
- [הגדרת Google OAuth](GOOGLE_OAUTH_SETUP.md)
- [הגדרת Microsoft OAuth](MICROSOFT_OAUTH_SETUP.md)

### 1.3 קבלת מפתחות Supabase

1. היכנס ל-[Supabase Dashboard](https://supabase.com/dashboard)
2. בחר את הפרויקט שלך
3. לך ל-Settings > API
4. העתק את:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

### 1.4 הרצת מסד הנתונים

1. לך ל-SQL Editor ב-Supabase
2. העתק והרץ את התוכן של `setup_database.sql`
3. ודא שהסקריפט רץ בהצלחה

### 1.4 התקנת תלויות

```bash
npm install
```

### 1.5 הרצת האפליקציה

```bash
npm run dev
```

האפליקציה תהיה זמינה ב-http://localhost:3000

## שלב 2: השלמת אימות (השלב הבא)

לאחר השלמת שלב 1, נמשיך ליצירת דפי האימות.

## שלב 3: הגדרת תפקידים

### 3.1 הגדרת מנהל מערכת ראשון

1. היכנס ל-Supabase Dashboard
2. לך ל-SQL Editor
3. הרץ את הסקריפט `scripts/set-user-role.sql`
4. החלף את הפרטים שלך:
   - `your-admin@email.com` → האימייל שלך
   - `your-user-id-here` → ה-ID שלך מ-Supabase Auth

### 3.2 הגדרת תפקידים דרך האפליקציה

1. התחבר כמנהל מערכת
2. לך ל-`/admin/roles`
3. שנה תפקידים למשתמשים
4. הפעל/השבת משתמשים

## שלב 4: בדיקת הפונקציונליות

1. **התחברות** - בדוק שההתחברות עובדת
2. **יצירת הזמנה** - בדוק שיצירת הזמנות עובדת
3. **ניהול משתמשים** - בדוק שניתן לנהל משתמשים
4. **הרשאות** - בדוק שההרשאות עובדות נכון
