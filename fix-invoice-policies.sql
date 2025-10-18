-- Run this SQL in your Supabase SQL Editor to fix the invoice generation issue

-- Add INSERT policy for invoices so service providers can create invoices
CREATE POLICY "Service providers can create invoices for their appointments" ON public.invoices
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT service_provider_id FROM public.appointments WHERE id = appointment_id
    )
  );

-- Also add UPDATE policy for invoices in case we need to update them later
CREATE POLICY "Service providers can update invoices for their appointments" ON public.invoices
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT service_provider_id FROM public.appointments WHERE id = appointment_id
    )
  );

-- Check if notifications table has proper INSERT policy
-- If not, add this policy too:
CREATE POLICY "Users can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- Verify the policies are applied
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('invoices', 'notifications');
