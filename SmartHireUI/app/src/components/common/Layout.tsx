import React, { type ReactNode } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { ToastNotification } from './ToastNotification'

interface LayoutProps {
  children: ReactNode
  showSidebar?: boolean
  showHeader?: boolean
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  showSidebar = true,
  showHeader = true,
}) => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      {showSidebar && <Sidebar />}

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        {showHeader && <Header />}

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container-main py-6">
            {children}
          </div>
        </main>
      </div>

      {/* Global notifications */}
      <ToastNotification />
    </div>
  )
}

export default Layout
