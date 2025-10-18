import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
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

    const {
      appointment_id,
      customer_id,
      amount,
      tax_amount,
      total_amount,
      description
    } = await request.json()

    // Create admin client for bypassing RLS
    const { createClient: createServiceClient } = await import("@supabase/supabase-js")
    const supabaseAdmin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!
    )

    // Verify that the appointment exists and is completed
    const { data: appointment, error: appointmentError } = await supabaseAdmin
      .from("appointments")
      .select("*, users!appointments_customer_id_fkey(full_name, email, phone_number)")
      .eq("id", appointment_id)
      .eq("status", "completed")
      .single()

    if (appointmentError || !appointment) {
      return NextResponse.json({ error: "Appointment not found or not completed" }, { status: 404 })
    }

    // Generate invoice number
    const invoiceNumber = `INV-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from("invoices")
      .insert({
        appointment_id,
        invoice_number: invoiceNumber,
        amount: parseFloat(amount),
        tax_amount: parseFloat(tax_amount),
        total_amount: parseFloat(total_amount),
        payment_status: "pending",
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] // 7 days from now
      })
      .select()
      .single()

    if (invoiceError) {
      console.error("Invoice creation error:", invoiceError)
      return NextResponse.json({ 
        error: "Failed to create invoice", 
        details: invoiceError.message 
      }, { status: 500 })
    }

    // Update appointment with actual cost and payment status
    const { error: updateError } = await supabaseAdmin
      .from("appointments")
      .update({
        actual_cost: parseFloat(amount),
        payment_status: "pending"
      })
      .eq("id", appointment_id)

    if (updateError) {
      console.error("Appointment update error:", updateError)
      // Don't fail if appointment update fails, invoice is already created
    }

    // Create notification for customer
    const { error: notificationError } = await supabaseAdmin
      .from("notifications")
      .insert({
        user_id: customer_id,
        title: "Invoice Generated",
        message: `Invoice ${invoiceNumber} has been generated for your service "${appointment.title}". Amount: ₹${total_amount}. Please check your email or WhatsApp for payment details.`,
        type: "payment",
        related_appointment_id: appointment_id
      })

    if (notificationError) {
      console.error("Notification creation error:", notificationError)
      // Don't fail if notification fails, invoice is already created
    }

    // Send email notification (if you have email service configured)
    try {
      // This is a placeholder for email service integration
      // You can implement your preferred email service (SendGrid, AWS SES, etc.)
      const emailResult = await sendInvoiceEmail({
        customerEmail: appointment.users?.email,
        customerName: appointment.users?.full_name,
        invoiceNumber,
        serviceName: appointment.title,
        amount: total_amount,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
      })
      console.log("Email sent:", emailResult)
    } catch (emailError) {
      console.error("Email sending failed:", emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({ 
      success: true, 
      invoice,
      message: "Invoice generated and sent successfully"
    })

  } catch (error) {
    console.error("Admin invoice generation error:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

// Placeholder email function - implement with your preferred email service
async function sendInvoiceEmail(emailData: {
  customerEmail?: string
  customerName?: string
  invoiceNumber: string
  serviceName: string
  amount: number
  dueDate: string
}) {
  // This is where you would integrate with your email service
  // For now, just log the email data
  console.log("Sending invoice email:", emailData)
  
  // Example implementation with a hypothetical email service:
  /*
  const emailService = new EmailService(process.env.EMAIL_API_KEY)
  return await emailService.send({
    to: emailData.customerEmail,
    subject: `Invoice ${emailData.invoiceNumber} - FixItNow`,
    template: 'invoice-notification',
    data: emailData
  })
  */
  
  return { success: true, message: "Email would be sent here" }
}