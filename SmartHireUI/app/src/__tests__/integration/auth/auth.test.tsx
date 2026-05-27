/**
 * Integration tests for authentication flow
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../utils/testUtils'
import LoginScreen from '@screens/auth/LoginScreen'
import { useAuth } from '@hooks/useAuth'

const mockNavigate = vi.fn()

// Mock the navigation
vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock useAuth
vi.mock('@hooks/useAuth')
const mockUseAuth = vi.mocked(useAuth)

describe('Authentication Flow', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: null,
      token: null,
      roles: [],
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshToken: vi.fn(),
      checkTokenExpiry: vi.fn(),
      initKeycloak: vi.fn(),
    })
  })

  describe('LoginScreen', () => {
    it('renders the login page with SSO button', () => {
      renderWithProviders(<LoginScreen />)
      expect(screen.getByText('SmartHire')).toBeInTheDocument()
      expect(screen.getByText('Sign in with SSO')).toBeInTheDocument()
    })

    it('shows demo login options by default', () => {
      renderWithProviders(<LoginScreen />)
      expect(screen.getByText('Demo Login — Choose a role')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Recruiter' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Admin' })).toBeInTheDocument()
    })

    it('calls login when SSO button is clicked', async () => {
      const mockLogin = vi.fn().mockResolvedValue(undefined)
      mockUseAuth.mockReturnValue({
        user: null,
        token: null,
        roles: [],
        isAuthenticated: false,
        isLoading: false,
        login: mockLogin,
        logout: vi.fn(),
        refreshToken: vi.fn(),
        checkTokenExpiry: vi.fn(),
        initKeycloak: vi.fn(),
      })

      const user = userEvent.setup()
      renderWithProviders(<LoginScreen />)

      await user.click(screen.getByText('Sign in with SSO'))
      expect(mockLogin).toHaveBeenCalledOnce()
    })

    it('shows loading state when isLoading is true', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        token: null,
        roles: [],
        isAuthenticated: false,
        isLoading: true,
        login: vi.fn(),
        logout: vi.fn(),
        refreshToken: vi.fn(),
        checkTokenExpiry: vi.fn(),
        initKeycloak: vi.fn(),
      })

      renderWithProviders(<LoginScreen />)
      expect(screen.getByText('Redirecting...')).toBeInTheDocument()
    })

    it('disables SSO button while loading', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        token: null,
        roles: [],
        isAuthenticated: false,
        isLoading: true,
        login: vi.fn(),
        logout: vi.fn(),
        refreshToken: vi.fn(),
        checkTokenExpiry: vi.fn(),
        initKeycloak: vi.fn(),
      })

      renderWithProviders(<LoginScreen />)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })
  })

  describe('Role-based redirect', () => {
    it('redirects RECRUITER to /todo-list after login', async () => {
      mockNavigate.mockClear()

      mockUseAuth.mockReturnValue({
        user: { id: '1', email: 'test@example.com', name: 'Test', roles: [] },
        token: 'test-token',
        roles: ['RECRUITER'],
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        refreshToken: vi.fn(),
        checkTokenExpiry: vi.fn(),
        initKeycloak: vi.fn(),
      })

      renderWithProviders(<LoginScreen />)

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/todo-list', { replace: true })
      })
    })

    it('redirects TOWER_LEAD to /workflow after login', async () => {
      mockNavigate.mockClear()

      mockUseAuth.mockReturnValue({
        user: { id: '1', email: 'lead@example.com', name: 'Lead', roles: [] },
        token: 'test-token',
        roles: ['TOWER_LEAD'],
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        refreshToken: vi.fn(),
        checkTokenExpiry: vi.fn(),
        initKeycloak: vi.fn(),
      })

      renderWithProviders(<LoginScreen />)

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/workflow', { replace: true })
      })
    })
  })
})
