# 🔐 הגדרת Google OAuth בחינם

## שלב 1: יצירת Google OAuth App

### 1.1 היכנס ל-Google Cloud Console
1. לך ל-[Google Cloud Console](https://console.cloud.google.com/)
2. התחבר עם חשבון Google שלך
3. צור פרויקט חדש או בחר פרויקט קיים

### 1.2 הפעל את Google+ API
1. לך ל-APIs & Services > Library
2. חפש "Google+ API" או "Google Identity"
3. לחץ על "Enable"

### 1.3 צור OAuth 2.0 Credentials
1. לך ל-APIs & Services > Credentials
2. לחץ על "Create Credentials" > "OAuth 2.0 Client IDs"
3. בחר "Web application"
4. תן שם לפרויקט (למשל: "Workspace Booking App")

### 1.4 הגדר Authorized Redirect URIs
הוסף את הכתובות הבאות:
```
http://localhost:3000/auth/callback
http://localhost:3001/auth/callback
http://localhost:3002/auth/callback
https://your-domain.com/auth/callback
```

### 1.5 העתק את המפתחות
- **Client ID** - תצטרך את זה
- **Client Secret** - תצטרך את זה

## שלב 2: הגדרת Supabase

### 2.1 היכנס ל-Supabase Dashboard
1. לך ל-[Supabase Dashboard](https://supabase.com/dashboard)
2. בחר את הפרויקט שלך
3. לך ל-Authentication > Providers

### 2.2 הפעל Google Provider
1. מצא את "Google" ברשימת ה-Providers
2. לחץ על "Enable"
3. הזן את:
   - **Client ID** (מה-Google Cloud Console)
   - **Client Secret** (מה-Google Cloud Console)
4. שמור

### 2.3 הגדר Redirect URLs
הוסף את הכתובות הבאות:
```
http://localhost:3000/auth/callback
http://localhost:3001/auth/callback
http://localhost:3002/auth/callback
https://your-domain.com/auth/callback
```

## שלב 3: בדיקה

1. הרץ את האפליקציה: `npm run dev`
2. לך ל-http://localhost:3001/auth/login
3. לחץ על "התחבר עם Google"
4. אמור לעבוד!

## 🆓 עלויות

- **Google OAuth**: חינם עד 100,000 בקשות בחודש
- **Supabase**: חינם עד 50,000 משתמשים פעילים
- **הכל בחינם!** 🎉

## 🔧 פתרון בעיות

### שגיאה: "redirect_uri_mismatch"
- ודא שה-Redirect URI ב-Google Cloud Console תואם לזה שב-Supabase
- ודא שהפורט נכון (3001 במקום 3000)

### שגיאה: "invalid_client"
- ודא שה-Client ID וה-Client Secret נכונים
- ודא שה-Google+ API מופעל

### שגיאה: "access_denied"
- ודא שה-Google OAuth App מוגדר נכון
- בדוק שה-Authorized domains נכונים
