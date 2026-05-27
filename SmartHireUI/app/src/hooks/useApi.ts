import { useState, useCallback, useEffect } from 'react'
import { apiClient } from '@services/api/client'
import type { ApiErrorResponse, RequestConfig } from '@services/api/types'

export interface UseApiReturn<T> {
  data: T | null
  loading: boolean
  error: ApiErrorResponse | null
  refetch: () => Promise<void>
}

/**
 * Custom hook for generic API calls
 */
export const useApi = <T,>(
  url: string,
  config?: RequestConfig
): UseApiReturn<T> => {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiErrorResponse | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await apiClient.get<T>(url, config)
        setData(response.data)
      } catch (err) {
        setError(err as ApiErrorResponse)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [url, config])

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.get<T>(url, config)
      setData(response.data)
    } catch (err) {
      setError(err as ApiErrorResponse)
    } finally {
      setLoading(false)
    }
  }, [url, config])

  return { data, loading, error, refetch }
}

export default useApi
