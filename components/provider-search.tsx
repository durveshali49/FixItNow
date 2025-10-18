"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Search, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Provider {
  id: string
  users: {
    full_name: string
    city: string
    state: string
  }
  rating: number
  hourly_rate: number
  experience_years: number
  distance?: number
}

interface ProviderSearchProps {
  onProviderSelect?: (provider: Provider) => void
  selectedCategory?: string
}

export function ProviderSearch({ onProviderSelect, selectedCategory }: ProviderSearchProps) {
  const [searchCity, setSearchCity] = useState("")
  const [searchState, setSearchState] = useState("")
  const [providers, setProviders] = useState<Provider[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const searchProviders = async () => {
    if (!searchCity || !searchState) return

    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        city: searchCity,
        state: searchState,
      })
      
      if (selectedCategory) {
        params.append("category", selectedCategory)
      }

      const response = await fetch(`/api/providers?${params}`)
      const data = await response.json()
      
      if (data.providers) {
        setProviders(data.providers)
        setHasSearched(true)
      }
    } catch (error) {
      console.error("Error searching providers:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const searchByCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.")
      return
    }

    setIsLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const params = new URLSearchParams({
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
            radius: "25", // 25km radius
          })

          if (selectedCategory) {
            params.append("category", selectedCategory)
          }

          const response = await fetch(`/api/providers?${params}`)
          const data = await response.json()
          
          if (data.providers) {
            setProviders(data.providers)
            setHasSearched(true)
          }
        } catch (error) {
          console.error("Error searching providers by location:", error)
        } finally {
          setIsLoading(false)
        }
      },
      (error) => {
        console.error("Error getting location:", error)
        setIsLoading(false)
        alert("Could not get your current location. Please search by city instead.")
      }
    )
  }

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Find Service Providers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                placeholder="Enter city"
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={searchState}
                onChange={(e) => setSearchState(e.target.value)}
                placeholder="Enter state"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={searchProviders} 
              disabled={!searchCity || !searchState || isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Search by City
            </Button>
            
            <Button 
              onClick={searchByCurrentLocation} 
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MapPin className="h-4 w-4" />
              )}
              Use My Location
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {hasSearched && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {providers.length} Provider{providers.length !== 1 ? "s" : ""} Found
              {searchCity && searchState && (
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}in {searchCity}, {searchState}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {providers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No providers found in this area.</p>
                <p className="text-sm">Try searching in a nearby city or expanding your search radius.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {providers.map((provider) => (
                  <Card
                    key={provider.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onProviderSelect?.(provider)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {provider.users?.full_name?.charAt(0) || "P"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{provider.users?.full_name}</h4>
                            <div className="flex items-center gap-1">
                              <span className="text-sm">⭐ {provider.rating?.toFixed(1)}</span>
                            </div>
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3" />
                              {provider.users?.city}, {provider.users?.state}
                              {provider.distance && (
                                <Badge variant="secondary" className="text-xs">
                                  {provider.distance.toFixed(1)} km away
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <span>₹{provider.hourly_rate}/hour</span>
                              <span>{provider.experience_years} years exp.</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
