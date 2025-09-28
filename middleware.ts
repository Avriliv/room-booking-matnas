import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const url = req.nextUrl
  const pathname = url.pathname

  // TEMP LOGS - Remove after debugging
  console.log('[MW] path=', pathname, 'search=', url.search)

  // Avoid redirecting to the same path to prevent infinite loops
  const currentUrl = req.url
  const targetUrl = new URL('/dashboard', req.url).toString()
  
  if (currentUrl === targetUrl) {
    console.log('[MW] Preventing redirect loop to same URL')
    return NextResponse.next()
  }

  // No auth middleware needed - handled in components
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)']
}
