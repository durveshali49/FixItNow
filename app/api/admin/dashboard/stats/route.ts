import { NextRequest, NextResponse } from 'next/server'
import { AdminAuthService, supabaseAdmin } from '@/lib/admin/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    const admin = await AdminAuthService.verifySession(token)
    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Calculate dashboard statistics from actual tables
    try {
      // Get total customers (users with customer role)
      const { count: totalCustomers } = await supabaseAdmin
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'customer')

      // Get total service providers
      const { count: totalProviders } = await supabaseAdmin
        .from('service_providers')
        .select('*', { count: 'exact', head: true })

      // Get verified providers
      const { count: verifiedProviders } = await supabaseAdmin
        .from('service_providers')
        .select('*', { count: 'exact', head: true })
        .eq('verification_status', 'verified')

      // Get pending verifications
      const { count: pendingVerifications } = await supabaseAdmin
        .from('service_providers')
        .select('*', { count: 'exact', head: true })
        .eq('verification_status', 'pending')

      // Get total appointments
      const { count: totalAppointments } = await supabaseAdmin
        .from('appointments')
        .select('*', { count: 'exact', head: true })

      // Get completed appointments
      const { count: completedAppointments } = await supabaseAdmin
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')

      // Calculate average rating
      const { data: ratingsData } = await supabaseAdmin
        .from('reviews')
        .select('rating')

      const avgRating = ratingsData && ratingsData.length > 0 
        ? ratingsData.reduce((sum, review) => sum + review.rating, 0) / ratingsData.length 
        : 0

      // Calculate total revenue (from completed appointments)
      const { data: revenueData } = await supabaseAdmin
        .from('appointments')
        .select('estimated_cost')
        .eq('status', 'completed')

      const totalRevenue = revenueData 
        ? revenueData.reduce((sum, appointment) => sum + (appointment.estimated_cost || 0), 0)
        : 0

      const stats = {
        total_customers: totalCustomers || 0,
        total_providers: totalProviders || 0,
        verified_providers: verifiedProviders || 0,
        pending_verifications: pendingVerifications || 0,
        total_appointments: totalAppointments || 0,
        completed_appointments: completedAppointments || 0,
        avg_platform_rating: Number(avgRating.toFixed(1)),
        total_revenue: totalRevenue
      }

      return NextResponse.json(stats)
    } catch (statsError) {
      console.error('Error calculating stats:', statsError)
      return NextResponse.json(
        { error: 'Failed to calculate dashboard statistics' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}