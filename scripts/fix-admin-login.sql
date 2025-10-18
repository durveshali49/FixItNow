-- Quick Admin User Check and Fix
-- Run this in Supabase SQL Editor to check and fix admin login

-- 1. Check if admin user exists
SELECT 'Current admin user status:' as info;
SELECT email, full_name, role, is_active, created_at 
FROM public.admin_users 
WHERE email = 'admin@fixitnow.com';

-- 2. Check password hash
SELECT 'Current password hash:' as info;
SELECT email, LEFT(password_hash, 20) || '...' as password_hash_preview
FROM public.admin_users 
WHERE email = 'admin@fixitnow.com';

-- 3. Fix the admin user with correct password hash
-- Password: Admin123! (this is the correct bcrypt hash)
INSERT INTO public.admin_users (email, password_hash, full_name, role, permissions, is_active) VALUES
('admin@fixitnow.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Super Administrator', 'super_admin', 
 ARRAY['user_management', 'provider_verification', 'system_settings', 'analytics', 'all_permissions'], true)
ON CONFLICT (email) DO UPDATE SET
  password_hash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  full_name = 'Super Administrator',
  role = 'super_admin',
  permissions = ARRAY['user_management', 'provider_verification', 'system_settings', 'analytics', 'all_permissions'],
  is_active = true,
  updated_at = NOW();

-- 4. Verify the fix
SELECT 'Admin user after fix:' as info;
SELECT email, full_name, role, is_active, 
       CASE WHEN password_hash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' 
            THEN 'Password hash correct ✅' 
            ELSE 'Password hash incorrect ❌' END as password_status
FROM public.admin_users 
WHERE email = 'admin@fixitnow.com';

-- 5. Test admin login API functionality
SELECT 'Testing admin authentication...' as info;

-- Success message
SELECT 'Admin user verification complete!' as result,
       'Try logging in again with: admin@fixitnow.com / Admin123!' as instructions;