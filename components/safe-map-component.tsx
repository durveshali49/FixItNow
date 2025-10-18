"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Navigation, Search } from "lucide-react"

interface SafeMapComponentProps {
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void
  initialLocation?: { lat: number; lng: number }
  height?: string
  showSearch?: boolean
  showNavigation?: boolean
  address?: string
}

export function SafeMapComponent({
  onLocationSelect,
  initialLocation = { lat: 12.9716, lng: 77.5946 }, // Bangalore default
  height = "400px",
  showSearch = true,
  showNavigation = false,
  address,
}: SafeMapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const isInitializedRef = useRef(false)
  
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [currentLocation, setCurrentLocation] = useState(initialLocation)
  const [mapReady, setMapReady] = useState(false)

  // Cleanup function
  const cleanupMap = useCallback(() => {
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markerRef.current = null
        isInitializedRef.current = false
        setMapReady(false)
      } catch (error) {
        console.warn("Error during map cleanup:", error)
      }
    }
  }, [])

  // Initialize map function
  const initializeMap = useCallback(async () => {
    if (!mapRef.current || isInitializedRef.current) {
      return
    }

    try {
      // Clear any existing Leaflet container state
      if ((mapRef.current as any)._leaflet_id) {
        delete (mapRef.current as any)._leaflet_id
      }

      const L = await import("leaflet")

      // Fix for default markers in Leaflet
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      })

      const mapInstance = L.map(mapRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        touchZoom: true,
      }).setView([currentLocation.lat, currentLocation.lng], 13)

      mapInstanceRef.current = mapInstance

      // Add OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        tileSize: 256,
        zoomOffset: 0,
      }).addTo(mapInstance)

      // Add marker
      const markerInstance = L.marker([currentLocation.lat, currentLocation.lng])
        .addTo(mapInstance)
        .bindPopup(address || "Selected Location", {
          closeButton: true,
          autoClose: false,
          className: "custom-popup",
        })

      markerRef.current = markerInstance

      // Handle map clicks
      mapInstance.on("click", async (e: any) => {
        const { lat, lng } = e.latlng
        markerInstance.setLatLng([lat, lng])
        markerInstance.bindPopup("Loading address...").openPopup()

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
          )
          const data = await response.json()
          const addressStr = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`

          markerInstance.bindPopup(`
            <div class="text-sm">
              <strong>Selected Location</strong><br/>
              ${addressStr}
            </div>
          `).openPopup()
          
          setCurrentLocation({ lat, lng })

          if (onLocationSelect) {
            onLocationSelect({ lat, lng, address: addressStr })
          }
        } catch (error) {
          console.error("Reverse geocoding failed:", error)
          const addressStr = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
          markerInstance.bindPopup(`
            <div class="text-sm">
              <strong>Selected Location</strong><br/>
              ${addressStr}
            </div>
          `).openPopup()

          if (onLocationSelect) {
            onLocationSelect({ lat, lng, address: addressStr })
          }
        }
      })

      isInitializedRef.current = true
      setMapReady(true)
      setIsLoading(false)
      
      // Invalidate size to ensure proper rendering
      setTimeout(() => {
        mapInstance.invalidateSize()
      }, 100)
    } catch (error) {
      console.error("Failed to initialize map:", error)
      setIsLoading(false)
    }
  }, [currentLocation, address, onLocationSelect])

  // Effect to initialize map
  useEffect(() => {
    if (typeof window !== "undefined" && mapRef.current && !isInitializedRef.current) {
      initializeMap()
    }

    return cleanupMap
  }, [initializeMap, cleanupMap])

  // Update marker position when initialLocation changes
  useEffect(() => {
    if (mapReady && mapInstanceRef.current && markerRef.current && initialLocation) {
      markerRef.current.setLatLng([initialLocation.lat, initialLocation.lng])
      mapInstanceRef.current.setView([initialLocation.lat, initialLocation.lng], 13)
      setCurrentLocation(initialLocation)
    }
  }, [initialLocation, mapReady])

  const handleSearch = async () => {
    if (!searchQuery.trim() || !mapInstanceRef.current || !markerRef.current) return

    setIsLoading(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&addressdetails=1`,
      )
      const data = await response.json()

      if (data.length > 0) {
        const { lat, lon, display_name } = data[0]
        const newLocation = { lat: parseFloat(lat), lng: parseFloat(lon) }

        markerRef.current.setLatLng([newLocation.lat, newLocation.lng])
        mapInstanceRef.current.setView([newLocation.lat, newLocation.lng], 15)
        markerRef.current.bindPopup(display_name).openPopup()

        setCurrentLocation(newLocation)

        if (onLocationSelect) {
          onLocationSelect({ lat: newLocation.lat, lng: newLocation.lng, address: display_name })
        }
      }
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation && mapInstanceRef.current && markerRef.current) {
      setIsLoading(true)
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          const newLocation = { lat: latitude, lng: longitude }

          markerRef.current.setLatLng([latitude, longitude])
          mapInstanceRef.current.setView([latitude, longitude], 15)

          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            )
            const data = await response.json()
            const addressStr = data.display_name || "Current Location"

            markerRef.current.bindPopup(addressStr).openPopup()
            setCurrentLocation(newLocation)

            if (onLocationSelect) {
              onLocationSelect({ lat: latitude, lng: longitude, address: addressStr })
            }
          } catch (error) {
            console.error("Reverse geocoding failed:", error)
            markerRef.current.bindPopup("Current Location").openPopup()

            if (onLocationSelect) {
              onLocationSelect({ lat: latitude, lng: longitude, address: "Current Location" })
            }
          }
          
          setIsLoading(false)
        },
        (error) => {
          console.error("Geolocation failed:", error)
          setIsLoading(false)
        },
      )
    }
  }

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${currentLocation.lat},${currentLocation.lng}&travelmode=driving`
    window.open(url, "_blank")
  }

  return (
    <Card className="border-border">
      <CardContent className="p-0">
        {showSearch && (
          <div className="p-4 border-b border-border">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search for a location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10 border-border"
                />
              </div>
              <Button onClick={handleSearch} disabled={isLoading} className="bg-primary hover:bg-primary/90">
                Search
              </Button>
              <Button
                variant="outline"
                onClick={getCurrentLocation}
                disabled={isLoading}
                className="border-border bg-transparent"
              >
                <MapPin className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="relative">
          <div className="map-container" style={{ height }}>
            <div 
              ref={mapRef} 
              className="leaflet-container"
            />
          </div>

          {isLoading && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-b-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading map...</p>
              </div>
            </div>
          )}

          {showNavigation && (
            <div className="absolute bottom-4 right-4">
              <Button onClick={openInGoogleMaps} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                <Navigation className="h-4 w-4 mr-2" />
                Navigate
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}