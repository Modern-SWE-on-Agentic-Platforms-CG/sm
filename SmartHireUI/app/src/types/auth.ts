/**
 * Authentication types for SmartHire application
 */

/**
 * User roles in the system
 */
export enum UserRole {
  RECRUITER = 'RECRUITER',
  PMO = 'PMO',
  TOWER_LEAD = 'TOWER_LEAD',
  RECRUITER_LEAD = 'RECRUITER_LEAD',
  BU_ADMIN = 'BU_ADMIN',
  ADMIN = 'ADMIN',
  PANELIST = 'PANELIST',
  INTERVIEWEE = 'INTERVIEWEE',
  SPOC_REFERRAL = 'SPOC_REFERRAL',
  REQUESTER = 'REQUESTER',
  APPROVER = 'APPROVER',
}

/**
 * User profile from Keycloak JWT
 */
export interface UserProfile {
  id: string
  email: string
  name: string
  givenName?: string
  familyName?: string
  roles?: string[]
  realmAccess?: {
    roles: string[]
  }
}

/**
 * JWT Payload structure
 */
export interface JwtPayload {
  sub: string
  email: string
  name: string
  given_name?: string
  family_name?: string
  realm_access?: {
    roles: string[]
  }
  iat: number
  exp: number
  aud?: string | string[]
  iss?: string
}

/**
 * Authentication tokens
 */
export interface AuthTokens {
  accessToken: string
  refreshToken?: string
  expiresIn?: number
  tokenType?: string
}

/**
 * Role to permissions mapping
 */
export interface RoleMapping {
  role: UserRole
  permissions: Permission[]
}

/**
 * Available permissions in the system
 */
export enum Permission {
  // Candidate management
  VIEW_CANDIDATES = 'VIEW_CANDIDATES',
  CREATE_CANDIDATE = 'CREATE_CANDIDATE',
  EDIT_CANDIDATE = 'EDIT_CANDIDATE',
  DELETE_CANDIDATE = 'DELETE_CANDIDATE',
  UPLOAD_CANDIDATES = 'UPLOAD_CANDIDATES',
  EXPORT_CANDIDATES = 'EXPORT_CANDIDATES',

  // Interview scheduling
  SCHEDULE_INTERVIEW = 'SCHEDULE_INTERVIEW',
  VIEW_SCHEDULE = 'VIEW_SCHEDULE',
  CANCEL_INTERVIEW = 'CANCEL_INTERVIEW',

  // Feedback
  SUBMIT_FEEDBACK = 'SUBMIT_FEEDBACK',
  VIEW_FEEDBACK = 'VIEW_FEEDBACK',

  // Approvals
  APPROVE_CANDIDATE = 'APPROVE_CANDIDATE',
  REJECT_CANDIDATE = 'REJECT_CANDIDATE',
  VIEW_APPROVALS = 'VIEW_APPROVALS',

  // Admin
  MANAGE_USERS = 'MANAGE_USERS',
  MANAGE_ROLES = 'MANAGE_ROLES',
  VIEW_REPORTS = 'VIEW_REPORTS',
  MANAGE_SETTINGS = 'MANAGE_SETTINGS',

  // Referral
  SUBMIT_REFERRAL = 'SUBMIT_REFERRAL',
  VIEW_REFERRALS = 'VIEW_REFERRALS',
}

/**
 * Employee information
 */
export interface Employee {
  id: string
  email: string
  name: string
  roles: UserRole[]
  department?: string
  manager?: string
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}
