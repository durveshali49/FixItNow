import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get admin token from headers
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    // Verify admin token (simplified for now)
    if (!token || token !== "admin-temp-token-123") {
      return NextResponse.json({ error: "Invalid admin token" }, { status: 403 })
    }

    const invoiceId = params.id

    // Create admin client for bypassing RLS
    const { createClient: createServiceClient } = await import("@supabase/supabase-js")
    const supabaseAdmin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!
    )

    // Update invoice payment status
    const { data: invoice, error: updateError } = await supabaseAdmin
      .from("invoices")
      .update({ 
        payment_status: "paid",
        paid_at: new Date().toISOString()
      })
      .eq("id", invoiceId)
      .select("*, appointments(customer_id, title)")
      .single()

    if (updateError || !invoice) {
      return NextResponse.json({ 
        error: "Failed to update invoice", 
        details: updateError?.message 
      }, { status: 500 })
    }

    // Update related appointment payment status
    const { error: appointmentError } = await supabaseAdmin
      .from("appointments")
      .update({ payment_status: "paid" })
      .eq("id", invoice.appointment_id)

    if (appointmentError) {
      console.error("Failed to update appointment payment status:", appointmentError)
    }

    // Create notification for customer
    const { error: notificationError } = await supabaseAdmin
      .from("notifications")
      .insert({
        user_id: invoice.appointments.customer_id,
        title: "Payment Confirmed",
        message: `Payment for invoice ${invoice.invoice_number} has been confirmed. Thank you for choosing FixItNow!`,
        type: "payment",
        related_appointment_id: invoice.appointment_id
      })

    if (notificationError) {
      console.error("Failed to create notification:", notificationError)
    }

    return NextResponse.json({ 
      success: true, 
      message: "Invoice marked as paid successfully"
    })

  } catch (error) {
    console.error("Mark invoice as paid error:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}