'use client'

import { Navigation } from './navigation'
import { useAuth } from '@/hooks/use-auth'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // זמנית - משתמש דמה עד שהאימות יעבוד
  const currentUser = user || {
    id: 'mock-user',
    email: 'demo@example.com',
    display_name: 'משתמש דמה',
    role: 'admin' as const,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
