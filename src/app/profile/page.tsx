'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Phone, Briefcase, Shield, Save, Key } from 'lucide-react'
import { Profile } from '@/types'
import { toast } from 'sonner'

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [formData, setFormData] = useState({
    display_name: '',
    email: '',
    job_title: '',
    phone: '',
    role: 'user' as 'admin' | 'editor' | 'user'
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileData) {
          setProfile(profileData)
          setFormData({
            display_name: profileData.display_name,
            email: profileData.email,
            job_title: profileData.job_title || '',
            phone: profileData.phone || '',
            role: profileData.role
          })
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [supabase])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: formData.display_name,
          job_title: formData.job_title || null,
          phone: formData.phone || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile?.id)

      if (error) throw error

      // Update local state
      setProfile(prev => prev ? {
        ...prev,
        display_name: formData.display_name,
        job_title: formData.job_title || null,
        phone: formData.phone || null,
        updated_at: new Date().toISOString()
      } : null)

      toast.success('הפרופיל עודכן בהצלחה')
    } catch (error: unknown) {
      toast.error(error.message || 'אירעה שגיאה בעדכון הפרופיל')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setChangingPassword(true)

    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.error('הסיסמאות החדשות אינן תואמות')
        return
      }

      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) throw error

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })

      toast.success('הסיסמה שונתה בהצלחה')
    } catch (error: unknown) {
      toast.error(error.message || 'אירעה שגיאה בשינוי הסיסמה')
    } finally {
      setChangingPassword(false)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1">
            <Shield className="h-3 w-3" />
            מנהל
          </Badge>
        )
      case 'editor':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1">
            <Shield className="h-3 w-3" />
            עורך
          </Badge>
        )
      case 'user':
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200 flex items-center gap-1">
            <User className="h-3 w-3" />
            משתמש
          </Badge>
        )
      default:
        return <Badge variant="secondary">{role}</Badge>
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    )
  }

  if (!profile) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">פרופיל לא נמצא</h2>
          <p className="text-gray-600">אירעה שגיאה בטעינת הפרופיל</p>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">פרופיל אישי</h1>
          <p className="mt-2 text-gray-600">
            ניהול פרטי החשבון שלך
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                פרטים אישיים
              </CardTitle>
              <CardDescription>
                עדכן את הפרטים האישיים שלך
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="display_name">שם מלא</Label>
                  <Input
                    id="display_name"
                    value={formData.display_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">כתובת מייל</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">
                    כתובת המייל לא ניתנת לשינוי
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job_title">תפקיד בארגון</Label>
                  <Input
                    id="job_title"
                    value={formData.job_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, job_title: e.target.value }))}
                    placeholder="לדוגמה: רכז הדרכה"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">טלפון</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="050-1234567"
                  />
                </div>

                <div className="space-y-2">
                  <Label>תפקיד במערכת</Label>
                  <div className="flex items-center gap-2">
                    {getRoleBadge(formData.role)}
                    <p className="text-sm text-gray-500">
                      התפקיד נקבע על ידי מנהל המערכת
                    </p>
                  </div>
                </div>

                <Button type="submit" disabled={saving} className="w-full">
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                      שומר...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 ml-2" />
                      שמור שינויים
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                שינוי סיסמה
              </CardTitle>
              <CardDescription>
                שנה את הסיסמה שלך
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">סיסמה נוכחית</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">סיסמה חדשה</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    required
                    minLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">אישור סיסמה חדשה</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                    minLength={6}
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={changingPassword} 
                  className="w-full"
                  variant="outline"
                >
                  {changingPassword ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 ml-2"></div>
                      משנה...
                    </>
                  ) : (
                    <>
                      <Key className="h-4 w-4 ml-2" />
                      שנה סיסמה
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle>מידע על החשבון</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-900">תאריך הצטרפות</p>
                <p className="text-gray-600">
                  {new Date(profile.created_at).toLocaleDateString('he-IL')}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-900">עדכון אחרון</p>
                <p className="text-gray-600">
                  {new Date(profile.updated_at).toLocaleDateString('he-IL')}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-900">סטטוס</p>
                <Badge variant={profile.active ? 'default' : 'secondary'}>
                  {profile.active ? 'פעיל' : 'לא פעיל'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
