'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [phone, setPhone] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isSignUp) {
        // הרשמה
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              display_name: displayName,
              job_title: jobTitle,
              phone: phone
            }
          }
        })

        if (error) {
          setError(error.message)
          return
        }

        if (data.user && !data.user.email_confirmed_at) {
          toast.success('נשלח אימייל לאישור החשבון. אנא בדוק את תיבת הדואר שלך.')
        } else {
          // Create profile after successful signup
          if (data.user) {
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                display_name: displayName,
                email: email,
                job_title: jobTitle,
                phone: phone,
                role: 'user',
                active: true
              })

            if (profileError) {
              console.error('Error creating profile:', profileError)
            }
          }
          
          toast.success('הרשמה הושלמה בהצלחה!')
          router.push('/dashboard')
        }
      } else {
        // התחברות
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) {
          setError(error.message)
          return
        }

        toast.success('התחברת בהצלחה!')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Auth error:', error)
      setError('אירעה שגיאה לא צפויה')
    } finally {
      setLoading(false)
    }
  }



  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            {isSignUp ? 'הרשמה למערכת' : 'התחברות למערכת'}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {isSignUp ? 'צור חשבון חדש' : 'התחבר לחשבון הקיים שלך'}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            המחלקה לחינוך בלתי פורמלי מטה אשר
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {isSignUp ? 'הרשמה' : 'התחברות'}
            </CardTitle>
            <CardDescription className="text-center">
              {isSignUp ? 'מלא את הפרטים ליצירת חשבון חדש' : 'הזן את פרטי ההתחברות שלך'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="displayName">שם מלא</Label>
                  <Input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="הזן את שמך המלא"
                    required
                  />
                </div>
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

              {isSignUp && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">תפקיד</Label>
                    <Input
                      id="jobTitle"
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="הזן את התפקיד שלך"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">טלפון</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="הזן מספר טלפון"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">סיסמה</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="הזן סיסמה"
                    className="pl-10 pr-10"
                    required
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
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
                    {isSignUp ? 'יוצר חשבון...' : 'מתחבר...'}
                  </>
                ) : (
                  isSignUp ? 'צור חשבון' : 'התחבר'
                )}
              </Button>
            </form>


            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {isSignUp ? 'כבר יש לך חשבון?' : 'אין לך חשבון?'}{' '}
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto font-normal"
                  onClick={() => setIsSignUp(!isSignUp)}
                >
                  {isSignUp ? 'התחבר כאן' : 'הרשם כאן'}
                </Button>
              </p>
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
