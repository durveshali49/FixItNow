import { createClient } from '@supabase/supabase-js'
import bcrypt from "bcryptjs"

// Admin-specific Supabase client that bypasses RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role key bypasses RLS
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export interface AdminUser {
  id: string
  email: string
  full_name: string
  role: 'super_admin' | 'admin' | 'moderator'
  permissions: string[]
  is_active: boolean
  last_login?: string
  created_at: string
  updated_at: string
}

export interface AdminSession {
  admin: AdminUser
  token: string
  expires_at: string
}

export class AdminAuthService {
  
  // Authenticate admin user
  static async signIn(email: string, password: string): Promise<AdminSession | null> {
    try {
      // Get admin user from database
      const { data: admin, error } = await supabaseAdmin
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single()

      if (error || !admin) {
        throw new Error('Invalid credentials')
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, admin.password_hash)
      if (!isValidPassword) {
        throw new Error('Invalid credentials')
      }

      // Update last login
      await supabaseAdmin
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', admin.id)

      // Create session token (you might want to use JWT here)
      const token = Buffer.from(`${admin.id}:${Date.now()}`).toString('base64')
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours

      // Remove password hash from response
      const { password_hash, ...adminWithoutPassword } = admin

      return {
        admin: adminWithoutPassword,
        token,
        expires_at: expiresAt
      }
    } catch (error) {
      console.error('Admin sign in error:', error)
      return null
    }
  }

  // Verify admin session
  static async verifySession(token: string): Promise<AdminUser | null> {
    try {
      const decoded = Buffer.from(token, 'base64').toString()
      const [adminId] = decoded.split(':')

      const { data: admin, error } = await supabaseAdmin
        .from('admin_users')
        .select('id, email, full_name, role, permissions, is_active, last_login, created_at, updated_at')
        .eq('id', adminId)
        .eq('is_active', true)
        .single()

      if (error || !admin) {
        return null
      }

      return admin
    } catch (error) {
      console.error('Session verification error:', error)
      return null
    }
  }

  // Get all admin users (super admin only)
  static async getAllAdmins(): Promise<AdminUser[]> {
    const { data, error } = await supabaseAdmin
      .from('admin_users')
      .select('id, email, full_name, role, permissions, is_active, last_login, created_at, updated_at')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error('Failed to fetch admin users')
    }

    return data || []
  }

  // Create new admin user (super admin only)
  static async createAdmin(adminData: {
    email: string
    password: string
    full_name: string
    role: 'admin' | 'moderator'
    permissions: string[]
  }): Promise<AdminUser> {
    const passwordHash = await bcrypt.hash(adminData.password, 10)

    const { data, error } = await supabaseAdmin
      .from('admin_users')
      .insert({
        email: adminData.email,
        password_hash: passwordHash,
        full_name: adminData.full_name,
        role: adminData.role,
        permissions: adminData.permissions
      })
      .select('id, email, full_name, role, permissions, is_active, last_login, created_at, updated_at')
      .single()

    if (error) {
      throw new Error('Failed to create admin user')
    }

    return data
  }

  // Update admin user
  static async updateAdmin(adminId: string, updates: Partial<AdminUser>): Promise<AdminUser> {
    const { data, error } = await supabaseAdmin
      .from('admin_users')
      .update(updates)
      .eq('id', adminId)
      .select('id, email, full_name, role, permissions, is_active, last_login, created_at, updated_at')
      .single()

    if (error) {
      throw new Error('Failed to update admin user')
    }

    return data
  }

  // Log admin action
  static async logAction(adminId: string, action: {
    action_type: string
    target_table?: string
    target_id?: string
    old_values?: any
    new_values?: any
    description?: string
    ip_address?: string
    user_agent?: string
  }): Promise<void> {
    await supabaseAdmin
      .from('admin_action_logs')
      .insert({
        admin_id: adminId,
        ...action
      })
  }
}

export { supabaseAdmin }