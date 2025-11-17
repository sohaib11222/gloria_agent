import React, { useState, useEffect, useRef } from 'react'
import { agreementsOffersApi, AgreementOffer } from '../api/agreementsOffers'
import api from '../lib/api'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Loader } from '../components/ui/Loader'
import toast from 'react-hot-toast'

export default function Agreements() {
  const [activeTab, setActiveTab] = useState<'offers' | 'accepted'>('offers')
  const [allAgreements, setAllAgreements] = useState<AgreementOffer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAccepting, setIsAccepting] = useState<string | null>(null)
  const notifiedAgreementsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const storedNotified = localStorage.getItem('notifiedAgreements')
    if (storedNotified) {
      try {
        const parsed = JSON.parse(storedNotified) as string[]
        notifiedAgreementsRef.current = new Set(parsed)
      } catch (error) {
        console.error('Failed to parse notified agreements:', error)
      }
    }
  }, [])

  useEffect(() => {
    loadAgreements()
    const interval = setInterval(() => loadAgreements(false), 5000)
    return () => clearInterval(interval)
  }, [])

  const loadAgreements = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true)
      const response = await agreementsOffersApi.getOffers()
      
      // Check for new offers
      const newOffers = response.items.filter(
        a => a.status === 'OFFERED' && !notifiedAgreementsRef.current.has(a.id)
      )
      if (newOffers.length > 0) {
        toast.success(`New agreement offer: ${newOffers[0].agreement_ref}`)
        newOffers.forEach(a => notifiedAgreementsRef.current.add(a.id))
        localStorage.setItem('notifiedAgreements', JSON.stringify(Array.from(notifiedAgreementsRef.current)))
      }
      
      setAllAgreements(response.items)
    } catch (error) {
      console.error('Failed to load agreements:', error)
      toast.error('Failed to load agreements')
    } finally {
      if (showLoading) setIsLoading(false)
    }
  }

  const acceptAgreement = async (agreementId: string) => {
    setIsAccepting(agreementId)
    try {
      // Optional duplicate check
      try {
        const offer = allAgreements.find(a => a.id === agreementId)
        if (offer) {
          const { data } = await api.post('/agreements/check-duplicate', {
            agreementRef: offer.agreement_ref,
            agentId: offer.agent_id,
            sourceId: offer.source_id,
          })
          if (data?.duplicate) {
            toast.error('Duplicate agreement detected for this agent/source')
          }
        }
      } catch {}

      await agreementsOffersApi.acceptAgreement(agreementId)
      toast.success('Agreement activated')
      await loadAgreements(false)
    } catch (error: any) {
      console.error('Failed to accept agreement:', error)
      toast.error(error.response?.data?.message || 'Failed to accept agreement')
    } finally {
      setIsAccepting(null)
    }
  }

  const offeredAgreements = allAgreements.filter(a => a.status === 'OFFERED')
  const acceptedAgreements = allAgreements.filter(a => a.status === 'ACCEPTED')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Agreements</h1>
        <p className="mt-2 text-gray-600">
          Review and accept agreement offers from sources
        </p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('offers')}
            className={`${
              activeTab === 'offers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Available to Accept
            {offeredAgreements.length > 0 && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {offeredAgreements.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('accepted')}
            className={`${
              activeTab === 'accepted'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            My Agreements
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {acceptedAgreements.length}
            </span>
          </button>
        </nav>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader />
        </div>
      ) : activeTab === 'offers' ? (
        offeredAgreements.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500">No pending agreement offers</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {offeredAgreements.map((agreement) => (
              <Card key={agreement.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <h4 className="text-lg font-semibold text-gray-900">
                          Agreement {agreement.agreement_ref}
                        </h4>
                        <Badge variant="warning">OFFERED</Badge>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Agent ID:</span>
                          <span className="ml-2 font-mono">{agreement.agent_id}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Source ID:</span>
                          <span className="ml-2 font-mono">{agreement.source_id}</span>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        <p>Valid from: {new Date(agreement.valid_from).toLocaleString()}</p>
                        <p>Valid to: {new Date(agreement.valid_to).toLocaleString()}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => acceptAgreement(agreement.id)}
                      loading={isAccepting === agreement.id}
                      variant="primary"
                      size="md"
                    >
                      Accept Agreement
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : (
        acceptedAgreements.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500">No accepted agreements yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {acceptedAgreements.map((agreement) => (
              <Card key={agreement.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <h4 className="text-lg font-semibold text-gray-900">
                          Agreement {agreement.agreement_ref}
                        </h4>
                        <Badge variant="success">ACCEPTED</Badge>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Agent ID:</span>
                          <span className="ml-2 font-mono">{agreement.agent_id}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Source ID:</span>
                          <span className="ml-2 font-mono">{agreement.source_id}</span>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        <p>Valid from: {new Date(agreement.valid_from).toLocaleString()}</p>
                        <p>Valid to: {new Date(agreement.valid_to).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}
    </div>
  )
}

