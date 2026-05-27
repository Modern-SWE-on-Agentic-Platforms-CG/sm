/**
 * Utility formatters for dates, numbers, and strings
 */

export const formatters = {
  /**
   * Format date to YYYY-MM-DD
   */
  formatDate: (date: Date | string): string => {
    const d = new Date(date)
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${d.getFullYear()}-${month}-${day}`
  },

  /**
   * Format date to readable format (e.g., "May 22, 2026")
   */
  formatDateReadable: (date: Date | string): string => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  },

  /**
   * Format time to HH:MM
   */
  formatTime: (hours: number, minutes: number): string => {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  },

  /**
   * Format currency
   */
  formatCurrency: (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount)
  },

  /**
   * Format number with thousand separators
   */
  formatNumber: (num: number, decimals: number = 0): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num)
  },

  /**
   * Format experience duration
   */
  formatExperience: (years: number): string => {
    if (years === 0) return 'Fresher'
    if (years === 1) return '1 year'
    return `${years} years`
  },

  /**
   * Truncate string with ellipsis
   */
  truncate: (str: string, length: number = 50): string => {
    if (str.length <= length) return str
    return `${str.substring(0, length)}...`
  },

  /**
   * Capitalize first letter
   */
  capitalize: (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  },

  /**
   * Convert status to readable format
   */
  formatStatus: (status: string): string => {
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  },

  /**
   * Format time difference (e.g., "2 hours ago")
   */
  formatTimeDifference: (date: Date | string): string => {
    const d = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return formatters.formatDateReadable(d)
  },
}

export default formatters
