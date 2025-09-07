'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Profile, ProfileFormData } from '@/types'
import { toast } from 'sonner'

interface UserFormDialogProps {
  open: boolean
  onClose: () => void
  user?: Profile | null
  onSave: (user: Profile) => void
}

export function UserFormDialog({ open, onClose, user, onSave }: UserFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<ProfileFormData>({
    display_name: '',
    email: '',
    job_title: '',
    phone: '',
    role: 'user',
    active: true
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (user) {
      setFormData({
        display_name: user.display_name,
        email: user.email,
        job_title: user.job_title || '',
        phone: user.phone || '',
        role: user.role,
        active: user.active
      })
    } else {
      setFormData({
        display_name: '',
        email: '',
        job_title: '',
        phone: '',
        role: 'user',
        active: true
      })
    }
    setErrors({})
  }, [user, open])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.display_name.trim()) {
      newErrors.display_name = 'שם מלא נדרש'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'כתובת מייל נדרשת'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'כתובת מייל לא תקינה'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)

      if (user) {
        // Update existing user
        const { data, error } = await supabase
          .from('profiles')
          .update({
            display_name: formData.display_name,
            email: formData.email,
            job_title: formData.job_title || null,
            phone: formData.phone || null,
            role: formData.role,
            active: formData.active,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
          .select()
          .single()

        if (error) throw error

        onSave(data)
        toast.success('משתמש עודכן בהצלחה')
      } else {
        // Create new user - first create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: formData.email,
          password: 'temp123456', // Temporary password
          email_confirm: true
        })

        if (authError) throw authError

        // Create profile
        const { data, error } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            display_name: formData.display_name,
            email: formData.email,
            job_title: formData.job_title || null,
            phone: formData.phone || null,
            role: formData.role,
            active: formData.active
          })
          .select()
          .single()

        if (error) throw error

        onSave(data)
        toast.success('משתמש נוצר בהצלחה')
      }

      onClose()
    } catch (error: unknown) {
      console.error('Error saving user:', error)
      toast.error(error.message || 'שגיאה בשמירת המשתמש')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {user ? 'עריכת משתמש' : 'משתמש חדש'}
          </DialogTitle>
          <DialogDescription>
            {user ? 'ערוך את פרטי המשתמש' : 'הוסף משתמש חדש למערכת'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="display_name">שם מלא *</Label>
            <Input
              id="display_name"
              value={formData.display_name}
              onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
              placeholder="שם מלא"
            />
            {errors.display_name && (
              <p className="text-sm text-red-600">{errors.display_name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">כתובת מייל *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="user@example.com"
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
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
            <Label htmlFor="role">הרשאה</Label>
            <Select 
              value={formData.role} 
              onValueChange={(value: 'admin' | 'editor' | 'user') => 
                setFormData(prev => ({ ...prev, role: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">משתמש</SelectItem>
                <SelectItem value="editor">עורך</SelectItem>
                <SelectItem value="admin">מנהל</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="active">פעיל</Label>
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              ביטול
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'שומר...' : user ? 'עדכן' : 'צור'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
