import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { withSupabaseTimeout } from '@/lib/withTimeout'

export async function GET() {
  try {
    // Test Supabase connection with a simple query
    await withSupabaseTimeout(
      supabaseAdmin
        .from('profiles')
        .select('count')
        .limit(1),
      3000
    )

    return NextResponse.json({ 
      ok: true, 
      timestamp: new Date().toISOString(),
      message: 'Supabase connection healthy'
    })
  } catch (error) {
    console.error('Supabase health check failed:', error)
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
