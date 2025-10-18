import { NextRequest, NextResponse } from 'next/server'
import { AdminAuthService, supabaseAdmin } from '@/lib/admin/auth'

export async function POST(request: NextRequest) {
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

    // Check permission - ensure admin.permissions exists and is an array
    const permissions = admin.permissions || []
    const hasPermission = permissions.includes('provider_verification') || 
                         permissions.includes('all_permissions') || 
                         admin.role === 'super_admin'
    
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const { provider_id, status, notes, rejection_reason } = await request.json()

    if (!provider_id || !status) {
      return NextResponse.json(
        { error: 'Provider ID and status are required' },
        { status: 400 }
      )
    }

    if (!['approved', 'rejected', 'suspended'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Update service provider verification status directly
    const { data: verificationUpdate, error: verificationError } = await supabaseAdmin
      .from('service_provider_verifications')
      .update({
        status: status,
        verification_notes: notes || null,
        rejection_reason: status === 'rejected' ? rejection_reason : null,
        verified_by: admin.id,
        verified_at: status === 'approved' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('service_provider_id', provider_id)

    if (verificationError) {
      console.error('Verification update error:', verificationError)
      return NextResponse.json(
        { error: 'Failed to update verification status' },
        { status: 500 }
      )
    }

    // Update service provider verified status
    const { data: providerUpdate, error: providerError } = await supabaseAdmin
      .from('service_providers')
      .update({
        is_verified: status === 'approved'
      })
      .eq('id', provider_id)

    if (providerError) {
      console.error('Provider update error:', providerError)
      return NextResponse.json(
        { error: 'Failed to update provider status' },
        { status: 500 }
      )
    }

    // Log the action
    await AdminAuthService.logAction(admin.id, {
      action_type: 'provider_verified',
      target_table: 'service_providers',
      target_id: provider_id,
      description: `Provider ${status}: ${notes || rejection_reason || 'No notes'}`,
      ip_address: request.ip || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown'
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Provider verification API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}