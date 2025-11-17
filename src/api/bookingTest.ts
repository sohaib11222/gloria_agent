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

export const bookingTestApi = {
  createBooking: async (data: CreateBookingRequest): Promise<BookingTestResponse> => {
    const idempotencyKey = `test-create-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const response = await api.post('/bookings/test/create', data, {
      headers: {
        'Idempotency-Key': idempotencyKey
      }
    })
    return response.data
  },

  modifyBooking: async (agentBookingRef: string, data: ModifyBookingRequest): Promise<BookingTestResponse> => {
    const idempotencyKey = `test-modify-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const response = await api.patch(`/bookings/test/modify/${agentBookingRef}`, data, {
      headers: {
        'Idempotency-Key': idempotencyKey
      }
    })
    return response.data
  },

  cancelBooking: async (agentBookingRef: string, data: CancelBookingRequest): Promise<BookingTestResponse> => {
    const idempotencyKey = `test-cancel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const response = await api.post(`/bookings/test/cancel/${agentBookingRef}`, data, {
      headers: {
        'Idempotency-Key': idempotencyKey
      }
    })
    return response.data
  },
}
