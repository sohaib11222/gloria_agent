/**
 * SDK Client wrapper for frontend integration
 * Handles token management, error handling, and provides axios-like interface
 * Uses HttpClient instead of external SDK
 */

import toast from 'react-hot-toast'
import { HttpClient } from '../api/http'

const API_BASE_URL = import.meta.env.VITE_MIDDLEWARE_URL || 'http://localhost:8080'

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

// Create HTTP client instance
const httpClient = new HttpClient(API_BASE_URL)

// Token management
let currentToken: string | null = null

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
    }
  }

  getToken(): string | null {
    return currentToken || localStorage.getItem('token')
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
        throw new SDKError(
          error.message || 'Login failed',
          error.status || 500,
          'LOGIN_ERROR',
          error
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
        throw new SDKError(
          error.message || 'Registration failed',
          error.status || 500,
          'REGISTER_ERROR',
          error
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
  return sdkClient.getHttpClient()
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
      const response = await http.post<T>(url, data)
      return { data: response }
    } catch (error) {
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
      const http = createHttpClient()
      const response = await http.patch<T>(url, data)
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

