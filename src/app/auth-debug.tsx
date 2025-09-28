'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthDebug() {
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        // Check user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        // Check profile
        let profile = null
        if (user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          profile = profileData
        }

        setSessionInfo({
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
          profile: {
            exists: !!profile,
            id: profile?.id,
            role: profile?.role,
            display_name: profile?.display_name
          },
          errors: {
            session: sessionError?.message,
            user: userError?.message
          }
        })
      } catch (error) {
        console.error('Auth debug error:', error)
        setSessionInfo({ error: error instanceof Error ? error.message : 'Unknown error' })
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[AUTH DEBUG] Auth state changed:', event, session?.user?.id)
      checkAuth()
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return <div>Loading auth debug...</div>
  }

  return (
    <div style={{ 
      position: 'fixed', 
      top: 10, 
      right: 10, 
      background: 'white', 
      border: '1px solid #ccc', 
      padding: '10px', 
      borderRadius: '5px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 9999
    }}>
      <h4>Auth Debug</h4>
      <pre>{JSON.stringify(sessionInfo, null, 2)}</pre>
    </div>
  )
}
