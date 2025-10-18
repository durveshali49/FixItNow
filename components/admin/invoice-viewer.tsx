"use client"

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
import { 
  FileText, 
  Download, 
  CreditCard, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  IndianRupee,
  Calendar,
  User,
  Phone
} from "lucide-react"
import { formatDate, safeDateFormat } from "@/lib/date-utils"

interface Invoice {
  id: string
  invoice_number: string
  amount: number
  tax_amount: number
  total_amount: number
  payment_status: string
  due_date: string
  issued_at: string
  appointment_id: string
  appointments?: {
    title: string
    description: string
    scheduled_date: string
    service_providers?: {
      users?: {
        full_name: string
        phone_number: string
      }
    }
  }
}

interface AdminInvoiceViewerProps {
  invoices: Invoice[]
  customerId?: string
}

export function AdminInvoiceViewer({ invoices, customerId }: AdminInvoiceViewerProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "overdue":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const markAsPaid = async (invoiceId: string) => {
    try {
      const token = "admin-temp-token-123" // Temporary token for testing
      const response = await fetch(`/api/admin/invoices/${invoiceId}/mark-paid`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        // Refresh the page or update local state
        window.location.reload()
      } else {
        alert("Failed to mark invoice as paid")
      }
    } catch (error) {
      console.error("Error marking invoice as paid:", error)
      alert("Error updating payment status")
    }
  }

  const sendReminderToCustomer = async (invoice: Invoice) => {
    try {
      const token = "admin-temp-token-123" // Temporary token for testing
      const response = await fetch(`/api/admin/invoices/${invoice.id}/send-reminder`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        alert("Reminder sent successfully!")
      } else {
        alert("Failed to send reminder")
      }
    } catch (error) {
      console.error("Error sending reminder:", error)
      alert("Error sending reminder")
    }
  }

  const downloadInvoice = (invoice: Invoice) => {
    // Generate a simple invoice HTML and trigger download
    const invoiceHtml = generateInvoiceHtml(invoice)
    const blob = new Blob([invoiceHtml], { type: 'text/html' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoice-${invoice.invoice_number}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const generateInvoiceHtml = (invoice: Invoice) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Invoice ${invoice.invoice_number}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #f97316; padding-bottom: 20px; margin-bottom: 30px; }
        .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .service-details { background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .amount-breakdown { background-color: #fef7ed; padding: 20px; border-radius: 8px; }
        .total-row { font-weight: bold; font-size: 1.2em; border-top: 2px solid #f97316; padding-top: 10px; }
        .status { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 0.9em; }
        .status-paid { background-color: #dcfce7; color: #166534; }
        .status-pending { background-color: #fef3c7; color: #92400e; }
        .status-overdue { background-color: #fee2e2; color: #991b1b; }
    </style>
</head>
<body>
    <div class="header">
        <h1 style="color: #f97316; margin: 0;">FixItNow</h1>
        <h2 style="margin: 10px 0 0 0;">Invoice ${invoice.invoice_number}</h2>
    </div>
    
    <div class="invoice-details">
        <div>
            <h3>Invoice Details</h3>
            <p><strong>Invoice Number:</strong> ${invoice.invoice_number}</p>
            <p><strong>Issue Date:</strong> ${safeDateFormat(invoice.issued_at)}</p>
            <p><strong>Due Date:</strong> ${safeDateFormat(invoice.due_date)}</p>
            <p><strong>Status:</strong> <span class="status status-${invoice.payment_status}">${invoice.payment_status.toUpperCase()}</span></p>
        </div>
        <div>
            <h3>Service Provider</h3>
            <p><strong>Name:</strong> ${invoice.appointments?.service_providers?.users?.full_name || 'N/A'}</p>
            <p><strong>Phone:</strong> ${invoice.appointments?.service_providers?.users?.phone_number || 'N/A'}</p>
        </div>
    </div>

    <div class="service-details">
        <h3>Service Details</h3>
        <p><strong>Service:</strong> ${invoice.appointments?.title || 'N/A'}</p>
        <p><strong>Description:</strong> ${invoice.appointments?.description || 'N/A'}</p>
        <p><strong>Service Date:</strong> ${invoice.appointments ? safeDateFormat(invoice.appointments.scheduled_date) : 'N/A'}</p>
    </div>

    <div class="amount-breakdown">
        <h3>Amount Breakdown</h3>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span>Service Amount:</span>
            <span>₹${invoice.amount}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span>Tax (18% GST):</span>
            <span>₹${invoice.tax_amount}</span>
        </div>
        <hr>
        <div class="total-row" style="display: flex; justify-content: space-between;">
            <span>Total Amount:</span>
            <span>₹${invoice.total_amount}</span>
        </div>
    </div>

    <div style="margin-top: 30px; text-align: center; color: #666;">
        <p>Thank you for choosing FixItNow!</p>
        <p>For any questions regarding this invoice, please contact our support team.</p>
    </div>
</body>
</html>
    `
  }

  return (
    <div className="space-y-4">
      {invoices.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No invoices found</p>
          </CardContent>
        </Card>
      ) : (
        invoices.map((invoice) => (
          <Card key={invoice.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {getStatusIcon(invoice.payment_status)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{invoice.invoice_number}</h3>
                    <p className="text-sm text-muted-foreground">
                      {invoice.appointments?.title} • Due: {safeDateFormat(invoice.due_date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className={getStatusColor(invoice.payment_status)}>
                    {invoice.payment_status}
                  </Badge>
                  <div className="text-right">
                    <p className="font-semibold flex items-center">
                      <IndianRupee className="h-4 w-4" />
                      {invoice.total_amount}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedInvoice(invoice)
                        setViewDialogOpen(true)
                      }}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    {invoice.payment_status === "pending" && (
                      <Button
                        size="sm"
                        onClick={() => markAsPaid(invoice.id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Mark Paid
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {/* Invoice Detail Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Invoice Details
            </DialogTitle>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Invoice Number</p>
                  <p className="font-medium">{selectedInvoice.invoice_number}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(selectedInvoice.payment_status)}>
                    {selectedInvoice.payment_status}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Issue Date</p>
                  <p className="font-medium">{safeDateFormat(selectedInvoice.issued_at)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Due Date</p>
                  <p className="font-medium">{safeDateFormat(selectedInvoice.due_date)}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">Service Details</h4>
                <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                  <p><span className="text-muted-foreground">Service:</span> {selectedInvoice.appointments?.title}</p>
                  <p><span className="text-muted-foreground">Description:</span> {selectedInvoice.appointments?.description}</p>
                  <p><span className="text-muted-foreground">Service Date:</span> {selectedInvoice.appointments ? safeDateFormat(selectedInvoice.appointments.scheduled_date) : 'N/A'}</p>
                  <p><span className="text-muted-foreground">Provider:</span> {selectedInvoice.appointments?.service_providers?.users?.full_name}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Amount Breakdown</h4>
                <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <span>Service Amount:</span>
                    <span>₹{selectedInvoice.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (18% GST):</span>
                    <span>₹{selectedInvoice.tax_amount}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total Amount:</span>
                    <span className="flex items-center">
                      <IndianRupee className="h-4 w-4 mr-1" />
                      {selectedInvoice.total_amount}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => downloadInvoice(selectedInvoice)}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                {selectedInvoice.payment_status === "pending" && (
                  <>
                    <Button
                      onClick={() => sendReminderToCustomer(selectedInvoice)}
                      variant="outline"
                      className="flex-1"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Send Reminder
                    </Button>
                    <Button
                      onClick={() => markAsPaid(selectedInvoice.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Paid
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}