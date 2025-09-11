'use client'

import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co'
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-key-for-testing'

// Mock Supabase client for demo purposes
export const supabase = createClient(url, anon, {
  auth: {
    persistSession: false
  }
})


