"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { FileText, Send, Calculator, IndianRupee } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { formatDate, safeDateFormat } from "@/lib/date-utils"

interface InvoiceGeneratorProps {
  appointment: any
  serviceProvider: any
  trigger: React.ReactNode
}

export function InvoiceGenerator({ appointment, serviceProvider, trigger }: InvoiceGeneratorProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [invoiceData, setInvoiceData] = useState({
    amount: appointment.actual_cost || appointment.estimated_cost || 0,
    tax_amount: 0,
    description: appointment.description || "",
    additional_charges: "",
    discount: 0,
  })
  const router = useRouter()

  const calculateTax = (amount: number) => {
    return Math.round(amount * 0.18 * 100) / 100 // 18% GST
  }

  const calculateTotal = () => {
    const baseAmount = Number(invoiceData.amount) || 0
    const discount = Number(invoiceData.discount) || 0
    const taxableAmount = baseAmount - discount
    const tax = calculateTax(taxableAmount)
    return taxableAmount + tax
  }

  const handleInputChange = (field: string, value: string | number) => {
    setInvoiceData((prev) => {
      const updated = { ...prev, [field]: value }
      if (field === "amount" || field === "discount") {
        const baseAmount = Number(field === "amount" ? value : updated.amount) || 0
        const discount = Number(field === "discount" ? value : updated.discount) || 0
        const taxableAmount = baseAmount - discount
        updated.tax_amount = calculateTax(taxableAmount)
      }
      return updated
    })
  }

  const generateInvoice = async () => {
    setIsLoading(true)

    try {
      const totalAmount = calculateTotal()

      console.log("Generating invoice with data:", {
        appointment_id: appointment.id,
        amount: invoiceData.amount,
        tax_amount: invoiceData.tax_amount,
        total_amount: totalAmount,
        description: invoiceData.description,
        discount: invoiceData.discount
      })

      const response = await fetch("/api/invoices/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appointment_id: appointment.id,
          amount: invoiceData.amount,
          tax_amount: invoiceData.tax_amount,
          total_amount: totalAmount,
          description: invoiceData.description,
          discount: invoiceData.discount
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.details || result.error || "Failed to generate invoice")
      }

      console.log("Invoice generated successfully:", result)
      alert("Invoice generated successfully!")
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error generating invoice:", error)
      alert(`Error generating invoice: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const sendWhatsAppInvoice = () => {
    const customerPhone = appointment.users?.phone_number
    if (!customerPhone) return

    const message = `*FixItNow Invoice*
    
Service: ${appointment.title}
Date: ${safeDateFormat(appointment.scheduled_date)}
Provider: ${serviceProvider.users?.full_name}

Amount: ₹${invoiceData.amount}
Tax (18%): ₹${invoiceData.tax_amount}
${invoiceData.discount > 0 ? `Discount: -₹${invoiceData.discount}` : ""}
*Total: ₹${calculateTotal()}*

Payment Methods:
💰 Cash Payment
💳 WhatsApp Payment
🌐 Online Payment (Coming Soon)

Thank you for choosing FixItNow!`

    const whatsappUrl = `https://wa.me/${customerPhone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Invoice
          </DialogTitle>
          <DialogDescription>Create and send invoice for completed service</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Service Details */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Service Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Service</p>
                  <p className="font-medium">{appointment.title}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">{safeDateFormat(appointment.scheduled_date)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Customer</p>
                  <p className="font-medium">{appointment.users?.full_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant="secondary" className="capitalize">
                    {appointment.status.replace("_", " ")}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Details */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Invoice Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Service Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={invoiceData.amount}
                    onChange={(e) => handleInputChange("amount", Number(e.target.value))}
                    className="border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount">Discount (₹)</Label>
                  <Input
                    id="discount"
                    type="number"
                    placeholder="0.00"
                    value={invoiceData.discount}
                    onChange={(e) => handleInputChange("discount", Number(e.target.value))}
                    className="border-border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additional_charges">Additional Charges/Notes</Label>
                <Textarea
                  id="additional_charges"
                  placeholder="Any additional charges or notes..."
                  value={invoiceData.additional_charges}
                  onChange={(e) => handleInputChange("additional_charges", e.target.value)}
                  className="border-border min-h-[60px]"
                />
              </div>

              <Separator />

              {/* Invoice Summary */}
              <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Service Amount:</span>
                  <span>₹{invoiceData.amount}</span>
                </div>
                {invoiceData.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount:</span>
                    <span>-₹{invoiceData.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Tax (18% GST):</span>
                  <span>₹{invoiceData.tax_amount.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total Amount:</span>
                  <span className="flex items-center gap-1">
                    <IndianRupee className="h-4 w-4" />
                    {calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={generateInvoice}
              disabled={isLoading || !invoiceData.amount}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <FileText className="h-4 w-4 mr-2" />
              {isLoading ? "Generating..." : "Generate Invoice"}
            </Button>
            <Button
              onClick={sendWhatsAppInvoice}
              variant="outline"
              className="flex-1 border-green-200 text-green-700 hover:bg-green-50 bg-transparent"
            >
              <Send className="h-4 w-4 mr-2" />
              Send via WhatsApp
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
