'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (error) {
        setError(error.message)
        return
      }

      setSuccess(true)
      toast.success('נשלח אימייל לשחזור הסיסמה')
    } catch (error) {
      console.error('Password reset error:', error)
      setError('אירעה שגיאה לא צפויה')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  אימייל נשלח!
                </h2>
                <p className="text-gray-600 mb-6">
                  שלחנו לך קישור לשחזור הסיסמה. אנא בדוק את תיבת הדואר שלך ופעל לפי ההוראות.
                </p>
                <div className="space-y-3">
                  <Button asChild className="w-full">
                    <Link href="/auth/login">
                      חזרה להתחברות
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/">
                      עמוד הבית
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            שחזור סיסמה
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            הזן את כתובת האימייל שלך ונשלח לך קישור לשחזור הסיסמה
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              שחזור סיסמה
            </CardTitle>
            <CardDescription className="text-center">
              נשלח לך קישור לאיפוס הסיסמה
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">כתובת אימייל</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    שולח...
                  </>
                ) : (
                  'שלח קישור שחזור'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button asChild variant="link" className="p-0 h-auto">
                <Link href="/auth/login">
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  חזרה להתחברות
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← חזרה לעמוד הבית
          </Link>
        </div>
      </div>
    </div>
  )
}
