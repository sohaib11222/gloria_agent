import React, { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { LogOut, Bell, Menu, X, LayoutDashboard, Search, FileText, Calendar, MapPin, BookOpen } from 'lucide-react'
import { NotificationsDrawer } from '../NotificationsDrawer'
import api from '../../lib/api'

export const Shell: React.FC = () => {
  const navigate = useNavigate()
  const navItems = [
    { path: '/agent', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/availability', label: 'Availability', icon: Search },
    { path: '/agreements', label: 'Agreements', icon: FileText },
    { path: '/bookings', label: 'My Bookings', icon: Calendar },
    { path: '/locations', label: 'Locations', icon: MapPin },
    { path: '/docs', label: 'API Reference', icon: BookOpen },
  ]
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  
  // Fetch unread notification count
  const { data: notificationsData } = useQuery({
    queryKey: ['notifications-count'],
    queryFn: async () => {
      try {
        const response = await api.get('/agreements/notifications', {
          params: { limit: 50, unreadOnly: true }
        })
        const items = response.data?.items || response.data?.data?.items || []
        return items.filter((n: any) => !n.read && !n.readAt)
      } catch (error) {
        return []
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 1,
  })
  
  const unreadNotifications = notificationsData?.length || 0
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
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-800 shadow-lg">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h1 className="text-lg font-bold text-white">Gloria Connect - Agent</h1>
          </div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white border-r border-gray-200 shadow-sm
          transform transition-transform duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col h-screen lg:h-auto
        `}
      >
        <div className="flex items-center px-6 py-5 border-b border-blue-800 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Gloria Connect - Agent</h1>
              <p className="text-xs text-blue-100">Portal</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden ml-auto p-1.5 text-white hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            if (item.path === '/docs') {
              return (
                <a
                  key={item.path}
                  href="/docs-fullscreen"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between px-3 py-3 text-sm font-semibold rounded-xl transition-all duration-200 text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md group"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-gray-500 group-hover:text-blue-600" />
                    <span>{item.label}</span>
                  </div>
                  <svg className="h-4 w-4 text-gray-400 group-hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )
            }
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-[1.02]'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        <div className="p-4 border-t-2 border-gray-200 bg-gradient-to-b from-white to-gray-50">
          <div className="flex items-center gap-3 px-3 py-3 mb-3 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 flex items-center justify-center text-sm font-bold text-white shadow-lg ring-2 ring-blue-200">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-gray-900 truncate">{companyName}</div>
              <div className="text-xs text-gray-500 truncate">{email}</div>
            </div>
          </div>
          <button
            onClick={() => {
              handleLogout()
              setMobileOpen(false)
            }}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Mobile topbar spacing */}
        <div className="lg:hidden h-16"></div>
        
        {/* Topbar - Hidden on mobile, shown on desktop */}
        <header className="hidden lg:block bg-gradient-to-r from-white to-gray-50 border-b-2 border-gray-200 shadow-md">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Gloria Connect - Agent</h2>
                <p className="text-xs text-gray-500">Portal Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 pr-4 border-r-2 border-gray-200">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-bold text-white shadow-md ring-2 ring-blue-200">
                  {initial}
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">{companyName}</div>
                  <div className="text-xs text-gray-500">{email}</div>
                </div>
              </div>

              <button
                onClick={() => setShowNotifications(true)}
                className="relative p-3 text-gray-700 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:shadow-md"
              >
                <Bell className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-0 right-0 h-5 w-5 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-bold rounded-full border-2 border-white flex items-center justify-center shadow-lg animate-pulse">
                    {unreadNotifications > 99 ? '99+' : unreadNotifications}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
      
      <NotificationsDrawer 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)}
        endpoint="/agreements/notifications"
        markReadEndpoint={(id) => `/agreements/notifications/${id}/read`}
      />
    </div>
  )
}


