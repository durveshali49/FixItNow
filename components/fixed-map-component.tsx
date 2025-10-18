"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Navigation, Search } from "lucide-react"

interface FixedMapComponentProps {
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void
  initialLocation?: { lat: number; lng: number }
  height?: string
  showSearch?: boolean
  showNavigation?: boolean
  address?: string
}

export function FixedMapComponent({
  onLocationSelect,
  initialLocation = { lat: 12.9716, lng: 77.5946 }, // Bangalore default
  height = "400px",
  showSearch = true,
  showNavigation = false,
  address,
}: FixedMapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [currentLocation, setCurrentLocation] = useState(initialLocation)
  const [isInitialized, setIsInitialized] = useState(false)

  // Cleanup function
  const cleanup = useCallback(() => {
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markerRef.current = null
        setIsInitialized(false)
      } catch (error) {
        console.warn("Cleanup error:", error)
      }
    }
  }, [])

  // Initialize map
  const initializeMap = useCallback(async () => {
    if (!mapRef.current || isInitialized) {
      return
    }

    console.log("Initializing map...")
    setIsLoading(true)

    try {
      // Clear any existing Leaflet state
      if ((mapRef.current as any)._leaflet_id) {
        delete (mapRef.current as any)._leaflet_id
      }

      // Dynamic import Leaflet
      const L = (await import("leaflet")).default
      console.log("Leaflet loaded")

      // Fix default icons
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      })

      // Create map instance
      const map = L.map(mapRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        touchZoom: true,
        preferCanvas: false,
      }).setView([currentLocation.lat, currentLocation.lng], 13)

      console.log("Map instance created")
      mapInstanceRef.current = map

      // Add tile layer with error handling
      const tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        minZoom: 1,
        tileSize: 256,
        zoomOffset: 0,
        crossOrigin: true,
      })

      tileLayer.on('tileload', () => {
        console.log("Tiles loading...")
      })

      tileLayer.on('tileerror', (e) => {
        console.error("Tile error:", e)
      })

      tileLayer.addTo(map)
      console.log("Tile layer added")

      // Add marker
      const marker = L.marker([currentLocation.lat, currentLocation.lng])
        .addTo(map)
        .bindPopup(address || "Selected Location")

      markerRef.current = marker

      // Map click handler
      map.on("click", async (e: any) => {
        const { lat, lng } = e.latlng
        marker.setLatLng([lat, lng])
        marker.bindPopup("Loading address...").openPopup()

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
          )
          const data = await response.json()
          const addressStr = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`

          marker.bindPopup(`
            <div class="text-sm">
              <strong>Selected Location</strong><br/>
              ${addressStr}
            </div>
          `).openPopup()

          setCurrentLocation({ lat, lng })
          onLocationSelect?.({ lat, lng, address: addressStr })
        } catch (error) {
          console.error("Reverse geocoding failed:", error)
          const addressStr = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
          marker.bindPopup(`
            <div class="text-sm">
              <strong>Selected Location</strong><br/>
              ${addressStr}
            </div>
          `).openPopup()
          onLocationSelect?.({ lat, lng, address: addressStr })
        }
      })

      setIsInitialized(true)
      setIsLoading(false)
      
      // Force resize after a short delay
      setTimeout(() => {
        console.log("Invalidating map size...")
        map.invalidateSize()
      }, 300)

      console.log("Map initialization complete")

    } catch (error) {
      console.error("Map initialization failed:", error)
      setIsLoading(false)
    }
  }, [currentLocation, address, onLocationSelect, isInitialized])

  // Initialize on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      initializeMap()
    }
    return cleanup
  }, [initializeMap, cleanup])

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim() || !mapInstanceRef.current || !markerRef.current) return

    setIsLoading(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&addressdetails=1`
      )
      const data = await response.json()

      if (data.length > 0) {
        const { lat, lon, display_name } = data[0]
        const newLocation = { lat: parseFloat(lat), lng: parseFloat(lon) }

        markerRef.current.setLatLng([newLocation.lat, newLocation.lng])
        mapInstanceRef.current.setView([newLocation.lat, newLocation.lng], 15)
        markerRef.current.bindPopup(display_name).openPopup()

        setCurrentLocation(newLocation)
        onLocationSelect?.({ lat: newLocation.lat, lng: newLocation.lng, address: display_name })
      }
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setIsLoading(false)
    }
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
            </div>
          </div>
        )}

        <div className="relative">
          <div className="map-container" style={{ height }}>
            <div 
              ref={mapRef} 
              className="leaflet-container"
              style={{ height: "100%", width: "100%" }}
            />
          </div>

          {isLoading && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading map...</p>
              </div>
            </div>
          )}

          {showNavigation && (
            <div className="absolute bottom-4 right-4">
              <Button 
                onClick={() => {
                  const url = `https://www.google.com/maps/dir/?api=1&destination=${currentLocation.lat},${currentLocation.lng}&travelmode=driving`
                  window.open(url, "_blank")
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
              >
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