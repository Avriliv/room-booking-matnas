'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Calendar, 
  Home, 
  Building2, 
  User, 
  Settings, 
  LogOut, 
  Menu,
  X,
  Shield,
  Clock,
  TrendingUp,
  Edit
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function Navigation() {
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
  }

  // Navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      { name: 'דשבורד', href: '/dashboard', icon: Home, roles: ['admin', 'editor', 'user'] },
      { name: 'לוח שנה', href: '/calendar', icon: Calendar, roles: ['admin', 'editor', 'user'] },
      { name: 'חללים', href: '/rooms', icon: Building2, roles: ['admin', 'editor', 'user'] },
      { name: 'הזמנות שלי', href: '/my-bookings', icon: Clock, roles: ['admin', 'editor', 'user'] },
      { name: 'פרופיל', href: '/profile', icon: User, roles: ['admin', 'editor', 'user'] }
    ]

    const adminItems = [
      { name: 'ניהול משתמשים', href: '/admin/users', icon: User, roles: ['admin'] },
      { name: 'ניהול חללים', href: '/admin/rooms', icon: Building2, roles: ['admin'] },
      { name: 'ניהול הזמנות', href: '/admin/bookings', icon: Calendar, roles: ['admin'] },
      { name: 'אישורים', href: '/admin/approvals', icon: Shield, roles: ['admin'] },
      { name: 'דוחות', href: '/admin/reports', icon: TrendingUp, roles: ['admin'] },
      { name: 'הגדרות', href: '/admin/settings', icon: Settings, roles: ['admin'] }
    ]

    const editorItems = [
      { name: 'ניהול חללים', href: '/admin/rooms', icon: Building2, roles: ['editor'] },
      { name: 'ניהול הזמנות', href: '/admin/bookings', icon: Calendar, roles: ['editor'] },
      { name: 'אישורים', href: '/admin/approvals', icon: Shield, roles: ['editor'] }
    ]

    const allItems = [...baseItems, ...adminItems, ...editorItems]

    if (!user) return baseItems

    return allItems.filter(item => 
      item.roles.includes(user.role as 'admin' | 'editor' | 'user')
    )
  }

  const navigation = getNavigationItems()

  // If user is not authenticated, show login/register buttons
  if (!user) {
    return (
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                הזמנת חללי עבודה
              </Link>
              <span className="text-sm text-gray-600 mr-2">המחלקה לחינוך בלתי פורמלי מטה אשר</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
                <Link href="/auth/login">התחבר</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/auth/login">הרשם</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <nav className="bg-white shadow-lg border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
                הזמנת חללי עבודה
              </Link>
              <span className="hidden lg:block text-sm text-gray-600 mr-4">המחלקה לחינוך בלתי פורמלי מטה אשר</span>
            </div>
            
            {/* Main Navigation */}
            <div className="hidden lg:ml-8 lg:flex lg:space-x-1 space-x-reverse">
              {navigation.filter(item => !item.roles.includes('admin') || item.roles.includes('user')).map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
                      pathname === item.href
                        ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    <Icon className="ml-2 h-4 w-4" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Admin Menu */}
            {user?.role === 'admin' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="hidden lg:flex">
                    <Shield className="ml-2 h-4 w-4" />
                    ניהול
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  {navigation.filter(item => item.roles.includes('admin') && !item.roles.includes('user')).map((item) => {
                    const Icon = item.icon
                    return (
                      <DropdownMenuItem key={item.name} asChild>
                        <Link href={item.href} className="flex items-center">
                          <Icon className="ml-2 h-4 w-4" />
                          {item.name}
                        </Link>
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <span className="sr-only">פתח תפריט משתמש</span>
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                    {user?.display_name?.charAt(0) || '?'}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user?.display_name}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center">
                    <User className="ml-2 h-4 w-4" />
                    פרופיל
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center">
                    <Settings className="ml-2 h-4 w-4" />
                    הגדרות
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                  <LogOut className="ml-2 h-4 w-4" />
                  התנתק
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="mr-2 flex items-center sm:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item, index) => {
              const Icon = item.icon
              const isAdminItem = item.roles.includes('admin') && !item.roles.includes('user')
              const showSeparator = index > 0 && isAdminItem && !navigation[index - 1].roles.includes('admin')
              
              return (
                <div key={item.name}>
                  {showSeparator && (
                    <div className="border-t border-gray-200 my-2" />
                  )}
                  <Link
                    href={item.href}
                    className={cn(
                      'block pl-3 pr-4 py-2 border-r-4 text-base font-medium',
                      pathname === item.href
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <Icon className="ml-2 h-4 w-4" />
                      {item.name}
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </nav>
  )
}
