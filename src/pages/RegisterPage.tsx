import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { RegisterSchema, RegisterForm } from '../lib/validators'
import { authApi } from '../api/auth'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import toast from 'react-hot-toast'
import logoImage from '../assets/logo.jpg'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(RegisterSchema),
  })

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true)
    try {
      await authApi.register(data)
      
      // Store email for OTP verification
      localStorage.setItem('pendingEmail', data.email)
      
      toast.success('Registration successful! Please check your email for verification code. After verification, your account will be pending admin approval.')
      navigate('/verify-email', { state: { email: data.email } })
    } catch (error: any) {
      console.error('Registration error:', error)
      console.error('Full error object:', JSON.stringify(error, null, 2))
      console.error('Error structure:', {
        message: error.message,
        'response': error.response,
        'response.data': error.response?.data,
        'response.message': error.response?.message,
        'response.data.message': error.response?.data?.message,
        'details': error.details,
        'status': error.status
      })
      
      // Extract error message - prioritize API message over HTTP status text
      // Check multiple possible locations for the error message
      let errorMessage = 'Registration failed'
      
      // Priority order: 
      // 1. response.data.message (axios-like format from API wrapper)
      // 2. response.message (direct from HTTP client)
      // 3. message (if not HTTP status text)
      // 4. details.message (from SDKError details)
      
      if (error.response?.data?.message) {
        errorMessage = String(error.response.data.message)
      } else if (error.response?.message) {
        errorMessage = String(error.response.message)
      } else if (error.details?.message) {
        errorMessage = String(error.details.message)
      } else if (error.message) {
        const msg = String(error.message)
        // Only use error.message if it's not the generic HTTP status message
        if (!msg.startsWith('HTTP ') && !msg.includes('Conflict') && !msg.includes('409')) {
          errorMessage = msg
        }
      }
      
      // Final fallback: check if response.data exists and has message
      if (errorMessage === 'Registration failed' && error.response?.data) {
        const data = error.response.data
        if (typeof data === 'object' && data.message) {
          errorMessage = String(data.message)
        }
      }
      
      console.log('Final extracted error message:', errorMessage)
      
      // Only show toast, don't set error state (removed error UI)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <img 
              src={logoImage} 
              alt="Gloria Connect" 
              className="h-16 w-auto object-contain"
            />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-1">
            Create Agent Account
          </h2>
          <p className="text-sm text-gray-600">
            Join as a booking platform
          </p>
        </div>
        
        <Card className="border border-gray-200">
          <CardHeader className="border-b border-gray-200 bg-white">
            <CardTitle className="text-xl font-semibold text-gray-900">Get started</CardTitle>
            <p className="text-sm text-gray-600 mt-1">Enter your details to create an account</p>
          </CardHeader>
          <CardContent className="pt-6 pb-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Input
                  label="Company Name"
                  placeholder="Your company name"
                  {...register('companyName')}
                  error={errors.companyName?.message}
                />
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <Input
                  label="Account Type"
                  value="AGENT"
                  disabled
                  className="cursor-not-allowed bg-white"
                />
                <div className="flex items-center mt-2 gap-1">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs font-medium text-gray-700">
                    Agent registration only
                  </p>
                </div>
              </div>
              <input type="hidden" {...register('type')} value="AGENT" />

              <div className="space-y-2">
                <Input
                  label="Email"
                  type="email"
                  placeholder="company@example.com"
                  {...register('email')}
                  error={errors.email?.message}
                />
              </div>

              <div className="space-y-2">
                <Input
                  label="Password"
                  type="password"
                  placeholder="Create a secure password"
                  {...register('password')}
                  error={errors.password?.message}
                />
              </div>

              <Button
                type="submit"
                loading={isLoading}
                className="w-full"
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="font-medium text-slate-700 hover:text-slate-800"
                >
                  Sign in
                </button>
              </p>
            </div>

            {/* <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-700 text-center">What you'll get:</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: '🔍', text: 'Search availability' },
                    { icon: '📅', text: 'Create bookings' },
                    { icon: '📊', text: 'View history' },
                    { icon: '🔌', text: 'API access' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded-md p-2">
                      <span className="text-base">{item.icon}</span>
                      <span className="text-xs text-gray-700">{item.text}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-xs text-yellow-800 text-center">
                    <strong>Note:</strong> After email verification, your account will require admin approval before you can access the dashboard.
                  </p>
                </div>
              </div>
            </div> */}
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Gloria Connect – Agent Portal
          </p>
        </div>
      </div>
    </div>
  )
}
