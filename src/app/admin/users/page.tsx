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
  UserCheck, 
  UserX,
  Mail,
  Phone,
  Briefcase
} from 'lucide-react'
import { Profile } from '@/types'
import { toast } from 'sonner'
import { UserFormDialog } from '@/components/admin/user-form-dialog'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showUserForm, setShowUserForm] = useState(false)
  const [editingUser, setEditingUser] = useState<Profile | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data: usersData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      setUsers(usersData || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('שגיאה בטעינת המשתמשים')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ active: !currentStatus })
        .eq('id', userId)

      if (error) throw error

      setUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, active: !currentStatus }
            : user
        )
      )

      toast.success(`משתמש ${!currentStatus ? 'הופעל' : 'הושבת'} בהצלחה`)
    } catch (error: any) {
      toast.error(error.message || 'שגיאה בעדכון סטטוס המשתמש')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק את המשתמש?')) return

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (error) throw error

      setUsers(prev => prev.filter(user => user.id !== userId))
      toast.success('משתמש נמחק בהצלחה')
    } catch (error: any) {
      toast.error(error.message || 'שגיאה במחיקת המשתמש')
    }
  }

  const handleUserSaved = (savedUser: Profile) => {
    if (editingUser) {
      setUsers(prev => 
        prev.map(user => user.id === savedUser.id ? savedUser : user)
      )
    } else {
      setUsers(prev => [savedUser, ...prev])
    }
    setShowUserForm(false)
    setEditingUser(null)
  }

  const filteredUsers = users.filter(user => 
    user.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.job_title?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-100 text-red-800">מנהל</Badge>
      case 'editor':
        return <Badge className="bg-blue-100 text-blue-800">עורך</Badge>
      case 'user':
        return <Badge className="bg-gray-100 text-gray-800">משתמש</Badge>
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

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ניהול משתמשים</h1>
            <p className="mt-2 text-gray-600">
              ניהול כל המשתמשים במערכת
            </p>
          </div>
          
          <Button onClick={() => setShowUserForm(true)}>
            <Plus className="h-4 w-4 ml-2" />
            משתמש חדש
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="חיפוש משתמשים..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>משתמשים ({filteredUsers.length})</CardTitle>
            <CardDescription>
              רשימת כל המשתמשים במערכת
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>שם</TableHead>
                    <TableHead>מייל</TableHead>
                    <TableHead>תפקיד</TableHead>
                    <TableHead>הרשאה</TableHead>
                    <TableHead>סטטוס</TableHead>
                    <TableHead>תאריך הצטרפות</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                            {user.display_name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium">{user.display_name}</div>
                            {user.job_title && (
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <Briefcase className="h-3 w-3" />
                                {user.job_title}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.job_title || '-'}
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(user.role)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.active ? 'default' : 'secondary'}>
                          {user.active ? 'פעיל' : 'לא פעיל'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString('he-IL')}
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
                              setEditingUser(user)
                              setShowUserForm(true)
                            }}>
                              <Edit className="h-4 w-4 ml-2" />
                              עריכה
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleToggleUserStatus(user.id, user.active)}
                            >
                              {user.active ? (
                                <>
                                  <UserX className="h-4 w-4 ml-2" />
                                  השבת
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-4 w-4 ml-2" />
                                  הפעל
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteUser(user.id)}
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

            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'לא נמצאו משתמשים התואמים לחיפוש' : 'אין משתמשים במערכת'}
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Form Dialog */}
        <UserFormDialog
          open={showUserForm}
          onClose={() => {
            setShowUserForm(false)
            setEditingUser(null)
          }}
          user={editingUser}
          onSave={handleUserSaved}
        />
      </div>
    </MainLayout>
  )
}
