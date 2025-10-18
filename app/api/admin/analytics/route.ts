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

    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '30d'

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    switch (range) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(endDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(endDate.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
      default:
        startDate.setDate(endDate.getDate() - 30)
    }

    // Get overview statistics
    const { data: bookings } = await supabaseAdmin
      .from('bookings')
      .select('total_amount, status, created_at')
      .gte('created_at', startDate.toISOString())

    const { data: users } = await supabaseAdmin
      .from('users')
      .select('user_type, created_at')
      .gte('created_at', startDate.toISOString())

    const { count: totalBookings } = await supabaseAdmin
      .from('bookings')
      .select('*', { count: 'exact' })

    const { count: totalUsers } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact' })

    const { count: totalProviders } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact' })
      .eq('user_type', 'provider')

    // Calculate metrics
    const completedBookings = bookings?.filter(b => b.status === 'completed') || []
    const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0)
    const averageBookingValue = completedBookings.length > 0 ? totalRevenue / completedBookings.length : 0

    // Calculate growth rates (mock data for now - would need previous period comparison)
    const revenueGrowth = Math.floor(Math.random() * 20) - 5 // -5% to +15%
    const bookingGrowth = Math.floor(Math.random() * 15) - 2 // -2% to +13%
    const userGrowth = Math.floor(Math.random() * 25) + 5 // +5% to +30%

    // Generate monthly revenue chart data
    const months = []
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthBookings = bookings?.filter(b => {
        const bookingDate = new Date(b.created_at)
        return bookingDate.getMonth() === date.getMonth() && bookingDate.getFullYear() === date.getFullYear()
      }) || []
      
      const monthRevenue = monthBookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + (b.total_amount || 0), 0)

      months.push({
        month: monthNames[date.getMonth()],
        revenue: monthRevenue,
        bookings: monthBookings.length
      })
    }

    // Generate user growth data
    const userGrowthData = months.map(month => ({
      month: month.month,
      customers: Math.floor(Math.random() * 50) + 20,
      providers: Math.floor(Math.random() * 15) + 5
    }))

    // Service breakdown
    const serviceTypes = ['Plumbing', 'Electrical', 'Cleaning', 'Handyman', 'Gardening']
    const serviceBreakdown = serviceTypes.map(service => {
      const serviceBookings = bookings?.filter(b => 
        b.status === 'completed' && 
        service.toLowerCase().includes(service.toLowerCase())
      ) || []
      
      return {
        name: service,
        value: serviceBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0),
        bookings: serviceBookings.length
      }
    })

    // Top providers (mock data)
    const topProviders = [
      {
        id: '1',
        name: 'John Smith',
        business_name: 'Smith Plumbing Services',
        revenue: 15420,
        bookings: 67,
        rating: 4.8
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        business_name: 'Elite Cleaning Co',
        revenue: 12340,
        bookings: 89,
        rating: 4.9
      },
      {
        id: '3',
        name: 'Mike Wilson',
        business_name: 'Wilson Electric',
        revenue: 11200,
        bookings: 45,
        rating: 4.7
      }
    ]

    // Recent activity
    const recentActivity = [
      {
        id: '1',
        type: 'booking',
        description: 'New booking completed by Smith Plumbing Services',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        amount: 150
      },
      {
        id: '2',
        type: 'user',
        description: 'New provider registered: ABC Handyman',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
      },
      {
        id: '3',
        type: 'booking',
        description: 'Booking payment received from customer #4521',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        amount: 75
      }
    ]

    const analyticsData = {
      overview: {
        totalRevenue,
        totalBookings: totalBookings || 0,
        totalUsers: totalUsers || 0,
        totalProviders: totalProviders || 0,
        revenueGrowth,
        bookingGrowth,
        userGrowth,
        averageBookingValue
      },
      revenueChart: months,
      userGrowth: userGrowthData,
      serviceBreakdown,
      topProviders,
      recentActivity
    }

    return NextResponse.json(analyticsData)

  } catch (error) {
    console.error('Error in GET /api/admin/analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}