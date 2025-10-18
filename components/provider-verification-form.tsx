"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  X,
  Camera,
  FileImage
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface ProviderVerificationFormProps {
  user: any
  userProfile: any
  serviceProvider: any
  existingVerification: any
}

export function ProviderVerificationForm({ 
  user, 
  userProfile, 
  serviceProvider, 
  existingVerification 
}: ProviderVerificationFormProps) {
  const [documents, setDocuments] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [bio, setBio] = useState(serviceProvider?.bio || "")
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // Validate file types
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    const validFiles = files.filter(file => allowedTypes.includes(file.type))
    
    if (validFiles.length !== files.length) {
      setMessage({
        type: 'error',
        text: 'Only PDF, JPG, and PNG files are allowed'
      })
      return
    }

    // Limit to 5 files max
    if (documents.length + validFiles.length > 5) {
      setMessage({
        type: 'error',
        text: 'Maximum 5 documents allowed'
      })
      return
    }

    setDocuments(prev => [...prev, ...validFiles])
    setMessage(null)
  }

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index))
  }

  const uploadDocuments = async () => {
    if (documents.length === 0) return []

    setUploading(true)
    setUploadProgress(0)

    try {
      console.log(`Uploading ${documents.length} documents via server...`)
      
      // Create FormData for server upload
      const formData = new FormData()
      documents.forEach(document => {
        formData.append('files', document)
      })

      // Upload via API endpoint (server-side)
      const response = await fetch('/api/provider/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      console.log('Upload successful:', result)
      setUploadProgress(100)
      
      return result.urls || []
    } catch (error: any) {
      console.error('Upload error:', error)
      throw new Error(`Failed to upload documents: ${error?.message || 'Unknown error'}`)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)

    try {
      // Upload documents first
      const documentUrls = await uploadDocuments()

      // Submit verification request via API
      const response = await fetch('/api/provider/verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documents: documentUrls,
          bio: bio
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit verification request')
      }

      setMessage({
        type: 'success',
        text: 'Verification request submitted successfully! You will be notified once reviewed.'
      })

      // Clear form
      setDocuments([])
      
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push('/provider/dashboard')
      }, 3000)

    } catch (error: any) {
      console.error('Submission error:', error)
      setMessage({
        type: 'error',
        text: error.message || 'Failed to submit verification request'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending Review</Badge>
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><X className="h-3 w-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  if (existingVerification) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Verification Status</CardTitle>
          <CardDescription>
            Your verification request has been submitted
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="font-medium">Current Status:</span>
            {getStatusBadge(existingVerification.status)}
          </div>

          {existingVerification.verification_notes && (
            <div>
              <Label className="font-medium">Your Submission Notes:</Label>
              <p className="text-gray-600 mt-1">{existingVerification.verification_notes}</p>
            </div>
          )}

          {existingVerification.rejection_reason && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Rejection Reason:</strong> {existingVerification.rejection_reason}
              </AlertDescription>
            </Alert>
          )}

          {existingVerification.documents_submitted && existingVerification.documents_submitted.length > 0 && (
            <div>
              <Label className="font-medium">Submitted Documents:</Label>
              <div className="mt-2 space-y-2">
                {existingVerification.documents_submitted.map((doc: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <a href={doc} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Document {index + 1}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {existingVerification.status === 'rejected' && (
            <Alert>
              <AlertDescription>
                You can resubmit your verification request with updated documents.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex space-x-3">
            <Button onClick={() => router.push('/provider/dashboard')} variant="outline">
              Back to Dashboard
            </Button>
            {existingVerification.status === 'rejected' && (
              <Button 
                onClick={() => {
                  // Allow resubmission by clearing existing verification
                  window.location.reload()
                }}
              >
                Resubmit Application
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Verification Documents</CardTitle>
        <CardDescription>
          Upload your professional documents to get verified as a service provider
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {message && (
            <Alert className={message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
              <AlertDescription className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          {/* Profile Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Full Name</Label>
              <Input value={userProfile.full_name} disabled />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={userProfile.email} disabled />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={userProfile.phone_number || 'Not provided'} disabled />
            </div>
            <div>
              <Label>Experience Years</Label>
              <Input value={serviceProvider?.experience_years || 'Not set'} disabled />
            </div>
          </div>

          {/* Bio/About */}
          <div>
            <Label htmlFor="bio">Professional Bio</Label>
            <Textarea
              id="bio"
              placeholder="Describe your professional background, experience, and services you provide..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              required
            />
          </div>

          {/* Document Upload */}
          <div>
            <Label>Upload Verification Documents</Label>
            <p className="text-sm text-gray-600 mb-3">
              Upload professional documents (License, Certificates, ID proof, etc.). 
              Maximum 5 files. Supported formats: PDF, JPG, PNG
            </p>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="hidden"
                id="document-upload"
              />
              <label htmlFor="document-upload" className="cursor-pointer">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Click to upload documents or drag and drop
                </p>
              </label>
            </div>

            {/* Uploaded Files List */}
            {documents.length > 0 && (
              <div className="mt-4 space-y-2">
                <Label>Selected Documents:</Label>
                {documents.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      {file.type.startsWith('image/') ? (
                        <FileImage className="h-4 w-4" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDocument(index)}
                      disabled={uploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                {/* Upload Progress */}
                {uploading && (
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Uploading documents...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Required Documents Info */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Required Documents:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Government issued ID (Aadhar Card, Passport, etc.)</li>
                <li>Professional License or Certificate (if applicable)</li>
                <li>Address Proof</li>
                <li>Bank Account Details/Cancelled Cheque</li>
                <li>Any relevant skill certificates</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Submit Button */}
          <div className="flex space-x-3">
            <Button 
              type="submit" 
              disabled={submitting || uploading || documents.length === 0 || !bio.trim()}
              className="flex items-center space-x-2"
            >
              {submitting ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Submit for Verification</span>
                </>
              )}
            </Button>
            
            <Button 
              type="button" 
              variant="outline"
              onClick={() => router.push('/provider/dashboard')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}