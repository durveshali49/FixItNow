import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check user role and redirect accordingly
  const { data: userProfile } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (userProfile?.role === "service_provider") {
    redirect("/provider/dashboard")
  } else {
    redirect("/customer/dashboard")
  }
}