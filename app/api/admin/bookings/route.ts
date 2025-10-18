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
    
    // Get all appointments with customer and provider details
    const { data: appointments, error } = await supabaseAdmin
      .from('appointments')
      .select(`
        id,
        title,
        description,
        status,
        scheduled_date,
        scheduled_time,
        estimated_cost,
        actual_cost,
        customer_address,
        special_instructions,
        payment_status,
        created_at,
        updated_at,
        customer:users!customer_id (
          id,
          full_name,
          email,
          phone_number,
          city,
          state
        ),
        service_provider:service_providers!service_provider_id (
          id,
          hourly_rate,
          bio,
          users (
            id,
            full_name,
            email,
            phone_number,
            city,
            state
          )
        ),
        category:service_categories!category_id (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching appointments:', error)
      return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
    }

    // Format the data for the frontend
    const formattedAppointments = (appointments || []).map((appointment: any) => ({
      ...appointment,
      service_provider: {
        ...appointment.service_provider,
        user: appointment.service_provider?.users || null
      }
    }))

    return NextResponse.json({ appointments: formattedAppointments })

  } catch (error) {
    console.error('Error in GET /api/admin/bookings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}