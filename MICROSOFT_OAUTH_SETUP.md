# 🔐 הגדרת Microsoft/Outlook OAuth בחינם

## שלב 1: יצירת Microsoft OAuth App

### 1.1 היכנס ל-Microsoft Azure Portal
1. לך ל-[Azure Portal](https://portal.azure.com/)
2. התחבר עם חשבון Microsoft שלך
3. לחץ על "Azure Active Directory" או "Microsoft Entra ID"

### 1.2 צור App Registration
1. לך ל-App registrations
2. לחץ על "New registration"
3. תן שם לפרויקט (למשל: "Workspace Booking App")
4. בחר "Accounts in any organizational directory and personal Microsoft accounts"
5. ב-Redirect URI בחר "Web" והוסף:
   ```
   http://localhost:3001/auth/callback
   ```

### 1.3 העתק את המפתחות
- **Application (client) ID** - תצטרך את זה
- **Directory (tenant) ID** - תצטרך את זה

### 1.4 צור Client Secret
1. לך ל-Certificates & secrets
2. לחץ על "New client secret"
3. תן תיאור (למשל: "App Secret")
4. בחר תוקף (12 months)
5. לחץ "Add"
6. **העתק את הערך מיד!** (לא תוכל לראות אותו שוב)

### 1.5 הגדר API Permissions
1. לך ל-API permissions
2. לחץ על "Add a permission"
3. בחר "Microsoft Graph"
4. בחר "Delegated permissions"
5. הוסף:
   - `openid`
   - `profile`
   - `email`
   - `User.Read`
6. לחץ "Add permissions"

## שלב 2: הגדרת Supabase

### 2.1 היכנס ל-Supabase Dashboard
1. לך ל-[Supabase Dashboard](https://supabase.com/dashboard)
2. בחר את הפרויקט שלך
3. לך ל-Authentication > Providers

### 2.2 הפעל Azure Provider
1. מצא את "Azure" ברשימת ה-Providers
2. לחץ על "Enable"
3. הזן את:
   - **Client ID** (Application ID מ-Azure)
   - **Client Secret** (מה-Azure)
   - **Tenant ID** (Directory ID מ-Azure)
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
3. לחץ על "התחבר עם Microsoft"
4. אמור לעבוד!

## 🆓 עלויות

- **Microsoft OAuth**: חינם עד 100,000 בקשות בחודש
- **Supabase**: חינם עד 50,000 משתמשים פעילים
- **הכל בחינם!** 🎉

## 🔧 פתרון בעיות

### שגיאה: "AADSTS50011: The reply URL specified in the request does not match"
- ודא שה-Redirect URI ב-Azure Portal תואם לזה שב-Supabase
- ודא שהפורט נכון (3001 במקום 3000)

### שגיאה: "AADSTS7000215: Invalid client secret"
- ודא שה-Client Secret נכון
- אם פג תוקף, צור חדש

### שגיאה: "AADSTS65001: The user or administrator has not consented"
- ודא שה-API Permissions מוגדרים נכון
- נסה להתחבר עם חשבון admin

## 📝 הערות חשובות

- **Microsoft OAuth** עובד עם כל חשבונות Microsoft (Outlook, Hotmail, Office 365)
- **Tenant ID** יכול להיות "common" לכל המשתמשים
- **Client Secret** פג תוקף אחרי 12 חודשים - תצטרך ליצור חדש
