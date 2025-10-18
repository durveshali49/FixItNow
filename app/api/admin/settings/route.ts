import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/admin/auth'

export async function GET() {
  try {
    // Get all system settings
    const { data: settingsData, error } = await supabaseAdmin
      .from('system_settings')
      .select('*')

    if (error) {
      console.error('Error fetching settings:', error)
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
    }

    // Convert array of settings to structured object
    const settings = {
      general: {
        platform_name: 'FixItNow',
        platform_description: 'Your trusted platform for home services',
        support_email: 'support@fixitnow.com',
        support_phone: '+1-555-0123',
        maintenance_mode: false,
        maintenance_message: 'System is under maintenance. Please check back later.',
        max_booking_radius: 50,
        default_currency: 'USD',
        timezone: 'UTC'
      },
      financial: {
        commission_rate: 15,
        payment_processing_fee: 2.9,
        minimum_booking_amount: 25,
        cancellation_fee: 10,
        late_cancellation_hours: 24,
        auto_refund_enabled: true,
        payout_schedule: 'weekly'
      },
      features: {
        user_registration: true,
        provider_registration: true,
        booking_system: true,
        chat_system: true,
        rating_system: true,
        push_notifications: true,
        email_notifications: true,
        sms_notifications: false,
        geo_location: true,
        payment_gateway: true
      },
      security: {
        password_min_length: 8,
        require_email_verification: true,
        require_phone_verification: false,
        two_factor_auth: false,
        session_timeout: 60,
        max_login_attempts: 5,
        account_lockout_duration: 30
      },
      notifications: {
        new_booking_email: true,
        booking_confirmation_email: true,
        booking_reminder_email: true,
        payment_confirmation_email: true,
        admin_alert_emails: true,
        system_maintenance_alerts: true
      }
    }

    // Override with database values if they exist
    if (settingsData && settingsData.length > 0) {
      settingsData.forEach((setting: any) => {
        const [category, key] = setting.key.split('.')
        if (settings[category as keyof typeof settings] && key) {
          (settings[category as keyof typeof settings] as any)[key] = setting.value
        }
      })
    }

    return NextResponse.json({ settings })

  } catch (error) {
    console.error('Error in GET /api/admin/settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { settings } = await request.json()

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

    if (!adminProfile || !['super_admin', 'admin'].includes(adminProfile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Convert settings object to database format
    const settingsToUpdate = []
    
    for (const [category, categorySettings] of Object.entries(settings)) {
      for (const [key, value] of Object.entries(categorySettings as Record<string, any>)) {
        settingsToUpdate.push({
          key: `${category}.${key}`,
          value: value,
          category: category,
          updated_by: adminProfile.id
        })
      }
    }

    // Update or insert settings
    for (const setting of settingsToUpdate) {
      const { error } = await supabaseAdmin
        .from('system_settings')
        .upsert(setting, {
          onConflict: 'key'
        })

      if (error) {
        console.error('Error updating setting:', error)
        throw error
      }
    }

    // Log admin action
    await supabaseAdmin
      .from('admin_action_logs')
      .insert({
        admin_id: adminProfile.id,
        action_type: 'system_settings',
        resource_type: 'settings',
        resource_id: 'system',
        description: 'System settings updated',
        details: {
          updated_settings: settingsToUpdate.length,
          categories: Object.keys(settings)
        }
      })

    return NextResponse.json({ success: true, message: 'Settings updated successfully' })

  } catch (error) {
    console.error('Error in POST /api/admin/settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}