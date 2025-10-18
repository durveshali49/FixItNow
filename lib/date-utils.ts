/**
 * Date utility functions to prevent hydration errors
 * by ensuring consistent date formatting between server and client
 */

/**
 * Format date consistently across server and client
 * Using a fixed locale and options to prevent hydration mismatches
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  // Use a consistent locale and format to prevent hydration errors
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...options
  })
}

/**
 * Format date for display in a more readable format
 */
export function formatDateReadable(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Format time consistently
 */
export function formatTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  return dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

/**
 * Format date for ISO string (form inputs)
 */
export function formatDateForInput(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toISOString().split('T')[0]
}

/**
 * Safe date formatter that handles null/undefined values
 */
export function safeDateFormat(date: Date | string | null | undefined, fallback: string = 'N/A'): string {
  if (!date) return fallback
  
  try {
    return formatDate(date)
  } catch (error) {
    console.warn('Date formatting error:', error)
    return fallback
  }
}