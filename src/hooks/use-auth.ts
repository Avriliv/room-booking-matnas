'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types'

export function useAuth() {
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const getUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (authUser) {
          // Fetch user profile
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single()

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
        console.error('Error getting user:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (error) {
            console.error('Error fetching profile:', error)
            setUser(null)
          } else {
            setUser(profile)
          }
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [mounted])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return {
    user: mounted ? user : null,
    loading: mounted ? loading : true,
    signOut
  }
}
