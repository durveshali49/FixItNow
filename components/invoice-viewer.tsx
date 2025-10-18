"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FileText, Download, Send, CreditCard, IndianRupee, Calendar, User } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { formatDate, safeDateFormat } from "@/lib/date-utils"

interface InvoiceViewerProps {
  invoice: any
  appointment?: any
  trigger: React.ReactNode
  userRole?: "customer" | "service_provider"
}

export function InvoiceViewer({ invoice, appointment, trigger, userRole = "customer" }: InvoiceViewerProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [appointmentData, setAppointmentData] = useState(appointment)

  useEffect(() => {
    if (open && !appointmentData && invoice.appointment_id) {
      loadAppointmentData()
    }
  }, [open, appointmentData, invoice.appointment_id])

  const loadAppointmentData = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("appointments")
      .select(`
        *,
        users!appointments_customer_id_fkey(full_name, phone_number, email),
        service_providers(
          users!service_providers_id_fkey(full_name, phone_number)
        ),
        service_categories(name)
      `)
      .eq("id", invoice.appointment_id)
      .single()

    if (!error && data) {
      setAppointmentData(data)
    }
  }

  const markAsPaid = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      // Update invoice status
      await supabase
        .from("invoices")
        .update({
          payment_status: "paid",
          paid_at: new Date().toISOString(),
        })
        .eq("id", invoice.id)

      // Update appointment payment status
      await supabase.from("appointments").update({ payment_status: "paid" }).eq("id", invoice.appointment_id)

      // Create notification
      const customerId = appointmentData?.customer_id || appointmentData?.users?.id
      if (customerId) {
        await supabase.from("notifications").insert({
          user_id: customerId,
          title: "Payment Confirmed",
          message: `Payment for invoice ${invoice.invoice_number} has been confirmed.`,
          type: "payment",
          related_appointment_id: invoice.appointment_id,
        })
      }

      setOpen(false)
      window.location.reload()
    } catch (error) {
      console.error("Error marking as paid:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const sendWhatsAppReminder = () => {
    const customerPhone = appointmentData?.users?.phone_number
    if (!customerPhone) return

    const message = `*Payment Reminder - FixItNow*

Invoice: ${invoice.invoice_number}
Service: ${appointmentData?.title}
Amount: ₹${invoice.total_amount}
Due Date: ${new Date(invoice.due_date).toLocaleDateString()}

Please complete your payment at your earliest convenience.

Payment Methods:
💰 Cash Payment
💳 WhatsApp Payment
🌐 Online Payment (Coming Soon)

Thank you!`

    const whatsappUrl = `https://wa.me/${customerPhone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  const downloadInvoice = () => {
    // Create a simple invoice HTML for printing/downloading
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoice.invoice_number}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .invoice-details { margin-bottom: 20px; }
          .table { width: 100%; border-collapse: collapse; }
          .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .total { font-weight: bold; background-color: #f5f5f5; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>FixItNow</h1>
          <h2>Invoice ${invoice.invoice_number}</h2>
        </div>
        
        <div class="invoice-details">
          <p><strong>Date:</strong> ${new Date(invoice.issued_at).toLocaleDateString()}</p>
          <p><strong>Due Date:</strong> ${new Date(invoice.due_date).toLocaleDateString()}</p>
          <p><strong>Service:</strong> ${appointmentData?.title || "Service"}</p>
          <p><strong>Customer:</strong> ${appointmentData?.users?.full_name || "Customer"}</p>
        </div>
        
        <table class="table">
          <tr><th>Description</th><th>Amount</th></tr>
          <tr><td>Service Charge</td><td>₹${invoice.amount}</td></tr>
          <tr><td>Tax (18% GST)</td><td>₹${invoice.tax_amount}</td></tr>
          <tr class="total"><td>Total</td><td>₹${invoice.total_amount}</td></tr>
        </table>
        
        <p style="margin-top: 30px;">Thank you for choosing FixItNow!</p>
      </body>
      </html>
    `

    const blob = new Blob([invoiceHTML], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `invoice-${invoice.invoice_number}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "failed":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoice {invoice.invoice_number}
          </DialogTitle>
          <DialogDescription>Invoice details and payment information</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Header */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">FixItNow</CardTitle>
                <Badge className={getStatusColor(invoice.payment_status)}>
                  {invoice.payment_status.charAt(0).toUpperCase() + invoice.payment_status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Invoice Number</p>
                  <p className="font-medium">{invoice.invoice_number}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Issue Date</p>
                  <p className="font-medium">{safeDateFormat(invoice.issued_at)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Due Date</p>
                  <p className="font-medium">{safeDateFormat(invoice.due_date)}</p>
                </div>
                {invoice.paid_at && (
                  <div>
                    <p className="text-muted-foreground">Paid Date</p>
                    <p className="font-medium">{safeDateFormat(invoice.paid_at)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Service Details */}
          {appointmentData && (
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base">Service Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Customer</p>
                      <p className="font-medium">{appointmentData.users?.full_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Service Date</p>
                      <p className="font-medium">{safeDateFormat(appointmentData.scheduled_date)}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground">Service</p>
                  <p className="font-medium">{appointmentData.title}</p>
                </div>
                {appointmentData.description && (
                  <div>
                    <p className="text-muted-foreground">Description</p>
                    <p className="text-sm">{appointmentData.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Invoice Amount */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <IndianRupee className="h-4 w-4" />
                Amount Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Service Amount:</span>
                  <span>₹{invoice.amount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (18% GST):</span>
                  <span>₹{invoice.tax_amount}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total Amount:</span>
                  <span className="flex items-center gap-1">
                    <IndianRupee className="h-5 w-5" />
                    {invoice.total_amount}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={downloadInvoice} variant="outline" className="flex-1 border-border bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>

            {userRole === "service_provider" && invoice.payment_status === "pending" && (
              <>
                <Button
                  onClick={sendWhatsAppReminder}
                  variant="outline"
                  className="flex-1 border-green-200 text-green-700 hover:bg-green-50 bg-transparent"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Reminder
                </Button>
                <Button
                  onClick={markAsPaid}
                  disabled={isLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {isLoading ? "Processing..." : "Mark as Paid"}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
