'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Building2, Users, Shield, ArrowRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  const router = useRouter()
  const { user, loading } = useAuth()
  
  // If user is authenticated, redirect to dashboard (with timeout protection)
  useEffect(() => {
    if (user && !loading) {
      console.log('[HOME] Redirecting authenticated user to dashboard')
      const timeoutId = setTimeout(() => {
        router.push('/dashboard')
      }, 100) // Small delay to prevent race conditions
      
      return () => clearTimeout(timeoutId)
    }
  }, [user, loading, router])
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">
                  הזמנת חללי עבודה
                </h1>
                <p className="text-sm text-gray-600">המחלקה לחינוך בלתי פורמלי מטה אשר</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button asChild variant="outline">
                <Link href="/auth/login">התחבר</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/login">הרשם</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            הזמנת חללי עבודה
            <span className="block text-blue-600">המחלקה לחינוך בלתי פורמלי מטה אשר</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            פתרון מקיף לניהול חללי עבודה, הזמנות ומשתמשים עם מערכת הרשאות מתקדמת
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Button asChild size="lg" className="w-full">
                <Link href="/auth/login">
                  התחל עכשיו
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <Calendar className="h-8 w-8 text-blue-600" />
                <CardTitle className="text-lg">לוח שנה חכם</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  ניהול הזמנות עם לוח שנה אינטראקטיבי ותצוגות מרובות
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Building2 className="h-8 w-8 text-green-600" />
                <CardTitle className="text-lg">ניהול חללים</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  יצירה וניהול חללי עבודה עם תמונות והגדרות מתקדמות
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-purple-600" />
                <CardTitle className="text-lg">ניהול משתמשים</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  מערכת הרשאות מתקדמת עם תפקידים שונים
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-red-600" />
                <CardTitle className="text-lg">אבטחה מתקדמת</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  הגנה מלאה על הנתונים עם Row Level Security
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-20">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-base text-gray-400">
              © 2025 Avrili. כל הזכויות שמורות.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}