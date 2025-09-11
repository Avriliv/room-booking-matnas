import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active')

    let query = supabaseAdmin
      .from('rooms')
      .select('*')
      .order('name', { ascending: true })

    if (active !== null) {
      query = query.eq('active', active === 'true')
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching rooms:', error)
      return NextResponse.json(
        { error: 'שגיאה בטעינת החדרים' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })

  } catch (error) {
    console.error('Error fetching rooms:', error)
    return NextResponse.json(
      { error: 'שגיאה בטעינת החדרים' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      name, 
      description, 
      capacity, 
      location, 
      equipment, 
      tags, 
      images, 
      color, 
      requires_approval, 
      cancellation_hours 
    } = body

    // Validate required fields
    if (!name || !capacity || !location || !color) {
      return NextResponse.json(
        { error: 'שדות חובה חסרים' },
        { status: 400 }
      )
    }

    // Create room
    const { data, error } = await supabaseAdmin
      .from('rooms')
      .insert({
        name,
        description: description || null,
        capacity,
        location,
        equipment: equipment || [],
        tags: tags || [],
        images: images || [],
        color,
        requires_approval: requires_approval || false,
        cancellation_hours: cancellation_hours || 24,
        active: true
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating room:', error)
      return NextResponse.json(
        { error: 'שגיאה ביצירת החדר' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data,
      message: 'חדר נוצר בהצלחה'
    })

  } catch (error) {
    console.error('Error creating room:', error)
    return NextResponse.json(
      { error: 'שגיאה ביצירת החדר' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      id, 
      name, 
      description, 
      capacity, 
      location, 
      equipment, 
      tags, 
      images, 
      color, 
      requires_approval, 
      cancellation_hours, 
      active 
    } = body

    if (!id) {
      return NextResponse.json(
        { error: 'מזהה חדר נדרש' },
        { status: 400 }
      )
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (capacity !== undefined) updateData.capacity = capacity
    if (location !== undefined) updateData.location = location
    if (equipment !== undefined) updateData.equipment = equipment
    if (tags !== undefined) updateData.tags = tags
    if (images !== undefined) updateData.images = images
    if (color !== undefined) updateData.color = color
    if (requires_approval !== undefined) updateData.requires_approval = requires_approval
    if (cancellation_hours !== undefined) updateData.cancellation_hours = cancellation_hours
    if (active !== undefined) updateData.active = active

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

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

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
