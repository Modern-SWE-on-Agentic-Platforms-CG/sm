import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '@hooks/useAuth'
import { useAppSelector, useAppDispatch } from '@store/store'
import { selectIsAuthenticated, selectRoles } from '@store/selectors/authSelectors'
import { getRoleDashboardPath } from '@navigation/routes'
import { setAuthState } from '@store/slices/authSlice'
import { tokenManager } from '@services/auth/tokenManager'
import type { UserRole } from '@services/auth/roleService'

const SHOW_DEMO_LOGINS = import.meta.env.VITE_MOCK_AUTH !== 'false'
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8083'

const MOCK_ROLES: { label: string; role: UserRole; email: string }[] = [
  { label: 'Recruiter', role: 'RECRUITER' as UserRole, email: 'recruiter@smarthire.dev' },
  { label: 'PMO', role: 'PMO' as UserRole, email: 'pmo@smarthire.dev' },
  { label: 'Interviewer', role: 'INTERVIEWER' as UserRole, email: 'interviewer@smarthire.dev' },
  { label: 'Tower Lead', role: 'TOWER_LEAD' as UserRole, email: 'towerlead@smarthire.dev' },
  { label: 'Admin', role: 'ADMIN' as UserRole, email: 'admin@smarthire.dev' },
  { label: 'SPOC', role: 'SPOC' as UserRole, email: 'spoc@smarthire.dev' },
]

/**
 * LoginScreen — Keycloak SSO entry point.
 * If already authenticated redirects to role-specific dashboard.
 */
const LoginScreen: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { login, isLoading } = useAuth()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const roles = useAppSelector(selectRoles)
  const [mockLoading, setMockLoading] = useState<string | null>(null)
  const [mockError, setMockError] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated && roles.length > 0) {
      const dashboardPath = getRoleDashboardPath(roles[0])
      navigate(dashboardPath, { replace: true })
    }
  }, [isAuthenticated, roles, navigate])

  const handleLogin = async () => {
    try {
      await login()
    } catch {
      // Keycloak login triggers a redirect, errors are handled by Keycloak
    }
  }

  /**
   * Mock login calls the backend /dev/token endpoint to obtain a real signed JWT.
   * This avoids sending invalid mock tokens to protected endpoints.
   */
  const handleMockLogin = async (role: UserRole, email: string, name: string) => {
    setMockLoading(role)
    setMockError(null)
    try {
      const res = await fetch(`${API_BASE}/dev/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, email, name }),
      })
      if (!res.ok) {
        throw new Error(`Backend returned ${res.status}`)
      }
      const data: { access_token: string; expires_in: number } = await res.json()
      tokenManager.setAccessToken(data.access_token, data.expires_in)
      dispatch(
        setAuthState({
          user: { id: email, email, name, roles: [role] },
          token: data.access_token,
          roles: [role],
        })
      )
    } catch (err) {
      setMockError(`Login failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setMockLoading(null)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-md text-center">
        {/* Logo */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">SmartHire</h1>
          <p className="text-gray-500 mt-2 text-sm">Intelligent Hiring Platform</p>
        </div>

        {SHOW_DEMO_LOGINS ? (
          <>
            <div className="mb-4 px-3 py-2 bg-yellow-50 border border-yellow-300 rounded-lg">
              <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wide">Demo Login — Choose a role</p>
            </div>
            {mockError && (
              <div className="mb-3 px-3 py-2 bg-red-50 border border-red-300 rounded-lg">
                <p className="text-xs text-red-700">{mockError}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              {MOCK_ROLES.map(({ label, role, email }) => (
                <button
                  key={role}
                  onClick={() => handleMockLogin(role, email, label)}
                  disabled={mockLoading !== null}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-sm flex items-center justify-center gap-1"
                >
                  {mockLoading === role ? (
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : null}
                  {label}
                </button>
              ))}
            </div>
            <div className="mt-6">
              <p className="text-xs text-gray-400 mb-3">Or continue with your organization SSO account</p>
              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed
                           text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200
                           flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Redirecting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 3a7 7 0 110 14A7 7 0 0112 5zm-1 4v6l5-3-5-3z" />
                    </svg>
                    Sign in with SSO
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Welcome Back</h2>
            <p className="text-gray-500 text-sm mb-8">
              Sign in with your organizational account via Single Sign-On
            </p>
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed
                         text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200
                         flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Redirecting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 3a7 7 0 110 14A7 7 0 0112 5zm-1 4v6l5-3-5-3z" />
                  </svg>
                  Sign in with SSO
                </>
              )}
            </button>
            <p className="text-xs text-gray-400 mt-6">
              Secured by Keycloak Identity Provider
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default LoginScreen

