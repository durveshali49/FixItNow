"use client"

import { useEffect, useState } from 'react'
import { formatDate, safeDateFormat } from '@/lib/date-utils'

interface ClientOnlyDateProps {
  date: Date | string | null | undefined
  format?: 'default' | 'readable' | 'time'
  fallback?: string
  className?: string
}

/**
 * A component that renders dates only on the client side to prevent hydration errors
 * Use this when server and client might have different timezone/locale settings
 */
export function ClientOnlyDate({ 
  date, 
  format = 'default', 
  fallback = 'Loading...', 
  className 
}: ClientOnlyDateProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Show fallback during SSR
  if (!isClient) {
    return <span className={className}>{fallback}</span>
  }

  // Render actual date on client
  if (!date) {
    return <span className={className}>N/A</span>
  }

  let formattedDate: string
  const dateObj = typeof date === 'string' ? new Date(date) : date

  switch (format) {
    case 'readable':
      formattedDate = dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      break
    case 'time':
      formattedDate = dateObj.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
      break
    default:
      formattedDate = safeDateFormat(date, fallback)
  }

  return <span className={className}>{formattedDate}</span>
}

/**
 * Hook to safely get client-side date formatting
 */
export function useClientDate(date: Date | string | null | undefined) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient || !date) {
    return null
  }

  return typeof date === 'string' ? new Date(date) : date
}