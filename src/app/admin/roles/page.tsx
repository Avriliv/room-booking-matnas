'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loading, TableSkeleton } from '@/components/ui/loading'
import { ErrorMessage } from '@/components/ui/error'
import { AdminOnly } from '@/components/auth/permission-guard'
import { Search, UserCheck, UserX, Shield, Edit, Users } from 'lucide-react'
import { toast } from 'sonner'

interface User {
  id: string
  display_name: string
  email: string
  job_title: string
  role: 'admin' | 'editor' | 'user'
  active: boolean
  created_at: string
}

export default function RolesPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [newRole, setNewRole] = useState<'admin' | 'editor' | 'user'>('user')
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setError(null)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      setError('שגיאה בטעינת המשתמשים')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'editor' | 'user') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) {
        throw error
      }

      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ))

      toast.success('תפקיד המשתמש עודכן בהצלחה')
      setEditingUser(null)
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error('שגיאה בעדכון התפקיד')
    }
  }

  const handleToggleActive = async (userId: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ active })
        .eq('id', userId)

      if (error) {
        throw error
      }

      setUsers(users.map(user => 
        user.id === userId ? { ...user, active } : user
      ))

      toast.success(`משתמש ${active ? 'הופעל' : 'הושבת'} בהצלחה`)
    } catch (error) {
      console.error('Error toggling active status:', error)
      toast.error('שגיאה בעדכון סטטוס המשתמש')
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'editor':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'user':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4" />
      case 'editor':
        return <Edit className="h-4 w-4" />
      case 'user':
        return <Users className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return 'מנהל מערכת'
      case 'editor':
        return 'עורך'
      case 'user':
        return 'משתמש רגיל'
      default:
        return 'לא מוגדר'
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">ניהול תפקידים</h1>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="h-10 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
            <div className="h-10 w-40 bg-gray-200 rounded-md animate-pulse"></div>
          </div>

          <TableSkeleton rows={5} />
        </div>
      </MainLayout>
    )
  }

  if (error) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">ניהול תפקידים</h1>
          </div>
          
          <ErrorMessage
            title="שגיאה בטעינת הנתונים"
            message={error}
            showRetry={true}
            onRetry={fetchUsers}
            showHome={true}
          />
        </div>
      </MainLayout>
    )
  }

  return (
    <AdminOnly>
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ניהול תפקידים</h1>
              <p className="mt-2 text-gray-600">
                נהל תפקידים והרשאות משתמשים
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="חיפוש משתמשים..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="תפקיד" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל התפקידים</SelectItem>
                <SelectItem value="admin">מנהל מערכת</SelectItem>
                <SelectItem value="editor">עורך</SelectItem>
                <SelectItem value="user">משתמש רגיל</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                משתמשים ({filteredUsers.length})
              </CardTitle>
              <CardDescription>
                רשימת כל המשתמשים במערכת
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>שם</TableHead>
                    <TableHead>אימייל</TableHead>
                    <TableHead>תפקיד</TableHead>
                    <TableHead>סטטוס</TableHead>
                    <TableHead>פעולות</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.display_name}</div>
                          <div className="text-sm text-gray-500">{user.job_title}</div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`${getRoleColor(user.role)} flex items-center gap-1 w-fit`}
                        >
                          {getRoleIcon(user.role)}
                          {getRoleText(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={user.active ? 'default' : 'secondary'}
                          className="flex items-center gap-1 w-fit"
                        >
                          {user.active ? (
                            <>
                              <UserCheck className="h-3 w-3" />
                              פעיל
                            </>
                          ) : (
                            <>
                              <UserX className="h-3 w-3" />
                              לא פעיל
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingUser(user)}
                          >
                            שנה תפקיד
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleActive(user.id, !user.active)}
                          >
                            {user.active ? 'השבת' : 'הפעל'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Edit Role Dialog */}
          {editingUser && (
            <Card className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <CardContent className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold mb-4">
                  שנה תפקיד ל-{editingUser.display_name}
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="role">תפקיד חדש</Label>
                    <Select value={newRole} onValueChange={(value: 'admin' | 'editor' | 'user') => setNewRole(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">מנהל מערכת</SelectItem>
                        <SelectItem value="editor">עורך</SelectItem>
                        <SelectItem value="user">משתמש רגיל</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleRoleChange(editingUser.id, newRole)}
                      disabled={newRole === editingUser.role}
                    >
                      עדכן
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setEditingUser(null)}
                    >
                      ביטול
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </MainLayout>
    </AdminOnly>
  )
}
