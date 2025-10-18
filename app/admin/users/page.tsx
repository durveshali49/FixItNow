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
  Ban, 
  CheckCircle, 
  XCircle,
  Users,
  UserCheck,
  UserX,
  AlertTriangle
} from 'lucide-react'

interface User {
  id: string
  email: string
  full_name: string
  phone_number: string
  user_type: 'customer' | 'provider'
  is_verified: boolean
  is_active: boolean
  created_at: string
  updated_at: string
  provider_profile?: {
    business_name: string
    service_categories: string[]
    verification_status: 'pending' | 'verified' | 'rejected'
    rating: number
    total_bookings: number
  }
  customer_profile?: {
    total_bookings: number
    total_spent: number
  }
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      } else {
        toast.error('Failed to fetch users')
      }
    } catch (error) {
      toast.error('Error fetching users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleUserAction = async (userId: string, action: 'activate' | 'deactivate' | 'verify' | 'unverify', reason?: string) => {
    setActionLoading(true)
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/admin/users/${userId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action, reason })
      })

      if (response.ok) {
        toast.success(`User ${action}d successfully`)
        fetchUsers()
        setSelectedUser(null)
      } else {
        toast.error(`Failed to ${action} user`)
      }
    } catch (error) {
      toast.error('Error performing action')
    } finally {
      setActionLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone_number?.includes(searchTerm)
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && user.is_active) ||
                         (filterStatus === 'inactive' && !user.is_active) ||
                         (filterStatus === 'verified' && user.is_verified) ||
                         (filterStatus === 'unverified' && !user.is_verified)

    return matchesSearch && matchesStatus
  })

  const getUserStatusColor = (user: User) => {
    if (!user.is_active) return 'destructive'
    if (user.user_type === 'provider' && user.provider_profile?.verification_status === 'verified') return 'default'
    if (user.is_verified) return 'default'
    return 'secondary'
  }

  const getUserStatusText = (user: User) => {
    if (!user.is_active) return 'Suspended'
    return user.is_verified ? 'Verified' : 'Active'
  }

  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    customers: users.length, // All users are customers now
    verified: users.filter(u => u.is_verified).length,
    totalSpent: users.reduce((sum, u) => sum + (u.customer_profile?.total_spent || 0), 0)
  }

  if (loading) {
    return (
      <AdminProvider>
        <AdminRouteGuard requiredPermission="user_management">
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
      <AdminRouteGuard requiredPermission="user_management">
        <AdminLayout>
          <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customer Management</h1>
        <p className="text-muted-foreground">
          Manage and monitor all customer accounts
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.reduce((sum, u) => sum + (u.customer_profile?.total_bookings || 0), 0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalSpent.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verified}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Customers</CardTitle>
          <CardDescription>
            View and manage all customer accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Customers Table */}
          <div className="border rounded-lg">
            <div className="grid grid-cols-7 gap-4 p-4 font-medium text-sm text-muted-foreground border-b">
              <div className="col-span-2">Customer</div>
              <div>Status</div>
              <div>Joined</div>
              <div>Bookings</div>
              <div>Total Spent</div>
              <div>Actions</div>
            </div>
            
            {filteredUsers.map((user) => (
              <div key={user.id} className="grid grid-cols-7 gap-4 p-4 border-b last:border-b-0 hover:bg-muted/50">
                <div className="col-span-2 flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" />
                    <AvatarFallback>
                      {user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || user.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-none">{user.full_name || 'No name'}</p>
                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Badge variant={getUserStatusColor(user)}>
                    {getUserStatusText(user)}
                  </Badge>
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString()}
                </div>
                
                <div className="flex items-center text-sm">
                  {user.customer_profile?.total_bookings || 0} bookings
                </div>
                
                <div className="flex items-center text-sm font-medium">
                  ₹{(user.customer_profile?.total_spent || 0).toFixed(2)}
                </div>
                
                <div className="flex items-center">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedUser(user)}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>User Details</DialogTitle>
                        <DialogDescription>
                          View and manage user account
                        </DialogDescription>
                      </DialogHeader>
                      
                      {selectedUser && (
                        <div className="space-y-6">
                          {/* User Info */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Full Name</Label>
                              <p className="text-sm text-muted-foreground">{selectedUser.full_name || 'Not provided'}</p>
                            </div>
                            <div>
                              <Label>Email</Label>
                              <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                            </div>
                            <div>
                              <Label>Phone</Label>
                              <p className="text-sm text-muted-foreground">{selectedUser.phone_number || 'Not provided'}</p>
                            </div>
                            <div>
                              <Label>User Type</Label>
                              <p className="text-sm text-muted-foreground">Customer</p>
                            </div>
                            <div>
                              <Label>Joined</Label>
                              <p className="text-sm text-muted-foreground">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <Label>Status</Label>
                              <Badge variant={getUserStatusColor(selectedUser)}>
                                {getUserStatusText(selectedUser)}
                              </Badge>
                            </div>
                          </div>

                          {/* Customer Profile */}
                          <div>
                            <Label>Customer Details</Label>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                              <div>
                                <p className="text-sm font-medium">Total Bookings</p>
                                <p className="text-sm text-muted-foreground">{selectedUser.customer_profile?.total_bookings || 0}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Total Spent</p>
                                <p className="text-sm text-muted-foreground">₹{(selectedUser.customer_profile?.total_spent || 0).toFixed(2)}</p>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap gap-2">
                            {selectedUser.is_active ? (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleUserAction(selectedUser.id, 'deactivate')}
                                disabled={actionLoading}
                              >
                                <Ban className="h-4 w-4 mr-2" />
                                Suspend User
                              </Button>
                            ) : (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleUserAction(selectedUser.id, 'activate')}
                                disabled={actionLoading}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Activate User
                              </Button>
                            )}

                            {selectedUser.is_verified ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUserAction(selectedUser.id, 'unverify')}
                                disabled={actionLoading}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Remove Verification
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUserAction(selectedUser.id, 'verify')}
                                disabled={actionLoading}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Verify User
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
            
            {filteredUsers.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                No customers found matching your criteria
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