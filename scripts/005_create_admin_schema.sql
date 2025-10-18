-- FixItNow Admin Panel Database Schema

-- Create admin roles enum
CREATE TYPE admin_role AS ENUM ('super_admin', 'admin', 'moderator');
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE admin_action_type AS ENUM (
  'user_created', 'user_updated', 'user_suspended', 'user_activated',
  'provider_verified', 'provider_rejected', 'provider_suspended',
  'appointment_modified', 'category_created', 'category_updated',
  'system_setting_changed'
);

-- Admin users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL, -- We'll handle this manually
  full_name TEXT NOT NULL,
  role admin_role NOT NULL DEFAULT 'admin',
  permissions TEXT[], -- Array of specific permissions
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service provider verification table
CREATE TABLE IF NOT EXISTS public.service_provider_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_provider_id UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  status verification_status DEFAULT 'pending',
  documents_submitted TEXT[], -- Array of document URLs
  verification_notes TEXT,
  verified_by UUID REFERENCES public.admin_users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin action logs table
CREATE TABLE IF NOT EXISTS public.admin_action_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES public.admin_users(id),
  action_type admin_action_type NOT NULL,
  target_table TEXT, -- Which table was affected
  target_id UUID, -- ID of the affected record
  old_values JSONB, -- Previous values (for updates)
  new_values JSONB, -- New values
  description TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System settings table
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES public.admin_users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Platform statistics table (for dashboard)
CREATE TABLE IF NOT EXISTS public.platform_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stat_date DATE NOT NULL UNIQUE DEFAULT CURRENT_DATE,
  total_users INTEGER DEFAULT 0,
  total_customers INTEGER DEFAULT 0,
  total_service_providers INTEGER DEFAULT 0,
  verified_providers INTEGER DEFAULT 0,
  pending_verifications INTEGER DEFAULT 0,
  total_appointments INTEGER DEFAULT 0,
  completed_appointments INTEGER DEFAULT 0,
  total_revenue DECIMAL(12, 2) DEFAULT 0,
  avg_rating DECIMAL(3, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add admin role to existing user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';

-- Create admin dashboard views
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM public.users WHERE role = 'customer') as total_customers,
  (SELECT COUNT(*) FROM public.users WHERE role = 'service_provider') as total_providers,
  (SELECT COUNT(*) FROM public.service_providers WHERE is_verified = true) as verified_providers,
  (SELECT COUNT(*) FROM public.service_provider_verifications WHERE status = 'pending') as pending_verifications,
  (SELECT COUNT(*) FROM public.appointments) as total_appointments,
  (SELECT COUNT(*) FROM public.appointments WHERE status = 'completed') as completed_appointments,
  (SELECT COALESCE(AVG(rating), 0) FROM public.reviews) as avg_platform_rating,
  (SELECT COALESCE(SUM(total_amount), 0) FROM public.invoices WHERE payment_status = 'paid') as total_revenue;

-- Create view for service provider verification queue
CREATE OR REPLACE VIEW service_provider_verification_queue AS
SELECT 
  sp.id,
  u.full_name,
  u.email,
  u.phone_number,
  u.city,
  u.state,
  sp.experience_years,
  sp.hourly_rate,
  sp.bio,
  sp.skills,
  spv.status as verification_status,
  spv.documents_submitted,
  spv.verification_notes,
  spv.created_at as application_date,
  spv.updated_at as last_updated,
  admin_u.full_name as verified_by_name
FROM public.service_providers sp
JOIN public.users u ON sp.id = u.id
LEFT JOIN public.service_provider_verifications spv ON sp.id = spv.service_provider_id
LEFT JOIN public.admin_users admin_u ON spv.verified_by = admin_u.id
ORDER BY spv.created_at DESC;

-- Insert default admin user (password: admin123 - CHANGE THIS!)
-- Password hash for 'admin123' using bcrypt
INSERT INTO public.admin_users (email, password_hash, full_name, role, permissions) VALUES
('admin@fixitnow.com', '$2b$10$8K1p/a9jZVJ5rO9oCzZ9/.VzQ3Z8YvTqLQgOjPp5qQj6XzGjKyaNG', 'Super Administrator', 'super_admin', 
 ARRAY['user_management', 'provider_verification', 'system_settings', 'analytics', 'all_permissions'])
ON CONFLICT (email) DO NOTHING;

-- Insert default system settings
INSERT INTO public.system_settings (setting_key, setting_value, description) VALUES
('platform_commission_rate', '{"rate": 0.10, "currency": "INR"}', 'Platform commission rate (10%)'),
('auto_verification_enabled', '{"enabled": false}', 'Automatic service provider verification'),
('max_booking_advance_days', '{"days": 30}', 'Maximum days in advance for bookings'),
('min_hourly_rate', '{"rate": 50, "currency": "INR"}', 'Minimum hourly rate for service providers'),
('max_hourly_rate', '{"rate": 5000, "currency": "INR"}', 'Maximum hourly rate for service providers'),
('platform_maintenance_mode', '{"enabled": false, "message": "Platform under maintenance"}', 'Maintenance mode settings')
ON CONFLICT (setting_key) DO NOTHING;

-- Add RLS policies for admin tables
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_provider_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_action_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_statistics ENABLE ROW LEVEL SECURITY;

-- Admin policies (these will be bypassed by service role)
CREATE POLICY "Only admins can access admin_users" ON public.admin_users
  FOR ALL USING (false); -- Will be bypassed by service role

CREATE POLICY "Only admins can access verifications" ON public.service_provider_verifications
  FOR ALL USING (false); -- Will be bypassed by service role

CREATE POLICY "Only admins can access action logs" ON public.admin_action_logs
  FOR ALL USING (false); -- Will be bypassed by service role

CREATE POLICY "Only admins can access system settings" ON public.system_settings
  FOR ALL USING (false); -- Will be bypassed by service role

CREATE POLICY "Only admins can access platform statistics" ON public.platform_statistics
  FOR ALL USING (false); -- Will be bypassed by service role

-- Create functions for admin operations
CREATE OR REPLACE FUNCTION verify_service_provider(
  provider_id UUID,
  admin_id UUID,
  approval_status verification_status,
  notes TEXT DEFAULT NULL,
  rejection_reason TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  -- Update service provider verification status
  UPDATE public.service_provider_verifications 
  SET 
    status = approval_status,
    verification_notes = notes,
    rejection_reason = rejection_reason,
    verified_by = admin_id,
    verified_at = CASE WHEN approval_status = 'approved' THEN NOW() ELSE NULL END,
    updated_at = NOW()
  WHERE service_provider_id = provider_id;

  -- Update service provider verified status
  UPDATE public.service_providers 
  SET is_verified = (approval_status = 'approved')
  WHERE id = provider_id;

  -- Log the action
  INSERT INTO public.admin_action_logs (admin_id, action_type, target_table, target_id, description)
  VALUES (admin_id, 'provider_verified', 'service_providers', provider_id, 
          format('Provider %s: %s', approval_status, COALESCE(notes, rejection_reason, 'No notes')));

  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update daily statistics
CREATE OR REPLACE FUNCTION update_daily_statistics() RETURNS VOID AS $$
BEGIN
  INSERT INTO public.platform_statistics (
    stat_date,
    total_users,
    total_customers,
    total_service_providers,
    verified_providers,
    pending_verifications,
    total_appointments,
    completed_appointments,
    total_revenue,
    avg_rating
  )
  SELECT 
    CURRENT_DATE,
    (SELECT COUNT(*) FROM public.users),
    (SELECT COUNT(*) FROM public.users WHERE role = 'customer'),
    (SELECT COUNT(*) FROM public.users WHERE role = 'service_provider'),
    (SELECT COUNT(*) FROM public.service_providers WHERE is_verified = true),
    (SELECT COUNT(*) FROM public.service_provider_verifications WHERE status = 'pending'),
    (SELECT COUNT(*) FROM public.appointments),
    (SELECT COUNT(*) FROM public.appointments WHERE status = 'completed'),
    (SELECT COALESCE(SUM(total_amount), 0) FROM public.invoices WHERE payment_status = 'paid'),
    (SELECT COALESCE(AVG(rating), 0) FROM public.reviews)
  ON CONFLICT (stat_date) DO UPDATE SET
    total_users = EXCLUDED.total_users,
    total_customers = EXCLUDED.total_customers,
    total_service_providers = EXCLUDED.total_service_providers,
    verified_providers = EXCLUDED.verified_providers,
    pending_verifications = EXCLUDED.pending_verifications,
    total_appointments = EXCLUDED.total_appointments,
    completed_appointments = EXCLUDED.completed_appointments,
    total_revenue = EXCLUDED.total_revenue,
    avg_rating = EXCLUDED.avg_rating;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE public.admin_users IS 'Admin users with special privileges to manage the platform';
COMMENT ON TABLE public.service_provider_verifications IS 'Service provider verification workflow';
COMMENT ON TABLE public.admin_action_logs IS 'Audit trail for all admin actions';
COMMENT ON TABLE public.system_settings IS 'Configurable platform settings';
COMMENT ON TABLE public.platform_statistics IS 'Daily platform metrics and statistics';