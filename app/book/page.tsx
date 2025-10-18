import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { BookingModal } from "@/components/booking-modal"
import { ProviderSearch } from "@/components/provider-search"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Wrench, MapPin, Users } from "lucide-react"

export default async function BookPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: userProfile } = await supabase.from("users").select("*").eq("id", user.id).single()

  // Get service categories
  const { data: serviceCategories } = await supabase
    .from("service_categories")
    .select("*")
    .eq("is_active", true)
    .order("name")

  // Get available service providers - simplified for now
  let serviceProviders = []
  
  // Debug: Log user profile location
  console.log("User location:", { city: userProfile?.city, state: userProfile?.state })
  
  // Get all providers (simplified approach)
  const { data: allProviders, error: providersError } = await supabase
    .from("service_providers")
    .select(`
      *,
      users (full_name, city, state, latitude, longitude),
      service_provider_categories (
        service_categories (*)
      )
    `)
    .order("rating", { ascending: false })

  console.log("All providers found:", allProviders?.length || 0)
  console.log("Providers data:", allProviders)
  console.log("Query error:", providersError)
  // For now, use all providers (location filtering will be added later)
  serviceProviders = allProviders || []
  console.log("Using all providers:", serviceProviders.length)

  return (
    <div className="min-h-screen bg-background">
      {/* Use unified navbar */}
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Book a Service</h2>
            <p className="text-muted-foreground">Find and book trusted professionals for your home service needs</p>
            
            {/* Location Status */}
            {userProfile?.city && userProfile?.state && (
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full text-sm text-green-700">
                <MapPin className="h-3 w-3" />
                Showing providers in your area: {userProfile.city}, {userProfile.state}
              </div>
            )}
          </div>

          <Tabs defaultValue="quick-book" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="quick-book" className="flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Quick Book
              </TabsTrigger>
              <TabsTrigger value="search-providers" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Find Providers
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="quick-book" className="mt-6">
              <Card className="border-border">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2">
                    <Users className="h-5 w-5" />
                    Quick Booking
                  </CardTitle>
                  <CardDescription>
                    {userProfile?.city && userProfile?.state ? (
                      <>
                        Showing {serviceProviders?.length || 0} providers in {userProfile.city}, {userProfile.state}
                      </>
                    ) : (
                      "Start your booking process with available providers"
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <BookingModal
                    trigger={
                      <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        Start Booking Process
                      </Button>
                    }
                    serviceCategories={serviceCategories || []}
                    serviceProviders={serviceProviders || []}
                    userProfile={userProfile}
                    user={user}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="search-providers" className="mt-6">
              <ProviderSearch />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
