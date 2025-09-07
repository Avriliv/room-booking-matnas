'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Building2, 
  Users,
  MapPin,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { Room } from '@/types'
import { toast } from 'sonner'
import { RoomFormDialog } from '@/components/admin/room-form-dialog'

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showRoomForm, setShowRoomForm] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      const { data: roomsData } = await supabase
        .from('rooms')
        .select('*')
        .order('name')

      setRooms(roomsData || [])
    } catch (error) {
      console.error('Error fetching rooms:', error)
      toast.error('שגיאה בטעינת החללים')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleRoomStatus = async (roomId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('rooms')
        .update({ bookable: !currentStatus })
        .eq('id', roomId)

      if (error) throw error

      setRooms(prev => 
        prev.map(room => 
          room.id === roomId 
            ? { ...room, bookable: !currentStatus }
            : room
        )
      )

      toast.success(`חלל ${!currentStatus ? 'הופעל' : 'הושבת'} בהצלחה`)
    } catch (error: any) {
      toast.error(error.message || 'שגיאה בעדכון סטטוס החלל')
    }
  }

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק את החלל?')) return

    try {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', roomId)

      if (error) throw error

      setRooms(prev => prev.filter(room => room.id !== roomId))
      toast.success('חלל נמחק בהצלחה')
    } catch (error: any) {
      toast.error(error.message || 'שגיאה במחיקת החלל')
    }
  }

  const handleRoomSaved = (savedRoom: Room) => {
    if (editingRoom) {
      setRooms(prev => 
        prev.map(room => room.id === savedRoom.id ? savedRoom : room)
      )
    } else {
      setRooms(prev => [savedRoom, ...prev])
    }
    setShowRoomForm(false)
    setEditingRoom(null)
  }

  const filteredRooms = rooms.filter(room => 
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ניהול חללים</h1>
            <p className="mt-2 text-gray-600">
              ניהול כל חללי העבודה במערכת
            </p>
          </div>
          
          <Button onClick={() => setShowRoomForm(true)}>
            <Plus className="h-4 w-4 ml-2" />
            חלל חדש
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="חיפוש חללים..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Rooms Table */}
        <Card>
          <CardHeader>
            <CardTitle>חללים ({filteredRooms.length})</CardTitle>
            <CardDescription>
              רשימת כל חללי העבודה במערכת
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>חלל</TableHead>
                    <TableHead>מיקום</TableHead>
                    <TableHead>קיבולת</TableHead>
                    <TableHead>ציוד</TableHead>
                    <TableHead>אישור נדרש</TableHead>
                    <TableHead>סטטוס</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: room.color }}
                          />
                          <div>
                            <div className="font-medium">{room.name}</div>
                            {room.description && (
                              <div className="text-sm text-gray-500 line-clamp-1">
                                {room.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {room.location}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-400" />
                          {room.capacity} מקומות
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {room.equipment.slice(0, 2).map((item, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {item}
                            </Badge>
                          ))}
                          {room.equipment.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{room.equipment.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {room.requires_approval ? (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <CheckCircle className="h-3 w-3 ml-1" />
                            כן
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <XCircle className="h-3 w-3 ml-1" />
                            לא
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={room.bookable ? 'default' : 'secondary'}>
                          {room.bookable ? 'פעיל' : 'לא פעיל'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setEditingRoom(room)
                              setShowRoomForm(true)
                            }}>
                              <Edit className="h-4 w-4 ml-2" />
                              עריכה
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleToggleRoomStatus(room.id, room.bookable)}
                            >
                              {room.bookable ? (
                                <>
                                  <XCircle className="h-4 w-4 ml-2" />
                                  השבת
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 ml-2" />
                                  הפעל
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteRoom(room.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 ml-2" />
                              מחק
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredRooms.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'לא נמצאו חללים התואמים לחיפוש' : 'אין חללים במערכת'}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Room Form Dialog */}
        <RoomFormDialog
          open={showRoomForm}
          onClose={() => {
            setShowRoomForm(false)
            setEditingRoom(null)
          }}
          room={editingRoom}
          onSave={handleRoomSaved}
        />
      </div>
    </MainLayout>
  )
}
