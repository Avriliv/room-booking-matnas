'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types'
import { withSupabaseTimeout } from '@/lib/withTimeout'

export function useAuth() {
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      try {
        console.log('[AUTH] Getting user...')
        const { data: { user: authUser } } = await withSupabaseTimeout(
          supabase.auth.getUser(),
          5000
        )
        
        if (authUser) {
          console.log('[AUTH] User found, fetching profile...')
          // Fetch user profile with timeout
          const profileQuery = supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single()
          
          const profileResult = await withSupabaseTimeout(
            Promise.resolve(profileQuery),
            5000
          )
          
          const { data: profile, error } = profileResult as any

          if (error) {
            console.error('Error fetching profile:', error)
            setUser(null)
          } else {
            console.log('[AUTH] Profile loaded successfully')
            setUser(profile)
          }
        } else {
          console.log('[AUTH] No user found')
          setUser(null)
        }
      } catch (error) {
        console.error('Error getting user:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    // Listen for auth changes with timeout
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AUTH] Auth state changed:', event)
        try {
          if (session?.user) {
            const profileQuery = supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()
            
            const profileResult = await withSupabaseTimeout(
              Promise.resolve(profileQuery),
              5000
            )
            
            const { data: profile, error } = profileResult as any

            if (error) {
              console.error('Error fetching profile:', error)
              setUser(null)
            } else {
              setUser(profile)
            }
          } else {
            setUser(null)
          }
        } catch (error) {
          console.error('Error in auth state change:', error)
          setUser(null)
        } finally {
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return {
    user,
    loading,
    signOut
  }
}
