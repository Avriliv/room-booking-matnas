import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'מזהה חדר נדרש' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('rooms')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching room:', error)
      return NextResponse.json(
        { error: 'שגיאה בטעינת החדר' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'חדר לא נמצא' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data })

  } catch (error) {
    console.error('Error fetching room:', error)
    return NextResponse.json(
      { error: 'שגיאה בטעינת החדר' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'מזהה חדר נדרש' },
        { status: 400 }
      )
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    // Only update fields that are provided
    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.capacity !== undefined) updateData.capacity = body.capacity
    if (body.location !== undefined) updateData.location = body.location
    if (body.equipment !== undefined) updateData.equipment = body.equipment
    if (body.tags !== undefined) updateData.tags = body.tags
    if (body.images !== undefined) updateData.images = body.images
    if (body.color !== undefined) updateData.color = body.color
    if (body.requires_approval !== undefined) updateData.requires_approval = body.requires_approval
    if (body.cancellation_hours !== undefined) updateData.cancellation_hours = body.cancellation_hours
    if (body.active !== undefined) updateData.active = body.active

    const { data, error } = await supabaseAdmin
      .from('rooms')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating room:', error)
      return NextResponse.json(
        { error: 'שגיאה בעדכון החדר' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data,
      message: 'חדר עודכן בהצלחה'
    })

  } catch (error) {
    console.error('Error updating room:', error)
    return NextResponse.json(
      { error: 'שגיאה בעדכון החדר' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'מזהה חדר נדרש' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('rooms')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting room:', error)
      return NextResponse.json(
        { error: 'שגיאה במחיקת החדר' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'חדר נמחק בהצלחה'
    })

  } catch (error) {
    console.error('Error deleting room:', error)
    return NextResponse.json(
      { error: 'שגיאה במחיקת החדר' },
      { status: 500 }
    )
  }
}
