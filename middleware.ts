import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * Middleware for route protection and session management
 * Protects business routes, allows public access to chat routes
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes - no auth required
  if (
    pathname.startsWith('/chat/') ||
    pathname === '/' ||
    pathname === '/login' ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/')
  ) {
    return updateSession(request)
  }

  // Business routes - require authentication
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/settings')) {
    return updateSession(request)
  }

  return updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

