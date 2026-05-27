import React from 'react'
import { Navigate } from 'react-router'
import { useRole } from '@hooks/useRole'
import { UserRole } from '@services/auth/roleService'

interface RoleRouteProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
}

/**
 * Route guard that checks user roles
 */
export const RoleRoute: React.FC<RoleRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { hasAnyRole } = useRole()

  if (!hasAnyRole(allowedRoles)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export default RoleRoute
