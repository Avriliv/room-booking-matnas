'use client'

import { ReactNode } from 'react'
import { useAuth } from '@/hooks/use-auth'

interface PermissionGuardProps {
  children: ReactNode
  requiredRoles?: ('admin' | 'editor' | 'user')[]
  fallback?: ReactNode
  requireAll?: boolean
}

export function PermissionGuard({ 
  children, 
  requiredRoles = [], 
  fallback = null,
  requireAll = false 
}: PermissionGuardProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return <>{fallback}</>
  }

  if (requiredRoles.length === 0) {
    return <>{children}</>
  }

  const hasPermission = requireAll
    ? requiredRoles.every(role => user.role === role)
    : requiredRoles.includes(user.role as 'admin' | 'editor' | 'user')

  if (!hasPermission) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// Helper components for specific roles
export function AdminOnly({ children, fallback = null }: { children: ReactNode, fallback?: ReactNode }) {
  return (
    <PermissionGuard requiredRoles={['admin']} fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

export function EditorOrAdmin({ children, fallback = null }: { children: ReactNode, fallback?: ReactNode }) {
  return (
    <PermissionGuard requiredRoles={['admin', 'editor']} fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

export function UserOrAbove({ children, fallback = null }: { children: ReactNode, fallback?: ReactNode }) {
  return (
    <PermissionGuard requiredRoles={['admin', 'editor', 'user']} fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}
