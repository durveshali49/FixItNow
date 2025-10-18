'use client'

import { useState, useEffect } from 'react'
import { AdminProvider } from '@/lib/admin/context'
import { AdminRouteGuard } from '@/components/admin/route-guard'
import { AdminLayout } from '@/components/admin/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  User,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react'

interface Booking {
  id: string
  title: string
  description: string
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'disputed'
  scheduled_date: string
  scheduled_time: string
  estimated_cost: number
  actual_cost: number
  customer_address: string
  payment_status: string
  created_at: string
  updated_at: string
  customer: {
    id: string
    full_name: string
    email: string
    phone_number: string
    city: string
    state: string
  }
  service_provider: {
    id: string
    hourly_rate: number
    bio: string
    user: {
      id: string
      full_name: string
      email: string
      phone_number: string
      city: string
      state: string
    }
  }
  category: {
    id: string
    name: string
  }
  dispute?: {
    id: string
    reason: string
    status: 'open' | 'investigating' | 'resolved'
    created_at: string
  }
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [disputeReason, setDisputeReason] = useState('')

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/admin/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setBookings(data.appointments)
      } else {
        toast.error('Failed to fetch bookings')
      }
    } catch (error) {
      toast.error('Error fetching bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const handleBookingAction = async (bookingId: string, action: string, reason?: string) => {
    setActionLoading(true)
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/admin/bookings/${bookingId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action, reason })
      })

      if (response.ok) {
        toast.success(`Booking ${action} successfully`)
        fetchBookings()
        setSelectedBooking(null)
        setDisputeReason('')
      } else {
        toast.error(`Failed to ${action} booking`)
      }
    } catch (error) {
      toast.error('Error performing action')
    } finally {
      setActionLoading(false)
    }
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.service_provider.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary'
      case 'confirmed': return 'default'
      case 'in_progress': return 'default'
      case 'completed': return 'default'
      case 'cancelled': return 'destructive'
      case 'disputed': return 'destructive'
      default: return 'secondary'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-3 w-3" />
      case 'confirmed': return <CheckCircle className="h-3 w-3" />
      case 'in_progress': return <RefreshCw className="h-3 w-3" />
      case 'completed': return <CheckCircle className="h-3 w-3" />
      case 'cancelled': return <XCircle className="h-3 w-3" />
      case 'disputed': return <AlertTriangle className="h-3 w-3" />
      default: return <Clock className="h-3 w-3" />
    }
  }

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    disputed: bookings.filter(b => b.status === 'disputed').length,
    totalRevenue: bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.actual_cost || b.estimated_cost || 0), 0)
  }

  if (loading) {
    return (
      <AdminProvider>
        <AdminRouteGuard requiredPermission="booking_management">
          <AdminLayout>
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
          </AdminLayout>
        </AdminRouteGuard>
      </AdminProvider>
    )
  }

  return (
    <AdminProvider>
      <AdminRouteGuard requiredPermission="booking_management">
        <AdminLayout>
          <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Booking Management</h1>
        <p className="text-muted-foreground">
          Monitor and manage all service bookings
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.confirmed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disputed</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.disputed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bookings</CardTitle>
          <CardDescription>
            View and manage all service bookings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="disputed">Disputed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bookings Table */}
          <div className="border rounded-lg">
            <div className="grid grid-cols-9 gap-4 p-4 font-medium text-sm text-muted-foreground border-b">
              <div>Booking ID</div>
              <div>Customer</div>
              <div>Provider</div>
              <div>Service</div>
              <div>Date & Time</div>
              <div>Amount</div>
              <div>Status</div>
              <div>Created</div>
              <div>Actions</div>
            </div>
            
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="grid grid-cols-9 gap-4 p-4 border-b last:border-b-0 hover:bg-muted/50">
                <div className="flex items-center text-sm font-mono">
                  #{booking.id.slice(-8)}
                </div>
                
                <div className="flex items-center">
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-none">{booking.customer.full_name}</p>
                    <p className="text-sm text-muted-foreground truncate">{booking.customer.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-none">{booking.service_provider.user?.full_name || 'Unknown Provider'}</p>
                    <p className="text-sm text-muted-foreground truncate">{booking.service_provider.user?.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center text-sm">
                  {booking.category?.name || booking.title}
                </div>
                
                <div className="flex items-center text-sm">
                  <div>
                    <p>{new Date(booking.scheduled_date).toLocaleDateString()}</p>
                    <p className="text-muted-foreground">{booking.scheduled_time}</p>
                  </div>
                </div>
                
                <div className="flex items-center text-sm font-medium">
                  ₹{(booking.actual_cost || booking.estimated_cost || 0).toFixed(2)}
                </div>
                
                <div className="flex items-center">
                  <Badge variant={getStatusColor(booking.status)} className="gap-1">
                    {getStatusIcon(booking.status)}
                    {booking.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  {new Date(booking.created_at).toLocaleDateString()}
                </div>
                
                <div className="flex items-center">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedBooking(booking)}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Booking Details</DialogTitle>
                        <DialogDescription>
                          View and manage booking #${booking.id.slice(-8)}
                        </DialogDescription>
                      </DialogHeader>
                      
                      {selectedBooking && (
                        <div className="space-y-6">
                          {/* Booking Info */}
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div>
                                <Label>Service Type</Label>
                                <p className="text-sm text-muted-foreground">{selectedBooking.category?.name || selectedBooking.title}</p>
                              </div>
                              <div>
                                <Label>Date & Time</Label>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(selectedBooking.scheduled_date).toLocaleDateString()} at {selectedBooking.scheduled_time}
                                </p>
                              </div>
                              <div>
                                <Label>Amount</Label>
                                <p className="text-sm text-muted-foreground">₹{(selectedBooking.actual_cost || selectedBooking.estimated_cost || 0).toFixed(2)}</p>
                              </div>
                              <div>
                                <Label>Status</Label>
                                <Badge variant={getStatusColor(selectedBooking.status)} className="gap-1">
                                  {getStatusIcon(selectedBooking.status)}
                                  {selectedBooking.status.replace('_', ' ')}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <div>
                                <Label>Address</Label>
                                <p className="text-sm text-muted-foreground">{selectedBooking.customer_address}</p>
                              </div>
                              <div>
                                <Label>Description</Label>
                                <p className="text-sm text-muted-foreground">{selectedBooking.description}</p>
                              </div>
                              <div>
                                <Label>Created</Label>
                                <p className="text-sm text-muted-foreground">{new Date(selectedBooking.created_at).toLocaleString()}</p>
                              </div>
                              <div>
                                <Label>Payment Status</Label>
                                <p className="text-sm text-muted-foreground">{selectedBooking.payment_status}</p>
                              </div>
                            </div>
                          </div>

                          {/* Customer & Provider Info */}
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <Label>Customer</Label>
                              <div className="border rounded-lg p-4 mt-2">
                                <p className="font-medium">{selectedBooking.customer.full_name}</p>
                                <p className="text-sm text-muted-foreground">{selectedBooking.customer.email}</p>
                                <p className="text-sm text-muted-foreground">{selectedBooking.customer.phone_number}</p>
                              </div>
                            </div>
                            
                            <div>
                              <Label>Provider</Label>
                              <div className="border rounded-lg p-4 mt-2">
                                <p className="font-medium">{selectedBooking.service_provider.user?.full_name || 'Unknown Provider'}</p>
                                <p className="text-sm text-muted-foreground">{selectedBooking.service_provider.user?.email}</p>
                                <p className="text-sm text-muted-foreground">{selectedBooking.service_provider.user?.phone_number}</p>
                                <p className="text-sm text-muted-foreground">Rate: ₹{selectedBooking.service_provider.hourly_rate}/hour</p>
                              </div>
                            </div>
                          </div>

                          {/* Dispute Info */}
                          {selectedBooking.dispute && (
                            <div>
                              <Label>Dispute Information</Label>
                              <div className="border rounded-lg p-4 mt-2 bg-red-50">
                                <div className="flex justify-between items-start mb-2">
                                  <Badge variant="destructive">{selectedBooking.dispute.status}</Badge>
                                  <span className="text-sm text-muted-foreground">
                                    {new Date(selectedBooking.dispute.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-sm">{selectedBooking.dispute.reason}</p>
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="space-y-4">
                            <Label>Admin Actions</Label>
                            <div className="flex flex-wrap gap-2">
                              {selectedBooking.status === 'pending' && (
                                <>
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => handleBookingAction(selectedBooking.id, 'confirm')}
                                    disabled={actionLoading}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Confirm Booking
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleBookingAction(selectedBooking.id, 'cancel')}
                                    disabled={actionLoading}
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Cancel Booking
                                  </Button>
                                </>
                              )}

                              {selectedBooking.status === 'confirmed' && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleBookingAction(selectedBooking.id, 'start')}
                                  disabled={actionLoading}
                                >
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Mark In Progress
                                </Button>
                              )}

                              {selectedBooking.status === 'in_progress' && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleBookingAction(selectedBooking.id, 'complete')}
                                  disabled={actionLoading}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Mark Completed
                                </Button>
                              )}

                              {selectedBooking.status === 'disputed' && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleBookingAction(selectedBooking.id, 'resolve_dispute')}
                                  disabled={actionLoading}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Resolve Dispute
                                </Button>
                              )}

                              {!['cancelled', 'completed', 'disputed'].includes(selectedBooking.status) && (
                                <div className="w-full space-y-2">
                                  <Textarea
                                    placeholder="Reason for dispute..."
                                    value={disputeReason}
                                    onChange={(e) => setDisputeReason(e.target.value)}
                                  />
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleBookingAction(selectedBooking.id, 'dispute', disputeReason)}
                                    disabled={actionLoading || !disputeReason.trim()}
                                  >
                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                    Flag as Disputed
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
            
            {filteredBookings.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                No bookings found matching your criteria
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
        </AdminLayout>
      </AdminRouteGuard>
    </AdminProvider>
  )
}