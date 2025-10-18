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

    // Get data for export
    const { data: bookings } = await supabaseAdmin
      .from('bookings')
      .select(`
        id,
        service_type,
        status,
        total_amount,
        created_at,
        customer:users!customer_id(full_name, email),
        provider:users!provider_id(full_name, email)
      `)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })

    const { data: users } = await supabaseAdmin
      .from('users')
      .select('id, full_name, email, user_type, created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })

    // Generate CSV content
    let csvContent = 'data:text/csv;charset=utf-8,'

    // Bookings section
    csvContent += 'BOOKINGS REPORT\n'
    csvContent += 'Booking ID,Service Type,Status,Amount,Customer,Provider,Date\n'
    
    bookings?.forEach((booking: any) => {
      csvContent += `${booking.id},${booking.service_type},${booking.status},${booking.total_amount},${booking.customer?.full_name || 'N/A'},${booking.provider?.full_name || 'N/A'},${new Date(booking.created_at).toLocaleDateString()}\n`
    })

    csvContent += '\n\nUSERS REPORT\n'
    csvContent += 'User ID,Full Name,Email,Type,Joined Date\n'
    
    users?.forEach((user: any) => {
      csvContent += `${user.id},${user.full_name || 'N/A'},${user.email},${user.user_type},${new Date(user.created_at).toLocaleDateString()}\n`
    })

    // Summary section
    const completedBookings = bookings?.filter((b: any) => b.status === 'completed') || []
    const totalRevenue = completedBookings.reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0)
    
    csvContent += '\n\nSUMMARY\n'
    csvContent += `Total Bookings,${bookings?.length || 0}\n`
    csvContent += `Completed Bookings,${completedBookings.length}\n`
    csvContent += `Total Revenue,$${totalRevenue.toFixed(2)}\n`
    csvContent += `New Users,${users?.length || 0}\n`
    csvContent += `Average Booking Value,$${completedBookings.length > 0 ? (totalRevenue / completedBookings.length).toFixed(2) : '0.00'}\n`

    // Create and return CSV file
    const encodedUri = encodeURI(csvContent)
    
    // For actual file download, we need to return the CSV as a blob
    const csvData = csvContent.replace('data:text/csv;charset=utf-8,', '')
    
    return new NextResponse(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="analytics-report-${range}-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })

  } catch (error) {
    console.error('Error in GET /api/admin/analytics/export:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}