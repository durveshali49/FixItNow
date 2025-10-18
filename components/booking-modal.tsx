"use client"

import type React from "react"
import { LocationPicker } from "./location-picker"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, MapPin, Star, DollarSign, User, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface BookingModalProps {
  trigger: React.ReactNode
  serviceCategories: any[]
  serviceProviders: any[]
  userProfile: any
  user: any
}

export function BookingModal({ trigger, serviceCategories, serviceProviders, userProfile, user }: BookingModalProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedProvider, setSelectedProvider] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [bookingData, setBookingData] = useState({
    title: "",
    description: "",
    scheduled_time: "",
    payment_method: "cash" as "cash" | "whatsapp_payment" | "online",
    special_instructions: "",
    customer_address: userProfile?.address || "",
    customer_latitude: null as number | null,
    customer_longitude: null as number | null,
  })
  const router = useRouter()

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371 // Radius of the Earth in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c // Distance in kilometers
  }

  // Debug: Log providers and category filtering
  console.log("All service providers:", serviceProviders.length)
  console.log("Selected category:", selectedCategory)
  console.log("Service providers data:", serviceProviders)

  const filteredProviders = serviceProviders
    .filter((provider) => {
      // For now, show all providers regardless of category
      console.log("Showing provider:", provider.users?.full_name || `Provider ${provider.id.slice(0, 8)}`)
      return true
      
      // TODO: Add category filtering back when categories are properly set up
      // if (!selectedCategory) return true
      // const hasCategory = provider.service_provider_categories?.some((cat: any) => 
      //   cat.service_categories?.id === selectedCategory
      // )
      // return hasCategory
    })
    .map((provider) => {
      // Calculate distance if both locations are available
      let distance = null
      if (
        bookingData.customer_latitude &&
        bookingData.customer_longitude &&
        provider.users?.latitude &&
        provider.users?.longitude
      ) {
        distance = calculateDistance(
          bookingData.customer_latitude,
          bookingData.customer_longitude,
          provider.users.latitude,
          provider.users.longitude,
        )
      }
      return { ...provider, distance }
    })
    .sort((a, b) => {
      // Sort by distance if available, otherwise by rating
      if (a.distance !== null && b.distance !== null) {
        return a.distance - b.distance
      }
      return (b.rating || 0) - (a.rating || 0)
    })

  // Debug filtered providers
  console.log("Filtered providers after processing:", filteredProviders.length)
  console.log("Filtered providers data:", filteredProviders)

  const handleInputChange = (field: string, value: string) => {
    setBookingData((prev) => ({ ...prev, [field]: value }))
  }

  const handleBookingSubmit = async () => {
    if (!selectedProvider || !selectedDate || !bookingData.title || !bookingData.scheduled_time) {
      return
    }

    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("appointments").insert({
        customer_id: user.id,
        service_provider_id: selectedProvider.id,
        category_id: selectedCategory,
        title: bookingData.title,
        description: bookingData.description,
        scheduled_date: format(selectedDate, "yyyy-MM-dd"),
        scheduled_time: bookingData.scheduled_time,
        customer_address: bookingData.customer_address,
        customer_latitude: bookingData.customer_latitude,
        customer_longitude: bookingData.customer_longitude,
        special_instructions: bookingData.special_instructions,
        payment_method: bookingData.payment_method,
        estimated_cost: selectedProvider.hourly_rate * 2, // Estimate 2 hours
        status: "pending",
      })

      if (error) throw error

      // Create notification for service provider
      await supabase.from("notifications").insert({
        user_id: selectedProvider.id,
        title: "New Booking Request",
        message: `You have a new booking request for ${bookingData.title}`,
        type: "appointment",
        related_appointment_id: null, // We'd need the appointment ID here in a real implementation
      })

      setOpen(false)
      setStep(1)
      setSelectedCategory("")
      setSelectedProvider(null)
      setSelectedDate(undefined)
      setBookingData({
        title: "",
        description: "",
        scheduled_time: "",
        payment_method: "cash",
        special_instructions: "",
        customer_address: userProfile?.address || "",
        customer_latitude: null as number | null,
        customer_longitude: null as number | null,
      })

      toast.success("Booking created successfully!", {
        description: "Your service request has been submitted. The provider will contact you soon."
      })

      router.refresh()
    } catch (error) {
      console.error("Error creating booking:", error)
      toast.error("Failed to create booking", {
        description: "There was an error submitting your booking. Please try again."
      })
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4))
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book a Service</DialogTitle>
          <DialogDescription>Find and book trusted professionals for your home service needs</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                    step >= stepNum ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  {stepNum}
                </div>
                {stepNum < 4 && <div className={cn("w-16 h-0.5 mx-2", step > stepNum ? "bg-primary" : "bg-muted")} />}
              </div>
            ))}
          </div>

          {/* Step 1: Service Category */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Select Service Category</h3>
                <p className="text-sm text-muted-foreground mb-4">Choose the type of service you need</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {serviceCategories.map((category) => (
                  <Card
                    key={category.id}
                    className={cn(
                      "cursor-pointer transition-colors border-border hover:bg-accent/5",
                      selectedCategory === category.id && "ring-2 ring-primary bg-primary/5",
                    )}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <CardContent className="p-4 text-center">
                      <h4 className="font-medium text-sm">{category.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{category.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Service Provider */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Choose Service Provider</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {userProfile?.city && userProfile?.state ? (
                    <>
                      Providers in {userProfile.city}, {userProfile.state}
                      {bookingData.customer_latitude && " - sorted by distance"}
                    </>
                  ) : bookingData.customer_latitude ? (
                    "Sorted by distance from your location"
                  ) : (
                    "Select from available professionals"
                  )}
                </p>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {/* Debug info */}
                <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                  Debug: {filteredProviders.length} providers found
                </div>
                
                {filteredProviders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No providers available for this category</p>
                ) : (
                  filteredProviders.map((provider) => (
                    <Card
                      key={provider.id}
                      className={cn(
                        "cursor-pointer transition-colors border-border hover:bg-accent/5",
                        selectedProvider?.id === provider.id && "ring-2 ring-primary bg-primary/5",
                      )}
                      onClick={() => setSelectedProvider(provider)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {provider.users?.full_name?.charAt(0) || "SP"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium">
                                {provider.users?.full_name || `Service Provider ${provider.id.slice(0, 8)}`}
                              </h4>
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                <span className="text-sm">{provider.rating?.toFixed(1) || "0.0"}</span>
                              </div>
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-3 w-3" />
                                <span className="flex-1">
                                  {provider.service_areas && provider.service_areas.length > 0
                                    ? provider.service_areas.slice(0, 2).join(", ") + 
                                      (provider.service_areas.length > 2 ? ` +${provider.service_areas.length - 2} more` : "")
                                    : provider.users?.city && provider.users?.state 
                                      ? `${provider.users.city}, ${provider.users.state}`
                                      : "Location not specified"
                                  }
                                </span>
                                {provider.distance && (
                                  <span className="text-primary font-medium">
                                    • {provider.distance.toFixed(1)} km away
                                  </span>
                                )}
                                {/* Show local badge if provider serves user's city */}
                                {provider.service_areas && userProfile?.city && 
                                 provider.service_areas.some((area: string) => 
                                   area.toLowerCase().includes(userProfile.city.toLowerCase()) ||
                                   userProfile.city.toLowerCase().includes(area.toLowerCase())
                                 ) && (
                                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                    Serves Your Area
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-3 w-3" />₹{provider.hourly_rate}/hour
                              </div>
                              <div className="flex items-center gap-2">
                                <User className="h-3 w-3" />
                                {provider.experience_years} years experience
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {provider.service_provider_categories?.slice(0, 2).map((cat: any, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {cat.service_categories?.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Step 3: Schedule */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Schedule Appointment</h3>
                <p className="text-sm text-muted-foreground mb-4">Choose your preferred date and time</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Date</Label>
                    <Input
                      type="date"
                      className="w-full"
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => {
                        if (e.target.value) {
                          const newDate = new Date(e.target.value + 'T00:00:00')
                          console.log("Date selected:", newDate)
                          setSelectedDate(newDate)
                        }
                      }}
                      value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
                    />
                    {selectedDate && (
                      <p className="text-xs text-green-600">
                        Selected: {selectedDate.toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Preferred Time</Label>
                    <Select
                      value={bookingData.scheduled_time}
                      onValueChange={(value) => handleInputChange("scheduled_time", value)}
                    >
                      <SelectTrigger className="border-border">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="09:00">9:00 AM</SelectItem>
                        <SelectItem value="10:00">10:00 AM</SelectItem>
                        <SelectItem value="11:00">11:00 AM</SelectItem>
                        <SelectItem value="12:00">12:00 PM</SelectItem>
                        <SelectItem value="13:00">1:00 PM</SelectItem>
                        <SelectItem value="14:00">2:00 PM</SelectItem>
                        <SelectItem value="15:00">3:00 PM</SelectItem>
                        <SelectItem value="16:00">4:00 PM</SelectItem>
                        <SelectItem value="17:00">5:00 PM</SelectItem>
                        <SelectItem value="18:00">6:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Service Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Kitchen sink repair"
                      value={bookingData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      className="border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the issue or service needed..."
                      value={bookingData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      className="border-border min-h-[80px]"
                    />
                  </div>
                </div>
              </div>

              <LocationPicker
                label="Service Address"
                placeholder="Enter the address where service is needed"
                onLocationChange={(location) => {
                  setBookingData((prev) => ({
                    ...prev,
                    customer_address: location.address,
                    customer_latitude: location.latitude || null,
                    customer_longitude: location.longitude || null,
                  }))
                }}
                initialAddress={bookingData.customer_address}
                showMap={true}
              />

              <div className="space-y-2">
                <Label htmlFor="instructions">Special Instructions (Optional)</Label>
                <Textarea
                  id="instructions"
                  placeholder="Any special instructions or requirements..."
                  value={bookingData.special_instructions}
                  onChange={(e) => handleInputChange("special_instructions", e.target.value)}
                  className="border-border min-h-[60px]"
                />
              </div>
            </div>
          )}

          {/* Step 4: Payment & Confirmation */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Payment & Confirmation</h3>
                <p className="text-sm text-muted-foreground mb-4">Review your booking and choose payment method</p>
              </div>

              {/* Booking Summary */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-base">Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service:</span>
                    <span className="font-medium">{bookingData.title}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Provider:</span>
                    <span className="font-medium">{selectedProvider?.users?.full_name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Date & Time:</span>
                    <span className="font-medium">
                      {selectedDate && format(selectedDate, "PPP")} at {bookingData.scheduled_time}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Estimated Cost:</span>
                    <span className="font-medium">₹{selectedProvider?.hourly_rate * 2}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <div className="space-y-3">
                <Label>Payment Method</Label>
                <RadioGroup
                  value={bookingData.payment_method}
                  onValueChange={(value) => handleInputChange("payment_method", value)}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2 p-3 border border-border rounded-lg">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash" className="flex-1 cursor-pointer">
                      <div className="font-medium">Cash on Service</div>
                      <div className="text-sm text-muted-foreground">Pay directly to the service provider</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border border-border rounded-lg">
                    <RadioGroupItem value="whatsapp_payment" id="whatsapp" />
                    <Label htmlFor="whatsapp" className="flex-1 cursor-pointer">
                      <div className="font-medium">WhatsApp Payment</div>
                      <div className="text-sm text-muted-foreground">Pay via WhatsApp after service completion</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border border-border rounded-lg">
                    <RadioGroupItem value="online" id="online" />
                    <Label htmlFor="online" className="flex-1 cursor-pointer">
                      <div className="font-medium">Online Payment</div>
                      <div className="text-sm text-muted-foreground">Pay securely online (Coming Soon)</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Important Notes */}
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-yellow-800 mb-1">Important Notes:</p>
                      <ul className="text-yellow-700 space-y-1 text-xs">
                        <li>• Your booking request will be sent to the service provider</li>
                        <li>• You'll receive confirmation once the provider accepts</li>
                        <li>• The provider will contact you before the scheduled time</li>
                        <li>• Estimated cost may vary based on actual work required</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t border-border">
            <Button variant="outline" onClick={prevStep} disabled={step === 1} className="border-border bg-transparent">
              Previous
            </Button>

            {step < 4 ? (
              <Button
                onClick={nextStep}
                disabled={
                  (step === 1 && !selectedCategory) ||
                  (step === 2 && !selectedProvider) ||
                  (step === 3 && (!selectedDate || !bookingData.title || !bookingData.scheduled_time))
                }
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleBookingSubmit}
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isLoading ? "Booking..." : "Confirm Booking"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
