import { ApiErrorResponse, ApiErrorCode } from '@services/api/types'

/**
 * Standardize API errors for UI display
 */
export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    const apiError = error as unknown as ApiErrorResponse

    if (apiError.code) {
      switch (apiError.code) {
        case ApiErrorCode.UNAUTHORIZED:
          return 'Your session has expired. Please log in again.'
        case ApiErrorCode.FORBIDDEN:
          return 'You do not have permission to perform this action.'
        case ApiErrorCode.NOT_FOUND:
          return 'The requested resource was not found.'
        case ApiErrorCode.VALIDATION_ERROR:
          return apiError.message || 'Please check your input and try again.'
        case ApiErrorCode.TIMEOUT_ERROR:
          return 'The request took too long. Please try again.'
        case ApiErrorCode.NETWORK_ERROR:
          return 'Network error. Please check your connection.'
        default:
          return apiError.message || 'An error occurred. Please try again later.'
      }
    }

    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  return 'An unexpected error occurred. Please try again.'
}

/**
 * Format validation errors from API response
 */
export const formatValidationErrors = (
  details?: Record<string, unknown>
): Record<string, string> => {
  if (!details) return {}

  const errors: Record<string, string> = {}

  Object.entries(details).forEach(([key, value]) => {
    if (typeof value === 'string') {
      errors[key] = value
    } else if (Array.isArray(value) && value.length > 0) {
      errors[key] = Array.isArray(value) ? value[0] : String(value)
    }
  })

  return errors
}

export default { handleApiError, formatValidationErrors }
