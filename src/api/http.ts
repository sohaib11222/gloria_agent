export interface HttpError extends Error {
  status: number
  statusText: string
}

export interface HttpOptions extends RequestInit {
  baseURL?: string
}

import { API_BASE_URL } from '../lib/apiConfig'

const DEFAULT_BASE_URL = API_BASE_URL

export class HttpClient {
  private baseURL: string

  constructor(baseURL: string = DEFAULT_BASE_URL) {
    this.baseURL = baseURL
  }

  setBaseURL(url: string) {
    this.baseURL = url
  }

  async request<T = any>(
    endpoint: string,
    options: HttpOptions = {}
  ): Promise<T> {
    const { baseURL, headers: providedHeaders, ...fetchOptions } = options
    const url = `${baseURL || this.baseURL}${endpoint}`
    
    // Get token from localStorage for auth (always read fresh to avoid stale tokens)
    const token = localStorage.getItem('token')
    
    // Start with default headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    // Add provided headers (convert to plain object if needed)
    if (providedHeaders) {
      if (providedHeaders instanceof Headers) {
        // Convert Headers object to plain object
        providedHeaders.forEach((value, key) => {
          headers[key] = value
        })
      } else if (Array.isArray(providedHeaders)) {
        // Convert array of [key, value] pairs to object
        providedHeaders.forEach(([key, value]) => {
          headers[key] = value
        })
      } else {
        // Already a plain object - merge it
        Object.assign(headers, providedHeaders as Record<string, string>)
      }
    }
    
    // ALWAYS set Authorization header if token exists (this ensures it's never missing)
    // Override any existing Authorization header to ensure we use the latest token
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    } else {
      // Log warning if no token found for non-auth endpoints
      if (!endpoint.includes('/auth/')) {
        console.warn(`[HttpClient] No token found for request to ${endpoint}. URL: ${url}`)
      }
    }
    
    // Debug logging for booking test endpoints
    if (endpoint.includes('/bookings/test/')) {
      console.log('[HttpClient] Booking test request:', {
        endpoint,
        url,
        hasToken: !!token,
        tokenLength: token?.length || 0,
        headers: Object.keys(headers),
        allHeaders: { ...headers },
        authorizationHeader: headers['Authorization'] ? headers['Authorization'].substring(0, 20) + '...' : 'Missing',
        agentEmailHeader: headers['X-Agent-Email'] || headers['x-agent-email'] || 'Missing',
        providedHeaders: providedHeaders,
        fetchOptionsKeys: Object.keys(fetchOptions)
      })
    }
    
    try {
      // Ensure headers are sent - fetch accepts plain objects
      // IMPORTANT: Don't spread fetchOptions.headers - we've already merged everything into headers
      // Make sure headers is the last property so it can't be overwritten
      // Also ensure we don't include headers in fetchOptions to avoid conflicts
      const { headers: _, ...restFetchOptions } = fetchOptions as any
      
      const fetchConfig: RequestInit = {
        ...restFetchOptions,
        method: restFetchOptions.method || 'GET',
        headers: headers as HeadersInit,
      }
      
      // Final debug check
      if (endpoint.includes('/bookings/test/')) {
        const finalHeaders = fetchConfig.headers as any
        console.log('[HttpClient] Final fetch config:', {
          method: fetchConfig.method,
          headerKeys: typeof finalHeaders === 'object' ? Object.keys(finalHeaders) : 'Headers object',
          hasAuthorization: finalHeaders?.['Authorization'] || finalHeaders?.get?.('Authorization') ? 'YES' : 'NO',
          authorizationValue: finalHeaders?.['Authorization']?.substring(0, 30) || 'N/A'
        })
      }
      
      const response = await fetch(url, fetchConfig)

      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`) as HttpError
        error.status = response.status
        error.statusText = response.statusText
        
        // Try to parse error response
        try {
          const errorData = await response.json()
          if (errorData.message) {
            error.message = errorData.message
          }
          (error as any).response = errorData
          
          // Only redirect to login for actual authentication errors (401)
          // Don't redirect for validation errors (400) or other client errors
          // Also don't auto-redirect for booking test endpoints - let components handle the error
          const isBookingTestEndpoint = endpoint.includes('/bookings/test/')
          
          if (endpoint.includes('/bookings/test/')) {
            console.log('[HttpClient] Booking test 401 error - NOT clearing token or redirecting:', {
              endpoint,
              errorData,
              currentToken: localStorage.getItem('token') ? 'Present' : 'Missing'
            })
          }
          
          if (response.status === 401 && 
              errorData.error !== 'SCHEMA_ERROR' && 
              errorData.error !== 'VALIDATION_ERROR' &&
              !isBookingTestEndpoint) {
            // Check if token actually exists - if it does, the 401 might be for a different reason
            const currentToken = localStorage.getItem('token')
            if (!currentToken || errorData.error === 'AUTH_ERROR') {
              localStorage.removeItem('token')
              localStorage.removeItem('user')
              localStorage.removeItem('refreshToken')
              // Get base path (matches vite.config.js and main.jsx)
              const basePath = import.meta.env.PROD ? '/agent' : ''
              const loginPath = `${basePath}/login`
              const currentPath = window.location.pathname
              // Only redirect if we're not already on the login page
              if (!currentPath.endsWith('/login') && !currentPath.endsWith('/login/')) {
                window.location.href = loginPath
              }
            }
            // If token exists, don't redirect - let the component handle the error
          }
        } catch {
          // If we can't parse JSON, only redirect on 401 if it's not a network error
          // Don't auto-redirect for booking test endpoints
          const isBookingTestEndpoint = endpoint.includes('/bookings/test/')
          
          if (endpoint.includes('/bookings/test/')) {
            console.log('[HttpClient] Booking test 401 error (unparseable JSON) - NOT clearing token or redirecting')
          }
          
          if (response.status === 401 && error.status !== 0 && !isBookingTestEndpoint) {
            const currentToken = localStorage.getItem('token')
            if (!currentToken) {
              localStorage.removeItem('token')
              localStorage.removeItem('user')
              localStorage.removeItem('refreshToken')
              const basePath = import.meta.env.PROD ? '/agent' : ''
              const loginPath = `${basePath}/login`
              const currentPath = window.location.pathname
              if (!currentPath.endsWith('/login') && !currentPath.endsWith('/login/')) {
                window.location.href = loginPath
              }
            }
            // If token exists, don't redirect - let the component handle the error
          }
        }
        
        throw error
      }

      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return await response.json()
      }
      
      return await response.text() as T
    } catch (error) {
      // If it's already an HttpError, just throw it
      if (error instanceof Error && 'status' in error) {
        throw error
      }
      
      // For network errors (connection failures, etc.), don't redirect to login
      // These are not authentication errors
      const httpError = new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`) as HttpError
      httpError.status = 0
      httpError.statusText = 'Network Error'
      // Don't redirect on network errors - let the component handle them
      throw httpError
    }
  }

  async get<T = any>(endpoint: string, options?: HttpOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  async post<T = any>(endpoint: string, data?: any, options?: HttpOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T = any>(endpoint: string, data?: any, options?: HttpOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T = any>(endpoint: string, data?: any, options?: HttpOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T = any>(endpoint: string, options?: HttpOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }
}

export const httpClient = new HttpClient()
