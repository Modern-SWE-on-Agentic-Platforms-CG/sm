/**
 * Role Service for managing user roles and permissions
 */

export enum UserRole {
  RECRUITER = 'RECRUITER',
  PMO = 'PMO',
  TOWER_LEAD = 'TOWER_LEAD',
  SL_BU_LEAD = 'SL_BU_LEAD',
  NA_LEAD = 'NA_LEAD',
  RECRUITER_LEAD = 'RECRUITER_LEAD',
  INTERVIEWER = 'INTERVIEWER',
  BU_ADMIN = 'BU_ADMIN',
  ADMIN = 'ADMIN',
  SPOC = 'SPOC',
  CANDIDATE = 'CANDIDATE',
}

export enum Permission {
  VIEW_CANDIDATES = 'VIEW_CANDIDATES',
  EDIT_CANDIDATES = 'EDIT_CANDIDATES',
  DELETE_CANDIDATES = 'DELETE_CANDIDATES',
  UPLOAD_CANDIDATES = 'UPLOAD_CANDIDATES',
  VIEW_DASHBOARD = 'VIEW_DASHBOARD',
  VIEW_APPROVALS = 'VIEW_APPROVALS',
  APPROVE_CANDIDATES = 'APPROVE_CANDIDATES',
  VIEW_REPORTS = 'VIEW_REPORTS',
  MANAGE_MASTER_DATA = 'MANAGE_MASTER_DATA',
  MANAGE_USERS = 'MANAGE_USERS',
  VIEW_SCHEDULING = 'VIEW_SCHEDULING',
  CREATE_SLOTS = 'CREATE_SLOTS',
  BOOK_INTERVIEWS = 'BOOK_INTERVIEWS',
  SUBMIT_FEEDBACK = 'SUBMIT_FEEDBACK',
  SUBMIT_REFERRAL = 'SUBMIT_REFERRAL',
}

type RolePermissionMap = {
  [key in UserRole]?: Permission[]
}

/**
 * Role to Permission mapping
 */
const ROLE_PERMISSIONS: RolePermissionMap = {
  [UserRole.RECRUITER]: [
    Permission.VIEW_CANDIDATES,
    Permission.EDIT_CANDIDATES,
    Permission.UPLOAD_CANDIDATES,
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_SCHEDULING,
    Permission.BOOK_INTERVIEWS,
  ],
  [UserRole.PMO]: [
    Permission.VIEW_CANDIDATES,
    Permission.EDIT_CANDIDATES,
    Permission.UPLOAD_CANDIDATES,
    Permission.VIEW_DASHBOARD,
  ],
  [UserRole.INTERVIEWER]: [
    Permission.VIEW_CANDIDATES,
    Permission.VIEW_SCHEDULING,
    Permission.CREATE_SLOTS,
    Permission.SUBMIT_FEEDBACK,
  ],
  [UserRole.TOWER_LEAD]: [
    Permission.VIEW_CANDIDATES,
    Permission.VIEW_APPROVALS,
    Permission.APPROVE_CANDIDATES,
  ],
  [UserRole.SL_BU_LEAD]: [
    Permission.VIEW_CANDIDATES,
    Permission.VIEW_APPROVALS,
    Permission.APPROVE_CANDIDATES,
  ],
  [UserRole.NA_LEAD]: [
    Permission.VIEW_CANDIDATES,
    Permission.VIEW_APPROVALS,
    Permission.APPROVE_CANDIDATES,
  ],
  [UserRole.RECRUITER_LEAD]: [
    Permission.VIEW_CANDIDATES,
    Permission.VIEW_APPROVALS,
    Permission.APPROVE_CANDIDATES,
  ],
  [UserRole.ADMIN]: [
    Permission.VIEW_CANDIDATES,
    Permission.EDIT_CANDIDATES,
    Permission.DELETE_CANDIDATES,
    Permission.MANAGE_MASTER_DATA,
    Permission.MANAGE_USERS,
    Permission.VIEW_REPORTS,
    Permission.VIEW_DASHBOARD,
  ],
  [UserRole.BU_ADMIN]: [
    Permission.VIEW_CANDIDATES,
    Permission.EDIT_CANDIDATES,
    Permission.MANAGE_MASTER_DATA,
    Permission.MANAGE_USERS,
  ],
  [UserRole.SPOC]: [Permission.SUBMIT_REFERRAL],
  [UserRole.CANDIDATE]: [],
}

export interface RoleService {
  hasRole(roles: string[], role: UserRole): boolean
  hasAnyRole(roles: string[], allowedRoles: UserRole[]): boolean
  hasAllRoles(roles: string[], requiredRoles: UserRole[]): boolean
  hasPermission(roles: string[], permission: Permission): boolean
  hasAnyPermission(roles: string[], permissions: Permission[]): boolean
  getPermissionsForRoles(roles: string[]): Set<Permission>
}

class RoleServiceImpl implements RoleService {
  hasRole(roles: string[], role: UserRole): boolean {
    return roles.includes(role)
  }

  hasAnyRole(roles: string[], allowedRoles: UserRole[]): boolean {
    return roles.some((role) => allowedRoles.includes(role as UserRole))
  }

  hasAllRoles(roles: string[], requiredRoles: UserRole[]): boolean {
    return requiredRoles.every((requiredRole) => roles.includes(requiredRole))
  }

  hasPermission(roles: string[], permission: Permission): boolean {
    const permissions = this.getPermissionsForRoles(roles)
    return permissions.has(permission)
  }

  hasAnyPermission(roles: string[], permissions: Permission[]): boolean {
    const userPermissions = this.getPermissionsForRoles(roles)
    return permissions.some((permission) => userPermissions.has(permission))
  }

  getPermissionsForRoles(roles: string[]): Set<Permission> {
    const permissions = new Set<Permission>()

    for (const role of roles) {
      const rolePermissions = ROLE_PERMISSIONS[role as UserRole]
      if (rolePermissions) {
        rolePermissions.forEach((permission) => permissions.add(permission))
      }
    }

    return permissions
  }
}

/**
 * Singleton instance of role service
 */
export const roleService: RoleService = new RoleServiceImpl()

export default roleService
