import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    // Get admin token from headers
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    // Verify admin token (simplified for now - you can enhance this later)
    if (!token || token !== "admin-temp-token-123") {
      return NextResponse.json({ error: "Invalid admin token" }, { status: 403 })
    }

    const supabase = await createClient()

    // Fetch completed appointments with user and provider details
    const { data: appointments, error } = await supabase
      .from("appointments")
      .select(`
        id,
        title,
        description,
        scheduled_date,
        status,
        estimated_cost,
        actual_cost,
        payment_status,
        customer_id,
        service_provider_id,
        users!appointments_customer_id_fkey (
          full_name,
          phone_number,
          email
        ),
        service_providers (
          users (
            full_name,
            phone_number
          )
        )
      `)
      .eq("status", "completed")
      .order("scheduled_date", { ascending: false })

    if (error) {
      console.error("Error fetching appointments:", error)
      return NextResponse.json({ 
        error: "Failed to fetch appointments", 
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json(appointments)

  } catch (error) {
    console.error("Admin appointments API error:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}