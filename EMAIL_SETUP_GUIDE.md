# 📧 מדריך להפעלת התראות מייל

## 🔍 **מצב נוכחי:**

### ✅ **מה שעובד:**
- **פונקציות מייל קיימות** - `notifyAdminNewBooking()` ו-`notifyUserBookingStatus()`
- **הפעלת מיילים** - הופעל בקוד (היה מושבת זמנית)
- **לוגים בקונסול** - רואים מתי מיילים אמורים להישלח

### ⚠️ **מה שחסר:**
- **שירות מייל אמיתי** - כרגע רק מדפיס לוגים
- **הגדרות סביבה** - אין API keys לשירותי מייל

## 📋 **מה קורה כרגע כשמתבצעת הזמנה:**

### **1. הזמנה חדשה:**
```
📧 Sending email notification for pending booking: [booking-id]
📧 Email Notification: {
  to: "admin@example.com",
  subject: "הזמנה חדשה ממתינה לאישור - חדר ישיבות",
  html: "[HTML content]"
}
✅ Email would be sent to: admin@example.com
📧 Subject: הזמנה חדשה ממתינה לאישור - חדר ישיבות
```

### **2. עדכון סטטוס הזמנה:**
```
📧 Sent booking status notification to user: user@example.com
✅ Email would be sent to: user@example.com
📧 Subject: הזמנתך אושרה - חדר ישיבות
```

## 🛠️ **איך להפעיל מיילים אמיתיים:**

### **אפשרות 1: Resend (מומלץ)**
```bash
# התקן Resend
npm install resend

# הוסף ל-.env.local
RESEND_API_KEY=re_xxxxxxxxx
```

```typescript
// עדכן את src/lib/email.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmailNotification(notification: EmailNotification) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'noreply@yourdomain.com',
      to: notification.to,
      subject: notification.subject,
      html: notification.html,
    })

    if (error) {
      console.error('Error sending email:', error)
      return { success: false, error }
    }

    console.log('✅ Email sent successfully:', data)
    return { success: true }
  } catch (error) {
    console.error('Error sending email notification:', error)
    return { success: false, error }
  }
}
```

### **אפשרות 2: SendGrid**
```bash
# התקן SendGrid
npm install @sendgrid/mail

# הוסף ל-.env.local
SENDGRID_API_KEY=SG.xxxxxxxxx
```

### **אפשרות 3: Nodemailer (SMTP)**
```bash
# התקן Nodemailer
npm install nodemailer

# הוסף ל-.env.local
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 🧪 **איך לבדוק שהמיילים עובדים:**

### **1. בדיקה מקומית:**
```bash
# הרץ את האפליקציה
npm run dev

# פתח את הקונסול בדפדפן
# צור הזמנה חדשה
# בדוק שהלוגים מופיעים בקונסול
```

### **2. בדיקה עם שירות מייל:**
```bash
# הוסף את ה-API key
# צור הזמנה חדשה
# בדוק שהמייל הגיע לתיבת הדואר
```

## 📊 **מה יקרה כשתפעיל מיילים:**

### **למנהלים:**
- 📧 **מייל על כל הזמנה חדשה** שדורשת אישור
- 📧 **פרטי ההזמנה המלאים** (חלל, תאריך, שעה, מזמין)
- 🔗 **קישור ישיר** לדף האישורים

### **למשתמשים:**
- 📧 **מייל אישור** כשהזמנה מאושרת
- 📧 **מייל דחייה** כשהזמנה נדחית
- 📧 **פרטי ההזמנה** וסיבת הדחייה (אם רלוונטי)

## ⚙️ **הגדרות נוספות:**

### **1. הוספת משתני סביבה:**
```env
# .env.local
NEXT_PUBLIC_APP_URL=http://localhost:3000
RESEND_API_KEY=re_xxxxxxxxx
```

### **2. עדכון כתובות מייל:**
```typescript
// בקובץ src/lib/email.ts
const subject = `הזמנה חדשה ממתינה לאישור - ${booking.room?.name || 'חלל לא ידוע'}`

// עדכן את הכתובת
const html = `
  <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/approvals">
    לבדיקת ההזמנה
  </a>
`
```

## 🚨 **נקודות חשובות:**

### **לפני ייצור:**
1. ✅ בחר שירות מייל (Resend מומלץ)
2. ✅ הוסף API key
3. ✅ בדוק שהמיילים מגיעים
4. ✅ עדכן את כתובת האתר

### **אבטחה:**
- 🔒 **אל תחשוף API keys** בקוד
- 🔒 **השתמש ב-.env.local** למשתני סביבה
- 🔒 **הוסף את .env.local ל-.gitignore**

---

**📧 המיילים מוכנים לעבודה - רק צריך להוסיף שירות מייל אמיתי!**
