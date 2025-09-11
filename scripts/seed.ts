import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function seedDatabase() {
  console.log('🌱 Starting database seed...')

  try {
    // 1. Create demo users
    console.log('👥 Creating demo users...')
    
    const demoUsers = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        display_name: 'מנהל ראשי',
        email: 'manager@mta-demo.org.il',
        role: 'admin' as const,
        job_title: 'מנהל ראשי',
        phone: '050-1234567',
        active: true
      },
      {
        id: '00000000-0000-0000-0000-000000000002',
        display_name: 'מנהל הדרכה',
        email: 'training@mta-demo.org.il',
        role: 'admin' as const,
        job_title: 'מנהל הדרכה',
        phone: '050-1234568',
        active: true
      },
      {
        id: '00000000-0000-0000-0000-000000000003',
        display_name: 'מנהלת חינוך',
        email: 'education@mta-demo.org.il',
        role: 'admin' as const,
        job_title: 'מנהלת חינוך',
        phone: '050-1234569',
        active: true
      },
      {
        id: '00000000-0000-0000-0000-000000000004',
        display_name: 'רכזת שליחות',
        email: 'coordinator@mta-demo.org.il',
        role: 'admin' as const,
        job_title: 'רכזת שליחות',
        phone: '050-1234570',
        active: true
      },
      {
        id: '00000000-0000-0000-0000-000000000005',
        display_name: 'יוסי כהן',
        email: 'yossi@mta-demo.org.il',
        role: 'user' as const,
        job_title: 'רכז הדרכה',
        phone: '050-1234571',
        active: true
      },
      {
        id: '00000000-0000-0000-0000-000000000006',
        display_name: 'שרה לוי',
        email: 'sara@mta-demo.org.il',
        role: 'user' as const,
        job_title: 'מנהלת פרויקטים',
        phone: '050-1234572',
        active: true
      },
      {
        id: '00000000-0000-0000-0000-000000000007',
        display_name: 'דוד ישראלי',
        email: 'david@mta-demo.org.il',
        role: 'user' as const,
        job_title: 'רכז קהילה',
        phone: '050-1234573',
        active: true
      },
      {
        id: '00000000-0000-0000-0000-000000000008',
        display_name: 'מיכל רוזן',
        email: 'michal@mta-demo.org.il',
        role: 'user' as const,
        job_title: 'מנהלת תוכן',
        phone: '050-1234574',
        active: true
      }
    ]

    for (const user of demoUsers) {
      const { error } = await supabase
        .from('profiles')
        .upsert(user, { onConflict: 'id' })
      
      if (error) {
        console.error(`Error creating user ${user.email}:`, error)
      } else {
        console.log(`✅ Created user: ${user.email}`)
      }
    }

    // 2. Create demo rooms
    console.log('🏢 Creating demo rooms...')
    
    const demoRooms = [
      {
        id: 'room-001',
        name: 'חדר ישיבות מנהלים',
        description: 'חדר ישיבות מפואר עם ציוד מתקדם לניהול ישיבות',
        capacity: 12,
        location: 'קומה 2, חדר 201',
        equipment: ['מסך 65 אינץ', 'מערכת שמע', 'לוח חכם', 'מחשב נייד'],
        tags: ['ישיבות', 'מנהלים', 'פגישות'],
        images: [],
        color: '#3B82F6',
        requires_approval: true,
        cancellation_hours: 24,
        active: true
      },
      {
        id: 'room-002',
        name: 'סטודיו הדרכה',
        description: 'חדר הדרכה גדול עם ציוד אודיו-ויזואלי מתקדם',
        capacity: 25,
        location: 'קומה 1, חדר 101',
        equipment: ['מסך 75 אינץ', 'מערכת שמע', 'מיקרופון אלחוטי', 'מצלמה'],
        tags: ['הדרכה', 'סמינרים', 'הרצאות'],
        images: [],
        color: '#10B981',
        requires_approval: false,
        cancellation_hours: 2,
        active: true
      },
      {
        id: 'room-003',
        name: 'עמדת עבודה שקטה A',
        description: 'חדר עבודה שקט למיקוד ועבודה אישית',
        capacity: 4,
        location: 'קומה 3, חדר 301',
        equipment: ['שולחן עבודה', 'כיסא ארגונומי', 'תאורה מתכווננת'],
        tags: ['עבודה', 'שקט', 'מיקוד'],
        images: [],
        color: '#8B5CF6',
        requires_approval: false,
        cancellation_hours: 1,
        active: true
      },
      {
        id: 'room-004',
        name: 'עמדת עבודה שקטה B',
        description: 'חדר עבודה שקט נוסף למיקוד ועבודה אישית',
        capacity: 6,
        location: 'קומה 3, חדר 302',
        equipment: ['שולחן עבודה', 'כיסא ארגונומי', 'תאורה מתכווננת'],
        tags: ['עבודה', 'שקט', 'מיקוד'],
        images: [],
        color: '#F59E0B',
        requires_approval: false,
        cancellation_hours: 1,
        active: true
      },
      {
        id: 'room-005',
        name: 'פינת רגיעה',
        description: 'חדר רגיעה ונוחות לזמן הפסקה',
        capacity: 8,
        location: 'קומה 1, חדר 102',
        equipment: ['ספות נוחות', 'משחקי שולחן', 'ספרים', 'קפה'],
        tags: ['הפסקה', 'רגיעה', 'נוחות'],
        images: [],
        color: '#EF4444',
        requires_approval: false,
        cancellation_hours: 1,
        active: true
      },
      {
        id: 'room-006',
        name: 'חדר ועדות',
        description: 'חדר ישיבות רשמי לוועדות ופגישות חשובות',
        capacity: 8,
        location: 'קומה 2, חדר 202',
        equipment: ['שולחן ישיבות', 'מסך 55 אינץ', 'מערכת שמע', 'מצלמה'],
        tags: ['ועדות', 'ישיבות', 'רשמי'],
        images: [],
        color: '#6B7280',
        requires_approval: true,
        cancellation_hours: 48,
        active: true
      }
    ]

    for (const room of demoRooms) {
      const { error } = await supabase
        .from('rooms')
        .upsert(room, { onConflict: 'id' })
      
      if (error) {
        console.error(`Error creating room ${room.name}:`, error)
      } else {
        console.log(`✅ Created room: ${room.name}`)
      }
    }

    // 3. Create some demo bookings
    console.log('📅 Creating demo bookings...')
    
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const dayAfter = new Date(now.getTime() + 48 * 60 * 60 * 1000)

    const demoBookings = [
      {
        id: 'booking-001',
        user_id: '00000000-0000-0000-0000-000000000001',
        room_id: 'room-001',
        title: 'ישיבת מנהלים שבועית',
        description: 'ישיבת מנהלים שבועית לסקירת פעילות השבוע',
        start_time: tomorrow.toISOString(),
        end_time: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000).toISOString(),
        status: 'approved' as const,
        recurrence_rule: null
      },
      {
        id: 'booking-002',
        user_id: '00000000-0000-0000-0000-000000000002',
        room_id: 'room-002',
        title: 'הדרכת צוות חדש',
        description: 'הדרכת צוות חדש על מערכות הארגון',
        start_time: dayAfter.toISOString(),
        end_time: new Date(dayAfter.getTime() + 3 * 60 * 60 * 1000).toISOString(),
        status: 'approved' as const,
        recurrence_rule: null
      }
    ]

    for (const booking of demoBookings) {
      const { error } = await supabase
        .from('bookings')
        .upsert(booking, { onConflict: 'id' })
      
      if (error) {
        console.error(`Error creating booking ${booking.title}:`, error)
      } else {
        console.log(`✅ Created booking: ${booking.title}`)
      }
    }

    console.log('🎉 Database seed completed successfully!')
    console.log('\n📋 Demo credentials:')
    console.log('👑 Admins:')
    console.log('  - manager@mta-demo.org.il (מנהל ראשי)')
    console.log('  - training@mta-demo.org.il (מנהל הדרכה)')
    console.log('  - education@mta-demo.org.il (מנהלת חינוך)')
    console.log('  - coordinator@mta-demo.org.il (רכזת שליחות)')
    console.log('\n👤 Users:')
    console.log('  - yossi@mta-demo.org.il (רכז הדרכה)')
    console.log('  - sara@mta-demo.org.il (מנהלת פרויקטים)')
    console.log('  - david@mta-demo.org.il (רכז קהילה)')
    console.log('  - michal@mta-demo.org.il (מנהלת תוכן)')
    console.log('\n🔑 Password for all users: demo123456')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

seedDatabase()


