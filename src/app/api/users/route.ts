import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const active = searchParams.get('active')

    let query = supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (role) {
      query = query.eq('role', role)
    }
    if (active !== null) {
      query = query.eq('active', active === 'true')
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json(
        { error: 'שגיאה בטעינת המשתמשים' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'שגיאה בטעינת המשתמשים' },
      { status: 500 }
    )
  }
}