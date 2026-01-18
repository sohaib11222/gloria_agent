import api from '../lib/api'

export interface Location {
  unlocode: string
  country: string
  place: string
  iata_code?: string
  latitude?: number
  longitude?: number
  isMock?: boolean
}

export interface LocationListResponse {
  items: Location[]
  next_cursor?: string
  total?: number
  hasMockData?: boolean
}

export const locationsApi = {
  listLocations: async (params?: {
    query?: string
    limit?: number
    cursor?: string
  }): Promise<LocationListResponse> => {
    const response = await api.get('/locations', { params })
    return response.data
  },

  getAgreementLocations: async (agreementId: string): Promise<LocationListResponse> => {
    const response = await api.get(`/agreements/${agreementId}/locations`)
    return response.data
  },

  getAgreementCoverage: async (agreementId: string): Promise<LocationListResponse> => {
    const response = await api.get(`/coverage/agreement/${agreementId}`)
    return response.data
  },
}

