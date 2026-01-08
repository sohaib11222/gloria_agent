import api from '../lib/api'

export interface CreateBookingRequest {
  source_id: string
  agreement_ref: string
  agent_booking_ref: string
}

export interface BookingTestResponse {
  test_mode: boolean
  booking_id: string
  status: string
  AgentBookingRef: string
  SourceId: string
  AgreementRef: string
  message: string
  verification: {
    create: boolean
    modify: boolean
    cancel: boolean
    check: boolean
  }
}

export interface ModifyBookingRequest {
  source_id: string
}

export interface CancelBookingRequest {
  source_id: string
}

// Helper to get user email from localStorage
const getUserEmail = (): string | null => {
  try {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      return user?.email || null
    }
  } catch (e) {
    console.error('Failed to parse user from localStorage:', e)
  }
  return null
}

export const bookingTestApi = {
  createBooking: async (data: CreateBookingRequest): Promise<BookingTestResponse> => {
    const idempotencyKey = `test-create-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const userEmail = getUserEmail()
    
    console.log('[bookingTestApi] createBooking - user email:', userEmail)
    
    const headers: Record<string, string> = {
      'Idempotency-Key': idempotencyKey
    }
    
    // Add agent email as header for booking test endpoints
    if (userEmail) {
      headers['X-Agent-Email'] = userEmail
      console.log('[bookingTestApi] Added X-Agent-Email header:', userEmail)
    } else {
      console.warn('[bookingTestApi] No user email found in localStorage!')
    }
    
    console.log('[bookingTestApi] Final headers being sent:', headers)
    
    const response = await api.post('/bookings/test/create', data, { headers })
    return response.data
  },

  modifyBooking: async (agentBookingRef: string, data: ModifyBookingRequest): Promise<BookingTestResponse> => {
    const idempotencyKey = `test-modify-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const userEmail = getUserEmail()
    
    const headers: Record<string, string> = {
      'Idempotency-Key': idempotencyKey
    }
    
    // Add agent email as header for booking test endpoints
    if (userEmail) {
      headers['X-Agent-Email'] = userEmail
    }
    
    const response = await api.patch(`/bookings/test/modify/${agentBookingRef}`, data, { headers })
    return response.data
  },

  cancelBooking: async (agentBookingRef: string, data: CancelBookingRequest): Promise<BookingTestResponse> => {
    const idempotencyKey = `test-cancel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const userEmail = getUserEmail()
    
    const headers: Record<string, string> = {
      'Idempotency-Key': idempotencyKey
    }
    
    // Add agent email as header for booking test endpoints
    if (userEmail) {
      headers['X-Agent-Email'] = userEmail
    }
    
    const response = await api.post(`/bookings/test/cancel/${agentBookingRef}`, data, { headers })
    return response.data
  },
}
