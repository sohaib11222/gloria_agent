import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { authApi } from '../api/auth'
import { LoginForm, LoginSchema } from '../lib/validators'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import toast from 'react-hot-toast'
import logoImage from '../assets/logo.jpg'

export default function LoginPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(LoginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    
    try {
      // Check if user is already authenticated
      const existingToken = localStorage.getItem('token')
      const existingUser = localStorage.getItem('user')
      
      if (existingToken && existingUser) {
        // Check if existing user is an agent
        const userData = JSON.parse(existingUser)
        if (userData.company.type === 'AGENT') {
          console.log('Using existing authentication')
          navigate('/agent')
          return
        } else {
          // Clear invalid data if not an agent
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
          toast.error('Access denied. Only Agent accounts are allowed.')
          return
        }
      }

      // Make authentication API call
      console.log('Login attempt:', data.email)
      const response = await authApi.login(data)
      console.log('Login response:', response)
      
      // Store the authentication tokens and user data
      localStorage.setItem('token', response.access)
      localStorage.setItem('refreshToken', response.refresh)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      // Check if user type is AGENT
      if (response.user.company.type === 'AGENT') {
        // Check approval status
        if (response.user.company.approvalStatus !== 'APPROVED') {
          // Clear stored data if not approved
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
          
          if (response.user.company.approvalStatus === 'PENDING') {
            toast.error('Your account is pending admin approval. Please wait for approval.')
          } else if (response.user.company.approvalStatus === 'REJECTED') {
            toast.error('Your account has been rejected. Please contact support.')
          } else {
            toast.error('Your account is not approved. Please contact support.')
          }
          return
        }

        // Check if account is active
        if (response.user.company.status !== 'ACTIVE') {
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
          toast.error('Your account is not active. Please contact support.')
          return
        }

        toast.success('Login successful!')
        navigate('/agent')
      } else {
        // Clear stored data if not an agent
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        toast.error('Access denied. Only Agent accounts are allowed.')
      }
    } catch (error: any) {
      console.error('Login failed:', error)
      console.log('Login error structure:', {
        error,
        response: error.response,
        responseData: error.response?.data,
        message: error.message,
        code: error.code
      })
      
      // Extract error code and message from various possible locations
      // Priority: response.data.error > response.error > code
      const errorCode = error.response?.data?.error || 
                       error.response?.error || 
                       error.code ||
                       error.response?.data?.code
      
      // Priority: response.data.message > response.message > message
      // But skip generic HTTP status messages like "HTTP 403: Forbidden"
      let errorMessage = error.response?.data?.message || 
                        error.response?.message || 
                        error.message || 
                        'Login failed. Please check your credentials.'
      
      // Check if errorMessage is a generic HTTP status message (e.g., "HTTP 403: Forbidden")
      // If so, try to get the actual message from response.data
      if (errorMessage.startsWith('HTTP ') && errorMessage.includes(':')) {
        errorMessage = error.response?.data?.message || 
                      error.response?.data?.error || 
                      error.response?.message ||
                      'Login failed. Please check your credentials.'
      }
      
      console.log('Extracted error info:', {
        errorCode,
        errorMessage,
        finalMessage: errorMessage
      })
      
      // Always show the proper error message from the backend
      if (errorCode === 'NOT_APPROVED') {
        toast.error(errorMessage)
      } else if (errorCode === 'ACCOUNT_NOT_ACTIVE') {
        toast.error(errorMessage)
      } else if (errorCode === 'EMAIL_NOT_VERIFIED') {
        toast.error(errorMessage)
      } else {
        // For any other error, show the message (which should be from backend)
        toast.error(errorMessage)
      }
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
            Agent Portal
          </h2>
          <p className="text-sm text-gray-600">
            Sign in to access your agent dashboard
          </p>
        </div>
        
        <Card className="border border-gray-200">
          <CardHeader className="border-b border-gray-200 bg-white">
            <CardTitle className="text-xl font-semibold text-gray-900">Welcome back</CardTitle>
            <p className="text-sm text-gray-600 mt-1">Enter your credentials to continue</p>
          </CardHeader>
          <CardContent className="pt-6 pb-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Input
                  label="Email Address"
                  type="email"
                  autoComplete="email"
                  placeholder="agent@example.com"
                  error={errors.email?.message}
                  {...register('email')}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-xs text-slate-700 hover:text-slate-800 transition-colors underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <Input
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  error={errors.password?.message}
                  {...register('password')}
                />
              </div>
              
              <Button
                type="submit"
                loading={isLoading}
                className="w-full"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={() => navigate('/register')}
                  className="font-medium text-slate-700 hover:text-slate-800"
                >
                  Register
                </button>
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <p className="text-xs">
                  Connect to car rental suppliers through our platform
                </p>
              </div>
            </div>
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
