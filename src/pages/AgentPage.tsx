import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AgentInformation } from '../components/AgentInformation'
import { EndpointConfiguration } from '../components/EndpointConfiguration'
import { AgreementOffers } from '../components/AgreementOffers'
import { BookingTest } from '../components/BookingTest'
import { Button } from '../components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import toast from 'react-hot-toast'
import { agreementsOffersApi } from '../api/agreementsOffers'
import { endpointsApi } from '../api/endpoints'
import api from '../lib/api'
import { 
  LayoutDashboard, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Bell, 
  ArrowRight, 
  Settings, 
  PlayCircle, 
  Handshake,
  Shield,
  Zap,
  AlertTriangle
} from 'lucide-react'

export default function AgentPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [bookingTestCompleted, setBookingTestCompleted] = useState(false)
  const [pendingOffers, setPendingOffers] = useState(0)
  const [httpConfigured, setHttpConfigured] = useState(false)
  const [grpcConfigured, setGrpcConfigured] = useState(false)
  const [agreementAccepted, setAgreementAccepted] = useState(false)
  const [allAgreements, setAllAgreements] = useState<any[]>([])
  const [showEndpointConfig, setShowEndpointConfig] = useState(false)
  const [showBookingTest, setShowBookingTest] = useState(false)

  // Fetch source health status
  const { data: sourcesHealth, isLoading: isLoadingHealth } = useQuery({
    queryKey: ['sources-health'],
    queryFn: async () => {
      try {
        const response = await api.get('/admin/sources/health')
        return response.data
      } catch (error) {
        console.error('Failed to load source health:', error)
        return { sources: [], hasMockSources: false }
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 1,
  })

  useEffect(() => {
    // Load user data from localStorage
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
    }

    // Load setup status
    loadSetupStatus()
  }, [])

  const loadSetupStatus = async () => {
    try {
      // Check endpoint configuration
      const endpointConfig = await endpointsApi.getConfig()
      setHttpConfigured(!!endpointConfig.httpEndpoint)
      setGrpcConfigured(!!endpointConfig.grpcEndpoint)

      // Check if booking test has been completed
      const testCompleted = localStorage.getItem('bookingTestCompleted')
      if (testCompleted === 'true') {
        setBookingTestCompleted(true)
      }

      // Load pending offers count and check agreement acceptance
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
      await loadOffers()
      const intv = setInterval(loadOffers, 5000)
      return () => clearInterval(intv)
    } catch (error) {
      console.error('Failed to load setup status:', error)
    }
  }

  const handleBookingTestCompleted = () => {
    setBookingTestCompleted(true)
    localStorage.setItem('bookingTestCompleted', 'true')
    loadSetupStatus() // Refresh status
    setShowBookingTest(false) // Hide the test section after completion
  }

  const handleEndpointConfigUpdated = () => {
    loadSetupStatus() // Refresh status
    setShowEndpointConfig(false) // Hide the config section after completion
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
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-md p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-700 rounded-md">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                Dashboard
              </h1>
              <p className="text-gray-600 text-sm">Welcome to your agent portal</p>
            </div>
          </div>
          {user?.company?.companyName && (
            <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-md border border-gray-200">
              <Building2 className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Company</p>
                <p className="text-sm font-semibold text-gray-900">{user.company.companyName}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New agreements banner */}
      {pendingOffers > 0 && (
        <Card className="bg-yellow-50 border border-yellow-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-600 rounded-md">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {pendingOffers} New Agreement{pendingOffers > 1 ? 's' : ''} Awaiting Review
                  </p>
                  <p className="text-sm text-gray-600 mt-0.5">Source partners are waiting for your response</p>
                </div>
              </div>
              <Button 
                variant="primary" 
                size="md"
                onClick={() => navigate('/agreements')}
                className="flex items-center gap-2"
              >
                Review Now
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Total Agreements</p>
                <p className="text-3xl font-semibold text-gray-900 mb-2">
                  {allAgreements.length}
                </p>
                {pendingOffers > 0 && (
                  <Badge variant="danger" className="mt-1">
                    <Clock className="w-3 h-3 mr-1" />
                    {pendingOffers} pending
                  </Badge>
                )}
                {pendingOffers === 0 && allAgreements.length > 0 && (
                  <Badge variant="success" className="mt-1">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    All reviewed
                  </Badge>
                )}
              </div>
              <div className="p-3 bg-slate-700 rounded-md">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">System Status</p>
                <p className="text-3xl font-semibold text-gray-900 mb-2">
                  {bookingTestCompleted && agreementAccepted ? 'Ready' : 'Setup'}
                </p>
                {bookingTestCompleted && agreementAccepted ? (
                  <Badge variant="success" className="mt-1">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Fully configured
                  </Badge>
                ) : (
                  <Badge variant="warning" className="mt-1">
                    <Clock className="w-3 h-3 mr-1" />
                    Incomplete
                  </Badge>
                )}
              </div>
              <div className={`p-3 rounded-md ${
                bookingTestCompleted && agreementAccepted 
                  ? 'bg-green-600' 
                  : 'bg-slate-700'
              }`}>
                {bookingTestCompleted && agreementAccepted ? (
                  <CheckCircle2 className="h-6 w-6 text-white" />
                ) : (
                  <Settings className="h-6 w-6 text-white" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Company</p>
                <p className="text-lg font-semibold text-gray-900 truncate mb-2">{user?.company?.companyName || '—'}</p>
                <Badge 
                  variant={user?.company?.status === 'ACTIVE' ? 'success' : 'warning'} 
                  size="sm" 
                  className="mt-1"
                >
                  {user?.company?.status || 'UNKNOWN'}
                </Badge>
              </div>
              <div className="p-3 bg-gray-700 rounded-md">
                <Building2 className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Source health status strip */}
      {isLoadingHealth ? (
        <Card className="bg-gray-50 border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
              <span className="text-sm text-gray-600">Checking source health...</span>
            </div>
          </CardContent>
        </Card>
      ) : sourcesHealth?.hasMockSources ? (
        <Card className="bg-yellow-50 border border-yellow-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-600 rounded-md">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Test Sources Detected</p>
                  <p className="text-xs text-yellow-700">
                    Some sources are using mock adapters (test data only). Production data may be limited.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-md border border-yellow-200">
                <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                <span className="text-xs font-medium text-gray-700">Test Mode</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-green-50 border border-green-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-600 rounded-md">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {sourcesHealth?.sources?.length > 0 
                      ? `All ${sourcesHealth.sources.length} Source${sourcesHealth.sources.length !== 1 ? 's' : ''} Healthy`
                      : 'All Sources Healthy'}
                  </p>
                  <p className="text-xs text-gray-600">System operational and ready</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-md border border-green-200">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-xs font-medium text-gray-700">Live</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Onboarding steps */}
      {(!httpConfigured || !grpcConfigured || !bookingTestCompleted || !agreementAccepted) && (
        <Card className="border border-gray-200">
          <CardHeader className="bg-slate-700 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-md">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-white text-xl font-semibold">Complete Your Setup</CardTitle>
                <p className="text-slate-200 text-sm mt-0.5">Follow these steps to get started with your agent portal</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Step 1 */}
              <div 
                className={`flex flex-col items-start p-4 rounded-md cursor-pointer ${
                  !httpConfigured || !grpcConfigured 
                      ? 'bg-white hover:bg-gray-50 border border-slate-300' 
                    : 'bg-gray-50 border border-gray-200'
                }`}
                onClick={() => {
                  if (!httpConfigured || !grpcConfigured) {
                    setShowEndpointConfig(true)
                    setShowBookingTest(false)
                  }
                }}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-md flex items-center justify-center font-semibold text-lg ${
                    httpConfigured && grpcConfigured 
                      ? 'bg-green-600 text-white' 
                      : 'bg-slate-700 text-white'
                  }`}>
                    {httpConfigured && grpcConfigured ? <CheckCircle2 className="w-7 h-7" /> : '1'}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-lg mb-1">Configure Endpoints</h4>
                    <p className="text-sm text-gray-600 mb-4">Set up your HTTP and gRPC endpoints</p>
                    {(!httpConfigured || !grpcConfigured) && (
                      <Button 
                        size="sm" 
                        variant="primary" 
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowEndpointConfig(true)
                          setShowBookingTest(false)
                        }}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Configure Now
                      </Button>
                    )}
                    {httpConfigured && grpcConfigured && (
                      <Badge variant="success" className="mt-2">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div 
                className={`flex flex-col items-start p-4 rounded-md cursor-pointer ${
                  !bookingTestCompleted && httpConfigured && grpcConfigured 
                      ? 'bg-white hover:bg-gray-50 border border-slate-300' 
                    : 'bg-gray-50 border border-gray-200'
                }`}
                onClick={() => {
                  if (!bookingTestCompleted && httpConfigured && grpcConfigured) {
                    setShowBookingTest(true)
                    setShowEndpointConfig(false)
                  }
                }}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-md flex items-center justify-center font-semibold text-lg ${
                    bookingTestCompleted 
                      ? 'bg-green-600 text-white' 
                      : httpConfigured && grpcConfigured 
                      ? 'bg-slate-700 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {bookingTestCompleted ? <CheckCircle2 className="w-7 h-7" /> : '2'}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-lg mb-1">Run Booking Test</h4>
                    <p className="text-sm text-gray-600 mb-4">Complete the booking integration test</p>
                    {!bookingTestCompleted && httpConfigured && grpcConfigured && (
                      <Button 
                        size="sm" 
                        variant="primary" 
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowBookingTest(true)
                          setShowEndpointConfig(false)
                        }}
                      >
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Run Test
                      </Button>
                    )}
                    {(!httpConfigured || !grpcConfigured) && (
                      <p className="text-xs text-gray-500 mt-2 font-medium">Complete step 1 first</p>
                    )}
                    {bookingTestCompleted && (
                      <Badge variant="success" className="mt-2">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div 
                className={`flex flex-col items-start p-4 rounded-md cursor-pointer ${
                  !agreementAccepted && bookingTestCompleted 
                      ? 'bg-white hover:bg-gray-50 border border-slate-300' 
                    : 'bg-gray-50 border border-gray-200'
                }`}
                onClick={() => {
                  if (!agreementAccepted && bookingTestCompleted) {
                    navigate('/agreements')
                  }
                }}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-md flex items-center justify-center font-semibold text-lg ${
                    agreementAccepted 
                      ? 'bg-green-600 text-white' 
                      : bookingTestCompleted 
                      ? 'bg-slate-700 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {agreementAccepted ? <CheckCircle2 className="w-7 h-7" /> : '3'}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-lg mb-1">Accept Agreement</h4>
                    <p className="text-sm text-gray-600 mb-4">Activate your agreement offers</p>
                    {!agreementAccepted && bookingTestCompleted && (
                      <Button 
                        size="sm" 
                        variant="primary" 
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate('/agreements')
                        }}
                      >
                        <Handshake className="w-4 h-4 mr-2" />
                        View Offers
                      </Button>
                    )}
                    {!bookingTestCompleted && (
                      <p className="text-xs text-gray-500 mt-2 font-medium">Complete step 2 first</p>
                    )}
                    {agreementAccepted && (
                      <Badge variant="success" className="mt-2">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Endpoint Configuration Section */}
      {showEndpointConfig && (
        <div className="mt-6">
          <EndpointConfiguration onConfigUpdated={handleEndpointConfigUpdated} />
        </div>
      )}

      {/* Booking Test Section */}
      {showBookingTest && (
        <div className="mt-6">
          <BookingTest onTestCompleted={handleBookingTestCompleted} />
        </div>
      )}
    </div>
  )
}
