/**
 * SDK Client wrapper for frontend integration
 * Handles token management, error handling, and provides axios-like interface
 * Uses HttpClient instead of external SDK
 */

import toast from 'react-hot-toast'
import { HttpClient } from '../api/http'
import { API_BASE_URL } from './apiConfig'

// SDK Error class to match SDK interface
export class SDKError extends Error {
  constructor(
    public message: string,
    public status: number,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'SDKError'
  }
}

// Token management
let currentToken: string | null = null

// Initialize token from localStorage if available
const initializeToken = () => {
  const token = localStorage.getItem('token')
  if (token) {
    currentToken = token
  }
}
initializeToken()

// Create HTTP client instance with token getter
const httpClient = new HttpClient(API_BASE_URL)

// SDK Client implementation
class CarHireSDKClient {
  private http: HttpClient

  constructor() {
    this.http = httpClient
  }

  setToken(token: string) {
    currentToken = token
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
      currentToken = null
    }
  }

  getToken(): string | null {
    // Always check localStorage first in case token was updated elsewhere
    const storedToken = localStorage.getItem('token')
    if (storedToken && storedToken !== currentToken) {
      currentToken = storedToken
    }
    return currentToken || storedToken
  }

  // Auth methods
  auth = {
    login: async (email: string, password: string) => {
      try {
        const response = await this.http.post<{
          access: string
          refresh: string
          user: any
        }>('/auth/login', { email, password })
        return response
      } catch (error: any) {
        // HttpClient sets error.response to the errorData object directly (not error.response.data)
        // It also sets error.message = errorData.message if it exists, otherwise "HTTP 403: Forbidden"
        // Priority: error.response.message > error.message (but only if error.message is not generic HTTP status)
        const rawMessage = error.response?.message || error.message || 'Login failed'
        // Check if error.message is a generic HTTP status message (e.g., "HTTP 403: Forbidden")
        const isGenericHttpMessage = rawMessage.startsWith('HTTP ') && rawMessage.includes(':')
        const errorMessage = isGenericHttpMessage 
          ? (error.response?.message || 'Login failed')
          : rawMessage
        
        const errorCode = error.response?.error || 
                         error.response?.code ||
                         'LOGIN_ERROR'
        const status = error.status || 500
        
        // Preserve the original error response data for proper error handling
        // Include all fields from error.response (which is the errorData object)
        const errorDetails = error.response || {}
        
        // Log for debugging
        console.log('[SDK auth.login] Error details:', {
          errorMessage,
          errorCode,
          status,
          errorResponse: error.response,
          errorMessageRaw: error.message,
          errorDetails
        })
        
        throw new SDKError(
          errorMessage,
          status,
          errorCode,
          { ...errorDetails, originalError: error }
        )
      }
    },

    register: async (data: {
      companyName: string
      type: string
      email: string
      password: string
    }) => {
      try {
        const response = await this.http.post<{
          access?: string
          refresh?: string
          user?: any
          message?: string
        }>('/auth/register', data)
        return response
      } catch (error: any) {
        // HttpClient sets error.response to the errorData object directly (not error.response.data)
        // It also sets error.message = errorData.message if it exists
        // So we need to check error.response.message or error.message
        // IMPORTANT: Prioritize error.response.message over error.message to avoid HTTP status text
        let errorMessage = 'Registration failed'
        let errorCode = 'REGISTER_ERROR'
        
        // First check error.response (the errorData object from backend)
        if (error.response) {
          if (error.response.message) {
            errorMessage = String(error.response.message)
          }
          if (error.response.error) {
            errorCode = String(error.response.error)
          }
        }
        
        // Fallback to error.message only if it's not HTTP status text
        if (errorMessage === 'Registration failed' && error.message) {
          const msg = String(error.message)
          if (!msg.startsWith('HTTP ') && !msg.includes('Conflict') && !msg.includes('409')) {
            errorMessage = msg
          }
        }
        
        const status = error.status || 500
        
        // Preserve the original error response data for proper error handling
        // Include all fields from error.response (which is the errorData object)
        const errorDetails = error.response || {}
        
        console.log('[SDK register] Error details:', {
          errorMessage,
          errorCode,
          status,
          'error.response': error.response,
          'error.message': error.message
        })
        
        throw new SDKError(
          errorMessage,
          status,
          errorCode,
          { ...errorDetails, originalError: error }
        )
      }
    },

    verifyEmail: async (email: string, otp: string) => {
      try {
        const response = await this.http.post<{
          access: string
          refresh: string
          user: any
          message: string
        }>('/auth/verify-email', { email, otp })
        return response
      } catch (error: any) {
        throw new SDKError(
          error.message || 'Email verification failed',
          error.status || 500,
          'VERIFY_EMAIL_ERROR',
          error
        )
      }
    },
  }

  // Agreements methods
  agreements = {
    list: async (params?: { status?: string }) => {
      try {
        const queryParams = params?.status ? `?status=${params.status}` : ''
        const response = await this.http.get<{
          items: Array<{
            id: string
            agentId: string
            sourceId: string
            agreementRef: string
            status: string
            validFrom: string
            validTo: string
          }>
        }>(`/agreements${queryParams}`)
        return response
      } catch (error: any) {
        throw new SDKError(
          error.message || 'Failed to list agreements',
          error.status || 500,
          'LIST_AGREEMENTS_ERROR',
          error
        )
      }
    },

    accept: async (agreementId: string) => {
      try {
        const response = await this.http.post<{
          id: string
          agentId: string
          sourceId: string
          agreementRef: string
          status: string
          validFrom: string
          validTo: string
        }>(`/agreements/${agreementId}/accept`)
        return response
      } catch (error: any) {
        throw new SDKError(
          error.message || 'Failed to accept agreement',
          error.status || 500,
          'ACCEPT_AGREEMENT_ERROR',
          error
        )
      }
    },
  }

  // Get HTTP client for custom requests
  getHttpClient(): HttpClient {
    return this.http
  }
}

// Create SDK client instance
const sdkClient = new CarHireSDKClient()

// Create a helper to get HTTP client
const createHttpClient = () => {
  // Ensure token is synced before making requests
  const token = sdkClient.getToken()
  if (token && currentToken !== token) {
    currentToken = token
  }
  return sdkClient.getHttpClient()
}

// Helper to handle SDK errors and convert to axios-like format
function handleError(error: unknown): never {
  if (error instanceof SDKError) {
    // Only redirect to login for actual authentication errors (401)
    // Don't redirect for validation errors or other client errors
    const basePath = import.meta.env.PROD ? '/agent' : ''
    const loginPath = `${basePath}/login`
    const currentPath = window.location.pathname
    
    if (error.status === 401 && 
        error.code !== 'SCHEMA_ERROR' && 
        error.code !== 'VALIDATION_ERROR' &&
        !currentPath.endsWith('/login') && !currentPath.endsWith('/login/')) {
      // Check if token still exists - if not, definitely redirect
      const token = localStorage.getItem('token')
      if (!token || error.code === 'AUTH_ERROR') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = loginPath
        return // Don't show toast or throw if redirecting
      }
      // If token exists but we got 401, might be expired - let component handle it
    }
    
    // Don't show toast for errors that will be handled by the component
    // Only show toast for unexpected errors (not 400, 401, 403, or 409)
    // 403 and 409 errors should be handled by components to show proper messages
    if (error.status !== 400 && error.status !== 401 && error.status !== 403 && error.status !== 409) {
      const message = error.message || 'An error occurred'
      toast.error(message)
    }
    
    // Convert SDKError to axios-like error format
    // Preserve the original error message and include error code
    // Prioritize details.message over error.message (which might be HTTP status text)
    const errorCode = error.code || error.details?.error
    const errorMessage = error.details?.message || error.message || 'An error occurred'
    const axiosError = new Error(errorMessage) as any
    axiosError.response = {
      status: error.status,
      statusText: errorCode || 'Error',
      data: {
        error: errorCode,
        message: errorMessage,
        code: errorCode,
        // Include all fields from details (which contains the original error response)
        ...(error.details && typeof error.details === 'object' ? error.details : {}),
      },
    }
    axiosError.status = error.status
    throw axiosError
  }
  
  // Handle other errors - check if it's an HttpError with status
  if (error instanceof Error && 'status' in error) {
    const httpError = error as any
    const basePath = import.meta.env.PROD ? '/agent' : ''
    const loginPath = `${basePath}/login`
    const currentPath = window.location.pathname
    
    // Don't auto-redirect for booking endpoints - let components handle the error
    // Check multiple ways the error might be marked as a booking error
    const isBookingError = httpError.isBookingError === true ||
                           httpError.endpoint?.includes('/bookings') ||
                           httpError.response?.config?.url?.includes('/bookings') ||
                           httpError.message?.includes('/bookings') ||
                           (httpError as any).url?.includes('/bookings')
    
    if (isBookingError) {
      console.log('[handleError] Booking error detected - NOT redirecting:', {
        isBookingError: httpError.isBookingError,
        endpoint: httpError.endpoint,
        status: httpError.status
      })
      // Just throw the error - don't redirect or clear token
      throw error
    }
    
    // Only redirect on 401, and only if not already on login page, and not a booking endpoint
    // NEVER redirect for booking endpoints - always let component handle the error
    if (httpError.status === 401 && 
        !currentPath.endsWith('/login') && 
        !currentPath.endsWith('/login/') &&
        !isBookingError) {
      const currentToken = localStorage.getItem('token')
      if (!currentToken || httpError.response?.data?.error === 'AUTH_ERROR') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('refreshToken')
        window.location.href = loginPath
        return
      }
      // If token exists, don't redirect - let the component handle the error
    }
    
    // For booking errors, never redirect - just throw
    if (isBookingError && httpError.status === 401) {
      console.log('[handleError] Booking 401 error - NOT redirecting, throwing error for component to handle')
      throw error
    }
    
    // Don't show toast for client errors (400-499) - let components handle them
    if (httpError.status < 400 || httpError.status >= 500) {
      const message = httpError.message || 'An error occurred'
      toast.error(message)
    }
  } else {
    // For unknown errors, show toast
    const message = error instanceof Error ? error.message : 'An error occurred'
    toast.error(message)
  }
  
  throw error
}

// Axios-like API wrapper
export const api = {
  get: async <T = any>(url: string, config?: any): Promise<{ data: T }> => {
    try {
      // Extract query params from config
      const query = config?.params || {}
      
      // For all endpoints, use SDK HTTP client
      const http = createHttpClient()
      // Build query string if query params exist
      const queryString = Object.keys(query).length > 0
        ? '?' + new URLSearchParams(query as Record<string, string>).toString()
        : ''
      const data = await http.get<T>(url + queryString)
      return { data }
    } catch (error) {
      handleError(error)
    }
  },

  post: async <T = any>(url: string, data?: any, config?: any): Promise<{ data: T }> => {
    try {
      // Use SDK methods for auth endpoints
      if (url === '/auth/login') {
        try {
          const response = await sdkClient.auth.login(data.email, data.password)
          // Update token
          sdkClient.setToken(response.access)
          localStorage.setItem('token', response.access)
          return { data: response as T }
        } catch (loginError: any) {
          // For login errors, convert SDKError to axios-like format and re-throw
          // Don't call handleError here - let the login page handle it
          if (loginError instanceof SDKError) {
            // Extract message and error code from details if available (preserves original backend response)
            // The details object contains the original error.response (which is the errorData from backend)
            // Priority: details.message > loginError.message (but only if loginError.message is not generic HTTP status)
            const rawMessage = loginError.details?.message || loginError.message
            const isGenericHttpMessage = rawMessage.startsWith('HTTP ') && rawMessage.includes(':')
            const errorMessage = isGenericHttpMessage 
              ? (loginError.details?.message || 'Login failed')
              : rawMessage
            const errorCode = loginError.details?.error || loginError.code || 'LOGIN_ERROR'
            
            console.log('[SDK api.post /auth/login] Converting SDKError to axios format:', {
              errorMessage,
              errorCode,
              status: loginError.status,
              details: loginError.details,
              originalMessage: loginError.message
            })
            
            const axiosError = new Error(errorMessage) as any
            axiosError.response = {
              status: loginError.status,
              statusText: errorCode || 'Error',
              data: {
                error: errorCode,
                message: errorMessage,
                // Include all fields from details (which contains the original error response from backend)
                ...(loginError.details && typeof loginError.details === 'object' ? loginError.details : {}),
              },
            }
            axiosError.status = loginError.status
            throw axiosError
          }
          throw loginError
        }
      }
      
      if (url === '/auth/register') {
        try {
          const response = await sdkClient.auth.register(data)
          return { data: response as T }
        } catch (registerError: any) {
          // For register errors, convert SDKError to axios-like format and re-throw
          // Don't call handleError here - let the register page handle it
          if (registerError instanceof SDKError) {
            // Extract message and error code from details if available (preserves original backend response)
            // The details object contains the original error.response (which is the errorData from backend)
            // IMPORTANT: Prioritize details.message over registerError.message
            let errorMessage = registerError.details?.message || registerError.message || 'Registration failed'
            let errorCode = registerError.details?.error || registerError.code || 'REGISTER_ERROR'
            
            // Ensure we don't use HTTP status text
            if (String(errorMessage).startsWith('HTTP ') || String(errorMessage).includes('Conflict')) {
              // If we got HTTP status text, try to get the real message from details
              errorMessage = registerError.details?.message || 'Registration failed'
            }
            
            console.log('[API wrapper register] Converting error:', {
              errorMessage,
              errorCode,
              'registerError.message': registerError.message,
              'registerError.details': registerError.details
            })
            
            const axiosError = new Error(String(errorMessage)) as any
            axiosError.response = {
              status: registerError.status,
              statusText: String(errorCode) || 'Error',
              data: {
                error: String(errorCode),
                message: String(errorMessage),
                // Include all fields from details (which contains the original error response from backend)
                ...(registerError.details && typeof registerError.details === 'object' ? registerError.details : {}),
              },
            }
            axiosError.status = registerError.status
            throw axiosError
          }
          throw registerError
        }
      }
      
      if (url === '/auth/verify-email') {
        const response = await sdkClient.auth.verifyEmail(data.email, data.otp)
        // Update token
        sdkClient.setToken(response.access)
        localStorage.setItem('token', response.access)
        return { data: response as T }
      }
      
      if (url === '/auth/logout') {
        // Clear token
        sdkClient.setToken('')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        return { data: { message: 'Logged out' } as T }
      }
      
      // For other endpoints, use SDK HTTP client with config (headers, etc.)
      // Note: We don't check token here - let the HTTP client handle it
      // This allows the HTTP client to add the token from localStorage even if SDK client's token is stale
      const http = createHttpClient()
      const response = await http.post<T>(url, data, config)
      return { data: response }
    } catch (error) {
      // For booking endpoints, don't use handleError which might redirect
      // Just throw the error so the component can handle it
      if (url.includes('/bookings')) {
        console.log('[api.post] Booking endpoint error - throwing directly without handleError:', url)
        throw error
      }
      handleError(error)
    }
  },

  put: async <T = any>(url: string, data?: any, config?: any): Promise<{ data: T }> => {
    try {
      const http = createHttpClient()
      const response = await http.put<T>(url, data)
      return { data: response }
    } catch (error) {
      handleError(error)
    }
  },

  patch: async <T = any>(url: string, data?: any, config?: any): Promise<{ data: T }> => {
    try {
      // Note: We don't check token here - let the HTTP client handle it
      // This allows the HTTP client to add the token from localStorage even if SDK client's token is stale
      const http = createHttpClient()
      const response = await http.patch<T>(url, data, config)
      return { data: response }
    } catch (error) {
      handleError(error)
    }
  },

  delete: async <T = any>(url: string, config?: any): Promise<{ data: T }> => {
    try {
      const http = createHttpClient()
      const response = await http.delete<T>(url)
      return { data: response }
    } catch (error) {
      handleError(error)
    }
  },
}

// Export SDK client for direct use if needed
export { sdkClient }
export default api

