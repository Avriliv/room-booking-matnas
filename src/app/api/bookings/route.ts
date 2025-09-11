import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const roomId = searchParams.get('roomId')
    const status = searchParams.get('status')

    let query = supabaseAdmin
      .from('bookings')
      .select(`
        *,
        room:rooms(*),
        user:profiles(*)
      `)
      .order('created_at', { ascending: false })

    if (userId) {
      query = query.eq('user_id', userId)
    }
    if (roomId) {
      query = query.eq('room_id', roomId)
    }
    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching bookings:', error)
      return NextResponse.json(
        { error: 'שגיאה בטעינת ההזמנות' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })

  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'שגיאה בטעינת ההזמנות' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      room_id, 
      user_id, 
      title, 
      description, 
      start_time, 
      end_time, 
      attendee_count, 
      attendees, 
      is_recurring, 
      recurrence_rule 
    } = body

    // Validate required fields
    if (!room_id || !user_id || !title || !start_time || !end_time) {
      return NextResponse.json(
        { error: 'שדות חובה חסרים' },
        { status: 400 }
      )
    }

    // Check if room requires approval
    const { data: room, error: roomError } = await supabaseAdmin
      .from('rooms')
      .select('requires_approval')
      .eq('id', room_id)
      .single()

    if (roomError) {
      console.error('Error fetching room:', roomError)
      return NextResponse.json(
        { error: 'שגיאה בטעינת פרטי החלל' },
        { status: 500 }
      )
    }

    const status = room.requires_approval ? 'pending' : 'approved'

    // Create booking
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .insert({
        room_id,
        user_id,
        title,
        description: description || null,
        start_time,
        end_time,
        attendee_count: attendee_count || 1,
        attendees: attendees || [],
        status,
        is_recurring: is_recurring || false,
        recurrence_rule: recurrence_rule || null
      })
      .select(`
        *,
        room:rooms(*),
        user:profiles(*)
      `)
      .single()

    if (error) {
      console.error('Error creating booking:', error)
      return NextResponse.json(
        { error: 'שגיאה ביצירת ההזמנה' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data,
      message: status === 'pending' 
        ? 'הזמנה נוצרה בהצלחה וממתינה לאישור' 
        : 'הזמנה נוצרה בהצלחה'
    })

  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'שגיאה ביצירת ההזמנה' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, rejection_reason, cancellation_reason } = body

    if (!id) {
      return NextResponse.json(
        { error: 'מזהה הזמנה נדרש' },
        { status: 400 }
      )
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (status) {
      updateData.status = status
      if (status === 'approved') {
        updateData.approved_at = new Date().toISOString()
      }
      if (status === 'rejected' && rejection_reason) {
        updateData.rejection_reason = rejection_reason
      }
      if (status === 'cancelled') {
        updateData.cancelled_at = new Date().toISOString()
        if (cancellation_reason) {
          updateData.cancellation_reason = cancellation_reason
        }
      }
    }

    const { data, error } = await supabaseAdmin
      .from('bookings')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        room:rooms(*),
        user:profiles(*)
      `)
      .single()

    if (error) {
      console.error('Error updating booking:', error)
      return NextResponse.json(
        { error: 'שגיאה בעדכון ההזמנה' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data,
      message: 'הזמנה עודכנה בהצלחה'
    })

  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { error: 'שגיאה בעדכון ההזמנה' },
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
        { error: 'מזהה הזמנה נדרש' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('bookings')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting booking:', error)
      return NextResponse.json(
        { error: 'שגיאה במחיקת ההזמנה' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'הזמנה נמחקה בהצלחה'
    })

  } catch (error) {
    console.error('Error deleting booking:', error)
    return NextResponse.json(
      { error: 'שגיאה במחיקת ההזמנה' },
      { status: 500 }
    )
  }
}
