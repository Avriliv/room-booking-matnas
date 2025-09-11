// Email notification system for workspace booking
import { supabaseAdmin } from './supabase-admin'

interface EmailNotification {
  to: string
  subject: string
  html: string
  text: string
}

export async function sendEmailNotification(notification: EmailNotification) {
  try {
    // For now, we'll just log the email to console
    // In production, you would integrate with an email service like:
    // - SendGrid
    // - Resend
    // - AWS SES
    // - Nodemailer with SMTP
    
    console.log('📧 Email Notification:', {
      to: notification.to,
      subject: notification.subject,
      html: notification.html
    })
    
    // TODO: Implement actual email sending
    // Example with Resend:
    // const response = await fetch('https://api.resend.com/emails', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     from: 'noreply@yourdomain.com',
    //     to: notification.to,
    //     subject: notification.subject,
    //     html: notification.html,
    //   }),
    // })
    
    return { success: true }
  } catch (error) {
    console.error('Error sending email notification:', error)
    return { success: false, error }
  }
}

export async function notifyAdminNewBooking(booking: any) {
  try {
    // Get admin users
    const { data: admins } = await supabaseAdmin
      .from('profiles')
      .select('email, display_name')
      .eq('role', 'admin')
      .eq('active', true)

    if (!admins || admins.length === 0) {
      console.log('No admin users found for notification')
      return
    }

    const bookingDate = new Date(booking.start_time).toLocaleDateString('he-IL')
    const bookingTime = new Date(booking.start_time).toLocaleTimeString('he-IL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })

    const subject = `הזמנה חדשה ממתינה לאישור - ${booking.room?.name || 'חלל לא ידוע'}`
    
    const html = `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">הזמנה חדשה ממתינה לאישור</h2>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1e293b;">פרטי ההזמנה:</h3>
          <p><strong>חלל:</strong> ${booking.room?.name || 'לא צוין'}</p>
          <p><strong>תאריך:</strong> ${bookingDate}</p>
          <p><strong>שעה:</strong> ${bookingTime}</p>
          <p><strong>כותרת:</strong> ${booking.title}</p>
          <p><strong>תיאור:</strong> ${booking.description || 'ללא תיאור'}</p>
          <p><strong>מזמין:</strong> ${booking.user?.display_name || 'לא ידוע'}</p>
          <p><strong>מספר משתתפים:</strong> ${booking.attendee_count || 1}</p>
        </div>
        
        <div style="margin: 20px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/approvals" 
             style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            לבדיקת ההזמנה
          </a>
        </div>
        
        <p style="color: #64748b; font-size: 14px;">
          זהו מייל אוטומטי מהמערכת להזמנת חללי עבודה
        </p>
      </div>
    `

    const text = `
הזמנה חדשה ממתינה לאישור

פרטי ההזמנה:
- חלל: ${booking.room?.name || 'לא צוין'}
- תאריך: ${bookingDate}
- שעה: ${bookingTime}
- כותרת: ${booking.title}
- תיאור: ${booking.description || 'ללא תיאור'}
- מזמין: ${booking.user?.display_name || 'לא ידוע'}
- מספר משתתפים: ${booking.attendee_count || 1}

לבדיקת ההזמנה: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/approvals
    `

    // Send email to all admins
    for (const admin of admins) {
      await sendEmailNotification({
        to: admin.email,
        subject,
        html,
        text
      })
    }

    console.log(`📧 Sent booking notification to ${admins.length} admin(s)`)
  } catch (error) {
    console.error('Error notifying admins of new booking:', error)
  }
}

export async function notifyUserBookingStatus(booking: any, status: 'approved' | 'rejected') {
  try {
    const userEmail = booking.user?.email
    if (!userEmail) {
      console.log('No user email found for notification')
      return
    }

    const bookingDate = new Date(booking.start_time).toLocaleDateString('he-IL')
    const bookingTime = new Date(booking.start_time).toLocaleTimeString('he-IL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })

    const isApproved = status === 'approved'
    const subject = isApproved 
      ? `הזמנתך אושרה - ${booking.room?.name || 'חלל לא ידוע'}`
      : `הזמנתך נדחתה - ${booking.room?.name || 'חלל לא ידוע'}`

    const html = `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${isApproved ? '#059669' : '#dc2626'};">
          ${isApproved ? '✅ הזמנתך אושרה!' : '❌ הזמנתך נדחתה'}
        </h2>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1e293b;">פרטי ההזמנה:</h3>
          <p><strong>חלל:</strong> ${booking.room?.name || 'לא צוין'}</p>
          <p><strong>תאריך:</strong> ${bookingDate}</p>
          <p><strong>שעה:</strong> ${bookingTime}</p>
          <p><strong>כותרת:</strong> ${booking.title}</p>
          ${!isApproved && booking.rejection_reason ? `<p><strong>סיבת הדחייה:</strong> ${booking.rejection_reason}</p>` : ''}
        </div>
        
        ${isApproved ? `
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; color: #166534;">🎉 ההזמנה שלך אושרה בהצלחה! תוכל לראות אותה בלוח הזמנים שלך.</p>
          </div>
        ` : `
          <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; color: #991b1b;">ההזמנה שלך נדחתה. תוכל ליצור הזמנה חדשה או ליצור קשר עם המנהל לפרטים נוספים.</p>
          </div>
        `}
        
        <p style="color: #64748b; font-size: 14px;">
          זהו מייל אוטומטי מהמערכת להזמנת חללי עבודה
        </p>
      </div>
    `

    const text = `
${isApproved ? '✅ הזמנתך אושרה!' : '❌ הזמנתך נדחתה'}

פרטי ההזמנה:
- חלל: ${booking.room?.name || 'לא צוין'}
- תאריך: ${bookingDate}
- שעה: ${bookingTime}
- כותרת: ${booking.title}
${!isApproved && booking.rejection_reason ? `- סיבת הדחייה: ${booking.rejection_reason}` : ''}

${isApproved 
  ? '🎉 ההזמנה שלך אושרה בהצלחה! תוכל לראות אותה בלוח הזמנים שלך.'
  : 'ההזמנה שלך נדחתה. תוכל ליצור הזמנה חדשה או ליצור קשר עם המנהל לפרטים נוספים.'
}
    `

    await sendEmailNotification({
      to: userEmail,
      subject,
      html,
      text
    })

    console.log(`📧 Sent booking status notification to user: ${userEmail}`)
  } catch (error) {
    console.error('Error notifying user of booking status:', error)
  }
}
