"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapComponent } from "./map-component"
import { MapPin, Navigation } from "lucide-react"

interface LocationPickerProps {
  onLocationChange: (location: { address: string; latitude?: number; longitude?: number }) => void
  initialAddress?: string
  initialCoordinates?: { lat: number; lng: number }
  label?: string
  placeholder?: string
  showMap?: boolean
}

export function LocationPicker({
  onLocationChange,
  initialAddress = "",
  initialCoordinates,
  label = "Address",
  placeholder = "Enter your address",
  showMap = true,
}: LocationPickerProps) {
  const [address, setAddress] = useState(initialAddress)
  const [coordinates, setCoordinates] = useState(initialCoordinates)
  const [showMapView, setShowMapView] = useState(false)

  const handleAddressChange = (value: string) => {
    setAddress(value)
    onLocationChange({ address: value, latitude: coordinates?.lat, longitude: coordinates?.lng })
  }

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setAddress(location.address)
    setCoordinates({ lat: location.lat, lng: location.lng })
    onLocationChange({
      address: location.address,
      latitude: location.lat,
      longitude: location.lng,
    })
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords

          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            )
            const data = await response.json()
            const addressStr = data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`

            setAddress(addressStr)
            setCoordinates({ lat: latitude, lng: longitude })
            onLocationChange({
              address: addressStr,
              latitude,
              longitude,
            })
          } catch (error) {
            console.error("Reverse geocoding failed:", error)
            const addressStr = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
            setAddress(addressStr)
            setCoordinates({ lat: latitude, lng: longitude })
            onLocationChange({
              address: addressStr,
              latitude,
              longitude,
            })
          }
        },
        (error) => {
          console.error("Geolocation failed:", error)
        },
      )
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="address">{label}</Label>
        <div className="flex gap-2">
          <Textarea
            id="address"
            placeholder={placeholder}
            value={address}
            onChange={(e) => handleAddressChange(e.target.value)}
            className="border-border min-h-[60px] flex-1"
          />
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={getCurrentLocation}
              className="border-border bg-transparent"
              title="Use current location"
            >
              <MapPin className="h-4 w-4" />
            </Button>
            {showMap && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowMapView(!showMapView)}
                className="border-border"
                title="Select on map"
              >
                <Navigation className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {showMapView && showMap && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Select Location on Map</CardTitle>
          </CardHeader>
          <CardContent>
            <MapComponent
              onLocationSelect={handleLocationSelect}
              initialLocation={coordinates}
              height="300px"
              showSearch={true}
              address={address}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
