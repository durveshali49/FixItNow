'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  Settings, 
  DollarSign, 
  Shield, 
  Bell, 
  Globe, 
  Mail,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface SystemSettings {
  general: {
    platform_name: string
    platform_description: string
    support_email: string
    support_phone: string
    maintenance_mode: boolean
    maintenance_message: string
    max_booking_radius: number
    default_currency: string
    timezone: string
  }
  financial: {
    commission_rate: number
    payment_processing_fee: number
    minimum_booking_amount: number
    cancellation_fee: number
    late_cancellation_hours: number
    auto_refund_enabled: boolean
    payout_schedule: string
  }
  features: {
    user_registration: boolean
    provider_registration: boolean
    booking_system: boolean
    chat_system: boolean
    rating_system: boolean
    push_notifications: boolean
    email_notifications: boolean
    sms_notifications: boolean
    geo_location: boolean
    payment_gateway: boolean
  }
  security: {
    password_min_length: number
    require_email_verification: boolean
    require_phone_verification: boolean
    two_factor_auth: boolean
    session_timeout: number
    max_login_attempts: number
    account_lockout_duration: number
  }
  notifications: {
    new_booking_email: boolean
    booking_confirmation_email: boolean
    booking_reminder_email: boolean
    payment_confirmation_email: boolean
    admin_alert_emails: boolean
    system_maintenance_alerts: boolean
  }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings)
      } else {
        toast.error('Failed to fetch settings')
      }
    } catch (error) {
      toast.error('Error fetching settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleSaveSettings = async () => {
    if (!settings) return

    setSaving(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings })
      })

      if (response.ok) {
        toast.success('Settings saved successfully')
      } else {
        toast.error('Failed to save settings')
      }
    } catch (error) {
      toast.error('Error saving settings')
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (category: keyof SystemSettings, key: string, value: any) => {
    if (!settings) return
    
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [key]: value
      }
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Failed to load settings</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground">
            Configure platform settings and preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchSettings} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={handleSaveSettings} disabled={saving}>
            <Save className={`h-4 w-4 mr-2 ${saving ? 'animate-spin' : ''}`} />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Platform Configuration
              </CardTitle>
              <CardDescription>
                Basic platform settings and information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platform_name">Platform Name</Label>
                  <Input
                    id="platform_name"
                    value={settings.general.platform_name}
                    onChange={(e) => updateSetting('general', 'platform_name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default_currency">Default Currency</Label>
                  <Select value={settings.general.default_currency} onValueChange={(value) => updateSetting('general', 'default_currency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CAD">CAD (C$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="platform_description">Platform Description</Label>
                <Textarea
                  id="platform_description"
                  value={settings.general.platform_description}
                  onChange={(e) => updateSetting('general', 'platform_description', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="support_email">Support Email</Label>
                  <Input
                    id="support_email"
                    type="email"
                    value={settings.general.support_email}
                    onChange={(e) => updateSetting('general', 'support_email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support_phone">Support Phone</Label>
                  <Input
                    id="support_phone"
                    value={settings.general.support_phone}
                    onChange={(e) => updateSetting('general', 'support_phone', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max_booking_radius">Max Booking Radius (km)</Label>
                  <Input
                    id="max_booking_radius"
                    type="number"
                    value={settings.general.max_booking_radius}
                    onChange={(e) => updateSetting('general', 'max_booking_radius', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={settings.general.timezone} onValueChange={(value) => updateSetting('general', 'timezone', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">Put the platform in maintenance mode</p>
                  </div>
                  <Switch
                    checked={settings.general.maintenance_mode}
                    onCheckedChange={(checked) => updateSetting('general', 'maintenance_mode', checked)}
                  />
                </div>
                {settings.general.maintenance_mode && (
                  <div className="space-y-2">
                    <Label htmlFor="maintenance_message">Maintenance Message</Label>
                    <Textarea
                      id="maintenance_message"
                      value={settings.general.maintenance_message}
                      onChange={(e) => updateSetting('general', 'maintenance_message', e.target.value)}
                      placeholder="Enter message to display during maintenance..."
                      rows={3}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Settings */}
        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Financial Configuration
              </CardTitle>
              <CardDescription>
                Commission rates, fees, and payment settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="commission_rate">Commission Rate (%)</Label>
                  <Input
                    id="commission_rate"
                    type="number"
                    step="0.1"
                    min="0"
                    max="50"
                    value={settings.financial.commission_rate}
                    onChange={(e) => updateSetting('financial', 'commission_rate', parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_processing_fee">Payment Processing Fee (%)</Label>
                  <Input
                    id="payment_processing_fee"
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={settings.financial.payment_processing_fee}
                    onChange={(e) => updateSetting('financial', 'payment_processing_fee', parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minimum_booking_amount">Minimum Booking Amount</Label>
                  <Input
                    id="minimum_booking_amount"
                    type="number"
                    min="0"
                    value={settings.financial.minimum_booking_amount}
                    onChange={(e) => updateSetting('financial', 'minimum_booking_amount', parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cancellation_fee">Cancellation Fee</Label>
                  <Input
                    id="cancellation_fee"
                    type="number"
                    min="0"
                    value={settings.financial.cancellation_fee}
                    onChange={(e) => updateSetting('financial', 'cancellation_fee', parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="late_cancellation_hours">Late Cancellation (hours before)</Label>
                  <Input
                    id="late_cancellation_hours"
                    type="number"
                    min="1"
                    max="72"
                    value={settings.financial.late_cancellation_hours}
                    onChange={(e) => updateSetting('financial', 'late_cancellation_hours', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payout_schedule">Payout Schedule</Label>
                  <Select value={settings.financial.payout_schedule} onValueChange={(value) => updateSetting('financial', 'payout_schedule', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between border-t pt-4">
                <div className="space-y-0.5">
                  <Label>Auto Refund</Label>
                  <p className="text-sm text-muted-foreground">Automatically process refunds for cancelled bookings</p>
                </div>
                <Switch
                  checked={settings.financial.auto_refund_enabled}
                  onCheckedChange={(checked) => updateSetting('financial', 'auto_refund_enabled', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feature Settings */}
        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Feature Controls
              </CardTitle>
              <CardDescription>
                Enable or disable platform features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  {Object.entries(settings.features).slice(0, 5).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="capitalize">{key.replace(/_/g, ' ')}</Label>
                        <p className="text-sm text-muted-foreground">
                          {key === 'user_registration' && 'Allow new customer registrations'}
                          {key === 'provider_registration' && 'Allow new provider registrations'}
                          {key === 'booking_system' && 'Enable booking functionality'}
                          {key === 'chat_system' && 'Enable in-app messaging'}
                          {key === 'rating_system' && 'Allow users to rate services'}
                        </p>
                      </div>
                      <Switch
                        checked={value as boolean}
                        onCheckedChange={(checked) => updateSetting('features', key, checked)}
                      />
                    </div>
                  ))}
                </div>
                
                <div className="space-y-4">
                  {Object.entries(settings.features).slice(5).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="capitalize">{key.replace(/_/g, ' ')}</Label>
                        <p className="text-sm text-muted-foreground">
                          {key === 'push_notifications' && 'Send push notifications to mobile apps'}
                          {key === 'email_notifications' && 'Send email notifications'}
                          {key === 'sms_notifications' && 'Send SMS notifications'}
                          {key === 'geo_location' && 'Use GPS for location services'}
                          {key === 'payment_gateway' && 'Enable online payments'}
                        </p>
                      </div>
                      <Switch
                        checked={value as boolean}
                        onCheckedChange={(checked) => updateSetting('features', key, checked)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Configuration
              </CardTitle>
              <CardDescription>
                Password policies and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password_min_length">Minimum Password Length</Label>
                  <Input
                    id="password_min_length"
                    type="number"
                    min="6"
                    max="20"
                    value={settings.security.password_min_length}
                    onChange={(e) => updateSetting('security', 'password_min_length', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="session_timeout">Session Timeout (minutes)</Label>
                  <Input
                    id="session_timeout"
                    type="number"
                    min="15"
                    max="480"
                    value={settings.security.session_timeout}
                    onChange={(e) => updateSetting('security', 'session_timeout', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max_login_attempts">Max Login Attempts</Label>
                  <Input
                    id="max_login_attempts"
                    type="number"
                    min="3"
                    max="10"
                    value={settings.security.max_login_attempts}
                    onChange={(e) => updateSetting('security', 'max_login_attempts', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account_lockout_duration">Account Lockout Duration (minutes)</Label>
                  <Input
                    id="account_lockout_duration"
                    type="number"
                    min="5"
                    max="1440"
                    value={settings.security.account_lockout_duration}
                    onChange={(e) => updateSetting('security', 'account_lockout_duration', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Email Verification</Label>
                    <p className="text-sm text-muted-foreground">Users must verify email before accessing platform</p>
                  </div>
                  <Switch
                    checked={settings.security.require_email_verification}
                    onCheckedChange={(checked) => updateSetting('security', 'require_email_verification', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Phone Verification</Label>
                    <p className="text-sm text-muted-foreground">Users must verify phone number</p>
                  </div>
                  <Switch
                    checked={settings.security.require_phone_verification}
                    onCheckedChange={(checked) => updateSetting('security', 'require_phone_verification', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Enable 2FA for enhanced security</p>
                  </div>
                  <Switch
                    checked={settings.security.two_factor_auth}
                    onCheckedChange={(checked) => updateSetting('security', 'two_factor_auth', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure email and notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {Object.entries(settings.notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="capitalize">{key.replace(/_/g, ' ')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {key === 'new_booking_email' && 'Send email when new booking is created'}
                        {key === 'booking_confirmation_email' && 'Send confirmation email to users'}
                        {key === 'booking_reminder_email' && 'Send reminder emails before bookings'}
                        {key === 'payment_confirmation_email' && 'Send payment confirmation emails'}
                        {key === 'admin_alert_emails' && 'Send alerts to admins for important events'}
                        {key === 'system_maintenance_alerts' && 'Send maintenance notifications'}
                      </p>
                    </div>
                    <Switch
                      checked={value as boolean}
                      onCheckedChange={(checked) => updateSetting('notifications', key, checked)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}