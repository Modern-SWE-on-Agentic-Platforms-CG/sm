/**
 * API Client Type Definitions
 */

export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  status: number
  timestamp: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
  timestamp: string
}

export interface ApiErrorResponse extends ApiError {
  status: number
}

export interface RequestConfig {
  headers?: Record<string, string>
  params?: Record<string, unknown>
  timeout?: number
  withCredentials?: boolean
}

export interface AuthTokens {
  accessToken: string
  refreshToken?: string
  expiresIn: number
}

export interface UserProfile {
  id: string
  email: string
  name: string
  roles: string[]
  avatar?: string
  phoneNumber?: string
}

export interface JwtPayload {
  sub: string
  email: string
  name: string
  roles: string[]
  iat: number
  exp: number
  iss: string
}

export enum ApiErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
}
