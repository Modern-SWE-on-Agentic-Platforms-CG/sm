/**
 * Authentication API client — mapped to actual backend paths
 */
import { apiClient } from './client'
import type { UserProfile, AuthTokens } from './types'

export interface LoginRequest {
  code: string
  redirectUri: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface FetchRolesResponse {
  roles: string[]
  empId: string
}

/**
 * Exchange OAuth2 code for tokens — Keycloak flow
 * Backend: POST /getCode (closest available)
 */
export const loginWithCode = async (request: LoginRequest): Promise<AuthTokens> => {
  const response = await apiClient.post<AuthTokens>('/getCode', request)
  return response.data
}

/**
 * Fetch current user's profile from backend
 * Backend: GET /keycloak/getUserDetails
 */
export const getProfile = async (): Promise<UserProfile> => {
  const response = await apiClient.get<{ data: UserProfile[] }>('/keycloak/getUserDetails')
  const raw = response.data as unknown as { data?: UserProfile[] }
  return raw.data?.[0] ?? (response.data as unknown as UserProfile)
}

/**
 * Fetch employee roles from backend
 * Backend: GET /keycloak/getUserRoles
 */
export const fetchEmpRoles = async (empId: string): Promise<FetchRolesResponse> => {
  const response = await apiClient.get<FetchRolesResponse>('/keycloak/getUserRoles', {
    params: { emp_id: empId },
  })
  return response.data
}

/**
 * Logout - invalidate session on backend (no dedicated endpoint; session is stateless JWT)
 */
export const logoutFromServer = async (): Promise<void> => {
  // JWT is stateless — logout is client-side (clear token)
}

/**
 * Refresh access token using refresh token
 * Backend: no token refresh endpoint (JWT-only)
 */
export const refreshAccessToken = async (
  _request: RefreshTokenRequest
): Promise<AuthTokens> => {
  throw new Error('Token refresh not supported — re-authenticate')
}

