import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CustomerDashboard } from "@/components/customer-dashboard"

export default async function CustomerDashboardPage() {
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

  if (!userProfile || userProfile.role !== "customer") {
    redirect("/provider/dashboard")
  }

  // Get customer's appointments
  const { data: appointments } = await supabase
    .from("appointments")
    .select(`
      *,
      service_providers!appointments_service_provider_id_fkey (
        users!service_providers_id_fkey (full_name, phone_number)
      ),
      service_categories (name)
    `)
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false })

  // Get service categories for booking
  const { data: serviceCategories } = await supabase
    .from("service_categories")
    .select("*")
    .eq("is_active", true)
    .order("name")

  // Get available service providers based on user's location
  let { data: serviceProviders } = await supabase
    .from("service_providers")
    .select(`
      id,
      rating,
      hourly_rate,
      experience_years,
      service_areas,
      bio,
      total_reviews,
      users!service_providers_id_fkey (full_name, city, state),
      service_provider_categories (
        service_categories (name)
      )
    `)
    .eq("is_verified", true)
    .not("service_areas", "is", null)
    .order("rating", { ascending: false })

  // Filter service providers by location
  if (serviceProviders && userProfile.city) {
    serviceProviders = serviceProviders.filter(provider => 
      provider.service_areas && 
      provider.service_areas.some((area: string) => 
        area.toLowerCase().includes(userProfile.city.toLowerCase()) ||
        userProfile.city.toLowerCase().includes(area.toLowerCase())
      )
    )

    // If no providers found in user's city, try state-level matching
    if (serviceProviders.length === 0 && userProfile.state) {
      const { data: stateProviders } = await supabase
        .from("service_providers")
        .select(`
          id,
          rating,
          hourly_rate,
          experience_years,
          service_areas,
          bio,
          total_reviews,
          users!service_providers_id_fkey (full_name, city, state),
          service_provider_categories (
            service_categories (name)
          )
        `)
        .eq("is_verified", true)
        .not("service_areas", "is", null)
        .order("rating", { ascending: false })

      if (stateProviders) {
        serviceProviders = stateProviders.filter(provider => 
          provider.service_areas && 
          provider.service_areas.some((area: string) => 
            area.toLowerCase().includes(userProfile.state.toLowerCase()) ||
            userProfile.state.toLowerCase().includes(area.toLowerCase())
          )
        )
      }
    }
  }

  // Limit to top 6 providers
  serviceProviders = serviceProviders?.slice(0, 6) || []

  // Debug logging
  console.log("Debug - User location:", { city: userProfile?.city, state: userProfile?.state })
  console.log("Debug - Final service providers:", serviceProviders.length)
  console.log("Debug - Service providers with service_areas:", serviceProviders.map(p => ({
    id: p.id.slice(0, 8),
    service_areas: p.service_areas,
    users: p.users
  })))

  return (
    <CustomerDashboard
      user={user}
      userProfile={userProfile}
      appointments={appointments || []}
      serviceCategories={serviceCategories || []}
      serviceProviders={serviceProviders || []}
    />
  )
}
