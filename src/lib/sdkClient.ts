/**
 * SDK Client wrapper for frontend integration
 * Handles token management, error handling, and provides axios-like interface
 */

import { CarHireClient, SDKError, HttpClient } from '../../../sdk/typescript/src/index.js'
import toast from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_MIDDLEWARE_URL || 'http://localhost:8080'

// Create SDK client instance
const sdkClient = new CarHireClient({
  baseUrl: API_BASE_URL,
  retry: {
    enabled: true,
    retries: 3,
    baseMs: 300,
    factor: 2,
  },
})

// Create a separate HTTP client for custom endpoints not in SDK
// We'll access the SDK's internal HTTP client through a workaround
const createHttpClient = () => {
  // Access the private http property (TypeScript allows this at runtime)
  return (sdkClient as any).http as HttpClient
}

// Initialize token from localStorage if available
const token = localStorage.getItem('token')
if (token) {
  sdkClient.setToken(token)
}

// Helper to handle SDK errors and convert to axios-like format
function handleError(error: unknown): never {
  if (error instanceof SDKError) {
    // Handle 401 Unauthorized - redirect to login
    if (error.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    
    const message = error.message || 'An error occurred'
    toast.error(message)
    
    // Convert SDKError to axios-like error format
    const axiosError = new Error(message) as any
    axiosError.response = {
      status: error.status,
      statusText: error.code || 'Error',
      data: {
        message: error.message,
        code: error.code,
        details: error.details,
      },
    }
    axiosError.status = error.status
    throw axiosError
  }
  
  // Handle other errors
  const message = error instanceof Error ? error.message : 'An error occurred'
  toast.error(message)
  throw error
}

// Axios-like API wrapper
export const api = {
  get: async <T = any>(url: string, config?: any): Promise<{ data: T }> => {
    try {
      // Extract query params from config
      const query = config?.params || {}
      
      // Use SDK methods for known endpoints
      if (url === '/auth/me') {
        // Use HTTP client for custom endpoints
        const http = createHttpClient()
        const data = await http.get<T>(url, { query })
        return { data }
      }
      
      // For other endpoints, use SDK HTTP client
      const http = createHttpClient()
      const data = await http.get<T>(url, { query })
      return { data }
    } catch (error) {
      handleError(error)
    }
  },

  post: async <T = any>(url: string, data?: any, config?: any): Promise<{ data: T }> => {
    try {
      // Use SDK methods for auth endpoints
      if (url === '/auth/login') {
        const response = await sdkClient.auth.login(data.email, data.password)
        // Update token
        sdkClient.setToken(response.access)
        localStorage.setItem('token', response.access)
        return { data: response as T }
      }
      
      if (url === '/auth/register') {
        const response = await sdkClient.auth.register(data)
        return { data: response as T }
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
      
      // For other endpoints, use SDK HTTP client
      const http = createHttpClient()
      const headers = config?.headers || {}
      const response = await http.post<T>(url, { body: data, headers })
      return { data: response }
    } catch (error) {
      handleError(error)
    }
  },

  put: async <T = any>(url: string, data?: any, config?: any): Promise<{ data: T }> => {
    try {
      const http = createHttpClient()
      const headers = config?.headers || {}
      const response = await http.put<T>(url, { body: data, headers })
      return { data: response }
    } catch (error) {
      handleError(error)
    }
  },

  patch: async <T = any>(url: string, data?: any, config?: any): Promise<{ data: T }> => {
    try {
      const http = createHttpClient()
      const headers = config?.headers || {}
      const response = await http.patch<T>(url, { body: data, headers })
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

