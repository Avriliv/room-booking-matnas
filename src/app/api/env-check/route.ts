import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      environment: {
        supabaseUrl: supabaseUrl ? 'present' : 'missing',
        supabaseAnonKey: supabaseAnonKey ? 'present' : 'missing',
        supabaseServiceKey: supabaseServiceKey ? 'present' : 'missing',
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV
      },
      supabaseUrl: supabaseUrl,
      supabaseAnonKey: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 10)}...` : 'missing'
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
