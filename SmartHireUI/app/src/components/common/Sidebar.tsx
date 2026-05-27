import React from 'react'
import { Link, useLocation } from 'react-router'
import { useAppDispatch, useAppSelector } from '@store/store'
import { selectIsSidebarOpen } from '@store/selectors/uiSelectors'
import { setSidebarOpen } from '@store/slices/uiSlice'
import { useRole } from '@hooks/useRole'
import type { UserRole, Permission } from '@services/auth/roleService'

interface NavItem {
  label: string
  path: string
  icon?: string
  requiredRoles?: UserRole[]
  requiredPermission?: Permission
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', requiredRoles: ['INTERVIEWER', 'RECRUITER', 'PMO'] as UserRole[] },
  { label: 'Candidates', path: '/candidates', requiredRoles: ['RECRUITER', 'PMO'] as UserRole[] },
  { label: 'Scheduling', path: '/booking/form', requiredRoles: ['RECRUITER', 'INTERVIEWER'] as UserRole[] },
  { label: 'Feedback', path: '/feedback', requiredRoles: ['INTERVIEWER'] as UserRole[] },
  { label: 'To-Do List', path: '/todo-list', requiredRoles: ['RECRUITER', 'INTERVIEWER'] as UserRole[] },
  { label: 'Approvals', path: '/workflow', requiredRoles: ['TOWER_LEAD', 'SL_BU_LEAD', 'NA_LEAD', 'RECRUITER_LEAD'] as UserRole[] },
  { label: 'Reports', path: '/reports/rejection-ratio', requiredRoles: ['RECRUITER_LEAD', 'ADMIN'] as UserRole[] },
  { label: 'Referrals', path: '/referral/register', requiredRoles: ['SPOC'] as UserRole[] },
  { label: 'Admin', path: '/admin/master-data', requiredRoles: ['ADMIN', 'BU_ADMIN'] as UserRole[] },
]

export const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const isSidebarOpen = useAppSelector(selectIsSidebarOpen)
  const { hasPermission, hasAnyRole } = useRole()

  const isActive = (path: string) => location.pathname === path

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.requiredRoles) {
      return hasAnyRole(item.requiredRoles)
    }
    if (item.requiredPermission) {
      return hasPermission(item.requiredPermission)
    }
    return true
  })

  return (
    <>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30"
          onClick={() => dispatch(setSidebarOpen(false))}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-gray-900 text-white transition-all duration-300 z-40 pt-20 ${
          isSidebarOpen ? 'w-64' : 'w-20'
        } lg:w-64 lg:sticky lg:top-0`}
      >
        <nav className="space-y-2 px-4 py-6">
          {visibleItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
              title={!isSidebarOpen ? item.label : undefined}
              onClick={() => {
                // Close sidebar on mobile after navigation
                if (window.innerWidth < 1024) {
                  dispatch(setSidebarOpen(false))
                }
              }}
            >
              <svg
                className="w-6 h-6 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              {isSidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  )
}

export default Sidebar
