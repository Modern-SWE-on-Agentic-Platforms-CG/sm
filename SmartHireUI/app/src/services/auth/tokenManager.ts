/**
 * Token Manager for handling JWT token lifecycle
 */

const TOKEN_STORAGE_KEY = 'auth_token'
const REFRESH_TOKEN_STORAGE_KEY = 'refresh_token'
const TOKEN_EXPIRY_KEY = 'token_expiry'

export interface TokenManager {
  setAccessToken(token: string, expiresIn?: number): void
  getAccessToken(): string | null
  setRefreshToken(token: string): void
  getRefreshToken(): string | null
  setTokenExpiry(expiresIn: number): void
  getTokenExpiry(): number | null
  isTokenExpired(): boolean
  clear(): void
}

/**
 * In-memory + localStorage token manager
 * Uses memory for performance, localStorage for persistence
 */
class TokenManagerImpl implements TokenManager {
  private memoryToken: string | null = null
  private memoryRefreshToken: string | null = null

  constructor() {
    // Load tokens from localStorage on initialization
    this.loadFromStorage()
  }

  private loadFromStorage(): void {
    try {
      this.memoryToken = localStorage.getItem(TOKEN_STORAGE_KEY)
      this.memoryRefreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)
    } catch (error) {
      console.error('Failed to load tokens from localStorage:', error)
    }
  }

  setAccessToken(token: string, expiresIn?: number): void {
    this.memoryToken = token
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, token)
      if (expiresIn) {
        this.setTokenExpiry(expiresIn)
      }
    } catch (error) {
      console.error('Failed to save access token:', error)
    }
  }

  getAccessToken(): string | null {
    return this.memoryToken
  }

  setRefreshToken(token: string): void {
    this.memoryRefreshToken = token
    try {
      localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, token)
    } catch (error) {
      console.error('Failed to save refresh token:', error)
    }
  }

  getRefreshToken(): string | null {
    return this.memoryRefreshToken
  }

  setTokenExpiry(expiresIn: number): void {
    try {
      const expiryTime = Date.now() + expiresIn * 1000
      localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString())
    } catch (error) {
      console.error('Failed to save token expiry:', error)
    }
  }

  getTokenExpiry(): number | null {
    try {
      const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY)
      return expiry ? parseInt(expiry, 10) : null
    } catch (error) {
      console.error('Failed to get token expiry:', error)
      return null
    }
  }

  isTokenExpired(): boolean {
    const expiry = this.getTokenExpiry()
    if (!expiry) {
      return !this.memoryToken
    }
    // Check if token expires within 5 minutes (buffer)
    return Date.now() >= expiry - 5 * 60 * 1000
  }

  clear(): void {
    this.memoryToken = null
    this.memoryRefreshToken = null
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
      localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
      localStorage.removeItem(TOKEN_EXPIRY_KEY)
    } catch (error) {
      console.error('Failed to clear tokens:', error)
    }
  }
}

/**
 * Singleton instance of token manager
 */
export const tokenManager: TokenManager = new TokenManagerImpl()

export default tokenManager
