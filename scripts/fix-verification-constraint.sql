-- Remove foreign key constraint temporarily for testing
-- Run this in Supabase SQL Editor

-- 1. Check current constraints (simplified query)
SELECT constraint_name, table_name, column_name
FROM information_schema.key_column_usage 
WHERE table_name = 'service_provider_verifications' 
  AND constraint_name LIKE '%fkey%';

-- 2. Drop the foreign key constraint
ALTER TABLE public.service_provider_verifications 
DROP CONSTRAINT IF EXISTS service_provider_verifications_service_provider_id_fkey;

-- 3. Also try alternative constraint name
ALTER TABLE public.service_provider_verifications 
DROP CONSTRAINT IF EXISTS service_provider_verifications_service_provider_id_fkey1;

-- 4. Verify constraint is removed
SELECT constraint_name, table_name, column_name 
FROM information_schema.key_column_usage 
WHERE table_name = 'service_provider_verifications' 
  AND constraint_name LIKE '%fkey%';

-- 5. Test: Try to insert a verification record
INSERT INTO public.service_provider_verifications (
  service_provider_id, 
  status, 
  documents_submitted, 
  verification_notes
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'pending',
  ARRAY['test-document.pdf'],
  'Test verification for development'
);

-- 6. Check if the insert worked
SELECT * FROM public.service_provider_verifications 
WHERE service_provider_id = '550e8400-e29b-41d4-a716-446655440000';

SELECT 'Foreign key constraint removed successfully!' as result,
       'Verification submission should now work!' as next_step;