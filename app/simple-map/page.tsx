"use client"

import { useEffect, useRef } from "react"

export default function SimpleMapTest() {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && mapRef.current) {
      console.log("Starting map initialization...")
      
      // Try to load Leaflet
      import("leaflet").then((L) => {
        console.log("Leaflet loaded successfully", L)
        
        // Add null check for mapRef.current inside the dynamic import callback
        if (!mapRef.current) {
          console.warn("Map container is null, skipping map initialization")
          return
        }
        
        try {
          console.log("Creating map on element:", mapRef.current)
          
          // Clear any existing map
          if ((mapRef.current as any)._leaflet_id) {
            delete (mapRef.current as any)._leaflet_id
          }

          // Fix default markers
          delete (L.Icon.Default.prototype as any)._getIconUrl
          L.Icon.Default.mergeOptions({
            iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
            iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
          })

          const map = L.map(mapRef.current).setView([12.9716, 77.5946], 13)
          console.log("Map created:", map)

          const tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
          })
          
          console.log("Adding tile layer...")
          tileLayer.addTo(map)
          
          tileLayer.on('tileerror', (e) => {
            console.error('Tile error:', e)
          })
          
          tileLayer.on('tileload', () => {
            console.log('Tile loaded successfully')
          })

          const marker = L.marker([12.9716, 77.5946]).addTo(map)
          marker.bindPopup("Test Location").openPopup()
          
          console.log("Map initialization complete!")
          
        } catch (error) {
          console.error("Error creating map:", error)
        }
      }).catch((error) => {
        console.error("Failed to load Leaflet:", error)
      })
    }
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Simple Map Test</h1>
      <div 
        ref={mapRef} 
        style={{ 
          width: '100%', 
          height: '400px', 
          border: '2px solid blue',
          backgroundColor: '#f0f0f0'
        }}
      />
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h3 className="font-bold">Debug Info:</h3>
        <p>1. Check browser console for logs</p>
        <p>2. Map container should have blue border</p>
        <p>3. Map should load with a marker at Bangalore</p>
      </div>
    </div>
  )
}