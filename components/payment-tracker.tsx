"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InvoiceViewer } from "./invoice-viewer"
import { InvoiceGenerator } from "./invoice-generator"
import { FileText, IndianRupee, Calendar, TrendingUp, AlertCircle, MessageCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { formatDate, safeDateFormat } from "@/lib/date-utils"

interface PaymentTrackerProps {
  user: any
  userProfile: any
  userRole: "customer" | "service_provider"
}

export function PaymentTracker({ user, userProfile, userRole }: PaymentTrackerProps) {
  const [invoices, setInvoices] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalEarnings: 0,
    pendingPayments: 0,
    paidInvoices: 0,
    totalSpent: 0,
  })

  useEffect(() => {
    loadData()
  }, [user, userRole])

  const loadData = async () => {
    const supabase = createClient()
    setIsLoading(true)

    try {
      if (userRole === "service_provider") {
        // Load earnings data for service provider (without showing invoice details)
        // Only show completed appointments with actual costs (invoiced jobs)
        const { data: earningsData } = await supabase
          .from("appointments")
          .select(`
            id,
            title,
            scheduled_date,
            actual_cost,
            payment_status,
            users!appointments_customer_id_fkey(full_name),
            service_categories(name)
          `)
          .eq("service_provider_id", user.id)
          .eq("status", "completed")
          .not("actual_cost", "is", null)

        setAppointments(earningsData || [])
        setInvoices([]) // Providers should not see invoice details

        // Calculate earnings stats from appointments
        const totalEarnings = (earningsData || [])
          .filter((appt: any) => appt.payment_status === "paid")
          .reduce((sum: number, appt: any) => sum + Number(appt.actual_cost || 0), 0)

        const pendingPayments = (earningsData || [])
          .filter((appt: any) => appt.payment_status === "pending")
          .reduce((sum: number, appt: any) => sum + Number(appt.actual_cost || 0), 0)

        const paidJobs = (earningsData || []).filter((appt: any) => appt.payment_status === "paid").length

        setStats({
          totalEarnings,
          pendingPayments,
          paidInvoices: paidJobs,
          totalSpent: 0,
        })
      } else {
        // Load invoices for customer
        const { data: invoiceData } = await supabase
          .from("invoices")
          .select(`
            *,
            appointments(
              *,
              service_providers(
                users!service_providers_id_fkey(full_name, phone_number)
              ),
              service_categories(name)
            )
          `)
          .eq("appointments.customer_id", user.id)
          .order("issued_at", { ascending: false })

        setInvoices(invoiceData || [])

        // Calculate stats for customer
        const totalSpent = (invoiceData || [])
          .filter((inv: any) => inv.payment_status === "paid")
          .reduce((sum: number, inv: any) => sum + Number(inv.total_amount), 0)

        const pendingPayments = (invoiceData || [])
          .filter((inv: any) => inv.payment_status === "pending")
          .reduce((sum: number, inv: any) => sum + Number(inv.total_amount), 0)

        setStats({
          totalEarnings: 0,
          pendingPayments,
          paidInvoices: (invoiceData || []).filter((inv: any) => inv.payment_status === "paid").length,
          totalSpent,
        })
      }
    } catch (error) {
      console.error("Error loading payment data:", error)
    } finally {
      setIsLoading(false)
    }
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-border">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-8 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {userRole === "service_provider" ? (
          <>
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">₹{stats.totalEarnings}</div>
                <p className="text-xs text-muted-foreground">From {stats.paidInvoices} completed jobs</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">₹{stats.pendingPayments}</div>
                <p className="text-xs text-muted-foreground">Awaiting payment</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Jobs</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{appointments.length}</div>
                <p className="text-xs text-muted-foreground">Jobs with payment processing</p>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">₹{stats.totalSpent}</div>
                <p className="text-xs text-muted-foreground">On {stats.paidInvoices} services</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">₹{stats.pendingPayments}</div>
                <p className="text-xs text-muted-foreground">Outstanding amount</p>
                {stats.pendingPayments > 0 && (
                  <Button 
                    size="sm" 
                    className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => {
                      const message = `Hi, I would like to pay my outstanding amount of ₹${stats.pendingPayments}. Please help me with the payment process.`;
                      const whatsappUrl = `https://wa.me/916301052247?text=${encodeURIComponent(message)}`;
                      window.open(whatsappUrl, '_blank');
                    }}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Pay on WhatsApp
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{invoices.length}</div>
                <p className="text-xs text-muted-foreground">All time invoices</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Tabs defaultValue={userRole === "service_provider" ? "earnings" : "invoices"} className="space-y-4">
        <TabsList>
          {userRole === "service_provider" ? (
            <TabsTrigger value="earnings">Earnings History</TabsTrigger>
          ) : (
            <TabsTrigger value="invoices">Pending Payments</TabsTrigger>
          )}
        </TabsList>

        {userRole === "service_provider" ? (
          <TabsContent value="earnings" className="space-y-4">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Earnings History</CardTitle>
                <p className="text-sm text-muted-foreground">Your completed jobs and payment status</p>
              </CardHeader>
              <CardContent>
                {appointments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No earnings data found</p>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge variant={appointment.payment_status === "paid" ? "default" : appointment.payment_status === "pending" ? "secondary" : "destructive"}>
                              {appointment.payment_status || "pending"}
                            </Badge>
                            <span className="text-sm text-muted-foreground">Job #{appointment.id}</span>
                          </div>
                          <h3 className="font-semibold">${appointment.actual_cost || appointment.estimated_cost}</h3>
                          <p className="text-sm text-muted-foreground">
                            Completed on {new Date(appointment.updated_at).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Service: {appointment.service_type}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">
                            {appointment.payment_status === "paid" ? "Earnings Received" : "Payment Pending"}
                          </Badge>
                        </div>
                      </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        ) : (
          <TabsContent value="invoices" className="space-y-4">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Pending Invoices</CardTitle>
                <p className="text-sm text-muted-foreground">Outstanding payments that require your attention</p>
              </CardHeader>
              <CardContent>
                {invoices.filter(invoice => invoice.status !== "paid").length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No pending invoices found</p>
                ) : (
                  <div className="space-y-4">
                    {invoices.filter(invoice => invoice.status !== "paid").map((invoice) => (
                      <div
                        key={invoice.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge variant={invoice.status === "paid" ? "default" : invoice.status === "pending" ? "secondary" : "destructive"}>
                              {invoice.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">#{invoice.invoice_number}</span>
                          </div>
                          <h3 className="font-semibold">₹{invoice.total_amount}</h3>
                          <p className="text-sm text-muted-foreground">
                            Created on {new Date(invoice.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <InvoiceViewer 
                            invoice={invoice}
                            trigger={
                              <Button variant="outline" size="sm">
                                <FileText className="h-4 w-4 mr-2" />
                                View Invoice
                              </Button>
                            }
                          />
                          {invoice.status !== "paid" && (
                            <Button 
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => {
                                const message = `Hi, I would like to pay for Invoice #${invoice.invoice_number} - ₹${invoice.total_amount}. Please help me with the payment process.`;
                                const whatsappUrl = `https://wa.me/916301052247?text=${encodeURIComponent(message)}`;
                                window.open(whatsappUrl, '_blank');
                              }}
                            >
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Pay on WhatsApp
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

      </Tabs>
    </div>
  )
}
