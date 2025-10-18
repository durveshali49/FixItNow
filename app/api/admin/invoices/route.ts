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

    // Fetch all invoices with related appointment and user details
    const { data: invoices, error } = await supabase
      .from("invoices")
      .select(`
        id,
        invoice_number,
        amount,
        tax_amount,
        total_amount,
        payment_status,
        due_date,
        issued_at,
        paid_at,
        appointment_id,
        appointments (
          title,
          description,
          scheduled_date,
          customer_id,
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
        )
      `)
      .order("issued_at", { ascending: false })

    if (error) {
      console.error("Error fetching invoices:", error)
      return NextResponse.json({ 
        error: "Failed to fetch invoices", 
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json(invoices)

  } catch (error) {
    console.error("Admin invoices API error:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}