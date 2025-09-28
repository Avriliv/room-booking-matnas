import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      session: {
        exists: !!session,
        user_id: session?.user?.id,
        expires_at: session?.expires_at,
        access_token: session?.access_token ? 'present' : 'missing',
        refresh_token: session?.refresh_token ? 'present' : 'missing'
      },
      user: {
        exists: !!user,
        id: user?.id,
        email: user?.email,
        created_at: user?.created_at
      },
      errors: {
        session: sessionError?.message,
        user: userError?.message
      }
    })
  } catch (error) {
    return NextResponse.json(
      { 
        ok: false, 
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
