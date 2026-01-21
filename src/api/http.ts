export interface HttpError extends Error {
  status: number
  statusText: string
}

export interface HttpOptions extends RequestInit {
  baseURL?: string
}

import { API_BASE_URL } from '../lib/apiConfig'

// Get API base URL - recalculate it to ensure it's current and fix protocol if needed
function getCurrentApiBaseUrl(): string {
  // If explicitly set in env, use that (but fix protocol if needed)
  if (import.meta.env.VITE_API_BASE_URL) {
    const envUrl = import.meta.env.VITE_API_BASE_URL
    // If env URL is HTTP but page is HTTPS, convert to HTTPS to avoid mixed content
    if (typeof window !== 'undefined' && window.location.protocol === 'https:' && envUrl.startsWith('http://')) {
      console.warn('⚠️ Converting HTTP API URL to HTTPS to avoid mixed content:', envUrl)
      return envUrl.replace('http://', 'https://')
    }
    return envUrl
  }

  // Auto-detect protocol based on current page protocol
  const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'https:' : 'http:'
  
  // Check if we're on localhost
  if (typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    if (isLocalhost && !import.meta.env.PROD) {
      return 'http://localhost:8080'
    }
  }
  
  // Production: use production API with protocol matching
  return `${protocol}//api.gloriaconnect.com/api`
}

const DEFAULT_BASE_URL = getCurrentApiBaseUrl()

// Log the API base URL for debugging
console.log('🔧 API Base URL configured (Agent):', DEFAULT_BASE_URL)
console.log('🔧 Current page protocol:', typeof window !== 'undefined' ? window.location.protocol : 'N/A')

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
    
    // Check if body is FormData - if so, don't set Content-Type (browser will set it with boundary)
    const isFormData = fetchOptions.body instanceof FormData
    
    // Start with default headers (skip Content-Type for FormData)
    const headers: Record<string, string> = {}
    if (!isFormData) {
      headers['Content-Type'] = 'application/json'
    }
    
    // Add provided headers (convert to plain object if needed)
    if (providedHeaders) {
      if (providedHeaders instanceof Headers) {
        // Convert Headers object to plain object
        providedHeaders.forEach((value, key) => {
          // Don't override Content-Type for FormData - browser needs to set it
          if (!(isFormData && key.toLowerCase() === 'content-type')) {
            headers[key] = value
          }
        })
      } else if (Array.isArray(providedHeaders)) {
        // Convert array of [key, value] pairs to object
        providedHeaders.forEach(([key, value]) => {
          // Don't override Content-Type for FormData - browser needs to set it
          if (!(isFormData && key.toLowerCase() === 'content-type')) {
            headers[key] = value
          }
        })
      } else {
        // Already a plain object - merge it
        const providedHeadersObj = providedHeaders as Record<string, string>
        Object.keys(providedHeadersObj).forEach(key => {
          // Don't override Content-Type for FormData - browser needs to set it
          if (!(isFormData && key.toLowerCase() === 'content-type')) {
            headers[key] = providedHeadersObj[key]
          }
        })
      }
    }
    
    // ALWAYS set Authorization header if token exists (this ensures it's never missing)
    // IMPORTANT: Re-read token from localStorage right before setting header to ensure it's current
    // This is critical for booking endpoints where token might have been updated
    const currentToken = localStorage.getItem('token') || token
    
    // For booking endpoints, log token status BEFORE setting header
    if (endpoint.includes('/bookings')) {
      console.log('[HttpClient] 🔍 PRE-HEADER SET: Token check for booking:', {
        endpoint,
        hasToken: !!currentToken,
        tokenLength: currentToken?.length || 0,
        tokenPreview: currentToken ? `${currentToken.substring(0, 20)}...` : 'N/A',
        tokenFromLocalStorage: !!localStorage.getItem('token'),
        tokenFromParam: !!token
      })
    }
    
    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`
      
      // For booking endpoints, verify it was set
      if (endpoint.includes('/bookings')) {
        console.log('[HttpClient] ✅ POST-HEADER SET: Authorization header set:', {
          endpoint,
          headerSet: !!headers['Authorization'],
          headerValue: headers['Authorization'] ? `${headers['Authorization'].substring(0, 30)}...` : 'MISSING',
          allHeaders: Object.keys(headers)
        })
      }
      
      // Double-check it was set correctly
      if (!headers['Authorization'] || !headers['Authorization'].startsWith('Bearer ')) {
        console.error('[HttpClient] CRITICAL: Authorization header not set correctly!', {
          endpoint,
          hasToken: !!currentToken,
          tokenLength: currentToken.length,
          headersKeys: Object.keys(headers),
          authorizationValue: headers['Authorization']
        })
      }
    } else {
      // Log warning if no token found for non-auth endpoints
      if (!endpoint.includes('/auth/')) {
        console.warn(`[HttpClient] No token found for request to ${endpoint}. URL: ${url}`)
        // For booking endpoints, this is a critical error
        if (endpoint.includes('/bookings')) {
          console.error('[HttpClient] ❌❌❌ CRITICAL: No token for booking request! This will fail with 401.')
          // Don't throw - let it fail so we can see the error
        }
      }
    }
    
    // Final verification for booking endpoints - ensure Authorization header is present
    if (endpoint.includes('/bookings') && !headers['Authorization']) {
      console.error('[HttpClient] CRITICAL ERROR: Authorization header missing for booking request!', {
        endpoint,
        url,
        hasToken: !!token,
        allHeaders: Object.keys(headers),
        providedHeadersType: providedHeaders ? typeof providedHeaders : 'none'
      })
    }
    
    // Debug logging for booking endpoints
    if (endpoint.includes('/bookings')) {
      console.log('[HttpClient] Booking request - BEFORE fetch:', {
        endpoint,
        url,
        hasToken: !!currentToken,
        tokenLength: currentToken?.length || 0,
        tokenPreview: currentToken ? `${currentToken.substring(0, 20)}...` : 'N/A',
        allHeaders: Object.keys(headers),
        authorizationHeader: headers['Authorization'] ? `${headers['Authorization'].substring(0, 30)}...` : 'MISSING',
        hasIdempotencyKey: !!headers['Idempotency-Key'] || !!headers['idempotency-key'],
        providedHeadersType: providedHeaders ? typeof providedHeaders : 'none',
        providedHeadersKeys: providedHeaders && typeof providedHeaders === 'object' ? Object.keys(providedHeaders) : 'N/A',
        fetchOptionsKeys: Object.keys(fetchOptions)
      })
      
      // CRITICAL: If Authorization header is still missing, this is a bug
      if (!headers['Authorization']) {
        console.error('[HttpClient] ⚠️⚠️⚠️ CRITICAL BUG: Authorization header is MISSING after all processing!', {
          endpoint,
          hasToken: !!currentToken,
          tokenValue: currentToken ? 'Present' : 'Missing',
          allHeaders: headers,
          providedHeaders: providedHeaders
        })
      }
    }
    
    try {
      // Ensure headers are sent - fetch accepts plain objects
      // IMPORTANT: Don't spread fetchOptions.headers - we've already merged everything into headers
      // Make sure headers is the last property so it can't be overwritten
      // Also ensure we don't include headers in fetchOptions to avoid conflicts
      const { headers: _, ...restFetchOptions } = fetchOptions as any
      
      // Debug logging for FormData requests
      if (isFormData) {
        // Log FormData entries if possible
        const formDataEntries: any[] = [];
        if (restFetchOptions.body instanceof FormData) {
          try {
            for (const [key, value] of restFetchOptions.body.entries()) {
              formDataEntries.push({
                key,
                valueType: value instanceof File ? 'File' : typeof value,
                valuePreview: value instanceof File 
                  ? `${value.name} (${value.size} bytes, ${value.type})` 
                  : String(value).substring(0, 100),
              });
            }
          } catch (e) {
            formDataEntries.push({ error: 'Could not iterate FormData entries' });
          }
        }
        
        console.log('[HttpClient] FormData request:', {
          endpoint,
          url,
          hasBody: !!restFetchOptions.body,
          bodyType: restFetchOptions.body?.constructor?.name,
          isFormDataInstance: restFetchOptions.body instanceof FormData,
          headers: Object.keys(headers),
          hasAuth: !!headers['Authorization'],
          contentType: headers['Content-Type'] || 'auto-set-by-browser',
          formDataEntries,
        })
      }
      
      // Ensure Authorization header is always set if token exists (final check before fetch)
      // Re-read token one more time to be absolutely sure
      const finalToken = localStorage.getItem('token')
      if (finalToken && !headers['Authorization']) {
        console.error('[HttpClient] CRITICAL: Authorization header missing before fetch! Adding it now.', {
          endpoint,
          hasToken: !!finalToken,
          existingHeaders: Object.keys(headers)
        })
        headers['Authorization'] = `Bearer ${finalToken}`
      } else if (finalToken && headers['Authorization'] && !headers['Authorization'].startsWith('Bearer ')) {
        // Fix malformed Authorization header
        console.error('[HttpClient] CRITICAL: Authorization header malformed! Fixing it.', {
          endpoint,
          currentValue: headers['Authorization']
        })
        headers['Authorization'] = `Bearer ${finalToken}`
      }
      
      // CRITICAL: Ensure headers object is properly formatted and Authorization is present
      // Convert headers object to a plain object to ensure it works with fetch
      const finalHeadersObj: Record<string, string> = {}
      
      // First, copy all existing headers
      for (const [key, value] of Object.entries(headers)) {
        if (value) {
          finalHeadersObj[key] = String(value)
        }
      }
      
      // CRITICAL: Always ensure Authorization header is present if token exists
      // Read token fresh from localStorage
      const finalTokenCheck = localStorage.getItem('token')
      if (finalTokenCheck) {
        // Always set Authorization header - don't check if it exists, just set it
        finalHeadersObj['Authorization'] = `Bearer ${finalTokenCheck}`
        console.log('[HttpClient] ✅ Authorization header set in finalHeadersObj:', {
          endpoint,
          hasToken: !!finalTokenCheck,
          tokenPreview: finalTokenCheck.substring(0, 20) + '...',
          allHeaders: Object.keys(finalHeadersObj)
        })
      } else {
        console.error('[HttpClient] ❌ NO TOKEN in localStorage when creating finalHeadersObj!', {
          endpoint,
          url
        })
      }
      
      // Ensure Content-Type is correct for JSON requests (not FormData)
      if (!isFormData && !finalHeadersObj['Content-Type'] && !finalHeadersObj['content-type']) {
        finalHeadersObj['Content-Type'] = 'application/json'
      }
      
      // CRITICAL: Ensure restFetchOptions doesn't have headers that could override ours
      // Remove headers from restFetchOptions multiple times to be absolutely sure
      const { headers: __, ...step1 } = restFetchOptions as any
      const { headers: ___, ...cleanRestFetchOptions } = step1 as any
      
      // Build fetchConfig - headers MUST be set last to ensure it can't be overridden
      const fetchConfig: RequestInit = {
        method: cleanRestFetchOptions.method || 'GET',
        body: cleanRestFetchOptions.body, // Preserve body
      }
      
      // Add all other properties from cleanRestFetchOptions EXCEPT headers
      for (const [key, value] of Object.entries(cleanRestFetchOptions)) {
        if (key !== 'headers' && key !== 'method' && key !== 'body') {
          (fetchConfig as any)[key] = value
        }
      }
      
      // FINALLY, set headers as the absolute last thing - this ensures it can't be overridden
      fetchConfig.headers = finalHeadersObj
      
      // Verify headers are actually set
      if (endpoint.includes('/bookings')) {
        console.log('[HttpClient] 📋 fetchConfig created:', {
          hasHeaders: !!fetchConfig.headers,
          headersType: fetchConfig.headers ? typeof fetchConfig.headers : 'null',
          headersKeys: fetchConfig.headers && typeof fetchConfig.headers === 'object' && !(fetchConfig.headers instanceof Headers)
            ? Object.keys(fetchConfig.headers)
            : 'N/A',
          method: fetchConfig.method,
          hasBody: !!fetchConfig.body
        })
      }
      
      // CRITICAL: Double-check headers are still there after creating fetchConfig
      if (endpoint.includes('/bookings')) {
        const configHeaders = fetchConfig.headers as any
        const authInConfig = configHeaders?.['Authorization'] || configHeaders?.get?.('Authorization')
        if (!authInConfig) {
          console.error('[HttpClient] ❌❌❌ FATAL: Authorization header lost after creating fetchConfig!', {
            endpoint,
            finalHeadersObjKeys: Object.keys(finalHeadersObj),
            finalHeadersObjAuth: finalHeadersObj['Authorization'] ? 'Present' : 'Missing',
            fetchConfigHeadersType: typeof configHeaders,
            fetchConfigHeaders: configHeaders
          })
          // Force add it one more time
          if (finalHeadersObj['Authorization']) {
            fetchConfig.headers = { ...finalHeadersObj }
          }
        }
      }
      
      // Final verification - log headers being sent for booking requests
      if (endpoint.includes('/bookings')) {
        const finalHeaders = fetchConfig.headers as any
        let authHeader = 'MISSING'
        if (finalHeaders instanceof Headers) {
          authHeader = finalHeaders.get('Authorization') || 'MISSING'
        } else if (finalHeaders && typeof finalHeaders === 'object') {
          authHeader = finalHeaders['Authorization'] || finalHeaders['authorization'] || 'MISSING'
        }
        
        const allHeaderKeys = finalHeaders instanceof Headers 
          ? Array.from(finalHeaders.keys())
          : (finalHeaders ? Object.keys(finalHeaders) : [])
        
        console.log('[HttpClient] ⚡ Final fetch config for booking - ABOUT TO SEND:', {
          hasAuthorization: !!authHeader && authHeader !== 'MISSING',
          authorizationHeader: authHeader !== 'MISSING' ? `${String(authHeader).substring(0, 30)}...` : '❌ MISSING - REQUEST WILL FAIL!',
          allHeaderKeys: allHeaderKeys,
          headerCount: allHeaderKeys.length,
          method: fetchConfig.method,
          url: url
        })
        
        // CRITICAL CHECK: If Authorization is still missing, log error
        if (!authHeader || authHeader === 'MISSING') {
          const errorMsg = '[HttpClient] ❌❌❌ FATAL ERROR: Authorization header is MISSING in final fetch config! Request will fail with 401.'
          console.error(errorMsg, {
            endpoint,
            url,
            finalHeaders,
            headersObject: headers,
            tokenInStorage: !!localStorage.getItem('token')
          })
        }
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
      
      // Final check for FormData before sending
      if (isFormData && fetchConfig.body instanceof FormData) {
        console.log('[HttpClient] About to send FormData via fetch:', {
          url,
          method: fetchConfig.method,
          hasBody: !!fetchConfig.body,
          bodyType: fetchConfig.body.constructor.name,
          headers: Object.keys(fetchConfig.headers as any || {}),
          contentType: (fetchConfig.headers as any)?.['Content-Type'] || 'auto-set',
        });
        
        // Try to log FormData entries (may not work in all browsers)
        try {
          const entries: any[] = [];
          for (const [key, value] of (fetchConfig.body as FormData).entries()) {
            entries.push({
              key,
              valueType: value instanceof File ? 'File' : typeof value,
              valuePreview: value instanceof File 
                ? `${value.name} (${value.size} bytes, ${value.type})` 
                : String(value).substring(0, 100),
            });
          }
          console.log('[HttpClient] FormData entries:', entries);
        } catch (e) {
          console.log('[HttpClient] Could not iterate FormData entries:', e);
        }
      }
      
      // ABSOLUTE FINAL CHECK: Ensure Authorization header is in fetchConfig before sending
      if (endpoint.includes('/bookings')) {
        const token = localStorage.getItem('token')
        const configHeaders = fetchConfig.headers as any
        let hasAuth = false
        
        if (configHeaders instanceof Headers) {
          hasAuth = configHeaders.has('Authorization')
        } else if (configHeaders && typeof configHeaders === 'object') {
          hasAuth = !!(configHeaders['Authorization'] || configHeaders['authorization'])
        }
        
        if (token && !hasAuth) {
          console.error('[HttpClient] ⚠️⚠️⚠️ LAST CHANCE: Authorization missing right before fetch! Adding it now.', {
            endpoint,
            tokenExists: !!token,
            configHeadersType: typeof configHeaders,
            configHeadersKeys: configHeaders ? Object.keys(configHeaders) : []
          })
          
          // Create new headers object with Authorization
          const newHeaders: Record<string, string> = {}
          if (configHeaders && typeof configHeaders === 'object' && !(configHeaders instanceof Headers)) {
            Object.assign(newHeaders, configHeaders)
          }
          newHeaders['Authorization'] = `Bearer ${token}`
          fetchConfig.headers = newHeaders
        }
      }
      
      // ABSOLUTE FINAL CHECK: Log what we're actually sending to fetch
      if (endpoint.includes('/bookings')) {
        const token = localStorage.getItem('token')
        const actualHeaders = fetchConfig.headers as any
        console.log('[HttpClient] 🔥🔥🔥 FINAL CHECK - About to call fetch:', {
          url,
          method: fetchConfig.method,
          hasHeaders: !!actualHeaders,
          headersType: actualHeaders ? (actualHeaders instanceof Headers ? 'Headers' : typeof actualHeaders) : 'null',
          headersKeys: actualHeaders && typeof actualHeaders === 'object' && !(actualHeaders instanceof Headers) 
            ? Object.keys(actualHeaders) 
            : (actualHeaders instanceof Headers ? Array.from(actualHeaders.keys()) : 'N/A'),
          authorizationInHeaders: actualHeaders instanceof Headers 
            ? (actualHeaders.get('Authorization') ? 'YES' : 'NO')
            : (actualHeaders?.['Authorization'] || actualHeaders?.['authorization'] ? 'YES' : 'NO'),
          tokenInStorage: !!token,
          fetchConfigKeys: Object.keys(fetchConfig),
          fullFetchConfig: JSON.stringify(fetchConfig, null, 2).substring(0, 500)
        })
        
        // If Authorization is still missing, FORCE it one more time
        if (token) {
          if (actualHeaders instanceof Headers) {
            if (!actualHeaders.has('Authorization')) {
              console.error('[HttpClient] ⚠️⚠️⚠️ Headers object missing Authorization - adding now!')
              actualHeaders.set('Authorization', `Bearer ${token}`)
            }
          } else if (actualHeaders && typeof actualHeaders === 'object') {
            if (!actualHeaders['Authorization'] && !actualHeaders['authorization']) {
              console.error('[HttpClient] ⚠️⚠️⚠️ Headers object missing Authorization - adding now!')
              actualHeaders['Authorization'] = `Bearer ${token}`
            }
          } else {
            // Headers is null/undefined - create new object
            console.error('[HttpClient] ⚠️⚠️⚠️ Headers is null/undefined - creating new headers object!')
            fetchConfig.headers = {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              ...(actualHeaders && typeof actualHeaders === 'object' ? actualHeaders : {})
            }
          }
        }
      }
      
      // ABSOLUTE FINAL CHECK: Verify token exists and headers are correct
      const tokenBeforeFetch = localStorage.getItem('token')
      if (endpoint.includes('/bookings')) {
        if (!tokenBeforeFetch) {
          console.error('[HttpClient] ❌❌❌ TOKEN IS MISSING FROM LOCALSTORAGE RIGHT BEFORE FETCH!')
          throw new Error('No authentication token available. Please log in again.')
        }
        
        const finalCheckHeaders = fetchConfig.headers as any
        const hasAuth = finalCheckHeaders instanceof Headers
          ? finalCheckHeaders.has('Authorization')
          : (finalCheckHeaders?.['Authorization'] || finalCheckHeaders?.['authorization'])
        
        if (!hasAuth) {
          console.error('[HttpClient] ❌❌❌ AUTHORIZATION HEADER IS MISSING RIGHT BEFORE FETCH!', {
            tokenExists: !!tokenBeforeFetch,
            headersType: typeof finalCheckHeaders,
            headersValue: finalCheckHeaders,
            fetchConfig: JSON.stringify(fetchConfig, null, 2).substring(0, 1000)
          })
          // Force add it
          if (finalCheckHeaders && typeof finalCheckHeaders === 'object' && !(finalCheckHeaders instanceof Headers)) {
            finalCheckHeaders['Authorization'] = `Bearer ${tokenBeforeFetch}`
            console.log('[HttpClient] ✅ FORCED Authorization header into headers object')
          } else {
            fetchConfig.headers = {
              'Authorization': `Bearer ${tokenBeforeFetch}`,
              'Content-Type': 'application/json',
              ...(finalCheckHeaders && typeof finalCheckHeaders === 'object' ? finalCheckHeaders : {})
            }
            console.log('[HttpClient] ✅ CREATED NEW headers object with Authorization')
          }
        } else {
          console.log('[HttpClient] ✅✅✅ Authorization header confirmed present before fetch!')
        }
      }
      
      // CRITICAL: Fix protocol mismatch before making the request
      // If page is HTTPS but URL is HTTP, convert to HTTPS to avoid mixed content blocking
      let finalUrl = url
      if (typeof window !== 'undefined' && window.location.protocol === 'https:' && url.startsWith('http://')) {
        finalUrl = url.replace('http://', 'https://')
        console.warn('⚠️ Fixing protocol mismatch (Agent):', {
          original: url,
          corrected: finalUrl,
          pageProtocol: window.location.protocol
        })
      }
      
      // CRITICAL: Set CORS mode and credentials to match backend configuration
      // Backend uses Access-Control-Allow-Credentials: false, so we use credentials: 'omit'
      // DO NOT set any CORS headers manually - browser handles this automatically
      const finalFetchConfig: RequestInit = {
        ...fetchConfig,
        mode: 'cors', // Explicitly set CORS mode
        credentials: 'omit', // Match backend credentials: false
        referrerPolicy: 'unsafe-url' as ReferrerPolicy,
      }
      
      const response = await fetch(finalUrl, finalFetchConfig)
      
      // Log response for debugging auth endpoints
      if (endpoint.includes('/auth/login') || endpoint.includes('/auth/register')) {
        console.log('📥 Response received (Agent):', {
          url: finalUrl,
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries())
        })
      }

      if (!response.ok) {
        // Try to parse error response first
        let errorData: any = {}
        try {
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            errorData = await response.json()
          } else {
            const text = await response.text()
            if (text) {
              try {
                errorData = JSON.parse(text)
              } catch {
                errorData = { message: text }
              }
            }
          }
        } catch (parseError) {
          console.warn('Failed to parse error response:', parseError)
        }
        
        const error = new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`) as HttpError
        error.status = response.status
        error.statusText = response.statusText
        ;(error as any).response = errorData
        
        // Check if this is a booking endpoint BEFORE any processing
        const isBookingEndpoint = endpoint.includes('/bookings')
        
        // Mark error as booking error so it can be identified later
        if (isBookingEndpoint) {
          (error as any).isBookingError = true
          (error as any).endpoint = endpoint
        }
          
          // NEVER redirect for booking endpoints - let components handle all errors
          // This MUST be checked FIRST before any redirect logic
          if (isBookingEndpoint) {
            const errorInfo = {
              endpoint,
              status: response.status,
              errorData,
              currentToken: localStorage.getItem('token') ? 'Present' : 'Missing',
              timestamp: new Date().toISOString()
            }
            // Store in sessionStorage so we can see it even if page reloads
            try {
              sessionStorage.setItem('lastBookingError', JSON.stringify(errorInfo))
            } catch (e) {
              // Ignore if sessionStorage fails
            }
            console.log('[HttpClient] 🚫 Booking endpoint error - NOT redirecting, throwing error for component:', errorInfo)
            // Just throw the error - don't redirect or clear token
            throw error
          }
          
          // Only redirect to login for actual authentication errors (401)
          // Don't redirect for validation errors (400) or other client errors
          // NOTE: isBookingEndpoint check above ensures we never get here for booking endpoints
          if (response.status === 401 && 
              errorData.error !== 'SCHEMA_ERROR' && 
              errorData.error !== 'VALIDATION_ERROR') {
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
        } catch (parseError) {
          // NEVER redirect for booking endpoints - check FIRST before any redirect logic
          if (isBookingEndpoint) {
            console.log('[HttpClient] 🚫 Booking endpoint error (unparseable JSON) - NOT redirecting, throwing error:', {
              endpoint,
              status: response.status
            })
            // Just throw the error - don't redirect or clear token
            throw error
          }
          
          // If we can't parse JSON, only redirect on 401 if it's not a network error
          if (response.status === 401 && error.status !== 0) {
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

      // Check if response was blocked by CORS
      if (response.type === 'opaque' || response.type === 'opaqueredirect') {
        const corsError = new Error('CORS error: Response was blocked by browser CORS policy. Please check server CORS configuration.') as HttpError
        corsError.status = 0
        corsError.statusText = 'CORS Error'
        ;(corsError as any).isCorsError = true
        throw corsError
      }

      // Parse response body
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        try {
          const data = await response.json()
          // Log successful response for auth endpoints
          if (endpoint.includes('/auth/login') || endpoint.includes('/auth/register')) {
            console.log('✅ Auth response parsed (Agent):', {
              url: finalUrl,
              status: response.status,
              hasData: !!data,
              dataKeys: data ? Object.keys(data) : []
            })
          }
          return data as T
        } catch (parseError) {
          console.error('Failed to parse JSON response:', parseError)
          throw new Error('Failed to parse server response')
        }
      }
      
      // For non-JSON responses, return as text
      const text = await response.text()
      return text as T
    } catch (error) {
      // Check for CORS errors
      if (error instanceof TypeError && error.message?.includes('Failed to fetch')) {
        const corsError = new Error('CORS error: Unable to connect to server. Please check your network connection and CORS configuration.') as HttpError
        corsError.status = 0
        corsError.statusText = 'CORS Error'
        ;(corsError as any).isCorsError = true
        ;(corsError as any).isNetworkError = true
        throw corsError
      }
      
      // If it's already an HttpError, just throw it
      if (error instanceof Error && 'status' in error) {
        throw error
      }
      
      // For network errors (connection failures, etc.), don't redirect to login
      // These are not authentication errors
      const httpError = new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`) as HttpError
      httpError.status = 0
      httpError.statusText = 'Network Error'
      ;(httpError as any).isNetworkError = true
      // Don't redirect on network errors - let the component handle them
      throw httpError
    }
  }

  async get<T = any>(endpoint: string, options?: HttpOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  async post<T = any>(endpoint: string, data?: any, options?: HttpOptions): Promise<T> {
    // Check if data is FormData - if so, send it as-is without stringifying
    const isFormData = data instanceof FormData
    
    // If FormData, pass it directly in options so request method can detect it
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? (isFormData ? data : JSON.stringify(data)) : undefined,
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

export const httpClient = new HttpClient(API_BASE_URL)
