import React from 'react'
import { Navigate } from 'react-router'
import { useAppSelector } from '@store/store'
import { selectIsAuthenticated } from '@store/selectors/authSelectors'

interface PrivateRouteProps {
  children: React.ReactNode
}

/**
 * Route guard that checks authentication
 */
export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to="/home" replace />
  }

  return <>{children}</>
}

export default PrivateRoute
