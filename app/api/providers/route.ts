import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  
  const city = searchParams.get("city")
  const state = searchParams.get("state")
  const category = searchParams.get("category")
  const latitude = searchParams.get("latitude")
  const longitude = searchParams.get("longitude")
  const radius = searchParams.get("radius") || "50" // Default 50km radius

  try {
    let query = supabase
      .from("service_providers")
      .select(`
        *,
        users!service_providers_id_fkey (full_name, city, state, latitude, longitude),
        service_provider_categories (
          service_categories (*)
        )
      `)
      .eq("is_verified", true)

    // Filter by category if provided
    if (category) {
      query = query.eq("service_provider_categories.service_categories.id", category)
    }

    // Filter by location
    if (city && state) {
      // First try exact city match
      query = query.eq("users.city", city).eq("users.state", state)
    } else if (state) {
      // If only state provided, filter by state
      query = query.eq("users.state", state)
    }

    const { data: providers, error } = await query.order("rating", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If coordinates provided, calculate distances and sort by distance
    if (latitude && longitude && providers) {
      const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371 // Earth's radius in kilometers
        const dLat = ((lat2 - lat1) * Math.PI) / 180
        const dLon = ((lon2 - lon1) * Math.PI) / 180
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        return R * c
      }

      const providersWithDistance = providers
        .map((provider) => {
          let distance = null
          if (provider.users?.latitude && provider.users?.longitude) {
            distance = calculateDistance(
              parseFloat(latitude),
              parseFloat(longitude),
              provider.users.latitude,
              provider.users.longitude
            )
          }
          return { ...provider, distance }
        })
        .filter((provider) => {
          // Filter by radius if distance is available
          return !provider.distance || provider.distance <= parseFloat(radius)
        })
        .sort((a, b) => {
          // Sort by distance if available, otherwise by rating
          if (a.distance !== null && b.distance !== null) {
            return a.distance - b.distance
          }
          return (b.rating || 0) - (a.rating || 0)
        })

      return NextResponse.json({ providers: providersWithDistance })
    }

    return NextResponse.json({ providers })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
