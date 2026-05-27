import axios from 'axios'
import type {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios'
import { ApiErrorCode } from './types'
import type { ApiErrorResponse } from './types'
import { tokenManager } from '../auth/tokenManager'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 30000

/**
 * Create and configure Axios client with interceptors
 */
export const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  /**
   * Request interceptor: Inject auth headers
   */
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = tokenManager.getAccessToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error: AxiosError) => {
      return Promise.reject(error)
    }
  )

  /**
   * Response interceptor: Handle errors and token refresh
   */
  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError<ApiErrorResponse>) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean
      }

      // Handle 401 (Unauthorized) - attempt token refresh
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true

        try {
          const refreshToken = tokenManager.getRefreshToken()
          if (!refreshToken) {
            // No refresh token available, redirect to login
            window.location.href = '/home'
            return Promise.reject(error)
          }

          // Attempt to refresh token
          const response = await axios.post<{ accessToken: string }>(
            `${API_BASE_URL}/auth/refresh-token`,
            { refreshToken }
          )

          const newAccessToken = response.data.accessToken
          tokenManager.setAccessToken(newAccessToken)

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          return client(originalRequest)
        } catch (refreshError) {
          // Token refresh failed, redirect to login
          tokenManager.clear()
          window.location.href = '/home'
          return Promise.reject(refreshError)
        }
      }

      // Handle 403 (Forbidden)
      if (error.response?.status === 403) {
        const apiError: ApiErrorResponse = {
          status: 403,
          code: ApiErrorCode.FORBIDDEN,
          message: 'Access denied',
          timestamp: new Date().toISOString(),
        }
        return Promise.reject(apiError)
      }

      // Handle 404 (Not Found)
      if (error.response?.status === 404) {
        const apiError: ApiErrorResponse = {
          status: 404,
          code: ApiErrorCode.NOT_FOUND,
          message: 'Resource not found',
          timestamp: new Date().toISOString(),
        }
        return Promise.reject(apiError)
      }

      // Handle validation errors
      if (error.response?.status === 400) {
        const apiError: ApiErrorResponse = {
          status: 400,
          code: ApiErrorCode.VALIDATION_ERROR,
          message: error.response.data?.message || 'Validation error',
          details: error.response.data?.details,
          timestamp: new Date().toISOString(),
        }
        return Promise.reject(apiError)
      }

      // Handle server errors
      if (error.response?.status && error.response.status >= 500) {
        const apiError: ApiErrorResponse = {
          status: error.response.status,
          code: ApiErrorCode.INTERNAL_ERROR,
          message: 'Internal server error',
          timestamp: new Date().toISOString(),
        }
        return Promise.reject(apiError)
      }

      // Handle network/timeout errors
      if (!error.response) {
        const apiError: ApiErrorResponse = {
          status: 0,
          code: error.code === 'ECONNABORTED' ? ApiErrorCode.TIMEOUT_ERROR : ApiErrorCode.NETWORK_ERROR,
          message: error.message || 'Network error',
          timestamp: new Date().toISOString(),
        }
        return Promise.reject(apiError)
      }

      return Promise.reject(error)
    }
  )

  return client
}

/**
 * Default API client instance
 */
export const apiClient = createApiClient()

export default apiClient
