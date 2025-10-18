import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/admin/auth'

export async function POST(request: NextRequest) {
  try {
    // Skip auth checks for now - just use service role
    console.log('Upload API called')

    // Get the uploaded files from form data
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    console.log(`Received ${files.length} files for upload`)

    // Validate file types
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type))
    
    if (invalidFiles.length > 0) {
      return NextResponse.json(
        { error: 'Invalid file types. Only PDF, JPG, and PNG files are allowed.' },
        { status: 400 }
      )
    }

    // Validate file sizes (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB
    const oversizedFiles = files.filter(file => file.size > maxSize)
    
    if (oversizedFiles.length > 0) {
      return NextResponse.json(
        { error: 'File size too large. Maximum 10MB per file.' },
        { status: 400 }
      )
    }

    // Upload files using admin client (bypasses RLS)
    const uploadedUrls: string[] = []

    for (const file of files) {
      const fileName = `documents/${Date.now()}_${file.name}`
      const fileBuffer = await file.arrayBuffer()
      
      console.log(`Uploading file: ${fileName}`)
      
      const { data, error } = await supabaseAdmin.storage
        .from('service-provider-documents')
        .upload(fileName, fileBuffer, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Upload error:', error)
        throw new Error(`Upload failed: ${error.message}`)
      }

      console.log('Upload successful:', data.path)

      const { data: urlData } = supabaseAdmin.storage
        .from('service-provider-documents')
        .getPublicUrl(data.path)

      uploadedUrls.push(urlData.publicUrl)
    }

    console.log('All uploads successful:', uploadedUrls)

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      message: `Successfully uploaded ${files.length} file(s)`
    })

  } catch (error: any) {
    console.error('File upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload files' },
      { status: 500 }
    )
  }
}