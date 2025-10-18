import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/admin/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params
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
      case 'activate':
        updateData = { is_active: true }
        actionDescription = 'User activated'
        break
      case 'deactivate':
        updateData = { is_active: false }
        actionDescription = 'User suspended'
        break
      case 'verify':
        updateData = { is_verified: true }
        actionDescription = 'User verified'
        break
      case 'unverify':
        updateData = { is_verified: false }
        actionDescription = 'User verification removed'
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Update user
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating user:', updateError)
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
    }

    // Log admin action
    await supabaseAdmin
      .from('admin_action_logs')
      .insert({
        admin_id: adminProfile.id,
        action_type: 'user_management',
        resource_type: 'user',
        resource_id: userId,
        description: actionDescription,
        details: {
          action,
          reason: reason || null,
          previous_state: updateData,
        }
      })

    return NextResponse.json({ success: true, message: actionDescription })

  } catch (error) {
    console.error('Error in POST /api/admin/users/[userId]/action:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}