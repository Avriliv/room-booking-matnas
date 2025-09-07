'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
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
  TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Profile } from '@/types'

interface NavigationProps {
  user: Profile | null
  isAdmin?: boolean
}

export function Navigation({ user, isAdmin = false }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const supabase = createClientComponentClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const navigation = [
    { name: 'דשבורד', href: '/dashboard', icon: Home },
    { name: 'לוח שנה', href: '/calendar', icon: Calendar },
    { name: 'חללים', href: '/rooms', icon: Building2 },
    { name: 'הזמנות שלי', href: '/my-bookings', icon: User },
  ]

  const adminNavigation = [
    { name: 'ניהול חללים', href: '/admin/rooms', icon: Building2 },
    { name: 'ניהול הזמנות', href: '/admin/bookings', icon: Calendar },
    { name: 'ניהול משתמשים', href: '/admin/users', icon: User },
    { name: 'תור אישורים', href: '/admin/approvals', icon: Clock },
    { name: 'דוחות', href: '/admin/reports', icon: TrendingUp },
    { name: 'הגדרות', href: '/admin/settings', icon: Settings },
  ]

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-blue-600">
                מטה אשר
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8 space-x-reverse">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium',
                      pathname === item.href
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    )}
                  >
                    <Icon className="ml-2 h-4 w-4" />
                    {item.name}
                  </Link>
                )
              })}
              {isAdmin && (
                <>
                  <div className="border-r border-gray-200 mx-4" />
                  {adminNavigation.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium',
                          pathname === item.href
                            ? 'border-blue-500 text-gray-900'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                        )}
                      >
                        <Icon className="ml-2 h-4 w-4" />
                        {item.name}
                      </Link>
                    )
                  })}
                </>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <div className="ml-4 flex items-center md:ml-6">
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
                      <p className="text-xs text-muted-foreground">
                        {user?.job_title}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User className="ml-2 h-4 w-4" />
                      <span>פרופיל</span>
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center">
                        <Shield className="ml-2 h-4 w-4" />
                        <span>ניהול מערכת</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                    <LogOut className="ml-2 h-4 w-4" />
                    <span>התנתק</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
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
              )
            })}
            {isAdmin && (
              <>
                <div className="border-t border-gray-200 my-2" />
                {adminNavigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
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
                  )
                })}
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
