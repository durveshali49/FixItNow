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

    // Get invoice details with customer and appointment info
    const { data: invoice, error: fetchError } = await supabaseAdmin
      .from("invoices")
      .select(`
        *,
        appointments (
          title,
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
      .eq("id", invoiceId)
      .single()

    if (fetchError || !invoice) {
      return NextResponse.json({ 
        error: "Invoice not found", 
        details: fetchError?.message 
      }, { status: 404 })
    }

    // Create notification for customer
    const { error: notificationError } = await supabaseAdmin
      .from("notifications")
      .insert({
        user_id: invoice.appointments.customer_id,
        title: "Payment Reminder",
        message: `Reminder: Payment for invoice ${invoice.invoice_number} (Amount: ₹${invoice.total_amount}) is ${invoice.payment_status}. Due date: ${new Date(invoice.due_date).toLocaleDateString()}`,
        type: "payment",
        related_appointment_id: invoice.appointment_id
      })

    if (notificationError) {
      console.error("Failed to create notification:", notificationError)
    }

    // Send WhatsApp reminder if phone number is available
    const customerPhone = invoice.appointments?.users?.phone_number
    if (customerPhone) {
      const reminderMessage = `*FixItNow Payment Reminder*

Invoice: ${invoice.invoice_number}
Service: ${invoice.appointments.title}
Amount: ₹${invoice.total_amount}
Due Date: ${new Date(invoice.due_date).toLocaleDateString()}
Status: ${invoice.payment_status.toUpperCase()}

${invoice.payment_status === 'overdue' ? '⚠️ This payment is overdue. Please pay immediately to avoid service disruption.' : 'Please make your payment by the due date.'}

Payment Methods:
💰 Cash Payment
💳 WhatsApp Payment
🌐 Online Payment

Contact us for any payment assistance.
Thank you for choosing FixItNow!`

      // In a real implementation, you would integrate with a WhatsApp Business API
      // For now, we'll log the message that would be sent
      console.log(`WhatsApp reminder would be sent to ${customerPhone}:`, reminderMessage)
    }

    // Send email reminder if email is available
    const customerEmail = invoice.appointments?.users?.email
    if (customerEmail) {
      try {
        // Placeholder for email service integration
        await sendReminderEmail({
          customerEmail,
          customerName: invoice.appointments?.users?.full_name,
          invoiceNumber: invoice.invoice_number,
          serviceName: invoice.appointments.title,
          amount: invoice.total_amount,
          dueDate: new Date(invoice.due_date).toLocaleDateString(),
          status: invoice.payment_status
        })
      } catch (emailError) {
        console.error("Failed to send email reminder:", emailError)
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "Reminder sent successfully"
    })

  } catch (error) {
    console.error("Send reminder error:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

// Placeholder email function - implement with your preferred email service
async function sendReminderEmail(emailData: {
  customerEmail?: string
  customerName?: string
  invoiceNumber: string
  serviceName: string
  amount: number
  dueDate: string
  status: string
}) {
  // This is where you would integrate with your email service
  // For now, just log the email data
  console.log("Sending reminder email:", emailData)
  
  // Example implementation with a hypothetical email service:
  /*
  const emailService = new EmailService(process.env.EMAIL_API_KEY)
  return await emailService.send({
    to: emailData.customerEmail,
    subject: `Payment Reminder - Invoice ${emailData.invoiceNumber}`,
    template: 'payment-reminder',
    data: emailData
  })
  */
  
  return { success: true, message: "Email reminder would be sent here" }
}