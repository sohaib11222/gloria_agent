export interface HttpError extends Error {
  status: number
  statusText: string
}

export interface HttpOptions extends RequestInit {
  baseURL?: string
}

const DEFAULT_BASE_URL = (import.meta as any).env?.VITE_MW_URL || 'http://localhost:8080'

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
    const { baseURL, ...fetchOptions } = options
    const url = `${baseURL || this.baseURL}${endpoint}`
    
    // Get token from localStorage for auth
    const token = localStorage.getItem('token')
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    try {
      const response = await fetch(url, {
        headers,
        ...fetchOptions,
      })

      if (!response.ok) {
        // Handle 401 Unauthorized - redirect to login
        if (response.status === 401) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          localStorage.removeItem('refreshToken')
          window.location.href = '/login'
        }
        
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
        } catch {
          // Ignore JSON parse errors
        }
        
        throw error
      }

      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return await response.json()
      }
      
      return await response.text() as T
    } catch (error) {
      if (error instanceof Error && 'status' in error) {
        throw error
      }
      
      const httpError = new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`) as HttpError
      httpError.status = 0
      httpError.statusText = 'Network Error'
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
