import { useCallback, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@store/store'
import { setAuthState, clearAuth, loginUser, logoutUser, fetchUserRoles } from '@store/slices/authSlice'
import { selectUser, selectIsAuthenticated, selectToken, selectRoles } from '@store/selectors/authSelectors'
import { keycloakService } from '@services/auth/keycloak'
import type { KeycloakConfig } from '@services/auth/keycloak'
import { tokenManager } from '@services/auth/tokenManager'
import type { UserRole } from '@services/auth/roleService'

/**
 * Decode JWT payload without verification (for client-side role restoration only).
 * NEVER use this for auth decisions — only for restoring UI state from a validated token.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split('.')[1]
    if (!base64) return null
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json)
  } catch {
    return null
  }
}

export interface UseAuthReturn {
  user: ReturnType<typeof selectUser>
  token: string | null
  roles: string[]
  isAuthenticated: boolean
  isLoading: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<string | null>
  checkTokenExpiry: () => boolean
  initKeycloak: (config: KeycloakConfig) => Promise<void>
}

/**
 * Custom hook for authentication
 */
export const useAuth = (): UseAuthReturn => {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectUser)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const token = useAppSelector(selectToken)
  const roles = useAppSelector(selectRoles)

  /**
   * Initialize auth on mount — restores roles from Keycloak profile or JWT payload (mock/dev login)
   */
  useEffect(() => {
    const initAuth = async () => {
      const existingToken = tokenManager.getAccessToken()
      if (existingToken && !tokenManager.isTokenExpired()) {
        const profile = keycloakService.getUserProfile()
        if (profile) {
          dispatch(
            setAuthState({
              user: profile,
              token: existingToken,
              roles: (profile.roles as unknown as UserRole[]) || [],
            })
          )
        } else {
          // Fallback: restore roles from JWT payload (mock/dev login)
          const payload = decodeJwtPayload(existingToken)
          if (payload) {
            const jwtRoles = (payload.roles as UserRole[]) || []
            const email = (payload.email as string) || (payload.sub as string) || ''
            const name = (payload.name as string) || email
            dispatch(
              setAuthState({
                user: { id: email, email, name, roles: jwtRoles },
                token: existingToken,
                roles: jwtRoles,
              })
            )
          }
        }
      }
    }

    initAuth().catch((error) => {
      console.error('Auth initialization failed:', error)
    })
  }, [dispatch])

  /**
   * Login user via Keycloak
   */
  const login = useCallback(async () => {
    try {
      await dispatch(loginUser()).unwrap()
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }, [dispatch])

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      dispatch(clearAuth())
      tokenManager.clear()
      await dispatch(logoutUser()).unwrap()
    } catch (_error) {
      // Ignore keycloak errors in mock/dev mode
    } finally {
      window.location.href = '/home'
    }
  }, [dispatch])

  /**
   * Refresh access token
   */
  const refreshToken = useCallback(async (): Promise<string | null> => {
    try {
      const newToken = await keycloakService.refreshToken()
      if (newToken) {
        dispatch(
          setAuthState({
            user,
            token: newToken,
            roles,
          })
        )
      }
      return newToken
    } catch (error) {
      console.error('Token refresh failed:', error)
      return null
    }
  }, [dispatch, user, roles])

  /**
   * Check if token is expired
   */
  const checkTokenExpiry = useCallback((): boolean => {
    return tokenManager.isTokenExpired()
  }, [])

  /**
   * Initialize Keycloak with config
   */
  const initKeycloak = useCallback(
    async (config: KeycloakConfig) => {
      try {
        await keycloakService.init(config)
        const profile = keycloakService.getUserProfile()
        if (profile) {
          dispatch(
            setAuthState({
              user: profile,
              token: keycloakService.getToken(),
              roles: (profile.roles as unknown as UserRole[]) || [],
            })
          )
          await dispatch(fetchUserRoles())
        }
      } catch (error) {
        console.error('Keycloak initialization failed:', error)
        throw error
      }
    },
    [dispatch]
  )

  return {
    user,
    token,
    roles,
    isAuthenticated,
    isLoading: false,
    login,
    logout,
    refreshToken,
    checkTokenExpiry,
    initKeycloak,
  }
}

export default useAuth
