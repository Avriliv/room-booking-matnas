import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'rooms'

    if (!file) {
      return NextResponse.json(
        { error: 'קובץ לא נמצא' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'סוג קובץ לא נתמך. אנא העלה תמונה בפורמט JPEG, PNG, WebP או GIF' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'גודל הקובץ גדול מדי. מקסימום 5MB' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const fileName = `${timestamp}-${randomString}.${fileExtension}`

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('room-images')
      .upload(`${folder}/${fileName}`, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Error uploading file:', error)
      return NextResponse.json(
        { error: 'שגיאה בהעלאת הקובץ' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('room-images')
      .getPublicUrl(data.path)

    return NextResponse.json({
      url: urlData.publicUrl,
      path: data.path,
      message: 'קובץ הועלה בהצלחה'
    })

  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'שגיאה בהעלאת הקובץ' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')

    if (!path) {
      return NextResponse.json(
        { error: 'נתיב קובץ נדרש' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin.storage
      .from('room-images')
      .remove([path])

    if (error) {
      console.error('Error deleting file:', error)
      return NextResponse.json(
        { error: 'שגיאה במחיקת הקובץ' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'קובץ נמחק בהצלחה'
    })

  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json(
      { error: 'שגיאה במחיקת הקובץ' },
      { status: 500 }
    )
  }
}
