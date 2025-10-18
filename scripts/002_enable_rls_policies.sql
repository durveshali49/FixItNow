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

-- Users table policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Service providers policies
CREATE POLICY "Anyone can view active service providers" ON public.service_providers
  FOR SELECT USING (true);

CREATE POLICY "Service providers can update their own profile" ON public.service_providers
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service providers can insert their own profile" ON public.service_providers
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Service provider categories policies
CREATE POLICY "Anyone can view service provider categories" ON public.service_provider_categories
  FOR SELECT USING (true);

CREATE POLICY "Service providers can manage their own categories" ON public.service_provider_categories
  FOR ALL USING (auth.uid() = service_provider_id);

-- Service provider images policies
CREATE POLICY "Anyone can view service provider images" ON public.service_provider_images
  FOR SELECT USING (true);

CREATE POLICY "Service providers can manage their own images" ON public.service_provider_images
  FOR ALL USING (auth.uid() = service_provider_id);

-- Appointments policies
CREATE POLICY "Users can view their own appointments" ON public.appointments
  FOR SELECT USING (auth.uid() = customer_id OR auth.uid() = service_provider_id);

CREATE POLICY "Customers can create appointments" ON public.appointments
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update their own appointments" ON public.appointments
  FOR UPDATE USING (auth.uid() = customer_id OR auth.uid() = service_provider_id);

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Customers can create reviews for their appointments" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can update their own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = customer_id);

-- Invoices policies
CREATE POLICY "Users can view their own invoices" ON public.invoices
  FOR SELECT USING (
    auth.uid() IN (
      SELECT customer_id FROM public.appointments WHERE id = appointment_id
      UNION
      SELECT service_provider_id FROM public.appointments WHERE id = appointment_id
    )
  );

CREATE POLICY "Service providers can create invoices for their appointments" ON public.invoices
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT service_provider_id FROM public.appointments WHERE id = appointment_id
    )
  );

-- Chat messages policies
CREATE POLICY "Users can view their own chat messages" ON public.chat_messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat messages" ON public.chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Service categories are public (no RLS needed)
-- Anyone can view service categories
