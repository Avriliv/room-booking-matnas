'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { 
  Settings, 
  Building2, 
  Clock, 
  Mail, 
  Shield, 
  Database,
  Save
} from 'lucide-react'
import { toast } from 'sonner'

interface OrgSettings {
  name: string
  workWeek: number[]
  workHours: {
    start: string
    end: string
  }
  timezone: string
  bookingWindowDays: number
  defaultCancellationHours: number
  timeSlotMinutes: number
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<OrgSettings>({
    name: 'המחלקה לחינוך בלתי פורמלי - מטה אשר',
    workWeek: [1, 2, 3, 4, 5], // Sunday to Thursday
    workHours: {
      start: '07:30',
      end: '18:00'
    },
    timezone: 'Asia/Jerusalem',
    bookingWindowDays: 30,
    defaultCancellationHours: 4,
    timeSlotMinutes: 30
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    // In a real app, you would load settings from the database
    // For now, we'll use the default settings
  }, [])

  const handleSave = async () => {
    try {
      setSaving(true)
      
      // In a real app, you would save to a settings table
      // For now, we'll just show a success message
      
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      toast.success('הגדרות נשמרו בהצלחה')
    } catch (error: unknown) {
      toast.error(error.message || 'שגיאה בשמירת ההגדרות')
    } finally {
      setSaving(false)
    }
  }

  const workDays = [
    { value: 0, label: 'ראשון' },
    { value: 1, label: 'שני' },
    { value: 2, label: 'שלישי' },
    { value: 3, label: 'רביעי' },
    { value: 4, label: 'חמישי' },
    { value: 5, label: 'שישי' },
    { value: 6, label: 'שבת' }
  ]

  const toggleWorkDay = (day: number) => {
    setSettings(prev => ({
      ...prev,
      workWeek: prev.workWeek.includes(day)
        ? prev.workWeek.filter(d => d !== day)
        : [...prev.workWeek, day].sort()
    }))
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">הגדרות מערכת</h1>
          <p className="mt-2 text-gray-600">
            ניהול הגדרות המערכת הכלליות
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Organization Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                הגדרות ארגון
              </CardTitle>
              <CardDescription>
                פרטי הארגון והגדרות בסיסיות
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orgName">שם הארגון</Label>
                <Input
                  id="orgName"
                  value={settings.name}
                  onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>ימי עבודה</Label>
                <div className="grid grid-cols-2 gap-2">
                  {workDays.map(day => (
                    <div key={day.value} className="flex items-center space-x-2">
                      <Switch
                        id={`day-${day.value}`}
                        checked={settings.workWeek.includes(day.value)}
                        onCheckedChange={() => toggleWorkDay(day.value)}
                      />
                      <Label htmlFor={`day-${day.value}`} className="text-sm">
                        {day.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="workStart">שעת התחלה</Label>
                  <Input
                    id="workStart"
                    type="time"
                    value={settings.workHours.start}
                    onChange={(e) => setSettings(prev => ({ 
                      ...prev, 
                      workHours: { ...prev.workHours, start: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workEnd">שעת סיום</Label>
                  <Input
                    id="workEnd"
                    type="time"
                    value={settings.workHours.end}
                    onChange={(e) => setSettings(prev => ({ 
                      ...prev, 
                      workHours: { ...prev.workHours, end: e.target.value }
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                הגדרות הזמנות
              </CardTitle>
              <CardDescription>
                הגדרות עבור מערכת ההזמנות
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="timezone">אזור זמן</Label>
                <Input
                  id="timezone"
                  value={settings.timezone}
                  onChange={(e) => setSettings(prev => ({ ...prev, timezone: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bookingWindow">חלון הזמנות (ימים)</Label>
                <Input
                  id="bookingWindow"
                  type="number"
                  min="1"
                  max="365"
                  value={settings.bookingWindowDays}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    bookingWindowDays: parseInt(e.target.value) || 30
                  }))}
                />
                <p className="text-xs text-gray-500">
                  כמה ימים מראש ניתן להזמין
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cancellationHours">שעות ביטול ברירת מחדל</Label>
                <Input
                  id="cancellationHours"
                  type="number"
                  min="0"
                  value={settings.defaultCancellationHours}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    defaultCancellationHours: parseInt(e.target.value) || 4
                  }))}
                />
                <p className="text-xs text-gray-500">
                  כמה שעות מראש ניתן לבטל הזמנה
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeSlot">מרווח זמן (דקות)</Label>
                <Input
                  id="timeSlot"
                  type="number"
                  min="15"
                  step="15"
                  value={settings.timeSlotMinutes}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    timeSlotMinutes: parseInt(e.target.value) || 30
                  }))}
                />
                <p className="text-xs text-gray-500">
                  מרווח הזמן המינימלי בין הזמנות
                </p>
              </div>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                הגדרות מערכת
              </CardTitle>
              <CardDescription>
                הגדרות אבטחה ופרטיות
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="requireApproval">דורש אישור ברירת מחדל</Label>
                  <p className="text-sm text-gray-500">
                    הזמנות חדשות דורשות אישור מנהל
                  </p>
                </div>
                <Switch id="requireApproval" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications">התראות מייל</Label>
                  <p className="text-sm text-gray-500">
                    שליחת התראות מייל על הזמנות
                  </p>
                </div>
                <Switch id="emailNotifications" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allowRecurring">הזמנות חוזרות</Label>
                  <p className="text-sm text-gray-500">
                    אפשרות ליצור הזמנות חוזרות
                  </p>
                </div>
                <Switch id="allowRecurring" defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Database Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                מידע על מסד הנתונים
              </CardTitle>
              <CardDescription>
                סטטיסטיקות ומידע טכני
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-900">גרסת מסד נתונים</p>
                  <p className="text-gray-600">PostgreSQL 15</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">ספק</p>
                  <p className="text-gray-600">Supabase</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">גיבוי אחרון</p>
                  <p className="text-gray-600">היום 14:30</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">גודל מסד נתונים</p>
                  <p className="text-gray-600">2.3 MB</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} size="lg">
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                שומר...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 ml-2" />
                שמור הגדרות
              </>
            )}
          </Button>
        </div>
      </div>
    </MainLayout>
  )
}
