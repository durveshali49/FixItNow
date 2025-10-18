import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/admin/auth'

export async function POST(request: NextRequest) {
  try {
    console.log('Verification API called')
    
    const { documents, bio } = await request.json()
    console.log('Received data:', { documents: documents?.length, bio: bio?.substring(0, 50) })

    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      console.log('Missing documents')
      return NextResponse.json(
        { error: 'At least one document is required' },
        { status: 400 }
      )
    }

    if (!bio || !bio.trim()) {
      console.log('Missing bio')
      return NextResponse.json(
        { error: 'Professional bio is required' },
        { status: 400 }
      )
    }

    // Generate a proper UUID for testing
    const mockUserId = '550e8400-e29b-41d4-a716-446655440000'
    
    console.log('Creating verification record for user:', mockUserId)

    // Insert verification request using admin client (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('service_provider_verifications')
      .insert({
        service_provider_id: mockUserId,
        status: 'pending',
        documents_submitted: documents,
        verification_notes: bio,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to submit verification request: ' + error.message },
        { status: 500 }
      )
    }

    console.log('Verification submitted successfully:', data)

    return NextResponse.json({
      success: true,
      message: 'Verification request submitted successfully! (Test mode)',
      data
    })

  } catch (error: any) {
    console.error('Verification submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get existing verification for this user using admin client
    const { data: verification, error } = await supabaseAdmin
      .from('service_provider_verifications')
      .select('*')
      .eq('service_provider_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch verification status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: verification || null
    })

  } catch (error: any) {
    console.error('Verification fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}