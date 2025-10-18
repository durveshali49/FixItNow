import { updateSession } from "@/lib/supabase/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Admin route protection
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    // Allow access to admin login page and all auth API endpoints
    if (pathname === '/admin/login' || pathname.startsWith('/api/admin/auth/')) {
      return NextResponse.next() // Don't use updateSession for admin routes
    }

    // For API routes (except login), check Authorization header
    if (pathname.startsWith('/api/admin')) {
      const authHeader = request.headers.get('authorization')
      const adminToken = authHeader?.replace('Bearer ', '')

      if (!adminToken) {
        return NextResponse.json(
          { error: 'No token provided' },
          { status: 401 }
        )
      }

      try {
        // Our token is base64 encoded: "adminId:timestamp"
        const decoded = Buffer.from(adminToken, 'base64').toString()
        const [adminId, timestamp] = decoded.split(':')
        
        // Check if token is expired (24 hours)
        const tokenTime = parseInt(timestamp)
        const expirationTime = tokenTime + (24 * 60 * 60 * 1000) // 24 hours
        
        if (Date.now() > expirationTime) {
          return NextResponse.json(
            { error: 'Token expired' },
            { status: 401 }
          )
        }

        // Allow access to API routes
        return NextResponse.next()
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        )
      }
    }

    // For web admin routes, check cookies
    const adminToken = request.cookies.get('admin_session')?.value

    if (!adminToken) {
      // Redirect to admin login if no token
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }

    try {
      // Our token is base64 encoded: "adminId:timestamp"
      const decoded = Buffer.from(adminToken, 'base64').toString()
      const [adminId, timestamp] = decoded.split(':')
      
      // Check if token is expired (24 hours)
      const tokenTime = parseInt(timestamp)
      const expirationTime = tokenTime + (24 * 60 * 60 * 1000) // 24 hours
      
      if (Date.now() > expirationTime) {
        const loginUrl = new URL('/admin/login', request.url)
        const response = NextResponse.redirect(loginUrl)
        response.cookies.delete('admin_session')
        return response
      }

      // Allow access to admin routes
      return NextResponse.next() // Don't use updateSession for admin routes
    } catch (error) {
      // Invalid token, redirect to login
      const loginUrl = new URL('/admin/login', request.url)
      const response = NextResponse.redirect(loginUrl)
      response.cookies.delete('admin_session')
      return response
    }
  }

  // For non-admin routes, use regular session handling
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
