import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProviderVerificationForm } from "@/components/provider-verification-form"

export default async function ProviderVerificationPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user profile and verify role
  const { data: userProfile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!userProfile || userProfile.role !== "service_provider") {
    redirect("/customer/dashboard")
  }

  // Get service provider data
  const { data: serviceProvider } = await supabase
    .from("service_providers")
    .select("*")
    .eq("id", user.id)
    .single()

  // Check if verification already exists
  const { data: existingVerification } = await supabase
    .from("service_provider_verifications")
    .select("*")
    .eq("service_provider_id", user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Service Provider Verification</h1>
            <p className="text-gray-600 mt-2">
              Submit your documents for verification to start offering services on FixItNow
            </p>
          </div>

          <ProviderVerificationForm
            user={user}
            userProfile={userProfile}
            serviceProvider={serviceProvider}
            existingVerification={existingVerification}
          />
        </div>
      </div>
    </div>
  )
}