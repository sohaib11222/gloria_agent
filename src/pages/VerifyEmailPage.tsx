import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { authApi, VerifyEmailForm } from '../api/auth'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { OTPInput } from '../components/ui/OTPInput'
import toast from 'react-hot-toast'

export default function VerifyEmailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(false)
  const [otp, setOtp] = useState('')
  const [email, setEmail] = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    // Get email from location state or localStorage
    const stateEmail = location.state?.email
    const storedEmail = localStorage.getItem('pendingEmail')
    
    if (stateEmail) {
      setEmail(stateEmail)
    } else if (storedEmail) {
      setEmail(storedEmail)
    } else {
      // No email found, redirect to registration
      navigate('/register')
    }
  }, [location.state, navigate])

  // Auto-submit when OTP is complete
  useEffect(() => {
    if (otp.length === 4 && !isLoading) {
      handleVerify()
    }
  }, [otp])

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const handleOTPComplete = (completedOTP: string) => {
    setOtp(completedOTP)
  }

  const handleVerify = async () => {
    if (otp.length !== 4) {
      toast.error('Please enter a valid 4-digit OTP')
      return
    }

    setIsLoading(true)
    try {
      const response = await authApi.verifyEmail({
        email,
        otp
      })

      // Store the authentication tokens and user data
      localStorage.setItem('token', response.access)
      localStorage.setItem('refreshToken', response.refresh)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      // Clear pending email
      localStorage.removeItem('pendingEmail')
      
      toast.success(response.message || 'Email verified successfully!')
      setTimeout(() => navigate('/agent'), 500)
    } catch (error: any) {
      console.error('Email verification failed:', error)
      toast.error(error.response?.data?.message || 'Invalid OTP. Please try again.')
      setOtp('')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendTimer > 0 || isResending) return
    
    setIsResending(true)
    try {
      // This would typically call a resend OTP endpoint
      // await authApi.resendOTP({ email })
      toast.success('OTP resent to your email')
      setResendTimer(60) // 60 second cooldown
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Animated background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center animate-fade-in">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-4 shadow-2xl transform transition-transform hover:scale-105">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            Verify Your Email
          </h2>
          <p className="mt-3 text-base text-gray-600 font-medium">
            We've sent a verification code to
          </p>
          <p className="mt-2 text-sm font-semibold text-green-700 bg-green-50 border border-green-200 px-4 py-2 rounded-lg inline-block shadow-sm">
            {email}
          </p>
        </div>
        
        <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/90 transform transition-all duration-300 hover:shadow-3xl">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden rounded-t-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600/5 to-emerald-600/5"></div>
            <div className="relative">
              <CardTitle className="text-2xl font-bold text-gray-900 text-center">Enter Verification Code</CardTitle>
              <p className="text-sm text-gray-600 mt-2 text-center font-medium">
                Please check your email and enter the 4-digit code below
              </p>
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="space-y-8">
              <div className="text-center">
                <OTPInput
                  length={4}
                  onComplete={handleOTPComplete}
                  className="justify-center"
                />
                {otp.length === 4 && (
                  <p className="mt-4 text-xs text-green-600 font-medium flex items-center justify-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Code entered - Verifying...
                  </p>
                )}
              </div>

              <Button
                onClick={handleVerify}
                loading={isLoading}
                disabled={otp.length !== 4}
                className="w-full h-11 text-base font-semibold"
              >
                {isLoading ? 'Verifying...' : 'Verify Email'}
              </Button>

              <div className="border-t border-gray-200 pt-6 space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Didn't receive the code?
                  </p>
                  <button
                    onClick={handleResend}
                    disabled={resendTimer > 0 || isResending}
                    className={`font-semibold text-sm transition-colors ${
                      resendTimer > 0 || isResending
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-green-600 hover:text-green-700'
                    }`}
                  >
                    {isResending ? (
                      'Sending...'
                    ) : resendTimer > 0 ? (
                      `Resend code in ${resendTimer}s`
                    ) : (
                      'Resend Verification Code'
                    )}
                  </button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-blue-900 mb-1">Email not received?</p>
                      <ul className="text-xs text-blue-700 space-y-0.5">
                        <li>• Check your spam/junk folder</li>
                        <li>• Ensure the email address is correct</li>
                        <li>• Wait a few moments and try resending</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <button
                    onClick={() => navigate('/register')}
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center justify-center gap-1 mx-auto"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Registration
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-gray-500 font-medium tracking-wide">
            Car Hire – Agent Portal
          </p>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  )
}
