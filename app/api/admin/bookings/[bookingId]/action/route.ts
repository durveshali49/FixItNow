import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/admin/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const { bookingId } = params
    const { action, reason } = await request.json()

    // Get current admin user for logging
    const { data: { user: adminUser } } = await supabaseAdmin.auth.getUser()
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin permissions
    const { data: adminProfile } = await supabaseAdmin
      .from('admin_users')
      .select('id, role')
      .eq('email', adminUser.email)
      .single()

    if (!adminProfile) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    let updateData: any = {}
    let actionDescription = ''

    switch (action) {
      case 'confirm':
        updateData = { status: 'confirmed' }
        actionDescription = 'Booking confirmed by admin'
        break
      case 'cancel':
        updateData = { status: 'cancelled' }
        actionDescription = 'Booking cancelled by admin'
        break
      case 'start':
        updateData = { status: 'in_progress' }
        actionDescription = 'Booking marked as in progress'
        break
      case 'complete':
        updateData = { status: 'completed' }
        actionDescription = 'Booking marked as completed'
        break
      case 'dispute':
        updateData = { status: 'disputed' }
        actionDescription = 'Booking flagged as disputed'
        
        // Create dispute record if reason provided
        if (reason) {
          await supabaseAdmin
            .from('booking_disputes')
            .insert({
              booking_id: bookingId,
              reason: reason,
              status: 'open',
              reported_by: 'admin',
              admin_id: adminProfile.id
            })
        }
        break
      case 'resolve_dispute':
        updateData = { status: 'completed' }
        actionDescription = 'Dispute resolved and booking completed'
        
        // Update dispute status
        await supabaseAdmin
          .from('booking_disputes')
          .update({ status: 'resolved', resolved_at: new Date().toISOString() })
          .eq('booking_id', bookingId)
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Update booking status
    const { error: updateError } = await supabaseAdmin
      .from('bookings')
      .update(updateData)
      .eq('id', bookingId)

    if (updateError) {
      console.error('Error updating booking:', updateError)
      return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
    }

    // Log admin action
    await supabaseAdmin
      .from('admin_action_logs')
      .insert({
        admin_id: adminProfile.id,
        action_type: 'booking_management',
        resource_type: 'booking',
        resource_id: bookingId,
        description: actionDescription,
        details: {
          action,
          reason: reason || null,
          new_status: updateData.status,
        }
      })

    return NextResponse.json({ success: true, message: actionDescription })

  } catch (error) {
    console.error('Error in POST /api/admin/bookings/[bookingId]/action:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}