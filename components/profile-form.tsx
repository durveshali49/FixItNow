"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, MapPin, Phone, Mail, Briefcase, Star, Edit3, Save, X, FileCheck } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"

interface ProfileFormProps {
  user: any
  userProfile: any
  serviceProviderData: any
}

export function ProfileForm({ user, userProfile, serviceProviderData }: ProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: userProfile?.full_name || "",
    phone_number: userProfile?.phone_number || "",
    address: userProfile?.address || "",
    city: userProfile?.city || "",
    state: userProfile?.state || "",
    postal_code: userProfile?.postal_code || "",
    // Service provider specific fields
    experience_years: serviceProviderData?.experience_years || 0,
    hourly_rate: serviceProviderData?.hourly_rate || "",
    availability_type: serviceProviderData?.availability_type || "part_time",
    bio: serviceProviderData?.bio || "",
    skills: serviceProviderData?.skills?.join(", ") || "",
    service_areas: serviceProviderData?.service_areas?.join(", ") || "",
  })
  const router = useRouter()

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    const supabase = createClient()
    setIsLoading(true)

    try {
      // Update user profile
      const { error: userError } = await supabase
        .from("users")
        .update({
          full_name: formData.full_name,
          phone_number: formData.phone_number,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postal_code,
        })
        .eq("id", user.id)

      if (userError) throw userError

      // Update service provider profile if applicable
      if (userProfile?.role === "service_provider") {
        const { error: providerError } = await supabase.from("service_providers").upsert({
          id: user.id,
          experience_years: Number.parseInt(formData.experience_years.toString()),
          hourly_rate: Number.parseFloat(formData.hourly_rate.toString()),
          availability_type: formData.availability_type,
          bio: formData.bio,
          skills: formData.skills
            .split(",")
            .map((s: string) => s.trim())
            .filter((s: string) => s),
          service_areas: formData.service_areas
            .split(",")
            .map((s: string) => s.trim())
            .filter((s: string) => s),
        })

        if (providerError) throw providerError
      }

      toast.success("Profile updated successfully!", {
        description: "Your profile information has been saved."
      })

      setIsEditing(false)
      router.refresh()
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile", {
        description: "There was an error saving your profile. Please try again."
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    // Reset form data
    setFormData({
      full_name: userProfile?.full_name || "",
      phone_number: userProfile?.phone_number || "",
      address: userProfile?.address || "",
      city: userProfile?.city || "",
      state: userProfile?.state || "",
      postal_code: userProfile?.postal_code || "",
      experience_years: serviceProviderData?.experience_years || 0,
      hourly_rate: serviceProviderData?.hourly_rate || "",
      availability_type: serviceProviderData?.availability_type || "part_time",
      bio: serviceProviderData?.bio || "",
      skills: serviceProviderData?.skills?.join(", ") || "",
      service_areas: serviceProviderData?.service_areas?.join(", ") || "",
    })
    setIsEditing(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground">Manage your account information and preferences</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
                className="border-border bg-transparent"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <div className="flex gap-2">
              {userProfile?.role === "service_provider" && (
                <Button asChild variant="outline" className="border-border bg-transparent">
                  <Link href="/provider/verification">
                    <FileCheck className="h-4 w-4 mr-2" />
                    Verification
                  </Link>
                </Button>
              )}
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Basic Information */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Basic Information
          </CardTitle>
          <CardDescription>Your personal details and contact information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              {isEditing ? (
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange("full_name", e.target.value)}
                  className="bg-input border-border"
                />
              ) : (
                <p className="text-foreground font-medium">{userProfile?.full_name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              {isEditing ? (
                <Input
                  id="phone_number"
                  value={formData.phone_number}
                  onChange={(e) => handleInputChange("phone_number", e.target.value)}
                  className="bg-input border-border"
                />
              ) : (
                <p className="text-foreground font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {userProfile?.phone_number}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <p className="text-foreground font-medium flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              {user.email}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Badge variant="secondary" className="w-fit">
              {userProfile?.role === "service_provider" ? "Service Provider" : "Customer"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Location Information */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Location Details
          </CardTitle>
          <CardDescription>Your address and location information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            {isEditing ? (
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className="bg-input border-border min-h-[80px]"
              />
            ) : (
              <p className="text-foreground">{userProfile?.address}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              {isEditing ? (
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className="bg-input border-border"
                />
              ) : (
                <p className="text-foreground font-medium">{userProfile?.city}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              {isEditing ? (
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  className="bg-input border-border"
                />
              ) : (
                <p className="text-foreground font-medium">{userProfile?.state}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="postal_code">Postal Code</Label>
              {isEditing ? (
                <Input
                  id="postal_code"
                  value={formData.postal_code}
                  onChange={(e) => handleInputChange("postal_code", e.target.value)}
                  className="bg-input border-border"
                />
              ) : (
                <p className="text-foreground font-medium">{userProfile?.postal_code}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Provider Information */}
      {userProfile?.role === "service_provider" && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Service Provider Details
            </CardTitle>
            <CardDescription>Your professional information and service details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {serviceProviderData && (
              <div className="flex items-center gap-4 p-4 bg-accent/5 rounded-lg border border-border">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500 fill-current" />
                  <span className="font-semibold text-lg">{serviceProviderData.rating.toFixed(1)}</span>
                </div>
                <Separator orientation="vertical" className="h-6" />
                <div className="text-sm text-muted-foreground">{serviceProviderData.total_reviews} reviews</div>
                <Separator orientation="vertical" className="h-6" />
                <div className="text-sm text-muted-foreground">
                  {serviceProviderData.total_jobs_completed} jobs completed
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="experience_years">Years of Experience</Label>
                {isEditing ? (
                  <Input
                    id="experience_years"
                    type="number"
                    min="0"
                    value={formData.experience_years}
                    onChange={(e) => handleInputChange("experience_years", Number.parseInt(e.target.value) || 0)}
                    className="bg-input border-border"
                  />
                ) : (
                  <p className="text-foreground font-medium">{serviceProviderData?.experience_years || 0} years</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="hourly_rate">Hourly Rate (₹)</Label>
                {isEditing ? (
                  <Input
                    id="hourly_rate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.hourly_rate}
                    onChange={(e) => handleInputChange("hourly_rate", e.target.value)}
                    className="bg-input border-border"
                  />
                ) : (
                  <p className="text-foreground font-medium">₹{serviceProviderData?.hourly_rate || 0}/hour</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Availability Type</Label>
              {isEditing ? (
                <RadioGroup
                  value={formData.availability_type}
                  onValueChange={(value) => handleInputChange("availability_type", value)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="full_time" id="full_time" />
                    <Label htmlFor="full_time">Full Time</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="part_time" id="part_time" />
                    <Label htmlFor="part_time">Part Time</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="contract" id="contract" />
                    <Label htmlFor="contract">Contract</Label>
                  </div>
                </RadioGroup>
              ) : (
                <Badge variant="outline" className="w-fit">
                  {serviceProviderData?.availability_type?.replace("_", " ").toUpperCase()}
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              {isEditing ? (
                <Textarea
                  id="bio"
                  placeholder="Tell customers about your experience and expertise..."
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  className="bg-input border-border min-h-[100px]"
                />
              ) : (
                <p className="text-foreground">{serviceProviderData?.bio || "No bio provided"}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              {isEditing ? (
                <Textarea
                  id="skills"
                  placeholder="e.g., Plumbing, Pipe Repair, Installation, Emergency Services"
                  value={formData.skills}
                  onChange={(e) => handleInputChange("skills", e.target.value)}
                  className="bg-input border-border"
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {serviceProviderData?.skills?.map((skill: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  )) || <p className="text-muted-foreground">No skills listed</p>}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="service_areas">Service Areas (comma-separated)</Label>
              <p className="text-sm text-muted-foreground">
                List the cities, towns, or areas where you provide services
              </p>
              {isEditing ? (
                <Textarea
                  id="service_areas"
                  placeholder="e.g., Ballari, Hospet, Sandur, Hagaribommanahalli"
                  value={formData.service_areas}
                  onChange={(e) => handleInputChange("service_areas", e.target.value)}
                  className="bg-input border-border"
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {serviceProviderData?.service_areas?.map((area: string, index: number) => (
                    <Badge key={index} variant="outline" className="bg-green-50 text-green-800 border-green-200">
                      <MapPin className="h-3 w-3 mr-1" />
                      {area}
                    </Badge>
                  )) || <p className="text-muted-foreground">No service areas specified</p>}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
