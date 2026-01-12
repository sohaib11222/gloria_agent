import React, { useState } from 'react'
import { bookingTestApi, BookingTestResponse } from '../api/bookingTest'
import { Button } from './ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Input } from './ui/Input'
import { Badge } from './ui/Badge'
import toast from 'react-hot-toast'

interface BookingTestProps {
  agreements: any[]
  onTestCompleted?: () => void
}

export const BookingTest: React.FC<BookingTestProps> = ({ onTestCompleted }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<'create' | 'modify' | 'cancel' | 'completed'>('create')
  const [bookingData, setBookingData] = useState({
    source_id: '',
    agreement_ref: '',
    agent_booking_ref: ''
  })
  const [testResults, setTestResults] = useState<BookingTestResponse | null>(null)
  const [allTestsPassed, setAllTestsPassed] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setBookingData(prev => ({ ...prev, [field]: value }))
  }

  const handleCreateBooking = async () => {
    if (!bookingData.source_id || !bookingData.agreement_ref || !bookingData.agent_booking_ref) {
      toast.error('Please fill in all fields')
      return
    }

    // Check if user is authenticated before making request
    const token = localStorage.getItem('token')
    if (!token) {
      toast.error('You must be logged in to run the booking test. Please log in and try again.', {
        duration: 5000
      })
      return
    }

    setIsLoading(true)
    try {
      // Double-check token before making request
      const currentToken = localStorage.getItem('token')
      if (!currentToken) {
        toast.error('You must be logged in to run the booking test. Please log in and try again.', {
          duration: 5000
        })
        setIsLoading(false)
        return
      }
      
      console.log('[BookingTest] Creating booking with token present:', !!currentToken)
      const response = await bookingTestApi.createBooking(bookingData)
      setTestResults(response)
      setCurrentStep('modify')
      toast.success('Booking created successfully!')
      window.dispatchEvent(new Event('booking:updated'))
    } catch (error: any) {
      console.error('[BookingTest] Failed to create booking:', error)
      console.error('[BookingTest] Error details:', {
        status: error.response?.status,
        statusText: error.status,
        message: error.message,
        response: error.response
      })
      
      // Extract error details
      const errorData = error.response?.data || error.response || {}
      const errorCode = errorData.error
      const errorMessage = errorData.message || error.message || 'Failed to create booking'
      const errorDetails = errorData.details
      const errorHint = errorData.hint
      const errorExample = errorData.example
      
      // Handle authentication errors specifically - but DON'T clear token or redirect
      if (error.response?.status === 401 || errorCode === 'AUTH_ERROR') {
        // Check if token still exists
        const tokenAfterError = localStorage.getItem('token')
        if (!tokenAfterError) {
          toast.error('Your session has expired. Please log in again.', {
            duration: 5000
          })
          // Only navigate to login if token was actually cleared
          setTimeout(() => {
            window.location.href = '/login'
          }, 2000)
        } else {
          toast.error('Authentication failed. Please check your credentials and try again.', {
            duration: 5000
          })
        }
        setIsLoading(false)
        return
      }
      
      // Show user-friendly error messages
      if (errorCode === 'SCHEMA_ERROR' && errorMessage.includes('Idempotency-Key')) {
        toast.error('Missing Idempotency-Key header. This is required for booking operations.', {
          duration: 5000
        })
        console.error('Error details:', {
          message: errorMessage,
          details: errorDetails,
          hint: errorHint,
          example: errorExample
        })
      } else if (error.response?.status === 400) {
        toast.error(errorMessage || 'Invalid request. Please check your input and try again.', {
          duration: 5000
        })
      } else if (error.response?.status >= 500) {
        toast.error('Server error. Please try again later or contact support.', {
          duration: 5000
        })
      } else {
        toast.error(errorMessage || 'Failed to create booking. Please try again.', {
          duration: 5000
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleModifyBooking = async () => {
    setIsLoading(true)
    try {
      const response = await bookingTestApi.modifyBooking(bookingData.agent_booking_ref, {
        source_id: bookingData.source_id
      })
      setTestResults(response)
      setCurrentStep('cancel')
      toast.success('Booking modified successfully!')
      window.dispatchEvent(new Event('booking:updated'))
    } catch (error: any) {
      console.error('Failed to modify booking:', error)
      
      const errorData = error.response?.data || error.response || {}
      const errorCode = errorData.error
      const errorMessage = errorData.message || error.message || 'Failed to modify booking'
      
      if (errorCode === 'SCHEMA_ERROR' && errorMessage.includes('Idempotency-Key')) {
        toast.error('Missing Idempotency-Key header. This is required for booking operations.', {
          duration: 5000
        })
      } else if (error.response?.status === 400) {
        toast.error(errorMessage || 'Invalid request. Please check your input and try again.', {
          duration: 5000
        })
      } else if (error.response?.status >= 500) {
        toast.error('Server error. Please try again later or contact support.', {
          duration: 5000
        })
      } else {
        toast.error(errorMessage || 'Failed to modify booking. Please try again.', {
          duration: 5000
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelBooking = async () => {
    setIsLoading(true)
    try {
      const response = await bookingTestApi.cancelBooking(bookingData.agent_booking_ref, {
        source_id: bookingData.source_id
      })
      setTestResults(response)
      setCurrentStep('completed')
      setAllTestsPassed(true)
      toast.success('All booking tests completed successfully!')
      window.dispatchEvent(new Event('booking:updated'))
      
      // Notify parent component that test is completed
      if (onTestCompleted) {
        onTestCompleted()
      }
    } catch (error: any) {
      console.error('Failed to cancel booking:', error)
      
      const errorData = error.response?.data || error.response || {}
      const errorCode = errorData.error
      const errorMessage = errorData.message || error.message || 'Failed to cancel booking'
      
      if (errorCode === 'SCHEMA_ERROR' && errorMessage.includes('Idempotency-Key')) {
        toast.error('Missing Idempotency-Key header. This is required for booking operations.', {
          duration: 5000
        })
      } else if (error.response?.status === 400) {
        toast.error(errorMessage || 'Invalid request. Please check your input and try again.', {
          duration: 5000
        })
      } else if (error.response?.status >= 500) {
        toast.error('Server error. Please try again later or contact support.', {
          duration: 5000
        })
      } else {
        toast.error(errorMessage || 'Failed to cancel booking. Please try again.', {
          duration: 5000
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const resetTest = () => {
    setCurrentStep('create')
    setBookingData({
      source_id: '',
      agreement_ref: '',
      agent_booking_ref: ''
    })
    setTestResults(null)
    setAllTestsPassed(false)
    
    // Clear the completed status in localStorage
    localStorage.removeItem('bookingTestCompleted')
  }

  return (
    <Card className="mb-8 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-xl">
        <CardTitle className="text-white">Booking Test</CardTitle>
        <p className="text-purple-100 text-sm mt-1">
          Test booking creation, modification, and cancellation
        </p>
      </CardHeader>
      <CardContent className="p-6">
        {allTestsPassed ? (
          <div className="text-center py-12">
            <div className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl shadow-xl">
              <div className="mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="text-green-900">
                <h4 className="font-bold text-2xl mb-3">🎉 All Tests Passed!</h4>
                <p className="text-base font-medium mb-4">
                  You have successfully completed all booking integration tests:
                </p>
                <div className="bg-white rounded-xl p-4 mb-4 shadow-md">
                  <ul className="text-sm space-y-2 text-left">
                    <li className="flex items-center gap-2">
                      <span className="text-green-600 font-bold">✅</span>
                      <span className="font-semibold">Create Booking</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600 font-bold">✅</span>
                      <span className="font-semibold">Modify Booking</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600 font-bold">✅</span>
                      <span className="font-semibold">Cancel Booking</span>
                    </li>
                  </ul>
                </div>
                <p className="text-sm font-semibold text-green-700">
                  Your booking integration is working correctly!
                </p>
              </div>
            </div>
            <Button onClick={resetTest} variant="secondary" className="mt-6 shadow-md" size="lg">
              Run Test Again
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Test Form */}
            {currentStep === 'create' && (
              <div className="space-y-6 bg-white p-6 rounded-xl border-2 border-purple-200 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                    1
                  </div>
                  <h4 className="font-bold text-xl text-gray-900">Step 1: Create Booking</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Source ID"
                    placeholder="cmgjg61ts0005forqadmbmoig"
                    value={bookingData.source_id}
                    onChange={(e) => handleInputChange('source_id', e.target.value)}
                  />
                  <Input
                    label="Agreement Reference"
                    placeholder="AG-2025-736"
                    value={bookingData.agreement_ref}
                    onChange={(e) => handleInputChange('agreement_ref', e.target.value)}
                  />
                  <Input
                    label="Agent Booking Reference"
                    placeholder="AGENT-ORDER-123"
                    value={bookingData.agent_booking_ref}
                    onChange={(e) => handleInputChange('agent_booking_ref', e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleCreateBooking}
                  loading={isLoading}
                  className="w-full h-12 text-base font-semibold shadow-md hover:shadow-lg"
                >
                  Create Test Booking
                </Button>
              </div>
            )}

            {/* Modify Step */}
            {currentStep === 'modify' && (
              <div className="space-y-6 bg-white p-6 rounded-xl border-2 border-purple-200 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                    2
                  </div>
                  <h4 className="font-bold text-xl text-gray-900">Step 2: Modify Booking</h4>
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-800">
                    ✅ Booking created successfully. Now let's test the modify functionality.
                  </p>
                </div>
                <Button
                  onClick={handleModifyBooking}
                  loading={isLoading}
                  className="w-full h-12 text-base font-semibold shadow-md hover:shadow-lg"
                >
                  Modify Booking
                </Button>
              </div>
            )}

            {/* Cancel Step */}
            {currentStep === 'cancel' && (
              <div className="space-y-6 bg-white p-6 rounded-xl border-2 border-purple-200 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                    3
                  </div>
                  <h4 className="font-bold text-xl text-gray-900">Step 3: Cancel Booking</h4>
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-800">
                    ✅ Booking modified successfully. Now let's test the cancel functionality.
                  </p>
                </div>
                <Button
                  onClick={handleCancelBooking}
                  loading={isLoading}
                  className="w-full h-12 text-base font-semibold shadow-md hover:shadow-lg"
                >
                  Cancel Booking
                </Button>
              </div>
            )}

            {/* Test Results */}
            {testResults && (
              <Card className="mt-6 border border-gray-200">
                <CardContent className="p-6">
                  <h5 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Test Results
                  </h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Booking ID:</span>
                    <span className="font-mono">{testResults.booking_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge variant="info">{testResults.status}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Test Mode:</span>
                    <Badge variant={testResults.test_mode ? 'success' : 'warning'}>
                      {testResults.test_mode ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="mt-3">
                    <span className="text-gray-600">Verification Status:</span>
                    <div className="mt-1 space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={testResults.verification.create ? 'text-green-600' : 'text-red-600'}>
                          {testResults.verification.create ? '✅' : '❌'}
                        </span>
                        <span>Create: {testResults.verification.create ? 'Passed' : 'Failed'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={testResults.verification.modify ? 'text-green-600' : 'text-red-600'}>
                          {testResults.verification.modify ? '✅' : '❌'}
                        </span>
                        <span>Modify: {testResults.verification.modify ? 'Passed' : 'Failed'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={testResults.verification.cancel ? 'text-green-600' : 'text-red-600'}>
                          {testResults.verification.cancel ? '✅' : '❌'}
                        </span>
                        <span>Cancel: {testResults.verification.cancel ? 'Passed' : 'Failed'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={testResults.verification.check ? 'text-green-600' : 'text-red-600'}>
                          {testResults.verification.check ? '✅' : '❌'}
                        </span>
                        <span>Check: {testResults.verification.check ? 'Passed' : 'Failed'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-white border border-gray-200 rounded-md">
                    <p className="text-sm font-semibold text-gray-900">{testResults.message}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
