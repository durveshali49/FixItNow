import { NextRequest, NextResponse } from 'next/server'
import { AdminAuthService } from '@/lib/admin/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const session = await AdminAuthService.signIn(email, password)

    if (!session) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Log the login action
    await AdminAuthService.logAction(session.admin.id, {
      action_type: 'admin_login',
      description: 'Admin user logged in',
      ip_address: request.ip || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown'
    })

    return NextResponse.json({
      admin: session.admin,
      token: session.token,
      expires_at: session.expires_at
    })
  } catch (error: any) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    )
  }
}