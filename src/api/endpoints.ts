import api from '../lib/api'

export interface EndpointConfig {
  companyId: string
  companyName: string
  type: string
  httpEndpoint: string
  grpcEndpoint: string
  adapterType: string
  description: string
  status: string
  updatedAt: string
}

export interface UpdateEndpointRequest {
  httpEndpoint: string
  grpcEndpoint: string
}

export interface UpdateEndpointResponse {
  message: string
  companyId: string
  httpEndpoint: string
  grpcEndpoint: string
  adapterType: string
  updatedAt: string
}

export const endpointsApi = {
  getConfig: async (): Promise<EndpointConfig> => {
    const response = await api.get('/endpoints/config')
    return response.data
  },

  updateConfig: async (data: UpdateEndpointRequest): Promise<UpdateEndpointResponse> => {
    const response = await api.put('/endpoints/config', data)
    return response.data
  },
}
