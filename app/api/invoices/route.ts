import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  
  try {
    const { searchParams } = new URL(request.url)
    const appointment_id = searchParams.get("appointment_id")

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let query = supabase
      .from("invoices")
      .select(`
        *,
        appointments (
          *,
          users!appointments_customer_id_fkey (full_name, email, phone_number),
          service_providers (
            users!service_providers_id_fkey (full_name)
          )
        )
      `)

    // Filter by appointment if specified
    if (appointment_id) {
      query = query.eq("appointment_id", appointment_id)
    }

    // Filter by user's appointments (either as customer or service provider)
    query = query.or(`appointments.customer_id.eq.${user.id},appointments.service_provider_id.eq.${user.id}`)

    const { data: invoices, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching invoices:", error)
      return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 })
    }

    return NextResponse.json({ invoices })

  } catch (error) {
    console.error("Invoice fetch error:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
