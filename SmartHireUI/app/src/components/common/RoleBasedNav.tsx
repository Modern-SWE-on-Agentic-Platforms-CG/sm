import React from 'react'
import { Link } from 'react-router'
import { useRole } from '@hooks/useRole'
import { UserRole } from '@services/auth/roleService'

interface NavLink {
  label: string
  path: string
  roles?: UserRole[]
}

interface RoleBasedNavProps {
  links: NavLink[]
  direction?: 'horizontal' | 'vertical'
  className?: string
}

export const RoleBasedNav: React.FC<RoleBasedNavProps> = ({
  links,
  direction = 'horizontal',
  className = '',
}) => {
  const { hasAnyRole } = useRole()

  const visibleLinks = links.filter((link) => {
    if (link.roles && link.roles.length > 0) {
      return hasAnyRole(link.roles)
    }
    return true
  })

  const containerClass =
    direction === 'horizontal'
      ? 'flex items-center gap-2'
      : 'flex flex-col gap-2'

  return (
    <nav className={`${containerClass} ${className}`}>
      {visibleLinks.map((link) => (
        <Link
          key={link.path}
          to={link.path}
          className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
}

export default RoleBasedNav
