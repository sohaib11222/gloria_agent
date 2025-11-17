import { sdkClient } from '../lib/sdkClient'

export interface AgreementOffer {
  id: string
  agent_id: string
  source_id: string
  agreement_ref: string
  status: 'OFFERED' | 'ACCEPTED' | 'REJECTED'
  valid_from: string
  valid_to: string
}

export interface AgreementsOffersResponse {
  items: AgreementOffer[]
}

export const agreementsOffersApi = {
  getOffers: async (): Promise<AgreementsOffersResponse> => {
    // Use SDK to list agreements with OFFERED status
    const response = await sdkClient.agreements.list({ status: 'OFFERED' })
    // Transform SDK response to match expected format
    return {
      items: response.items.map(agreement => ({
        id: agreement.id,
        agent_id: agreement.agentId,
        source_id: agreement.sourceId,
        agreement_ref: agreement.agreementRef,
        status: agreement.status as 'OFFERED' | 'ACCEPTED' | 'REJECTED',
        valid_from: agreement.validFrom,
        valid_to: agreement.validTo,
      }))
    }
  },

  acceptAgreement: async (agreementId: string): Promise<AgreementOffer> => {
    // Use SDK to accept agreement
    const agreement = await sdkClient.agreements.accept(agreementId)
    // Transform SDK response to match expected format
    return {
      id: agreement.id,
      agent_id: agreement.agentId,
      source_id: agreement.sourceId,
      agreement_ref: agreement.agreementRef,
      status: agreement.status as 'OFFERED' | 'ACCEPTED' | 'REJECTED',
      valid_from: agreement.validFrom,
      valid_to: agreement.validTo,
    }
  },
}
