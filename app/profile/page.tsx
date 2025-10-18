import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProfileForm } from "@/components/profile-form"

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user profile data
  const { data: userProfile } = await supabase.from("users").select("*").eq("id", user.id).single()

  // Get service provider data if applicable
  let serviceProviderData = null
  if (userProfile?.role === "service_provider") {
    const { data } = await supabase
      .from("service_providers")
      .select(`
        *,
        service_provider_categories (
          service_categories (*)
        )
      `)
      .eq("id", user.id)
      .single()
    serviceProviderData = data
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <ProfileForm user={user} userProfile={userProfile} serviceProviderData={serviceProviderData} />
      </div>
    </div>
  )
}
