import api from '../lib/api'

export interface AgentCompanyAgreement {
  id: string
  agreementRef: string
  status: string
  validFrom?: string | null
  validTo?: string | null
}

export interface AgentCompany {
  id: string
  companyName: string
  companyCode?: string | null
  email?: string | null
  status: string
  adapterType?: string | null
  lastLocationSyncAt?: string | null
  branchCount: number
  locationCount: number
  agreements: AgentCompanyAgreement[]
}

export interface AgentCompaniesResponse {
  items: AgentCompany[]
  total: number
}

export interface SourceBranch {
  id: string
  branchCode: string
  name: string
  status?: string | null
  locationType?: string | null
  city?: string | null
  country?: string | null
  natoLocode?: string | null
  updatedAt?: string
}

export interface SourceBranchesResponse {
  source: {
    id: string
    companyName: string
    status: string
  }
  items: SourceBranch[]
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

export interface SourceCoverageItem {
  unlocode: string
  country: string
  place: string
  iata_code?: string
  latitude?: number
  longitude?: number
}

export interface SourceCoverageResponse {
  source: {
    id: string
    companyName: string
    status: string
  }
  items: SourceCoverageItem[]
  next_cursor?: string
  total?: number
  has_more?: boolean
}

export interface SourceGroupAgreement {
  id: string
  agreementRef: string
  status: string
  sourceId: string
  source?: {
    id: string
    companyName: string
    companyCode?: string | null
  }
}

export interface SourceGroup {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  agreements: SourceGroupAgreement[]
}

export interface SourceGroupsResponse {
  items: SourceGroup[]
  total: number
}

export const companiesApi = {
  listCompanies: async (params?: { search?: string }): Promise<AgentCompaniesResponse> => {
    const response = await api.get('/agent/companies', { params })
    return response.data
  },

  listSourceBranches: async (
    sourceId: string,
    params?: { limit?: number; offset?: number; search?: string; status?: string; locationType?: string }
  ): Promise<SourceBranchesResponse> => {
    const response = await api.get(`/coverage/source/${sourceId}/branches`, { params })
    return response.data
  },

  getSourceCoverage: async (
    sourceId: string,
    params?: { limit?: number; cursor?: string }
  ): Promise<SourceCoverageResponse> => {
    const response = await api.get(`/coverage/source/${sourceId}`, { params })
    return response.data
  },
}

export const sourceGroupsApi = {
  list: async (): Promise<SourceGroupsResponse> => {
    const response = await api.get('/agent/source-groups')
    return response.data
  },

  create: async (name: string): Promise<SourceGroup> => {
    const response = await api.post('/agent/source-groups', { name })
    return response.data
  },

  rename: async (id: string, name: string): Promise<SourceGroup> => {
    const response = await api.patch(`/agent/source-groups/${id}`, { name })
    return response.data
  },

  remove: async (id: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/agent/source-groups/${id}`)
    return response.data
  },

  attachAgreement: async (groupId: string, agreementId: string): Promise<any> => {
    const response = await api.post(`/agent/source-groups/${groupId}/agreements`, { agreementId })
    return response.data
  },

  detachAgreement: async (groupId: string, agreementId: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/agent/source-groups/${groupId}/agreements/${agreementId}`)
    return response.data
  },
}

