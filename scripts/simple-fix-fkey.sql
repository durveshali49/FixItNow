-- Simple Foreign Key Restoration Script
-- Run this in Supabase SQL Editor

-- 1. Check current data situation
SELECT 'Current verification records:' as info;
SELECT service_provider_id, status, created_at FROM public.service_provider_verifications;

SELECT 'Current service providers:' as info;
SELECT id, experience_years FROM public.service_providers LIMIT 5;

-- 2. Check for orphaned verification records
SELECT COUNT(*) as orphaned_records
FROM public.service_provider_verifications spv
LEFT JOIN public.service_providers sp ON spv.service_provider_id = sp.id
WHERE sp.id IS NULL;

-- 3. Option A: Delete orphaned verification records (clean approach)
DELETE FROM public.service_provider_verifications 
WHERE service_provider_id NOT IN (
  SELECT id FROM public.service_providers
);

-- 4. Now safely add the foreign key constraint
ALTER TABLE public.service_provider_verifications 
ADD CONSTRAINT service_provider_verifications_service_provider_id_fkey 
FOREIGN KEY (service_provider_id) 
REFERENCES public.service_providers(id) 
ON DELETE CASCADE;

-- 5. Verify the constraint was added
SELECT constraint_name, table_name, column_name 
FROM information_schema.key_column_usage 
WHERE table_name = 'service_provider_verifications' 
  AND constraint_name LIKE '%fkey%';

-- 6. Create some test data for the admin panel
-- First create auth.users entry
INSERT INTO auth.users (id, email, created_at, updated_at, email_confirmed_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'testprovider@example.com',
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Then public.users entry
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

-- Then service_providers entry
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

-- Finally, create a verification record
INSERT INTO public.service_provider_verifications (
  service_provider_id,
  status,
  documents_submitted,
  verification_notes
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'pending',
  ARRAY['test-document.pdf'],
  'Test verification for admin panel'
) ON CONFLICT DO NOTHING;

-- 7. Test the relationship
SELECT 
  u.full_name,
  sp.experience_years,
  sp.is_verified,
  spv.status as verification_status,
  spv.created_at as verification_date
FROM public.users u
JOIN public.service_providers sp ON u.id = sp.id
LEFT JOIN public.service_provider_verifications spv ON sp.id = spv.service_provider_id
WHERE sp.id = '550e8400-e29b-41d4-a716-446655440000';

SELECT 'Foreign key constraint restored and test data created!' as result;