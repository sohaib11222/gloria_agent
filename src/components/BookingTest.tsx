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

    setIsLoading(true)
    try {
      const response = await bookingTestApi.createBooking(bookingData)
      setTestResults(response)
      setCurrentStep('modify')
      toast.success('Booking created successfully!')
      window.dispatchEvent(new Event('booking:updated'))
    } catch (error: any) {
      console.error('Failed to create booking:', error)
      toast.error(error.response?.data?.message || error.message || 'Failed to create booking')
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
      toast.error(error.response?.data?.message || error.message || 'Failed to modify booking')
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
      toast.error(error.response?.data?.message || error.message || 'Failed to cancel booking')
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
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Booking Test</CardTitle>
        <p className="text-sm text-gray-600">
          Test booking creation, modification, and cancellation
        </p>
      </CardHeader>
      <CardContent>
        {allTestsPassed ? (
          <div className="text-center py-8">
            <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-green-800">
                <h4 className="font-medium text-lg mb-2">🎉 All Tests Passed!</h4>
                <p className="text-sm">
                  You have successfully completed all booking integration tests:
                </p>
                <ul className="text-sm mt-2 space-y-1">
                  <li>✅ Create Booking</li>
                  <li>✅ Modify Booking</li>
                  <li>✅ Cancel Booking</li>
                </ul>
                <p className="text-xs mt-3 text-green-600">
                  Your booking integration is working correctly!
                </p>
              </div>
            </div>
            <Button onClick={resetTest} variant="secondary" className="mt-4">
              Run Test Again
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Test Form */}
            {currentStep === 'create' && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Step 1: Create Booking</h4>
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
                  className="w-full"
                >
                  Create Test Booking
                </Button>
              </div>
            )}

            {/* Modify Step */}
            {currentStep === 'modify' && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Step 2: Modify Booking</h4>
                <p className="text-sm text-gray-600">
                  Booking created successfully. Now let's test the modify functionality.
                </p>
                <Button
                  onClick={handleModifyBooking}
                  loading={isLoading}
                  className="w-full"
                >
                  Modify Booking
                </Button>
              </div>
            )}

            {/* Cancel Step */}
            {currentStep === 'cancel' && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Step 3: Cancel Booking</h4>
                <p className="text-sm text-gray-600">
                  Booking modified successfully. Now let's test the cancel functionality.
                </p>
                <Button
                  onClick={handleCancelBooking}
                  loading={isLoading}
                  className="w-full"
                >
                  Cancel Booking
                </Button>
              </div>
            )}

            {/* Test Results */}
            {testResults && (
              <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-3">Test Results</h5>
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
                  <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm text-blue-800">{testResults.message}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
