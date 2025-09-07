'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Room, RoomFormData } from '@/types'
import { toast } from 'sonner'
import { Plus, X } from 'lucide-react'

interface RoomFormDialogProps {
  open: boolean
  onClose: () => void
  room?: Room | null
  onSave: (room: Room) => void
}

export function RoomFormDialog({ open, onClose, room, onSave }: RoomFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<RoomFormData>({
    name: '',
    description: '',
    capacity: 1,
    location: '',
    equipment: [],
    tags: [],
    requires_approval: false,
    bookable: true,
    time_slot_minutes: 30,
    min_duration_minutes: 30,
    max_duration_minutes: 240,
    color: '#3B82F6',
    cancellation_hours: 4
  })
  const [newEquipment, setNewEquipment] = useState('')
  const [newTag, setNewTag] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (room) {
      setFormData({
        name: room.name,
        description: room.description || '',
        capacity: room.capacity,
        location: room.location,
        equipment: room.equipment,
        tags: room.tags,
        requires_approval: room.requires_approval,
        bookable: room.bookable,
        time_slot_minutes: room.time_slot_minutes,
        min_duration_minutes: room.min_duration_minutes,
        max_duration_minutes: room.max_duration_minutes,
        color: room.color,
        cancellation_hours: room.cancellation_hours
      })
    } else {
      setFormData({
        name: '',
        description: '',
        capacity: 1,
        location: '',
        equipment: [],
        tags: [],
        requires_approval: false,
        bookable: true,
        time_slot_minutes: 30,
        min_duration_minutes: 30,
        max_duration_minutes: 240,
        color: '#3B82F6',
        cancellation_hours: 4
      })
    }
    setErrors({})
  }, [room, open])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'שם החלל נדרש'
    }
    if (!formData.location.trim()) {
      newErrors.location = 'מיקום החלל נדרש'
    }
    if (formData.capacity < 1) {
      newErrors.capacity = 'קיבולת חייבת להיות לפחות 1'
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

      if (room) {
        // Update existing room
        const { data, error } = await supabase
          .from('rooms')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', room.id)
          .select()
          .single()

        if (error) throw error

        onSave(data)
        toast.success('חלל עודכן בהצלחה')
      } else {
        // Create new room
        const { data, error } = await supabase
          .from('rooms')
          .insert(formData)
          .select()
          .single()

        if (error) throw error

        onSave(data)
        toast.success('חלל נוצר בהצלחה')
      }

      onClose()
    } catch (error: unknown) {
      console.error('Error saving room:', error)
      toast.error(error.message || 'שגיאה בשמירת החלל')
    } finally {
      setLoading(false)
    }
  }

  const addEquipment = () => {
    if (newEquipment.trim() && !formData.equipment.includes(newEquipment.trim())) {
      setFormData(prev => ({
        ...prev,
        equipment: [...prev.equipment, newEquipment.trim()]
      }))
      setNewEquipment('')
    }
  }

  const removeEquipment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.filter((_, i) => i !== index)
    }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {room ? 'עריכת חלל' : 'חלל חדש'}
          </DialogTitle>
          <DialogDescription>
            {room ? 'ערוך את פרטי החלל' : 'הוסף חלל עבודה חדש'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">שם החלל *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="לדוגמה: חדר ישיבות מנהלים"
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">מיקום *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="לדוגמה: קומה 3, כנף צפון"
              />
              {errors.location && (
                <p className="text-sm text-red-600">{errors.location}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">תיאור</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="תיאור קצר של החלל"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacity">קיבולת *</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 1 }))}
              />
              {errors.capacity && (
                <p className="text-sm text-red-600">{errors.capacity}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">צבע</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-16 h-10"
                />
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cancellation_hours">שעות ביטול</Label>
              <Input
                id="cancellation_hours"
                type="number"
                min="0"
                value={formData.cancellation_hours}
                onChange={(e) => setFormData(prev => ({ ...prev, cancellation_hours: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>

          {/* Equipment */}
          <div className="space-y-2">
            <Label>ציוד</Label>
            <div className="flex gap-2">
              <Input
                value={newEquipment}
                onChange={(e) => setNewEquipment(e.target.value)}
                placeholder="הוסף ציוד"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEquipment())}
              />
              <Button type="button" onClick={addEquipment} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {formData.equipment.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.equipment.map((item, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {item}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEquipment(index)}
                      className="h-4 w-4 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>תגים</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="הוסף תג"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTag(index)}
                      className="h-4 w-4 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Duration Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="time_slot_minutes">מרווח זמן (דקות)</Label>
              <Input
                id="time_slot_minutes"
                type="number"
                min="15"
                step="15"
                value={formData.time_slot_minutes}
                onChange={(e) => setFormData(prev => ({ ...prev, time_slot_minutes: parseInt(e.target.value) || 30 }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="min_duration_minutes">משך מינימלי (דקות)</Label>
              <Input
                id="min_duration_minutes"
                type="number"
                min="15"
                step="15"
                value={formData.min_duration_minutes}
                onChange={(e) => setFormData(prev => ({ ...prev, min_duration_minutes: parseInt(e.target.value) || 30 }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_duration_minutes">משך מקסימלי (דקות)</Label>
              <Input
                id="max_duration_minutes"
                type="number"
                min="30"
                value={formData.max_duration_minutes}
                onChange={(e) => setFormData(prev => ({ ...prev, max_duration_minutes: parseInt(e.target.value) || 240 }))}
              />
            </div>
          </div>

          {/* Switches */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="requires_approval">דורש אישור מנהל</Label>
              <Switch
                id="requires_approval"
                checked={formData.requires_approval}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requires_approval: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="bookable">זמין להזמנה</Label>
              <Switch
                id="bookable"
                checked={formData.bookable}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, bookable: checked }))}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              ביטול
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'שומר...' : room ? 'עדכן' : 'צור'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
