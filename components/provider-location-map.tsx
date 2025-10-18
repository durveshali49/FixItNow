"use client"

import { useState } from "react"
import { FixedMapComponent } from "./fixed-map-component"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MapPin, Star, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProviderLocationMapProps {
  providers: any[]
  customerLocation?: { lat: number; lng: number; address: string }
  selectedProvider?: any
  onProviderSelect?: (provider: any) => void
}

export function ProviderLocationMap({
  providers,
  customerLocation,
  selectedProvider,
  onProviderSelect,
}: ProviderLocationMapProps) {
  const [mapCenter, setMapCenter] = useState(
    customerLocation || { lat: 12.9716, lng: 77.5946 }, // Bangalore default
  )

  // Calculate distances and sort providers
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const providersWithDistance = providers
    .filter((provider) => provider.users?.latitude && provider.users?.longitude)
    .map((provider) => {
      let distance = null
      if (customerLocation) {
        distance = calculateDistance(
          customerLocation.lat,
          customerLocation.lng,
          provider.users.latitude,
          provider.users.longitude,
        )
      }
      return { ...provider, distance }
    })
    .sort((a, b) => {
      if (a.distance !== null && b.distance !== null) {
        return a.distance - b.distance
      }
      return (b.rating || 0) - (a.rating || 0)
    })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Provider List */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Nearby Providers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 max-h-96 overflow-y-auto">
          {providersWithDistance.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No providers found with location data</p>
          ) : (
            providersWithDistance.map((provider) => (
              <div
                key={provider.id}
                className={`p-3 border border-border rounded-lg cursor-pointer transition-colors hover:bg-accent/5 ${
                  selectedProvider?.id === provider.id ? "ring-2 ring-primary bg-primary/5" : ""
                }`}
                onClick={() => onProviderSelect?.(provider)}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {provider.users?.full_name?.charAt(0) || "P"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sm">{provider.users?.full_name}</h4>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span className="text-xs">{provider.rating?.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        {provider.users?.city}, {provider.users?.state}
                        {provider.distance && (
                          <span className="text-primary font-medium">• {provider.distance.toFixed(1)} km</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {provider.service_provider_categories?.slice(0, 2).map((cat: any, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {cat.service_categories?.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Map View */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Location Map
            </span>
            {selectedProvider && (
              <Button
                size="sm"
                onClick={() => {
                  const url = `https://www.google.com/maps/dir/${customerLocation?.lat},${customerLocation?.lng}/${selectedProvider.users?.latitude},${selectedProvider.users?.longitude}`
                  window.open(url, "_blank")
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Navigation className="h-3 w-3 mr-1" />
                Navigate
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-96 relative">
            <FixedMapComponent initialLocation={mapCenter} height="100%" showSearch={false} showNavigation={false} />
            {/* Custom markers would be added here in a real implementation */}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
