"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { FileText, Send, Calculator, IndianRupee, Eye, Plus } from "lucide-react"
import { formatDate, safeDateFormat } from "@/lib/date-utils"
import { AdminInvoiceViewer } from "./invoice-viewer"

interface Appointment {
  id: string
  title: string
  description: string
  scheduled_date: string
  status: string
  estimated_cost: number
  actual_cost?: number
  payment_status: string
  customer_id: string
  service_provider_id: string
  users?: {
    full_name: string
    phone_number: string
    email: string
  }
  service_providers?: {
    users?: {
      full_name: string
      phone_number: string
    }
  }
}

interface InvoiceData {
  amount: number
  tax_amount: number
  description: string
}

export function AdminInvoiceManagement() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("create")
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    amount: 0,
    tax_amount: 0,
    description: "",
  })

  useEffect(() => {
    fetchCompletedAppointments()
    fetchExistingInvoices()
  }, [])

  const fetchExistingInvoices = async () => {
    try {
      const token = "admin-temp-token-123" // Temporary token for testing
      const response = await fetch('/api/admin/invoices', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setInvoices(data)
      }
    } catch (error) {
      console.error('Failed to fetch invoices:', error)
    }
  }

  const fetchCompletedAppointments = async () => {
    try {
      const token = "admin-temp-token-123" // Temporary token for testing
      const response = await fetch('/api/admin/appointments/completed', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setAppointments(data)
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error)
    }
  }

  const calculateTax = (amount: number) => {
    return Math.round(amount * 0.18 * 100) / 100 // 18% GST
  }

  const calculateTotal = () => {
    const baseAmount = Number(invoiceData.amount) || 0
    const tax = calculateTax(baseAmount)
    return baseAmount + tax
  }

  const handleInputChange = (field: string, value: string | number) => {
    setInvoiceData((prev) => {
      const updated = { ...prev, [field]: value }
      if (field === "amount") {
        const baseAmount = Number(value) || 0
        updated.tax_amount = calculateTax(baseAmount)
      }
      return updated
    })
  }

  const openInvoiceDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setInvoiceData({
      amount: appointment.actual_cost || appointment.estimated_cost || 0,
      tax_amount: calculateTax(appointment.actual_cost || appointment.estimated_cost || 0),
      description: appointment.description || "",
    })
    setInvoiceDialogOpen(true)
  }

  const generateAndSendInvoice = async () => {
    if (!selectedAppointment) return
    
    setIsLoading(true)
    try {
      const totalAmount = calculateTotal()
      const token = "admin-temp-token-123" // Temporary token for testing

      const response = await fetch("/api/admin/invoices/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          appointment_id: selectedAppointment.id,
          customer_id: selectedAppointment.customer_id,
          amount: invoiceData.amount,
          tax_amount: invoiceData.tax_amount,
          total_amount: totalAmount,
          description: invoiceData.description
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.details || result.error || "Failed to generate invoice")
      }

      alert("Invoice generated and sent successfully!")
      setInvoiceDialogOpen(false)
      fetchCompletedAppointments() // Refresh the list
      fetchExistingInvoices() // Refresh invoices list
    } catch (error) {
      console.error("Error generating invoice:", error)
      alert(`Error generating invoice: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const sendWhatsAppInvoice = () => {
    if (!selectedAppointment?.users?.phone_number) return

    const message = `*FixItNow Invoice*
    
Service: ${selectedAppointment.title}
Date: ${safeDateFormat(selectedAppointment.scheduled_date)}
Provider: ${selectedAppointment.service_providers?.users?.full_name}

Amount: ₹${invoiceData.amount}
Tax (18%): ₹${invoiceData.tax_amount}
*Total: ₹${calculateTotal()}*

Payment Methods:
💰 Cash Payment
💳 WhatsApp Payment
🌐 Online Payment (Coming Soon)

Thank you for choosing FixItNow!`

    const whatsappUrl = `https://wa.me/${selectedAppointment.users.phone_number.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.users?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.service_providers?.users?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || appointment.payment_status === statusFilter
    
    return matchesSearch && matchesStatus
  })

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoice Management
          </CardTitle>
          <CardDescription>
            Generate and send invoices for completed services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Create New Invoice</TabsTrigger>
              <TabsTrigger value="manage">Manage Existing Invoices</TabsTrigger>
            </TabsList>
            
            <TabsContent value="create" className="space-y-4 mt-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by service, customer, or provider..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Appointments Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-medium">{appointment.title}</TableCell>
                    <TableCell>{appointment.users?.full_name}</TableCell>
                    <TableCell>{appointment.service_providers?.users?.full_name}</TableCell>
                    <TableCell>{safeDateFormat(appointment.scheduled_date)}</TableCell>
                    <TableCell>₹{appointment.actual_cost || appointment.estimated_cost}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(appointment.payment_status)}>
                        {appointment.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => openInvoiceDialog(appointment)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Invoice
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredAppointments.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No appointments found matching your criteria.
              </div>
            )}
          </div>
            </TabsContent>

            <TabsContent value="manage" className="space-y-4 mt-6">
              <AdminInvoiceViewer invoices={invoices} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Invoice Generation Dialog */}
      <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generate Invoice
            </DialogTitle>
            <DialogDescription>
              Create and send invoice for completed service
            </DialogDescription>
          </DialogHeader>

          {selectedAppointment && (
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
                      <p className="font-medium">{selectedAppointment.title}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Date</p>
                      <p className="font-medium">{safeDateFormat(selectedAppointment.scheduled_date)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Customer</p>
                      <p className="font-medium">{selectedAppointment.users?.full_name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Provider</p>
                      <p className="font-medium">{selectedAppointment.service_providers?.users?.full_name}</p>
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
                </div>                  <Separator />

                  {/* Invoice Summary */}
                  <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>Service Amount:</span>
                      <span>₹{invoiceData.amount}</span>
                    </div>
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
                  onClick={generateAndSendInvoice}
                  disabled={isLoading || !invoiceData.amount}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {isLoading ? "Generating..." : "Generate & Send Invoice"}
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
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}