import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/admin/auth'
import { AdminAuthService } from '@/lib/admin/auth'

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    
    try {
      const admin = await AdminAuthService.verifySession(token)
      if (!admin) {
        return NextResponse.json({ error: 'Invalid admin token' }, { status: 401 })
      }
    } catch (error) {
      console.error('Admin auth error:', error)
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    }
    
    // Get all customer users only (excluding service providers)
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        email,
        full_name,
        phone_number,
        role,
        city,
        state,
        is_active,
        created_at,
        updated_at
      `)
      .eq('role', 'customer')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    // Get appointment stats for customers only
    const usersWithStats = await Promise.all(
      (users || []).map(async (user) => {
        // Get appointment counts for customers
        const { count: customerAppointments } = await supabaseAdmin
          .from('appointments')
          .select('*', { count: 'exact' })
          .eq('customer_id', user.id)

        // Get customer spending
        const { data: completedAppointments } = await supabaseAdmin
          .from('appointments')
          .select('actual_cost, estimated_cost')
          .eq('customer_id', user.id)
          .eq('status', 'completed')

        const totalSpent = completedAppointments?.reduce((sum, appointment) => 
          sum + (appointment.actual_cost || appointment.estimated_cost || 0), 0) || 0

        return {
          ...user,
          user_type: user.role, // Map role to user_type for frontend compatibility
          is_verified: true, // Customers are verified by default
          customer_profile: {
            total_bookings: customerAppointments || 0,
            total_spent: totalSpent
          }
        }
      })
    )

    return NextResponse.json({ users: usersWithStats })

  } catch (error) {
    console.error('Error in GET /api/admin/users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}