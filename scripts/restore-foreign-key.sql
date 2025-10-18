-- Restore foreign key constraint for service_provider_verifications
-- Run this in Supabase SQL Editor

-- 1. First check if we have any orphaned records that would prevent the constraint
SELECT COUNT(*) as orphaned_records
FROM public.service_provider_verifications spv
LEFT JOIN public.service_providers sp ON spv.service_provider_id = sp.id
WHERE sp.id IS NULL;

-- 2. Check if constraint already exists
SELECT constraint_name, table_name, column_name
FROM information_schema.key_column_usage 
WHERE table_name = 'service_provider_verifications' 
  AND constraint_name LIKE '%fkey%';

-- 3. Check if we have any existing service providers first
SELECT COUNT(*) as existing_providers FROM public.service_providers;

-- 4. If no providers exist, we'll create some test data
-- First, let's see if we have any existing users
SELECT COUNT(*) as existing_users FROM public.users;

-- 5. Create a simplified test user entry (bypassing auth.users for testing)
-- Note: This is just for testing the foreign key relationship
DO $$
BEGIN
  -- Only create test data if no service providers exist
  IF NOT EXISTS (SELECT 1 FROM public.service_providers LIMIT 1) THEN
    -- Insert directly into auth.users first (for testing only)
    INSERT INTO auth.users (id, email, created_at, updated_at, email_confirmed_at)
    VALUES (
      '550e8400-e29b-41d4-a716-446655440000',
      'testprovider@example.com',
      NOW(),
      NOW(),
      NOW()
    ) ON CONFLICT (id) DO NOTHING;
    
    -- Then insert into public.users
    INSERT INTO public.users (
      id,
      email,
      full_name,
      phone_number,
      role
    ) VALUES (
      '550e8400-e29b-41d4-a716-446655440000',
      'testprovider@example.com',
      'Test Service Provider User',
      '+1234567890',
      'service_provider'
    ) ON CONFLICT (id) DO NOTHING;
    
    -- Finally insert into service_providers
    INSERT INTO public.service_providers (
      id,
      experience_years,
      hourly_rate,
      availability_type,
      bio,
      skills,
      service_areas,
      is_verified
    ) VALUES (
      '550e8400-e29b-41d4-a716-446655440000',
      5,
      50.00,
      'full_time',
      'Test service provider for development',
      ARRAY['plumbing', 'repairs'],
      ARRAY['Downtown', 'City Center'],
      false
    ) ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- 6. Now add back the foreign key constraint
ALTER TABLE public.service_provider_verifications 
ADD CONSTRAINT service_provider_verifications_service_provider_id_fkey 
FOREIGN KEY (service_provider_id) 
REFERENCES public.service_providers(id) 
ON DELETE CASCADE;

-- 7. Verify the constraint was added
SELECT constraint_name, table_name, column_name 
FROM information_schema.key_column_usage 
WHERE table_name = 'service_provider_verifications' 
  AND constraint_name LIKE '%fkey%';

-- 8. Test that the relationship works
SELECT u.full_name, sp.experience_years, spv.status, spv.created_at
FROM public.users u
JOIN public.service_providers sp ON u.id = sp.id
LEFT JOIN public.service_provider_verifications spv ON sp.id = spv.service_provider_id
WHERE sp.id = '550e8400-e29b-41d4-a716-446655440000';

SELECT 'Foreign key constraint restored successfully!' as result,
       'Admin panel should now work!' as next_step;