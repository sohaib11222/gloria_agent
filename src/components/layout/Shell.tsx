import React, { useState } from 'react'
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { LogOut, Bell, Menu, X, LayoutDashboard, Search, FileText, Calendar, MapPin, BookOpen, MessageCircle } from 'lucide-react'
import { NotificationsDrawer } from '../NotificationsDrawer'
import api from '../../lib/api'
import logoImage from '../../assets/logo.jpg'

export const Shell: React.FC = () => {
  const navigate = useNavigate()
  const navItems = [
    { path: '/agent', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/availability', label: 'Availability', icon: Search },
    { path: '/agreements', label: 'Agreements', icon: FileText },
    { path: '/bookings', label: 'My Bookings', icon: Calendar },
    { path: '/locations', label: 'Locations', icon: MapPin },
    { path: '/support', label: 'Support', icon: MessageCircle },
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
    <div className="flex h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-700 border-b border-slate-800">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src={logoImage} 
              alt="Gloria Connect" 
              className="h-8 w-auto object-contain"
            />
            <h1 className="text-lg font-bold text-white">Gloria Connect - Agent</h1>
          </div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-white hover:bg-white/20 rounded-md"
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
          w-64 bg-gray-50 border-r border-gray-200
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col h-screen lg:h-auto
        `}
      >
        <div className="flex items-center px-6 py-5 border-b border-gray-200 bg-slate-700">
          <div className="flex items-center gap-3">
            <img 
              src={logoImage} 
              alt="Gloria Connect" 
              className="h-10 w-auto object-contain"
            />
            <div>
              <h1 className="text-xl font-bold text-white">Gloria Connect - Agent</h1>
              <p className="text-xs text-slate-200">Portal</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden ml-auto p-1.5 text-white hover:bg-white/20 rounded-md"
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
                <Link
                  key={item.path}
                  to="/docs-fullscreen/getting-started"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between px-3 py-3 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 hover:text-gray-900 group"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-gray-500 group-hover:text-gray-700" />
                    <span>{item.label}</span>
                  </div>
                  <svg className="h-4 w-4 text-gray-400 group-hover:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )
            }
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-slate-700 text-white'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
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

        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3 px-3 py-3 mb-3 bg-white rounded-md border border-gray-200">
            <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-semibold text-white">
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
            className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
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
        <header className="hidden lg:block bg-white border-b border-gray-200">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src={logoImage} 
                alt="Gloria Connect" 
                className="h-10 w-auto object-contain"
              />
              <div>
                <h2 className="text-lg font-bold text-gray-900">Gloria Connect - Agent</h2>
                <p className="text-xs text-gray-500">Portal Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 pr-4 border-r-2 border-gray-200">
                <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-semibold text-white">
                  {initial}
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">{companyName}</div>
                  <div className="text-xs text-gray-500">{email}</div>
                </div>
              </div>

              <button
                onClick={() => setShowNotifications(true)}
                className="relative p-3 text-gray-700 hover:bg-gray-50 rounded-md"
              >
                <Bell className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-0 right-0 h-5 w-5 bg-red-600 text-white text-xs font-semibold rounded-full border-2 border-white flex items-center justify-center">
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


