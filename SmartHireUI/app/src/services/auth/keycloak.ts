/**
 * Keycloak SSO Service
 */

import { JwtPayload, UserProfile } from '../api/types'
import { tokenManager } from './tokenManager'

export interface KeycloakConfig {
  url: string
  realm: string
  clientId: string
  redirectUri?: string
}

export interface KeycloakService {
  init(config: KeycloakConfig): Promise<void>
  login(): Promise<void>
  logout(): Promise<void>
  getToken(): string | null
  getUserProfile(): UserProfile | null
  refreshToken(): Promise<string | null>
  isTokenExpired(): boolean
}

class KeycloakServiceImpl implements KeycloakService {
  private config: KeycloakConfig | null = null
  private initialized = false

  async init(config: KeycloakConfig): Promise<void> {
    this.config = config

    // Check for existing token
    const token = tokenManager.getAccessToken()
    if (token && !tokenManager.isTokenExpired()) {
      this.initialized = true
      return
    }

    // Check URL for auth code (OAuth callback)
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const state = urlParams.get('state')

    if (code && state) {
      try {
        await this.exchangeCodeForToken(code, state)
        this.initialized = true
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname)
      } catch (error) {
        console.error('Failed to exchange code for token:', error)
      }
    } else {
      this.initialized = true
    }
  }

  private async exchangeCodeForToken(code: string, state: string): Promise<void> {
    if (!this.config) {
      throw new Error('Keycloak not initialized')
    }

    // In a real implementation, this would exchange the OAuth code for a token
    // For now, this is a placeholder - the actual implementation would call your backend
    const response = await fetch('/api/auth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, state }),
    })

    if (!response.ok) {
      throw new Error('Token exchange failed')
    }

    const data = await response.json()
    tokenManager.setAccessToken(data.accessToken, data.expiresIn)
    if (data.refreshToken) {
      tokenManager.setRefreshToken(data.refreshToken)
    }
  }

  async login(): Promise<void> {
    if (!this.config) {
      throw new Error('Keycloak not initialized')
    }

    const redirectUri = this.config.redirectUri || window.location.origin
    const clientId = this.config.clientId
    const realm = this.config.realm
    const url = this.config.url

    // Redirect to Keycloak login
    const loginUrl = `${url}/realms/${realm}/protocol/openid-connect/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=openid profile email roles&` +
      `state=${this.generateRandomState()}`

    window.location.href = loginUrl
  }

  async logout(): Promise<void> {
    if (!this.config) {
      throw new Error('Keycloak not initialized')
    }

    const redirectUri = this.config.redirectUri || window.location.origin
    const realm = this.config.realm
    const url = this.config.url

    tokenManager.clear()

    // Redirect to Keycloak logout
    const logoutUrl = `${url}/realms/${realm}/protocol/openid-connect/logout?` +
      `redirect_uri=${encodeURIComponent(redirectUri)}`

    window.location.href = logoutUrl
  }

  getToken(): string | null {
    return tokenManager.getAccessToken()
  }

  getUserProfile(): UserProfile | null {
    const token = tokenManager.getAccessToken()
    if (!token) {
      return null
    }

    try {
      const decoded = this.decodeJwt(token)
      return {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        roles: decoded.roles || [],
      }
    } catch (error) {
      console.error('Failed to decode JWT:', error)
      return null
    }
  }

  async refreshToken(): Promise<string | null> {
    const refreshToken = tokenManager.getRefreshToken()
    if (!refreshToken) {
      return null
    }

    try {
      const response = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })

      if (!response.ok) {
        throw new Error('Token refresh failed')
      }

      const data = await response.json()
      tokenManager.setAccessToken(data.accessToken, data.expiresIn)
      if (data.refreshToken) {
        tokenManager.setRefreshToken(data.refreshToken)
      }

      return data.accessToken
    } catch (error) {
      console.error('Failed to refresh token:', error)
      tokenManager.clear()
      return null
    }
  }

  isTokenExpired(): boolean {
    return tokenManager.isTokenExpired()
  }

  private decodeJwt(token: string): JwtPayload {
    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format')
    }

    const payload = JSON.parse(atob(parts[1]))
    return payload
  }

  private generateRandomState(): string {
    return Math.random().toString(36).substring(7)
  }
}

/**
 * Singleton instance of Keycloak service
 */
export const keycloakService: KeycloakService = new KeycloakServiceImpl()

export default keycloakService
