'use client'

import { useEffect, useState } from 'react'
import { AdminProvider } from '@/lib/admin/context'
import { AdminRouteGuard } from '@/components/admin/route-guard'
import { AdminLayout } from '@/components/admin/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  User, 
  UserCheck,
  Mail, 
  Phone, 
  MapPin,
  Star,
  Calendar
} from 'lucide-react'

interface ServiceProvider {
  id: string
  full_name: string
  email: string
  phone_number: string
  city: string
  state: string
  experience_years: number
  hourly_rate: number
  bio: string
  skills: string[]
  verification_status: 'pending' | 'approved' | 'rejected' | 'suspended'
  documents_submitted: string[]
  verification_notes: string
  application_date: string
  last_updated: string
  verified_by_name?: string
}

export default function ServiceProviderVerification() {
  const [providers, setProviders] = useState<ServiceProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null)
  const [verificationNotes, setVerificationNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchProviders()
  }, [])

  const fetchProviders = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/admin/providers/verification', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setProviders(data)
      }
    } catch (error) {
      console.error('Failed to fetch providers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerification = async (providerId: string, status: 'approved' | 'rejected') => {
    setProcessing(true)
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/admin/providers/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          provider_id: providerId,
          status,
          notes: verificationNotes,
          rejection_reason: status === 'rejected' ? rejectionReason : null
        })
      })

      if (response.ok) {
        await fetchProviders() // Refresh the list
        setSelectedProvider(null)
        setVerificationNotes('')
        setRejectionReason('')
      }
    } catch (error) {
      console.error('Verification failed:', error)
    } finally {
      setProcessing(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      case 'suspended':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Suspended</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <AdminProvider>
        <AdminRouteGuard requiredPermission="provider_verification">
          <AdminLayout>
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </AdminLayout>
        </AdminRouteGuard>
      </AdminProvider>
    )
  }

  return (
    <AdminProvider>
      <AdminRouteGuard requiredPermission="provider_verification">
        <AdminLayout>
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Service Provider Verification</h1>
                <p className="text-gray-600">Review and approve service provider applications</p>
              </div>
              <div className="flex space-x-2">
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {providers.filter(p => p.verification_status === 'pending').length} Pending
                </Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {providers.filter(p => p.verification_status === 'approved').length} Approved
                </Badge>
              </div>
            </div>

            {/* Providers List */}
            <div className="grid gap-4">
              {providers.map((provider) => (
                <Card key={provider.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{provider.full_name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center"><Mail className="h-4 w-4 mr-1" />{provider.email}</span>
                            <span className="flex items-center"><Phone className="h-4 w-4 mr-1" />{provider.phone_number}</span>
                            <span className="flex items-center"><MapPin className="h-4 w-4 mr-1" />{provider.city}, {provider.state}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {getStatusBadge(provider.verification_status)}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedProvider(provider)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Review Service Provider Application</DialogTitle>
                            </DialogHeader>
                            {selectedProvider && (
                              <div className="space-y-6">
                                {/* Provider Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-900">Personal Information</h4>
                                    <div className="space-y-2">
                                      <p><strong>Name:</strong> {selectedProvider.full_name}</p>
                                      <p><strong>Email:</strong> {selectedProvider.email}</p>
                                      <p><strong>Phone:</strong> {selectedProvider.phone_number}</p>
                                      <p><strong>Location:</strong> {selectedProvider.city}, {selectedProvider.state}</p>
                                    </div>
                                  </div>
                                  <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-900">Professional Information</h4>
                                    <div className="space-y-2">
                                      <p><strong>Experience:</strong> {selectedProvider.experience_years} years</p>
                                      <p><strong>Hourly Rate:</strong> ₹{selectedProvider.hourly_rate}</p>
                                      <p><strong>Status:</strong> {getStatusBadge(selectedProvider.verification_status)}</p>
                                      <p><strong>Applied:</strong> {new Date(selectedProvider.application_date).toLocaleDateString()}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Bio */}
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2">Bio</h4>
                                  <p className="text-gray-600 p-3 bg-gray-50 rounded-lg">
                                    {selectedProvider.bio || 'No bio provided'}
                                  </p>
                                </div>

                                {/* Skills */}
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2">Skills</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {selectedProvider.skills?.map((skill, index) => (
                                      <Badge key={index} variant="secondary">{skill}</Badge>
                                    ))}
                                  </div>
                                </div>

                                {/* Documents */}
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2">Submitted Documents</h4>
                                  <div className="space-y-2">
                                    {selectedProvider.documents_submitted?.length > 0 ? (
                                      selectedProvider.documents_submitted.map((doc, index) => (
                                        <div key={index} className="flex items-center space-x-2">
                                          <Button variant="outline" size="sm" asChild>
                                            <a href={doc} target="_blank" rel="noopener noreferrer">
                                              View Document {index + 1}
                                            </a>
                                          </Button>
                                        </div>
                                      ))
                                    ) : (
                                      <p className="text-gray-500">No documents submitted</p>
                                    )}
                                  </div>
                                </div>

                                {/* Verification Notes */}
                                {selectedProvider.verification_status === 'pending' && (
                                  <div className="space-y-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Verification Notes
                                      </label>
                                      <Textarea
                                        placeholder="Add notes about the verification..."
                                        value={verificationNotes}
                                        onChange={(e) => setVerificationNotes(e.target.value)}
                                        rows={3}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Rejection Reason (if rejecting)
                                      </label>
                                      <Textarea
                                        placeholder="Explain why the application is being rejected..."
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        rows={3}
                                      />
                                    </div>
                                  </div>
                                )}

                                {/* Previous Notes */}
                                {selectedProvider.verification_notes && (
                                  <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Previous Notes</h4>
                                    <p className="text-gray-600 p-3 bg-gray-50 rounded-lg">
                                      {selectedProvider.verification_notes}
                                    </p>
                                  </div>
                                )}

                                {/* Action Buttons */}
                                {selectedProvider.verification_status === 'pending' && (
                                  <div className="flex space-x-3 pt-4 border-t">
                                    <Button
                                      onClick={() => handleVerification(selectedProvider.id, 'approved')}
                                      disabled={processing}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Approve Provider
                                    </Button>
                                    <Button
                                      onClick={() => handleVerification(selectedProvider.id, 'rejected')}
                                      disabled={processing}
                                      variant="destructive"
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Reject Application
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                    
                    {/* Provider Summary */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Applied: {new Date(provider.application_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Experience: {provider.experience_years} years</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600">Rate: ₹{provider.hourly_rate}/hour</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {providers.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Service Providers</h3>
                  <p className="text-gray-600">No service provider applications found.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </AdminLayout>
      </AdminRouteGuard>
    </AdminProvider>
  )
}