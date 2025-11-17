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
import DocsPage from '../pages/Docs'

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Shell />
        </ProtectedRoute>
      }>
        <Route path="agent" element={<AgentPage />} />
        <Route path="availability" element={<AvailabilityTest />} />
        <Route path="agreements" element={<Agreements />} />
        <Route path="bookings" element={<MyBookings />} />
        <Route path="docs" element={<DocsPage />} />
        <Route index element={<Navigate to="/agent" replace />} />
      </Route>

      {/* Default redirects */}
      
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
