"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Calendar,
  Clock,
  Star,
  MapPin,
  Phone,
  CheckCircle,
  AlertCircle,
  XCircle,
  User,
  Settings,
  LogOut,
  Bell,
  Plus,
  Wrench,
  Home,
  Zap,
  Droplets,
  Paintbrush,
  Shield,
  Bug,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { BookingModal } from "./booking-modal"
import { AIChatbot } from "./ai-chatbot"
import { PaymentTracker } from "./payment-tracker"
import { formatDate, safeDateFormat } from "@/lib/date-utils"
import Navbar from "@/components/navbar"

interface CustomerDashboardProps {
  user: any
  userProfile: any
  appointments: any[]
  serviceCategories: any[]
  serviceProviders: any[]
}

export function CustomerDashboard({
  user,
  userProfile,
  appointments,
  serviceCategories,
  serviceProviders,
}: CustomerDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const router = useRouter()

  useEffect(() => {
    // Show welcome message when dashboard loads
    const hasShownWelcome = sessionStorage.getItem('hasShownCustomerWelcome')
    if (!hasShownWelcome) {
      toast.success(`Welcome back, ${userProfile?.full_name}!`, {
        description: "Your dashboard is ready. Browse services or manage your bookings."
      })
      sessionStorage.setItem('hasShownCustomerWelcome', 'true')
    }
  }, [userProfile?.full_name])

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

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case "plumbing":
        return <Droplets className="h-5 w-5" />
      case "electrical":
        return <Zap className="h-5 w-5" />
      case "cleaning":
        return <Home className="h-5 w-5" />
      case "painting":
        return <Paintbrush className="h-5 w-5" />
      case "home security":
        return <Shield className="h-5 w-5" />
      case "pest control":
        return <Bug className="h-5 w-5" />
      default:
        return <Wrench className="h-5 w-5" />
    }
  }

  const activeAppointments = appointments.filter((apt) => ["pending", "confirmed", "in_progress"].includes(apt.status))
  const completedAppointments = appointments.filter((apt) => apt.status === "completed")

  return (
    <div className="min-h-screen bg-background">
      {/* Use unified navbar */}
      <Navbar />
      
      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-fit lg:grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="appointments">My Bookings</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{activeAppointments.length}</div>
                  <p className="text-xs text-muted-foreground">Pending and confirmed</p>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{completedAppointments.length}</div>
                  <p className="text-xs text-muted-foreground">Total services used</p>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Quick Book</CardTitle>
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <BookingModal
                    trigger={
                      <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                        Book Service
                      </Button>
                    }
                    serviceCategories={serviceCategories}
                    serviceProviders={serviceProviders}
                    userProfile={userProfile}
                    user={user}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Recent Appointments */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>Your latest service appointments</CardDescription>
              </CardHeader>
              <CardContent>
                {appointments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No bookings yet</p>
                    <BookingModal
                      trigger={
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                          Book Your First Service
                        </Button>
                      }
                      serviceCategories={serviceCategories}
                      serviceProviders={serviceProviders}
                      userProfile={userProfile}
                      user={user}
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.slice(0, 3).map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium text-foreground">{appointment.title}</h4>
                            <Badge className={getStatusColor(appointment.status)}>
                              {getStatusIcon(appointment.status)}
                              <span className="ml-1 capitalize">{appointment.status.replace("_", " ")}</span>
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <p>
                              {appointment.service_providers?.users?.full_name} •{" "}
                              {safeDateFormat(appointment.scheduled_date)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            {/* Service Categories */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Available Services</CardTitle>
                <CardDescription>Choose from our wide range of home services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {serviceCategories.map((category) => (
                    <Button
                      key={category.id}
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center gap-2 border-border hover:bg-accent/5 bg-transparent"
                    >
                      {getCategoryIcon(category.name)}
                      <span className="text-sm font-medium">{category.name}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Service Providers */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Top Rated Professionals</CardTitle>
                <CardDescription>Highly rated service providers in your area</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {serviceProviders.map((provider) => (
                    <Card key={provider.id} className="border-border">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {provider.users?.full_name?.charAt(0) || "P"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">{provider.users?.full_name}</h4>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                              <span className="text-sm text-muted-foreground">
                                {provider.rating?.toFixed(1)} ({provider.total_reviews} reviews)
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            <span className="flex-1">
                              {provider.service_areas && provider.service_areas.length > 0
                                ? provider.service_areas.slice(0, 2).join(", ") + 
                                  (provider.service_areas.length > 2 ? ` +${provider.service_areas.length - 2} more` : "")
                                : `${provider.users?.city}, ${provider.users?.state}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span>${provider.hourly_rate}/hour</span>
                            <span>•</span>
                            <span>{provider.experience_years} years exp</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {provider.service_provider_categories?.slice(0, 2).map((cat: any, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {cat.service_categories?.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <BookingModal
                          trigger={
                            <Button className="w-full mt-3 bg-primary hover:bg-primary/90 text-primary-foreground">
                              Book Now
                            </Button>
                          }
                          serviceCategories={serviceCategories}
                          serviceProviders={[provider]}
                          userProfile={userProfile}
                          user={user}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>My Bookings</CardTitle>
                <CardDescription>Track and manage your service appointments</CardDescription>
              </CardHeader>
              <CardContent>
                {appointments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No bookings found</p>
                    <BookingModal
                      trigger={
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                          Book Your First Service
                        </Button>
                      }
                      serviceCategories={serviceCategories}
                      serviceProviders={serviceProviders}
                      userProfile={userProfile}
                      user={user}
                    />
                  </div>
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
                                {appointment.service_providers?.users?.full_name}
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                {appointment.service_providers?.users?.phone_number}
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {safeDateFormat(appointment.scheduled_date)}
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {appointment.scheduled_time}
                              </div>
                            </div>
                            {appointment.description && (
                              <p className="mt-2 text-sm text-foreground">{appointment.description}</p>
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
            <PaymentTracker user={user} userProfile={userProfile} userRole="customer" />
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Profile Settings</h2>
                <p className="text-muted-foreground">Manage your account information and preferences</p>
              </div>
              <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="/profile">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Link>
              </Button>
            </div>

            <Card className="border-border">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
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
                    <p className="text-muted-foreground">Customer</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <p className="text-muted-foreground">Email</p>
                    <p className="text-foreground">{user.email}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-muted-foreground">Phone</p>
                    <p className="text-foreground">{userProfile?.phone_number}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-muted-foreground">Location</p>
                    <p className="text-foreground">
                      {userProfile?.city}, {userProfile?.state}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-muted-foreground">Member Since</p>
                    <p className="text-foreground">{safeDateFormat(userProfile?.created_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AIChatbot user={user} userProfile={userProfile} />
    </div>
  )
}
