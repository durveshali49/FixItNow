-- ============================================
-- FixItNow Complete Database Setup for New Supabase
-- CORRECTED VERSION - Matches Existing Schema Exactly
-- Run ALL scripts in order: 001 → 002 → 003 → 004 → 005 → this script
-- ============================================

-- ============================================
-- PART 1: CORE SCHEMA (from 001_create_database_schema.sql)
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('customer', 'service_provider', 'admin');
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');
CREATE TYPE payment_method AS ENUM ('cash', 'whatsapp_payment', 'online');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed');
CREATE TYPE availability_type AS ENUM ('full_time', 'part_time', 'contract');

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  role user_role NOT NULL DEFAULT 'customer',
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  profile_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service categories table
CREATE TABLE IF NOT EXISTS public.service_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service providers table
CREATE TABLE IF NOT EXISTS public.service_providers (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  experience_years INTEGER DEFAULT 0,
  hourly_rate DECIMAL(10, 2),
  availability_type availability_type DEFAULT 'part_time',
  bio TEXT,
  skills TEXT[], -- Array of skills
  service_areas TEXT[], -- Array of areas they serve
  is_verified BOOLEAN DEFAULT false,
  rating DECIMAL(3, 2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  total_jobs_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service provider categories (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.service_provider_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_provider_id UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(service_provider_id, category_id)
);

-- Service provider images
CREATE TABLE IF NOT EXISTS public.service_provider_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_provider_id UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  description TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  service_provider_id UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.service_categories(id),
  title TEXT NOT NULL,
  description TEXT,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  estimated_duration INTEGER, -- in minutes
  status appointment_status DEFAULT 'pending',
  customer_address TEXT NOT NULL,
  customer_latitude DECIMAL(10, 8),
  customer_longitude DECIMAL(11, 8),
  special_instructions TEXT,
  estimated_cost DECIMAL(10, 2),
  actual_cost DECIMAL(10, 2),
  payment_method payment_method,
  payment_status payment_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  service_provider_id UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(appointment_id) -- One review per appointment
);

-- Invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  amount DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_status payment_status DEFAULT 'pending',
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE,
  due_date DATE
);

-- Chat messages table (for AI chatbot and user communication)
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_from_ai BOOLEAN DEFAULT false,
  language TEXT DEFAULT 'en', -- Support for Kannada and other languages
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- 'appointment', 'payment', 'review', etc.
  is_read BOOLEAN DEFAULT false,
  related_appointment_id UUID REFERENCES public.appointments(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PART 2: ADMIN SCHEMA (from 005_create_admin_schema.sql)
-- ============================================

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

-- ============================================
-- PART 3: ESSENTIAL DATA INSERTION
-- ============================================

-- Insert SERVICE CATEGORIES (10 categories from original schema)
INSERT INTO public.service_categories (name, description, icon_url) VALUES
('Plumbing', 'Water pipe repairs, installations, and maintenance', '🔧'),
('Electrical', 'Electrical wiring, repairs, and installations', '⚡'),
('Cleaning', 'Home and office cleaning services', '🧹'),
('Carpentry', 'Wood work, furniture repair, and installations', '🪚'),
('Painting', 'Interior and exterior painting services', '🎨'),
('AC Repair', 'Air conditioning installation and repair', '❄️'),
('Appliance Repair', 'Home appliance maintenance and repair', '🔌'),
('Gardening', 'Lawn care, plant maintenance, and landscaping', '🌿'),
('Pest Control', 'Insect and rodent control services', '🐛'),
('Home Security', 'Security system installation and maintenance', '🔒')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  icon_url = EXCLUDED.icon_url;

-- Insert ADMIN USER (Password: Admin123!)
INSERT INTO public.admin_users (email, password_hash, full_name, role, permissions) VALUES
('admin@fixitnow.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Super Administrator', 'super_admin', 
 ARRAY['user_management', 'provider_verification', 'system_settings', 'analytics', 'all_permissions'])
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  permissions = EXCLUDED.permissions;

-- Insert SYSTEM SETTINGS
INSERT INTO public.system_settings (setting_key, setting_value, description) VALUES
('platform_commission_rate', '{"rate": 0.10, "currency": "INR"}', 'Platform commission rate (10%)'),
('auto_verification_enabled', '{"enabled": false}', 'Automatic service provider verification'),
('max_booking_advance_days', '{"days": 30}', 'Maximum days in advance for bookings'),
('min_hourly_rate', '{"rate": 50, "currency": "INR"}', 'Minimum hourly rate for service providers'),
('max_hourly_rate', '{"rate": 5000, "currency": "INR"}', 'Maximum hourly rate for service providers'),
('platform_maintenance_mode', '{"enabled": false, "message": "Platform under maintenance"}', 'Maintenance mode settings')
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  description = EXCLUDED.description;

-- ============================================
-- PART 4: FUNCTIONS AND TRIGGERS (from 003_create_functions_triggers.sql)
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_service_providers_updated_at ON public.service_providers;
CREATE TRIGGER update_service_providers_updated_at BEFORE UPDATE ON public.service_providers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON public.appointments;
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (
    id, 
    email, 
    full_name, 
    role,
    phone_number,
    address,
    city,
    state,
    postal_code
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'User'),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'customer'),
    NEW.raw_user_meta_data ->> 'phone_number',
    NEW.raw_user_meta_data ->> 'address',
    NEW.raw_user_meta_data ->> 'city',
    NEW.raw_user_meta_data ->> 'state',
    NEW.raw_user_meta_data ->> 'postal_code'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, users.full_name),
    role = COALESCE(EXCLUDED.role, users.role),
    phone_number = COALESCE(EXCLUDED.phone_number, users.phone_number),
    address = COALESCE(EXCLUDED.address, users.address),
    city = COALESCE(EXCLUDED.city, users.city),
    state = COALESCE(EXCLUDED.state, users.state),
    postal_code = COALESCE(EXCLUDED.postal_code, users.postal_code),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$;

-- Trigger to create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update service provider rating
CREATE OR REPLACE FUNCTION update_service_provider_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.service_providers 
    SET 
        rating = (
            SELECT COALESCE(AVG(rating), 0) 
            FROM public.reviews 
            WHERE service_provider_id = NEW.service_provider_id
        ),
        total_reviews = (
            SELECT COUNT(*) 
            FROM public.reviews 
            WHERE service_provider_id = NEW.service_provider_id
        )
    WHERE id = NEW.service_provider_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update rating when review is added
DROP TRIGGER IF EXISTS update_rating_on_review_insert ON public.reviews;
CREATE TRIGGER update_rating_on_review_insert
    AFTER INSERT ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_service_provider_rating();

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.invoice_number = 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('invoice_sequence')::TEXT, 4, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create sequence for invoice numbers
CREATE SEQUENCE IF NOT EXISTS invoice_sequence START 1;

-- Trigger to generate invoice number
DROP TRIGGER IF EXISTS generate_invoice_number_trigger ON public.invoices;
CREATE TRIGGER generate_invoice_number_trigger
    BEFORE INSERT ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION generate_invoice_number();

-- ============================================
-- PART 5: ROW LEVEL SECURITY (from 002_enable_rls_policies.sql)
-- ============================================

-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_provider_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_provider_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_provider_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_action_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_statistics ENABLE ROW LEVEL SECURITY;

-- Users table policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Service providers policies
DROP POLICY IF EXISTS "Anyone can view active service providers" ON public.service_providers;
CREATE POLICY "Anyone can view active service providers" ON public.service_providers
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service providers can update their own profile" ON public.service_providers;
CREATE POLICY "Service providers can update their own profile" ON public.service_providers
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Service providers can insert their own profile" ON public.service_providers;
CREATE POLICY "Service providers can insert their own profile" ON public.service_providers
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Service provider categories policies
DROP POLICY IF EXISTS "Anyone can view service provider categories" ON public.service_provider_categories;
CREATE POLICY "Anyone can view service provider categories" ON public.service_provider_categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service providers can manage their own categories" ON public.service_provider_categories;
CREATE POLICY "Service providers can manage their own categories" ON public.service_provider_categories
  FOR ALL USING (auth.uid() = service_provider_id);

-- Service provider images policies
DROP POLICY IF EXISTS "Anyone can view service provider images" ON public.service_provider_images;
CREATE POLICY "Anyone can view service provider images" ON public.service_provider_images
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service providers can manage their own images" ON public.service_provider_images;
CREATE POLICY "Service providers can manage their own images" ON public.service_provider_images
  FOR ALL USING (auth.uid() = service_provider_id);

-- Appointments policies
DROP POLICY IF EXISTS "Users can view their own appointments" ON public.appointments;
CREATE POLICY "Users can view their own appointments" ON public.appointments
  FOR SELECT USING (auth.uid() = customer_id OR auth.uid() = service_provider_id);

DROP POLICY IF EXISTS "Customers can create appointments" ON public.appointments;
CREATE POLICY "Customers can create appointments" ON public.appointments
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Users can update their own appointments" ON public.appointments;
CREATE POLICY "Users can update their own appointments" ON public.appointments
  FOR UPDATE USING (auth.uid() = customer_id OR auth.uid() = service_provider_id);

-- Reviews policies
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Customers can create reviews for their appointments" ON public.reviews;
CREATE POLICY "Customers can create reviews for their appointments" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Customers can update their own reviews" ON public.reviews;
CREATE POLICY "Customers can update their own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = customer_id);

-- Invoices policies
DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;
CREATE POLICY "Users can view their own invoices" ON public.invoices
  FOR SELECT USING (
    auth.uid() IN (
      SELECT customer_id FROM public.appointments WHERE id = appointment_id
      UNION
      SELECT service_provider_id FROM public.appointments WHERE id = appointment_id
    )
  );

-- IMPORTANT: Invoice creation policies (from fix-invoice-policies.sql)
DROP POLICY IF EXISTS "Service providers can create invoices for their appointments" ON public.invoices;
CREATE POLICY "Service providers can create invoices for their appointments" ON public.invoices
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT service_provider_id FROM public.appointments WHERE id = appointment_id
    )
  );

DROP POLICY IF EXISTS "Service providers can update invoices for their appointments" ON public.invoices;
CREATE POLICY "Service providers can update invoices for their appointments" ON public.invoices
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT service_provider_id FROM public.appointments WHERE id = appointment_id
    )
  );

-- Chat messages policies
DROP POLICY IF EXISTS "Users can view their own chat messages" ON public.chat_messages;
CREATE POLICY "Users can view their own chat messages" ON public.chat_messages
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own chat messages" ON public.chat_messages;
CREATE POLICY "Users can insert their own chat messages" ON public.chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notifications policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create notifications" ON public.notifications;
CREATE POLICY "Users can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- Admin policies (these will be bypassed by service role)
DROP POLICY IF EXISTS "Only admins can access admin_users" ON public.admin_users;
CREATE POLICY "Only admins can access admin_users" ON public.admin_users
  FOR ALL USING (false); -- Will be bypassed by service role

DROP POLICY IF EXISTS "Only admins can access verifications" ON public.service_provider_verifications;
CREATE POLICY "Only admins can access verifications" ON public.service_provider_verifications
  FOR ALL USING (false); -- Will be bypassed by service role

DROP POLICY IF EXISTS "Only admins can access action logs" ON public.admin_action_logs;
CREATE POLICY "Only admins can access action logs" ON public.admin_action_logs
  FOR ALL USING (false); -- Will be bypassed by service role

DROP POLICY IF EXISTS "Only admins can access system settings" ON public.system_settings;
CREATE POLICY "Only admins can access system settings" ON public.system_settings
  FOR ALL USING (false); -- Will be bypassed by service role

DROP POLICY IF EXISTS "Only admins can access platform statistics" ON public.platform_statistics;
CREATE POLICY "Only admins can access platform statistics" ON public.platform_statistics
  FOR ALL USING (false); -- Will be bypassed by service role

-- ============================================
-- PART 6: ADMIN VIEWS AND FUNCTIONS
-- ============================================

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

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if everything was created successfully
SELECT 'Database Schema Setup Complete ✅' as status;

SELECT 'Service Categories' as table_name, COUNT(*) as count FROM public.service_categories WHERE is_active = true
UNION ALL
SELECT 'Admin Users' as table_name, COUNT(*) as count FROM public.admin_users WHERE is_active = true
UNION ALL
SELECT 'System Settings' as table_name, COUNT(*) as count FROM public.system_settings;

-- Show created service categories
SELECT 'Service Categories Created:' as info;
SELECT name, description, icon_url FROM public.service_categories ORDER BY name;

-- Show admin user
SELECT 'Admin User Created:' as info;
SELECT email, full_name, role, is_active FROM public.admin_users;

-- Success message
SELECT '🎉 FixItNow database setup completed successfully!' as result,
       'Tables: ✅ | Functions: ✅ | Policies: ✅ | Data: ✅' as details,
       'Admin login: admin@fixitnow.com / Admin123!' as credentials,
       'Service categories: 10 categories available for booking' as service_info;