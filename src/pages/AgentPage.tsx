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
import { endpointsApi } from '../api/endpoints'
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
  Zap
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
    <div className="space-y-8 animate-fade-in pb-8">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-600 rounded-2xl p-8 md:p-10 text-white shadow-2xl border border-indigo-400/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/20 rounded-full blur-2xl -ml-36 -mb-36"></div>
        <div className="relative flex items-center justify-between flex-wrap gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg">
              <LayoutDashboard className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-blue-100 text-lg md:text-xl">Welcome to your agent portal</p>
            </div>
          </div>
          {user?.company?.companyName && (
            <div className="flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <Building2 className="w-5 h-5" />
              <div>
                <p className="text-xs text-blue-200 font-medium">Company</p>
                <p className="text-sm font-bold">{user.company.companyName}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New agreements banner - Enhanced */}
      {pendingOffers > 0 && (
        <Card className="bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 border-2 border-orange-300 shadow-xl transform transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg animate-pulse">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg">
                    {pendingOffers} New Agreement{pendingOffers > 1 ? 's' : ''} Awaiting Review
                  </p>
                  <p className="text-sm text-gray-700 mt-1">Source partners are waiting for your response</p>
                </div>
              </div>
              <Button 
                variant="primary" 
                size="lg"
                onClick={() => navigate('/agreements')}
                className="flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                Review Now
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-50 border-2 border-blue-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/30 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-blue-300/40 transition-all"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Total Agreements</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  {allAgreements.length}
                </p>
                {pendingOffers > 0 && (
                  <Badge variant="danger" className="mt-2 animate-pulse shadow-md">
                    <Clock className="w-3 h-3 mr-1" />
                    {pendingOffers} pending
                  </Badge>
                )}
                {pendingOffers === 0 && allAgreements.length > 0 && (
                  <Badge variant="success" className="mt-2">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    All reviewed
                  </Badge>
                )}
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl transform group-hover:scale-110 transition-transform">
                <FileText className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 via-emerald-100 to-teal-50 border-2 border-green-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/30 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-green-300/40 transition-all"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">System Status</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                  {bookingTestCompleted && agreementAccepted ? 'Ready' : 'Setup'}
                </p>
                {bookingTestCompleted && agreementAccepted ? (
                  <Badge variant="success" className="mt-2">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Fully configured
                  </Badge>
                ) : (
                  <Badge variant="warning" className="mt-2">
                    <Clock className="w-3 h-3 mr-1" />
                    Incomplete
                  </Badge>
                )}
              </div>
              <div className={`p-4 rounded-2xl shadow-xl transform group-hover:scale-110 transition-transform ${
                bookingTestCompleted && agreementAccepted 
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                  : 'bg-gradient-to-br from-orange-500 to-amber-600'
              }`}>
                {bookingTestCompleted && agreementAccepted ? (
                  <CheckCircle2 className="h-8 w-8 text-white" />
                ) : (
                  <Settings className="h-8 w-8 text-white" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 via-indigo-100 to-pink-50 border-2 border-purple-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/30 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-purple-300/40 transition-all"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Company</p>
                <p className="text-lg font-bold text-gray-900 truncate mb-2">{user?.company?.companyName || '—'}</p>
                <Badge 
                  variant={user?.company?.status === 'ACTIVE' ? 'success' : 'warning'} 
                  size="sm" 
                  className="mt-2"
                >
                  {user?.company?.status || 'UNKNOWN'}
                </Badge>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-xl transform group-hover:scale-110 transition-transform">
                <Building2 className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Source health status strip */}
      <Card className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-2 border-green-300 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-md">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-green-900">All Sources Healthy</p>
                <p className="text-xs text-green-700">System operational and ready</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-lg border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-semibold text-green-800">Live</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Onboarding steps */}
      {(!httpConfigured || !grpcConfigured || !bookingTestCompleted || !agreementAccepted) && (
        <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-300 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <CardHeader className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
            <div className="relative flex items-center gap-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-white text-2xl font-bold">Complete Your Setup</CardTitle>
                <p className="text-blue-100 text-sm mt-1">Follow these steps to get started with your agent portal</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 md:p-8 relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div 
                className={`group flex flex-col items-start p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
                  !httpConfigured || !grpcConfigured 
                    ? 'bg-white hover:bg-blue-50 shadow-lg hover:shadow-2xl border-2 border-blue-300 transform hover:-translate-y-1' 
                    : 'bg-gray-50 border-2 border-gray-200'
                }`}
                onClick={() => {
                  if (!httpConfigured || !grpcConfigured) {
                    setShowEndpointConfig(true)
                    setShowBookingTest(false)
                  }
                }}
              >
                <div className="flex items-start gap-4 w-full">
                  <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg transition-all ${
                    httpConfigured && grpcConfigured 
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white' 
                      : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white group-hover:scale-110'
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
                        className="shadow-md hover:shadow-lg transform hover:scale-105"
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
                className={`group flex flex-col items-start p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
                  !bookingTestCompleted && httpConfigured && grpcConfigured 
                    ? 'bg-white hover:bg-blue-50 shadow-lg hover:shadow-2xl border-2 border-blue-300 transform hover:-translate-y-1' 
                    : 'bg-gray-50 border-2 border-gray-200'
                }`}
                onClick={() => {
                  if (!bookingTestCompleted && httpConfigured && grpcConfigured) {
                    setShowBookingTest(true)
                    setShowEndpointConfig(false)
                  }
                }}
              >
                <div className="flex items-start gap-4 w-full">
                  <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg transition-all ${
                    bookingTestCompleted 
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white' 
                      : httpConfigured && grpcConfigured 
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white group-hover:scale-110' 
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
                        className="shadow-md hover:shadow-lg transform hover:scale-105"
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
                className={`group flex flex-col items-start p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
                  !agreementAccepted && bookingTestCompleted 
                    ? 'bg-white hover:bg-blue-50 shadow-lg hover:shadow-2xl border-2 border-blue-300 transform hover:-translate-y-1' 
                    : 'bg-gray-50 border-2 border-gray-200'
                }`}
                onClick={() => {
                  if (!agreementAccepted && bookingTestCompleted) {
                    navigate('/agreements')
                  }
                }}
              >
                <div className="flex items-start gap-4 w-full">
                  <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg transition-all ${
                    agreementAccepted 
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white' 
                      : bookingTestCompleted 
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white group-hover:scale-110' 
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
                        className="shadow-md hover:shadow-lg transform hover:scale-105"
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
