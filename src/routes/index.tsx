import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { Shell } from '../components/layout/Shell'

// Import pages
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import VerifyEmailPage from '../pages/VerifyEmailPage'
import AgentPage from '../pages/AgentPage'
import AvailabilityTest from '../pages/AvailabilityTest'
import Agreements from '../pages/Agreements'
import MyBookings from '../pages/MyBookings'
import LocationBrowser from '../pages/LocationBrowser'
import DocsPage from '../pages/Docs'
import DocsFullscreen from '../pages/DocsFullscreen'
import NotFound from '../pages/NotFound'

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      
      {/* Fullscreen docs route (no sidebar) */}
      <Route path="/docs-fullscreen/:endpointId" element={<DocsFullscreen />} />
      <Route path="/docs-fullscreen" element={<DocsFullscreen />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Shell />
        </ProtectedRoute>
      }>
        <Route path="agent" element={<AgentPage />} />
        <Route path="availability" element={<AvailabilityTest />} />
        <Route path="agreements" element={<Agreements />} />
        <Route path="bookings" element={<MyBookings />} />
        <Route path="locations" element={<LocationBrowser />} />
        <Route path="docs" element={<DocsPage />} />
        <Route index element={<Navigate to="/agent" replace />} />
        {/* 404 for protected routes - will show with Shell layout */}
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* 404 Page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
