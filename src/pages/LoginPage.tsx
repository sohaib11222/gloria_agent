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
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            Agent Portal
          </h2>
          <p className="mt-2 text-base text-gray-600 font-medium">
            Sign in to access your agent dashboard
          </p>
        </div>
        
        <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/90 transform transition-all duration-300 hover:shadow-3xl">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600/5 to-emerald-600/5"></div>
            <div className="relative">
              <CardTitle className="text-2xl font-bold text-gray-900">Welcome back</CardTitle>
              <p className="text-sm text-gray-600 mt-2 font-medium">Enter your credentials to continue</p>
            </div>
          </CardHeader>
          <CardContent className="pt-8 pb-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Input
                  label="Email Address"
                  type="email"
                  autoComplete="email"
                  placeholder="agent@example.com"
                  error={errors.email?.message}
                  {...register('email')}
                  className="transition-all duration-300 focus:scale-[1.02] focus:shadow-lg"
                />
              </div>
              
              <div className="space-y-2">
                <Input
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  error={errors.password?.message}
                  {...register('password')}
                  className="transition-all duration-300 focus:scale-[1.02] focus:shadow-lg"
                />
              </div>
              
              <Button
                type="submit"
                loading={isLoading}
                className="w-full mt-4 h-12 text-base font-semibold shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={() => navigate('/register')}
                  className="font-semibold text-green-600 hover:text-green-500 transition-colors duration-200 hover:underline"
                >
                  Register
                </button>
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center space-x-2 text-gray-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <p className="text-xs font-medium">
                  Connect to car rental suppliers through our platform
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-gray-500 font-medium tracking-wide">
            Gloria Connect – Agent Portal
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
