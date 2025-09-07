import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'

export const supabase = createClientComponentClient<Database>({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tvphtqxmcnjrccnukcqp.supabase.co',
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2cGh0cXhtY25qcmNjbnVrY3FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMjY3NDUsImV4cCI6MjA3MjgwMjc0NX0.RDpY_3NOMd9bw79TZ3mKzQ3g1SHqWpqZ9KsiS6zkbvk'
})
