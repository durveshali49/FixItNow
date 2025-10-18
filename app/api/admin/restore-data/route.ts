import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { restoreKey, dataType } = await request.json()
    
    // Security check
    if (restoreKey !== process.env.ADMIN_SETUP_KEY) {
      return NextResponse.json({ error: "Invalid restore key" }, { status: 401 })
    }

    // Use service role for admin operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    let results = []

    // Restore Service Categories
    if (!dataType || dataType === 'service_categories') {
      const serviceCategories = [
        {
          name: "Plumbing",
          description: "Professional plumbing services for homes and businesses",
          icon_url: "🔧",
          is_active: true
        },
        {
          name: "Electrical",
          description: "Licensed electrical repair and installation services",
          icon_url: "⚡",
          is_active: true
        },
        {
          name: "Cleaning",
          description: "Professional cleaning services for residential and commercial spaces",
          icon_url: "🧹",
          is_active: true
        },
        {
          name: "Painting",
          description: "Interior and exterior painting services",
          icon_url: "🎨",
          is_active: true
        },
        {
          name: "Landscaping",
          description: "Garden maintenance and landscaping services",
          icon_url: "🌿",
          is_active: true
        },
        {
          name: "HVAC",
          description: "Heating, ventilation, and air conditioning services",
          icon_url: "❄️",
          is_active: true
        },
        {
          name: "Handyman",
          description: "General repair and maintenance services",
          icon_url: "🔨",
          is_active: true
        },
        {
          name: "Automotive",
          description: "Vehicle repair and maintenance services",
          icon_url: "🚗",
          is_active: true
        }
      ]

      const { data: categoriesData, error: categoriesError } = await supabase
        .from("service_categories")
        .upsert(serviceCategories, { onConflict: "name" })
        .select()

      if (categoriesError) {
        console.error("Categories error:", categoriesError)
      } else {
        results.push({ type: "service_categories", count: categoriesData?.length || 0 })
      }
    }

    // Restore Admin User
    if (!dataType || dataType === 'admin_users') {
      const { data: existingAdmin } = await supabase
        .from("admin_users")
        .select("email")
        .eq("email", "admin@fixitnow.com")
        .single()

      if (!existingAdmin) {
        const passwordHash = await bcrypt.hash("Admin123!", 10)
        
        const { data: adminData, error: adminError } = await supabase
          .from("admin_users")
          .insert({
            username: "admin",
            email: "admin@fixitnow.com",
            password_hash: passwordHash,
            role: "super_admin",
            is_active: true
          })
          .select()

        if (adminError) {
          console.error("Admin error:", adminError)
        } else {
          results.push({ 
            type: "admin_users", 
            count: 1,
            credentials: {
              username: "admin",
              email: "admin@fixitnow.com",
              password: "Admin123!"
            }
          })
        }
      } else {
        results.push({ 
          type: "admin_users", 
          count: 0, 
          message: "Admin already exists" 
        })
      }
    }

    // Restore Sample Service Providers (optional)
    if (dataType === 'sample_providers') {
      const sampleProviders = [
        {
          user_id: null, // Will need to be updated with actual user IDs
          bio: "Experienced plumber with 10+ years in residential and commercial plumbing",
          hourly_rate: 500,
          experience_years: 10,
          availability_type: "full_time",
          service_areas: ["Bangalore", "Electronic City", "BTM Layout"],
          skills: ["Pipe Repair", "Drain Cleaning", "Fixture Installation"],
          rating: 4.8,
          total_reviews: 45,
          total_jobs_completed: 120,
          verification_status: "verified",
          verification_documents: [],
          is_available: true
        }
      ]
      
      // Note: This would need actual user IDs to work properly
      results.push({ 
        type: "sample_providers", 
        count: 0, 
        message: "Sample providers need user accounts first" 
      })
    }

    return NextResponse.json({ 
      message: "Data restoration completed!",
      results: results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("Restoration error:", error)
    return NextResponse.json({ 
      error: "Restoration failed: " + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 })
  }
}