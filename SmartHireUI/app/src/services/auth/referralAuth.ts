/**
 * Referral portal auth — localStorage-based, independent of Keycloak SSO
 */
import type { ReferralUser, ReferralRole } from '@appTypes/referral'

const ROLE_KEY = 'refrole'
const NAME_KEY = 'refname'
const USER_KEY = 'refuser'

export function setReferralSession(user: ReferralUser): void {
  localStorage.setItem(ROLE_KEY, user.role)
  localStorage.setItem(NAME_KEY, user.name)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getReferralUser(): ReferralUser | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as ReferralUser
  } catch {
    return null
  }
}

export function getReferralRole(): ReferralRole | null {
  return (localStorage.getItem(ROLE_KEY) as ReferralRole) || null
}

export function getReferralName(): string | null {
  return localStorage.getItem(NAME_KEY)
}

export function isReferralAuthenticated(): boolean {
  return !!localStorage.getItem(ROLE_KEY)
}

export function clearReferralSession(): void {
  localStorage.removeItem(ROLE_KEY)
  localStorage.removeItem(NAME_KEY)
  localStorage.removeItem(USER_KEY)
}
