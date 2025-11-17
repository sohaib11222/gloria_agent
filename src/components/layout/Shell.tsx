import React, { useState, useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LogOut, Bell } from 'lucide-react'

export const Shell: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const navItems = [
    { path: '/agent', label: 'Dashboard' },
    { path: '/availability', label: 'Availability' },
    { path: '/agreements', label: 'Agreements' },
    { path: '/bookings', label: 'My Bookings' },
    { path: '/docs', label: 'API Reference' },
  ]
  const [mobileOpen, setMobileOpen] = useState(false)
  const [unreadNotifications, setUnreadNotifications] = useState(2) // Mock count
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
  })()
  const email: string = user?.email || ''
  const companyName: string = user?.company?.companyName || ''
  const initial = email ? email.charAt(0).toUpperCase() : 'U'

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    localStorage.removeItem('notifiedAgreements')
    localStorage.removeItem('bookingTestCompleted')
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-56 bg-white border-r border-gray-200 shadow-sm">
        <div className="flex items-center px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
          <h1 className="text-lg font-bold text-white">Car Hire - Agent</h1>
        </div>
        
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-200">
          <div className="flex items-center gap-2 px-2 py-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-xs font-semibold text-white shadow-md">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gray-900 truncate">{companyName}</div>
              <div className="text-xs text-gray-500 truncate">{email}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-gray-900">Car Hire - Agent</h2>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 pr-4 border-r border-gray-200">
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">{companyName}</div>
                  <div className="text-xs text-gray-500">{email}</div>
                </div>
              </div>

              <button
                onClick={() => navigate('/agreements')}
                className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full border-2 border-white" />
                )}
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Mobile menu button */}
        <div className="lg:hidden px-4 py-3 bg-white border-b border-gray-200">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-sm font-medium">Menu</span>
          </button>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="lg:hidden bg-white border-b border-gray-200 shadow-lg">
            <nav className="px-3 py-2 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-lg text-sm font-medium ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        )}

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}


