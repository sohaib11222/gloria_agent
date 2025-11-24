import api from '../lib/api'

export interface Booking {
  id: string
  agentId: string
  sourceId: string
  agreementRef?: string | null
  supplierBookingRef?: string | null
  status?: string | null
  vehicleInfo?: any
  pickupLocation?: string | null
  dropoffLocation?: string | null
  pickupDate?: string | null
  dropoffDate?: string | null
  createdAt: string
  updatedAt: string
}

export interface BookingListResponse {
  items: Booking[]
  total?: number
}

export interface ModifyBookingRequest {
  agreement_ref: string
  [key: string]: any
}

export interface CancelBookingRequest {
  agreement_ref: string
}

export const bookingsApi = {
  listBookings: async (params?: {
    limit?: number
    company_id?: string
    request_id?: string
  }): Promise<BookingListResponse> => {
    const response = await api.get('/bookings', { params })
    return response.data
  },

  getBooking: async (ref: string, agreementRef: string): Promise<Booking> => {
    const response = await api.get(`/bookings/${ref}`, {
      params: { agreement_ref: agreementRef },
    })
    return response.data
  },

  modifyBooking: async (ref: string, data: ModifyBookingRequest): Promise<any> => {
    const response = await api.patch(`/bookings/${ref}`, data, {
      params: { agreement_ref: data.agreement_ref },
    })
    return response.data
  },

  cancelBooking: async (ref: string, agreementRef: string): Promise<any> => {
    const response = await api.post(`/bookings/${ref}/cancel`, {}, {
      params: { agreement_ref: agreementRef },
    })
    return response.data
  },
}

