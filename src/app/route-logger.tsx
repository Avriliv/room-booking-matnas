'use client'

import { useEffect, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function RouteLogger() {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    console.log('[ROUTE] Logger mounted, current path:', pathname)
  }, [])

  useEffect(() => {
    console.log('[ROUTE] Path changed to:', pathname)
  }, [pathname])

  useEffect(() => {
    if (isPending) {
      console.log('[ROUTE] Transition pending...')
      const timeout = setTimeout(() => {
        console.warn('[ROUTE] Transition taking too long (>5s)')
      }, 5000)
      
      return () => clearTimeout(timeout)
    } else {
      console.log('[ROUTE] Transition completed')
    }
  }, [isPending])

  // Override router.push to add logging
  useEffect(() => {
    const originalPush = router.push
    router.push = (href: string, options?: any) => {
      console.log('[ROUTE] Navigating to:', href)
      return originalPush.call(router, href, options)
    }

    return () => {
      router.push = originalPush
    }
  }, [router])

  return null
}
