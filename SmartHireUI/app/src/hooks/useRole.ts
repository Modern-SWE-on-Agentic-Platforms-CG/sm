import { useAppSelector } from '@store/store'
import { selectRoles } from '@store/selectors/authSelectors'
import { roleService, UserRole, Permission } from '@services/auth/roleService'

export interface UseRoleReturn {
  hasRole(role: UserRole): boolean
  hasAnyRole(roles: UserRole[]): boolean
  hasAllRoles(roles: UserRole[]): boolean
  hasPermission(permission: Permission): boolean
  hasAnyPermission(permissions: Permission[]): boolean
  userRoles: string[]
}

/**
 * Custom hook for role-based logic
 */
export const useRole = (): UseRoleReturn => {
  const userRoles = useAppSelector(selectRoles)

  const hasRole = (role: UserRole): boolean => {
    return roleService.hasRole(userRoles, role)
  }

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return roleService.hasAnyRole(userRoles, roles)
  }

  const hasAllRoles = (roles: UserRole[]): boolean => {
    return roleService.hasAllRoles(userRoles, roles)
  }

  const hasPermission = (permission: Permission): boolean => {
    return roleService.hasPermission(userRoles, permission)
  }

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return roleService.hasAnyPermission(userRoles, permissions)
  }

  return {
    hasRole,
    hasAnyRole,
    hasAllRoles,
    hasPermission,
    hasAnyPermission,
    userRoles,
  }
}

export default useRole
