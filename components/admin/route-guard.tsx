'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdmin } from '@/lib/admin/context'

interface AdminRouteGuardProps {
  children: React.ReactNode
  requiredPermission?: string
}

export function AdminRouteGuard({ children, requiredPermission }: AdminRouteGuardProps) {
  const { admin, isLoading, hasPermission } = useAdmin()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!admin) {
        router.push('/admin/login')
        return
      }

      if (requiredPermission && !hasPermission(requiredPermission)) {
        router.push('/admin/dashboard') // Redirect to dashboard if no permission
        return
      }
    }
  }, [admin, isLoading, hasPermission, requiredPermission, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (!admin) {
    return null // Will redirect to login
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}