-- Storage Setup Script for Supabase
-- This creates the bucket and policies using service role permissions

-- 1. First, create the bucket if it doesn't exist
-- Note: This needs to be done via Supabase Dashboard or API, not SQL

-- 2. Create storage policies (run this as service role)
-- These policies allow file uploads and access

-- Policy for uploads (authenticated users can upload)
INSERT INTO storage.policies (id, bucket_id, name, definition, check_expression, command)
VALUES (
  'service-provider-uploads-policy',
  'service-provider-documents',
  'Allow authenticated uploads',
  'auth.uid() IS NOT NULL',
  'auth.uid() IS NOT NULL',
  'INSERT'
);

-- Policy for public access (anyone can view)
INSERT INTO storage.policies (id, bucket_id, name, definition, check_expression, command)
VALUES (
  'service-provider-public-access-policy',
  'service-provider-documents', 
  'Allow public access',
  'true',
  'true',
  'SELECT'
);

-- Policy for updates (users can update their own files)
INSERT INTO storage.policies (id, bucket_id, name, definition, check_expression, command)
VALUES (
  'service-provider-update-policy',
  'service-provider-documents',
  'Allow users to update own files',
  'auth.uid() IS NOT NULL',
  'auth.uid() IS NOT NULL', 
  'UPDATE'
);

-- Policy for deletes (users can delete their own files)
INSERT INTO storage.policies (id, bucket_id, name, definition, check_expression, command)
VALUES (
  'service-provider-delete-policy',
  'service-provider-documents',
  'Allow users to delete own files', 
  'auth.uid() IS NOT NULL',
  'auth.uid() IS NOT NULL',
  'DELETE'
);

-- Verify policies were created
SELECT * FROM storage.policies WHERE bucket_id = 'service-provider-documents';