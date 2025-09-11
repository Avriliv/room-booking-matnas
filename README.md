# הזמנת חללי עבודה - המחלקה לחינוך בלתי פורמלי מטה אשר

מערכת מלאה להזמנת חללי עבודה פנימית עבור המחלקה לחינוך בלתי פורמלי מטה אשר.

## תכונות עיקריות

- 🏢 **ניהול חללים** - הוספה, עריכה ומחיקה של חללי עבודה
- 📅 **לוח שנה מתקדם** - תצוגות יום, שבוע וחודש עם drag & drop
- 🔐 **מערכת אימות** - כניסה מאובטחת עם אימייל וסיסמה
- 👥 **ניהול משתמשים** - הרשאות admin, editor, user
- ✅ **מערכת אישורים** - הזמנות דורשות אישור מנהל
- 📧 **התראות מייל** - הודעות אוטומטיות על הזמנות
- 📱 **רספונסיבי** - עובד מושלם על נייד, טאבלט ודסקטופ
- 🌐 **RTL מלא** - תמיכה מלאה בעברית וכיוון ימין-שמאל

## טכנולוגיות

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod
- **Dates**: date-fns

## התקנה

### דרישות מוקדמות

- Node.js 18+ 
- npm או yarn
- חשבון Supabase
- חשבון Vercel (לפריסה)

### שלב 1: שכפול הפרויקט

```bash
git clone <repository-url>
cd workspace-booking
npm install
```

### שלב 2: הגדרת Supabase

1. צור פרויקט חדש ב-Supabase
2. העתק את ה-URL וה-Anon Key
3. צור קובץ `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### שלב 3: הגדרת מסד הנתונים

1. הפעל את Supabase CLI:
```bash
npm install -g supabase
supabase login
supabase init
```

2. הפעל את המיגרציות:
```bash
supabase db reset
```

3. הפעל את סקריפט הזריעה:
```bash
npm run db:seed
```

### שלב 4: הרצת הפרויקט

```bash
npm run dev
```

הפרויקט יהיה זמין ב-http://localhost:3000

## משתמשי דמו

המערכת מגיעה עם משתמשי דמו מוכנים:

### מנהלים (Admin)
- **manager@mta-demo.org.il** - מנהל ראשי
- **training@mta-demo.org.il** - מנהל הדרכה  
- **education@mta-demo.org.il** - מנהלת חינוך
- **coordinator@mta-demo.org.il** - רכזת שליחות

### משתמשים רגילים
- **yossi@mta-demo.org.il** - רכז הדרכה
- **sara@mta-demo.org.il** - מנהלת פרויקטים
- **david@mta-demo.org.il** - רכז קהילה
- **michal@mta-demo.org.il** - מנהלת תוכן

**סיסמה לכל המשתמשים**: `demo123456`

## חללי עבודה

המערכת מגיעה עם 6 חללי עבודה מוכנים:

1. **חדר ישיבות מנהלים** (12 מקומות) - דורש אישור
2. **סטודיו הדרכה** (25 מקומות) - זמין מיידית
3. **עמדת עבודה שקטה A** (4 מקומות) - זמין מיידית
4. **עמדת עבודה שקטה B** (6 מקומות) - זמין מיידית
5. **פינת רגיעה** (8 מקומות) - זמין מיידית
6. **חדר ועדות** (8 מקומות) - דורש אישור

## מבנה הפרויקט

```
src/
├── app/                    # עמודים (App Router)
│   ├── dashboard/          # דשבורד ראשי
│   ├── calendar/           # לוח שנה
│   ├── rooms/              # חללים
│   ├── my-bookings/        # הזמנות שלי
│   ├── profile/            # פרופיל אישי
│   └── admin/              # עמודי ניהול
├── components/             # קומפוננטים
│   ├── auth/               # אימות
│   ├── calendar/           # לוח שנה
│   ├── booking/            # הזמנות
│   ├── layout/             # פריסה
│   └── ui/                 # קומפוננטים בסיסיים
├── lib/                    # ספריות עזר
├── types/                  # טיפוסי TypeScript
└── hooks/                  # React Hooks
```

## סקריפטים

```bash
npm run dev          # הרצה בפיתוח
npm run build        # בנייה לפרודקשן
npm run start        # הרצה בפרודקשן
npm run db:seed      # זריעת נתוני דמו
npm run db:reset     # איפוס מסד נתונים
```

## פריסה ל-Vercel

1. חבר את הפרויקט ל-GitHub
2. התחבר ל-Vercel
3. בחר את הפרויקט
4. הוסף את משתני הסביבה
5. פרוס!

## הגדרות RLS

המערכת משתמשת ב-Row Level Security של Supabase:

- **profiles**: משתמשים יכולים לערוך רק את הפרופיל שלהם
- **rooms**: כולם יכולים לקרוא, רק admin יכול לכתוב
- **bookings**: משתמשים יכולים לנהל רק את ההזמנות שלהם
- **audit_log**: רק admin יכול לראות

## תמיכה

לשאלות או בעיות, פנה למנהל המערכת.

## רישיון

© 2025 Avrili. כל הזכויות שמורות.

פרויקט פנימי - המחלקה לחינוך בלתי פורמלי מטה אשר.