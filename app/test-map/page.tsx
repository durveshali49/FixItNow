"use client"

import { FixedMapComponent } from "@/components/fixed-map-component"

export default function TestMapPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Fixed Map Test Page</h1>
      <div style={{ width: '100%', height: '500px', border: '2px solid red' }}>
        <FixedMapComponent 
          initialLocation={{ lat: 12.9716, lng: 77.5946 }}
          height="100%"
          showSearch={true}
          showNavigation={true}
        />
      </div>
      <p className="mt-4 text-sm text-gray-600">
        Debug: Map container should be visible with red border above. Check browser console for logs.
      </p>
    </div>
  )
}