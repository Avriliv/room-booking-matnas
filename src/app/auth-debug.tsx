'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthDebug() {
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)

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

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  if (loading) {
    return (
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed top-4 right-4 z-50 bg-red-500 text-white px-2 py-1 text-xs rounded"
      >
        {isVisible ? 'Hide Debug' : 'Show Debug'}
      </button>
    )
  }

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed top-4 right-4 z-50 bg-red-500 text-white px-2 py-1 text-xs rounded"
      >
        {isVisible ? 'Hide Debug' : 'Show Debug'}
      </button>

      {/* Debug box */}
      {isVisible && sessionInfo && (
        <div className="fixed top-12 right-4 z-50 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-sm">
          <h3 className="font-bold text-sm mb-2">Auth Debug</h3>
          <pre className="text-xs overflow-auto max-h-64">
            {JSON.stringify(sessionInfo, null, 2)}
          </pre>
        </div>
      )}
    </>
  )
}
