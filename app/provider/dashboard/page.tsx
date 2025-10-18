import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProviderDashboard } from "@/components/provider-dashboard"

export default async function ProviderDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user profile and verify role
  const { data: userProfile } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (!userProfile || userProfile.role !== "service_provider") {
    redirect("/customer/dashboard")
  }

  // Get service provider data with related information
  const { data: serviceProvider } = await supabase
    .from("service_providers")
    .select(`
      *,
      service_provider_categories (
        service_categories (*)
      )
    `)
    .eq("id", user.id)
    .single()

  // Get appointments data
  const { data: appointments } = await supabase
    .from("appointments")
    .select(`
      *,
      users!appointments_customer_id_fkey (full_name, phone_number),
      service_categories (name)
    `)
    .eq("service_provider_id", user.id)
    .order("created_at", { ascending: false })

  // Get recent reviews
  const { data: reviews } = await supabase
    .from("reviews")
    .select(`
      *,
      users!reviews_customer_id_fkey (full_name),
      appointments (title)
    `)
    .eq("service_provider_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  // Get earnings data (from completed appointments)
  const { data: earnings } = await supabase
    .from("appointments")
    .select("actual_cost, scheduled_date")
    .eq("service_provider_id", user.id)
    .eq("status", "completed")
    .not("actual_cost", "is", null)

  return (
    <ProviderDashboard
      user={user}
      userProfile={userProfile}
      serviceProvider={serviceProvider}
      appointments={appointments || []}
      reviews={reviews || []}
      earnings={earnings || []}
    />
  )
}
