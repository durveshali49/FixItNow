"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Calendar,
  Clock,
  DollarSign,
  Star,
  Briefcase,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  XCircle,
  User,
  Settings,
  LogOut,
  Bell,
  TrendingUp,
  Award,
  Navigation,
  FileCheck,
  Menu,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AIChatbot } from "./ai-chatbot"
import { PaymentTracker } from "./payment-tracker"
import { formatDate, safeDateFormat } from "@/lib/date-utils"

interface ProviderDashboardProps {
  user: any
  userProfile: any
  serviceProvider: any
  appointments: any[]
  reviews: any[]
  earnings: any[]
}

export function ProviderDashboard({
  user,
  userProfile,
  serviceProvider,
  appointments,
  reviews,
  earnings,
}: ProviderDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const router = useRouter()

  useEffect(() => {
    // Show welcome message when dashboard loads
    const hasShownWelcome = sessionStorage.getItem('hasShownProviderWelcome')
    if (!hasShownWelcome) {
      toast.success(`Welcome back, ${userProfile?.full_name}!`, {
        description: "Your service provider dashboard is ready. Manage appointments and grow your business."
      })
      sessionStorage.setItem('hasShownProviderWelcome', 'true')
    }
  }, [userProfile?.full_name])

  // Navigation helper functions
  const openGoogleMaps = (latitude?: number, longitude?: number, address?: string) => {
    if (latitude && longitude) {
      // Use coordinates for more accurate navigation
      const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
      window.open(url, "_blank")
    } else if (address) {
      // Fallback to address search
      const encodedAddress = encodeURIComponent(address)
      const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
      window.open(url, "_blank")
    }
  }

  const openMapOptions = (latitude?: number, longitude?: number, address?: string) => {
    const destination = latitude && longitude ? `${latitude},${longitude}` : encodeURIComponent(address || '')
    
    if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')) {
      // iOS - try to open Apple Maps first, fallback to Google Maps
      const appleMapsUrl = `maps://maps.apple.com/?daddr=${destination}`
      const googleMapsUrl = `https://maps.google.com/maps?daddr=${destination}`
      
      // Try Apple Maps first
      window.location.href = appleMapsUrl
      setTimeout(() => {
        // Fallback to Google Maps if Apple Maps didn't open
        window.open(googleMapsUrl, "_blank")
      }, 1000)
    } else if (navigator.userAgent.includes('Android')) {
      // Android - try Google Maps app first
      const googleMapsApp = `google.navigation:q=${destination}`
      const googleMapsWeb = `https://maps.google.com/maps?daddr=${destination}`
      
      try {
        window.location.href = googleMapsApp
        setTimeout(() => {
          window.open(googleMapsWeb, "_blank")
        }, 1000)
      } catch {
        window.open(googleMapsWeb, "_blank")
      }
    } else {
      // Desktop - open Google Maps in browser
      const url = latitude && longitude 
        ? `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || '')}`
      window.open(url, "_blank")
    }
  }

  const sendLocationMessage = (appointment: any) => {
    if (!appointment.users?.phone_number) return
    
    const phone = appointment.users.phone_number.replace(/\D/g, "")
    const customerName = appointment.users.full_name || "Customer"
    const serviceName = appointment.title || "service"
    const address = appointment.customer_address || "your location"
    
    const message = `Hi ${customerName}! 👋

I'm your FixItNow service provider for ${serviceName}. I'm on my way to ${address}.

📍 I have your location and will be there shortly
⏰ Scheduled time: ${appointment.scheduled_time}
📞 You can call me if you have any questions

See you soon!
FixItNow Team`

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    window.open(url, "_blank")
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    try {
      await supabase.auth.signOut()
      toast.success("Successfully logged out!", {
        description: "You have been securely logged out of your account."
      })
      router.push("/auth/login")
    } catch (error) {
      console.error("Error signing out:", error)
      toast.error("Failed to logout", {
        description: "There was an error logging you out. Please try again."
      })
    }
  }

  const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("appointments").update({ status }).eq("id", appointmentId)

    if (!error) {
      const statusMessages = {
        confirmed: "Appointment confirmed successfully!",
        in_progress: "Job started successfully!",
        completed: "Job completed successfully!",
        cancelled: "Appointment cancelled."
      }
      
      const statusMessage = statusMessages[status as keyof typeof statusMessages] || "Status updated successfully!"
      
      if (status === "cancelled") {
        toast.error(statusMessage, {
          description: "The appointment has been cancelled."
        })
      } else {
        toast.success(statusMessage, {
          description: `The appointment status has been updated to ${status.replace("_", " ")}.`
        })
      }
      
      router.refresh()
    } else {
      toast.error("Failed to update appointment", {
        description: "There was an error updating the appointment status. Please try again."
      })
    }
  }

  // Location info component
  const LocationInfo = ({ appointment }: { appointment: any }) => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
      <div className="flex items-start gap-2 mb-2">
        <MapPin className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-900">Customer Location</p>
          <p className="text-sm text-blue-700">{appointment.customer_address}</p>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {(appointment.customer_latitude && appointment.customer_longitude) || appointment.customer_address ? (
          <Button
            size="sm"
            onClick={() => openMapOptions(
              appointment.customer_latitude, 
              appointment.customer_longitude, 
              appointment.customer_address
            )}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8"
          >
            <Navigation className="h-3 w-3 mr-1" />
            Navigate
          </Button>
        ) : null}
        
        {appointment.users?.phone_number && (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => sendLocationMessage(appointment)}
              className="border-green-500 text-green-700 hover:bg-green-50 text-xs h-8"
            >
              <Phone className="h-3 w-3 mr-1" />
              WhatsApp
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const phone = appointment.users.phone_number.replace(/\D/g, "")
                window.location.href = `tel:${phone}`
              }}
              className="border-blue-500 text-blue-700 hover:bg-blue-50 text-xs h-8"
            >
              <Phone className="h-3 w-3 mr-1" />
              Call
            </Button>
          </>
        )}
      </div>
    </div>
  )

  // Calculate stats
  const totalEarnings = earnings.reduce((sum, earning) => sum + (earning.actual_cost || 0), 0)
  const thisMonthEarnings = earnings
    .filter((earning) => {
      const earningDate = new Date(earning.scheduled_date)
      const now = new Date()
      return earningDate.getMonth() === now.getMonth() && earningDate.getFullYear() === now.getFullYear()
    })
    .reduce((sum, earning) => sum + (earning.actual_cost || 0), 0)

  const pendingAppointments = appointments.filter((apt) => apt.status === "pending")
  const activeAppointments = appointments.filter((apt) => ["confirmed", "in_progress"].includes(apt.status))
  const completedAppointments = appointments.filter((apt) => apt.status === "completed")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "in_progress":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="h-4 w-4" />
      case "confirmed":
      case "in_progress":
        return <Clock className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Provider Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Image
                  src="/logo_app.jpg"
                  alt="FixItNow Logo"
                  width={48}
                  height={48}
                  className="rounded-lg"
                />
                <div>
                  <h1 className="text-xl font-bold text-foreground">FixItNow Provider</h1>
                  <p className="text-sm text-muted-foreground">Service Provider Dashboard</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-3 hover:bg-orange-50 hover:text-orange-600 transition-colors duration-200">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-gray-600" />
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={userProfile?.profile_image_url || "/placeholder.svg"} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {userProfile?.full_name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <span className="hidden md:block text-sm font-medium">{userProfile?.full_name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/provider/verification" className="flex items-center gap-2">
                      <FileCheck className="h-4 w-4" />
                      Verification
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 text-red-600">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors duration-200"
                title="Sign Out"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-fit lg:grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">₹{totalEarnings.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">This month: ₹{thisMonthEarnings.toLocaleString()}</p>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rating</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground flex items-center gap-1">
                    {serviceProvider?.rating?.toFixed(1) || "0.0"}
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                  </div>
                  <p className="text-xs text-muted-foreground">{serviceProvider?.total_reviews || 0} reviews</p>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Jobs Completed</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{completedAppointments.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {serviceProvider?.total_jobs_completed || 0} total jobs
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{activeAppointments.length}</div>
                  <p className="text-xs text-muted-foreground">{pendingAppointments.length} pending requests</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending Appointments */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                    Pending Requests
                  </CardTitle>
                  <CardDescription>New appointment requests requiring your attention</CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingAppointments.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No pending requests</p>
                  ) : (
                    <div className="space-y-4">
                      {pendingAppointments.slice(0, 3).map((appointment) => (
                        <div
                          key={appointment.id}
                          className="flex items-center justify-between p-3 border border-border rounded-lg"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">{appointment.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {appointment.users?.full_name} •{" "}
                              {safeDateFormat(appointment.scheduled_date)}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => updateAppointmentStatus(appointment.id, "confirmed")}
                              className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateAppointmentStatus(appointment.id, "cancelled")}
                              className="border-border"
                            >
                              Decline
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Reviews */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Recent Reviews
                  </CardTitle>
                  <CardDescription>Latest feedback from your customers</CardDescription>
                </CardHeader>
                <CardContent>
                  {reviews.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No reviews yet</p>
                  ) : (
                    <div className="space-y-4">
                      {reviews.slice(0, 3).map((review) => (
                        <div key={review.id} className="p-3 border border-border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                  {review.users?.full_name?.charAt(0) || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium text-foreground">{review.users?.full_name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < review.rating ? "text-yellow-500 fill-current" : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>All Appointments</CardTitle>
                <CardDescription>Manage your service appointments and bookings</CardDescription>
              </CardHeader>
              <CardContent>
                {appointments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No appointments found</p>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <div key={appointment.id} className="p-4 border border-border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-foreground">{appointment.title}</h3>
                              <Badge className={getStatusColor(appointment.status)}>
                                {getStatusIcon(appointment.status)}
                                <span className="ml-1 capitalize">{appointment.status.replace("_", " ")}</span>
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                {appointment.users?.full_name}
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                {appointment.users?.phone_number}
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {safeDateFormat(appointment.scheduled_date)}
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {appointment.scheduled_time}
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span className="flex-1">{appointment.customer_address}</span>
                              </div>
                              {/* Navigation Buttons */}
                              <div className="flex flex-wrap gap-2 col-span-2">
                                {(appointment.customer_latitude && appointment.customer_longitude) || appointment.customer_address ? (
                                  <Button
                                    size="sm"
                                    onClick={() => openMapOptions(
                                      appointment.customer_latitude, 
                                      appointment.customer_longitude, 
                                      appointment.customer_address
                                    )}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                  >
                                    <Navigation className="h-4 w-4 mr-2" />
                                    {appointment.customer_latitude && appointment.customer_longitude 
                                      ? "Navigate (GPS)" 
                                      : "Find Location"
                                    }
                                  </Button>
                                ) : null}
                                
                                {appointment.users?.phone_number && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => sendLocationMessage(appointment)}
                                    className="border-green-200 text-green-700 hover:bg-green-50"
                                  >
                                    <Phone className="h-4 w-4 mr-2" />
                                    Notify Customer
                                  </Button>
                                )}

                                {/* Quick Call Button */}
                                {appointment.users?.phone_number && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const phone = appointment.users.phone_number.replace(/\D/g, "")
                                      window.location.href = `tel:${phone}`
                                    }}
                                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                                  >
                                    <Phone className="h-4 w-4 mr-2" />
                                    Call
                                  </Button>
                                )}
                              </div>
                              {appointment.estimated_cost && (
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-4 w-4" />₹{appointment.estimated_cost}
                                </div>
                              )}
                            </div>
                            {appointment.description && (
                              <p className="mt-2 text-sm text-foreground">{appointment.description}</p>
                            )}
                            
                            {/* Enhanced Location Info */}
                            <LocationInfo appointment={appointment} />
                          </div>
                          <div className="flex flex-col gap-2 ml-4">
                            {appointment.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => updateAppointmentStatus(appointment.id, "confirmed")}
                                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                >
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateAppointmentStatus(appointment.id, "cancelled")}
                                  className="border-border"
                                >
                                  Decline
                                </Button>
                              </>
                            )}
                            {appointment.status === "confirmed" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => updateAppointmentStatus(appointment.id, "in_progress")}
                                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                >
                                  Start Job
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    if (appointment.users?.phone_number) {
                                      const phone = appointment.users.phone_number.replace(/\D/g, "")
                                      const message = `Hi ${appointment.users.full_name}! 👋

I've arrived at ${appointment.customer_address} for your ${appointment.title} service. 

📍 I'm here and ready to start
⏰ Right on time for our ${appointment.scheduled_time} appointment

Please let me know where I can find you or any specific instructions for accessing the location.

Thank you!
FixItNow Service Provider`
                                      const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
                                      window.open(url, "_blank")
                                    }
                                  }}
                                  className="border-orange-200 text-orange-700 hover:bg-orange-50"
                                >
                                  📍 I've Arrived
                                </Button>
                              </>
                            )}
                            {appointment.status === "in_progress" && (
                              <Button
                                size="sm"
                                onClick={() => updateAppointmentStatus(appointment.id, "completed")}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                Complete
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <PaymentTracker user={user} userProfile={userProfile} userRole="service_provider" />
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
                <CardDescription>Feedback and ratings from your customers</CardDescription>
              </CardHeader>
              <CardContent>
                {reviews.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No reviews yet</p>
                ) : (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="p-4 border border-border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {review.users?.full_name?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium text-foreground">{review.users?.full_name}</h4>
                              <p className="text-sm text-muted-foreground">{review.appointments?.title}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? "text-yellow-500 fill-current" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-foreground">{review.comment}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {safeDateFormat(review.created_at)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Profile Settings</h2>
                <p className="text-muted-foreground">Manage your professional profile and preferences</p>
              </div>
              <div className="flex items-center gap-2">
                <Button asChild variant="outline" className="border-border bg-transparent">
                  <Link href="/provider/verification">
                    <FileCheck className="h-4 w-4 mr-2" />
                    Verification
                  </Link>
                </Button>
                <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link href="/profile">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Info */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={userProfile?.profile_image_url || "/placeholder.svg"} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                        {userProfile?.full_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{userProfile?.full_name}</h3>
                      <p className="text-muted-foreground">Service Provider</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{userProfile?.phone_number}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">
                        {userProfile?.city}, {userProfile?.state}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Professional Info */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Professional Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Experience</p>
                      <p className="font-medium text-foreground">{serviceProvider?.experience_years || 0} years</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Hourly Rate</p>
                      <p className="font-medium text-foreground">₹{serviceProvider?.hourly_rate || 0}/hour</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Availability</p>
                    <Badge variant="outline" className="mt-1">
                      {serviceProvider?.availability_type?.replace("_", " ").toUpperCase() || "Not Set"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bio</p>
                    <p className="text-foreground text-sm mt-1">{serviceProvider?.bio || "No bio provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Skills</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {serviceProvider?.skills?.map((skill: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      )) || <p className="text-sm text-muted-foreground">No skills listed</p>}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Service Areas</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {serviceProvider?.service_areas?.map((area: string, index: number) => (
                        <Badge key={index} variant="outline" className="bg-green-50 text-green-800 border-green-200">
                          <MapPin className="h-3 w-3 mr-1" />
                          {area}
                        </Badge>
                      )) || <p className="text-sm text-muted-foreground">No service areas specified</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <AIChatbot user={user} userProfile={userProfile} />
    </div>
  )
}
