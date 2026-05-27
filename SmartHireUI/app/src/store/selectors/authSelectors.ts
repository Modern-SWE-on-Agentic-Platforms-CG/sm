import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import type { UserRole } from '@services/auth/roleService'

/**
 * Base selector for auth state
 */
const selectAuthState = (state: RootState) => state.auth

/**
 * Select current user
 */
export const selectUser = createSelector(
  [selectAuthState],
  (auth) => auth.user
)

/**
 * Select authentication token
 */
export const selectToken = createSelector(
  [selectAuthState],
  (auth) => auth.token
)

/**
 * Select user roles
 */
export const selectRoles = createSelector(
  [selectAuthState],
  (auth) => auth.roles
)

/**
 * Select authentication status
 */
export const selectIsAuthenticated = createSelector(
  [selectAuthState],
  (auth) => auth.isAuthenticated
)

/**
 * Select loading status
 */
export const selectIsLoading = createSelector(
  [selectAuthState],
  (auth) => auth.isLoading
)

/**
 * Select error message
 */
export const selectError = createSelector(
  [selectAuthState],
  (auth) => auth.error
)

/**
 * Select user email
 */
export const selectUserEmail = createSelector(
  [selectUser],
  (user) => user?.email || ''
)

/**
 * Select user name
 */
export const selectUserName = createSelector(
  [selectUser],
  (user) => user?.name || ''
)

/**
 * Check if user has a specific role
 */
export const selectHasRole = createSelector(
  [selectRoles],
  (roles) => (role: UserRole) => roles.includes(role)
)

/**
 * Check if user has any of the provided roles
 */
export const selectHasAnyRole = createSelector(
  [selectRoles],
  (roles) => (requiredRoles: UserRole[]) =>
    requiredRoles.some((role) => roles.includes(role))
)

/**
 * Check if user has all of the provided roles
 */
export const selectHasAllRoles = createSelector(
  [selectRoles],
  (roles) => (requiredRoles: UserRole[]) =>
    requiredRoles.every((role) => roles.includes(role))
)

/**
 * Select entire auth state for debugging
 */
export const selectAuthDebug = createSelector(
  [selectAuthState],
  (auth) => ({
    hasUser: !!auth.user,
    hasToken: !!auth.token,
    isAuthenticated: auth.isAuthenticated,
    rolesCount: auth.roles.length,
  })
)
