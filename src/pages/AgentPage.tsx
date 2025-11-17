import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AgentInformation } from '../components/AgentInformation'
import { EndpointConfiguration } from '../components/EndpointConfiguration'
import { AgreementOffers } from '../components/AgreementOffers'
import { BookingTest } from '../components/BookingTest'
import { Button } from '../components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import toast from 'react-hot-toast'
import { agreementsOffersApi } from '../api/agreementsOffers'

export default function AgentPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [bookingTestCompleted, setBookingTestCompleted] = useState(false)
  const [pendingOffers, setPendingOffers] = useState(0)
  const [httpConfigured, setHttpConfigured] = useState(false)
  const [grpcConfigured, setGrpcConfigured] = useState(false)
  const [agreementAccepted, setAgreementAccepted] = useState(false)
  const [allAgreements, setAllAgreements] = useState<any[]>([])

  useEffect(() => {
    // Load user data from localStorage
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
    }

    // Check if booking test has been completed
    const testCompleted = localStorage.getItem('bookingTestCompleted')
    if (testCompleted === 'true') {
      setBookingTestCompleted(true)
    }

    // Load pending offers count for notifications bell
    const loadOffers = async () => {
      try {
        const res = await agreementsOffersApi.getOffers()
        setAllAgreements(res.items)
        setPendingOffers(res.items.filter(i => i.status === 'OFFERED').length)
        // Set agreement accepted if any accepted
        const anyAccepted = res.items.some(i => i.status === 'ACCEPTED')
        if (anyAccepted) setAgreementAccepted(true)
      } catch {}
    }
    loadOffers()
    const intv = setInterval(loadOffers, 5000)
    return () => clearInterval(intv)
  }, [])

  const handleBookingTestCompleted = () => {
    setBookingTestCompleted(true)
    localStorage.setItem('bookingTestCompleted', 'true')
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    localStorage.removeItem('notifiedAgreements')
    localStorage.removeItem('bookingTestCompleted')
    setBookingTestCompleted(false)
    toast.success('Logged out successfully')
    navigate('/login')
  }


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome to your agent portal</p>
      </div>

      {/* New agreements banner */}
      {pendingOffers > 0 && (
        <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500 rounded-lg">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    You have {pendingOffers} agreement{pendingOffers > 1 ? 's' : ''} to review
                  </p>
                  <p className="text-sm text-gray-600">Source partners are waiting for your response</p>
                </div>
              </div>
              <Button variant="primary" onClick={() => navigate('/agreements')}>
                Review Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-blue-100 rounded-xl">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Agreements</p>
              <p className="text-2xl font-bold text-gray-900">{allAgreements.length}</p>
              {pendingOffers > 0 && (
                <p className="text-sm text-red-600 font-semibold">
                  {pendingOffers} pending
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-green-100 rounded-xl">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Status</p>
              <p className="text-2xl font-bold text-gray-900">
                {bookingTestCompleted && agreementAccepted ? 'Ready' : 'Setup'}
              </p>
              {(!bookingTestCompleted || !agreementAccepted) && (
                <p className="text-sm text-orange-600 font-semibold">
                  Incomplete
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-purple-100 rounded-xl">
              <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Company</p>
              <p className="text-sm font-bold text-gray-900 truncate">{user?.company?.companyName || '—'}</p>
              <Badge variant={user?.company?.status === 'ACTIVE' ? 'success' : 'warning'} size="sm" className="mt-1">
                {user?.company?.status || 'UNKNOWN'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Source health status strip */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-semibold text-green-900">All sources healthy</span>
            </div>
            <span className="text-xs text-green-700">System operational</span>
          </div>
        </CardContent>
      </Card>

      {/* Onboarding steps */}
      {(!bookingTestCompleted || !agreementAccepted) && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Complete Your Setup</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${bookingTestCompleted ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                  1
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">Configure Endpoints</h4>
                  <p className="text-sm text-gray-600 mt-1">Set up your HTTP and gRPC endpoints</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${bookingTestCompleted ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                  2
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">Run Booking Test</h4>
                  <p className="text-sm text-gray-600 mt-1">Complete the booking integration test</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${agreementAccepted ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                  3
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">Accept Agreement</h4>
                  <p className="text-sm text-gray-600 mt-1">Activate your agreement offers</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
