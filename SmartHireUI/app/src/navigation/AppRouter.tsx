import React, { Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { routes } from './routes'
import { PrivateRoute } from './PrivateRoute'
import { RoleRoute } from './RoleRoute'
import { Layout } from '@components/common/Layout'
import type { UserRole } from '@services/auth/roleService'

// Loading placeholder
const LoadingScreen: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
)

const LoginScreen = React.lazy(() => import('@screens/auth/LoginScreen'))

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Public route: Login */}
          <Route
            path="/home"
            element={<LoginScreen />}
          />

          {/* Protected routes */}
          {routes
            .filter((route) => route.path !== '/home')
            .map((route) => {
              const RouteComponent = route.element as React.ComponentType<object>
              return (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    <PrivateRoute>
                      {route.requiredRoles ? (
                        <RoleRoute allowedRoles={route.requiredRoles as UserRole[]}>
                          <Layout>
                            <RouteComponent />
                          </Layout>
                        </RoleRoute>
                      ) : (
                        <Layout>
                          <RouteComponent />
                        </Layout>
                      )}
                    </PrivateRoute>
                  }
                />
              )
            })}

          {/* Fallback */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default AppRouter
