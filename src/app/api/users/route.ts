import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { display_name, email, job_title, phone, role, active } = body

    // Validate required fields
    if (!display_name || !email) {
      return NextResponse.json(
        { error: 'שם מלא וכתובת מייל נדרשים' },
        { status: 400 }
      )
    }

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: 'TempPassword123!', // Temporary password - user should change it
      email_confirm: true,
      user_metadata: {
        display_name,
        job_title,
        phone
      }
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      return NextResponse.json(
        { error: 'שגיאה ביצירת המשתמש במערכת האימות' },
        { status: 500 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'שגיאה ביצירת המשתמש' },
        { status: 500 }
      )
    }

    // Update the profile with additional data
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({
        job_title: job_title || null,
        phone: phone || null,
        role: role || 'user',
        active: active !== undefined ? active : true
      })
      .eq('id', authData.user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating profile:', error)
      return NextResponse.json(
        { error: 'שגיאה בעדכון פרטי המשתמש' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data,
      message: 'משתמש נוצר בהצלחה. סיסמה זמנית: TempPassword123!'
    })

  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'שגיאה ביצירת המשתמש' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, display_name, email, job_title, phone, role, active } = body

    if (!id) {
      return NextResponse.json(
        { error: 'מזהה משתמש נדרש' },
        { status: 400 }
      )
    }

    // Update profile
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({
        display_name,
        email,
        job_title: job_title || null,
        phone: phone || null,
        role: role || 'user',
        active: active !== undefined ? active : true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating user:', error)
      return NextResponse.json(
        { error: 'שגיאה בעדכון המשתמש' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data,
      message: 'משתמש עודכן בהצלחה'
    })

  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'שגיאה בעדכון המשתמש' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'מזהה משתמש נדרש' },
        { status: 400 }
      )
    }

    // Delete user from auth and profile will be deleted automatically due to CASCADE
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id)

    if (error) {
      console.error('Error deleting user:', error)
      return NextResponse.json(
        { error: 'שגיאה במחיקת המשתמש' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'משתמש נמחק בהצלחה'
    })

  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'שגיאה במחיקת המשתמש' },
      { status: 500 }
    )
  }
}
