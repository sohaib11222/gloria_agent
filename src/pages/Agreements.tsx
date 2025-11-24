import React, { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { agreementsOffersApi, AgreementOffer } from '../api/agreementsOffers'
import api from '../lib/api'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Loader } from '../components/ui/Loader'
import toast from 'react-hot-toast'

interface Agreement {
  id: string
  agentId: string
  sourceId: string
  agreementRef: string
  status: 'DRAFT' | 'OFFERED' | 'ACCEPTED' | 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'REJECTED'
  validFrom: string
  validTo: string
  createdAt: string
  updatedAt: string
  agent?: {
    id: string
    companyName: string
    email: string
    status: string
  }
  source?: {
    id: string
    companyName: string
    email: string
    status: string
  }
}

const getStatusColor = (status: string): 'success' | 'warning' | 'danger' | 'default' => {
  switch (status) {
    case 'ACTIVE':
    case 'ACCEPTED':
      return 'success'
    case 'OFFERED':
      return 'warning'
    case 'SUSPENDED':
    case 'EXPIRED':
    case 'REJECTED':
      return 'danger'
    default:
      return 'default'
  }
}

export default function Agreements() {
  const [activeTab, setActiveTab] = useState<'offers' | 'all'>('offers')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
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

  // Fetch all agreements for the agent
  const { data: allAgreementsData, isLoading: isLoadingAll, refetch: refetchAll } = useQuery({
    queryKey: ['agent-agreements', statusFilter],
    queryFn: async () => {
      const response = await api.get('/agreements', {
        params: {
          scope: 'agent',
          ...(statusFilter !== 'ALL' ? { status: statusFilter } : {}),
        },
      })
      return response.data
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  // Fetch offers (OFFERED status only)
  const { data: offersData, isLoading: isLoadingOffers, refetch: refetchOffers } = useQuery({
    queryKey: ['agent-offers'],
    queryFn: async () => {
      const response = await agreementsOffersApi.getOffers()
      return response
    },
    refetchInterval: 5000, // Refetch every 5 seconds for offers
  })

  const allAgreements: Agreement[] = (allAgreementsData?.items || []) as Agreement[]
  const offers: AgreementOffer[] = offersData?.items || []

  // Check for new offers and notify
  useEffect(() => {
    const newOffers = offers.filter(
      (a) => a.status === 'OFFERED' && !notifiedAgreementsRef.current.has(a.id)
    )
    if (newOffers.length > 0) {
      toast.success(`New agreement offer: ${newOffers[0].agreement_ref}`)
      newOffers.forEach((a) => notifiedAgreementsRef.current.add(a.id))
      localStorage.setItem(
        'notifiedAgreements',
        JSON.stringify(Array.from(notifiedAgreementsRef.current))
      )
    }
  }, [offers])

  const acceptAgreement = async (agreementId: string) => {
    setIsAccepting(agreementId)
    try {
      await agreementsOffersApi.acceptAgreement(agreementId)
      toast.success('Agreement accepted successfully')
      await Promise.all([refetchOffers(), refetchAll()])
    } catch (error: any) {
      console.error('Failed to accept agreement:', error)
      toast.error(error.response?.data?.message || 'Failed to accept agreement')
    } finally {
      setIsAccepting(null)
    }
  }

  const getStatusCounts = () => {
    const counts: Record<string, number> = {
      ALL: allAgreements.length,
      DRAFT: 0,
      OFFERED: 0,
      ACCEPTED: 0,
      ACTIVE: 0,
      SUSPENDED: 0,
      EXPIRED: 0,
      REJECTED: 0,
    }
    allAgreements.forEach((ag) => {
      const status = ag.status || 'DRAFT'
      if (counts[status] !== undefined) {
        counts[status]++
      }
    })
    return counts
  }

  const statusCounts = getStatusCounts()
  const offeredAgreements = allAgreements.filter((a) => a.status === 'OFFERED')
  const filteredAgreements =
    statusFilter === 'ALL'
      ? allAgreements
      : allAgreements.filter((ag) => ag.status === statusFilter)

  const isLoading = activeTab === 'offers' ? isLoadingOffers : isLoadingAll

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Agreements</h1>
        <p className="mt-2 text-gray-600">
          Review and manage your agreements with sources
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
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
          >
            Available to Accept
            {offeredAgreements.length > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {offeredAgreements.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
          >
            All Agreements
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {allAgreements.length}
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
                      <div className="flex items-center space-x-4 mb-3">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {agreement.agreementRef}
                        </h4>
                        <Badge variant="warning">OFFERED</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Source:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {agreement.source?.companyName || agreement.sourceId || 'Unknown'}
                          </span>
                          {agreement.source?.email && (
                            <span className="ml-2 text-gray-500 text-xs">
                              ({agreement.source.email})
                            </span>
                          )}
                        </div>
                        <div>
                          <span className="text-gray-500">Agreement ID:</span>
                          <span className="ml-2 font-mono text-gray-700 text-xs">
                            {agreement.id.slice(0, 16)}...
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Valid From:</span>
                          <span className="ml-2 text-gray-900">
                            {agreement.validFrom
                              ? new Date(agreement.validFrom).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Valid To:</span>
                          <span className="ml-2 text-gray-900">
                            {agreement.validTo
                              ? new Date(agreement.validTo).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-gray-500">
                        <span>Created: {new Date(agreement.createdAt).toLocaleString()}</span>
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
        <>
          {/* Status Filter Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {['ALL', 'DRAFT', 'OFFERED', 'ACCEPTED', 'ACTIVE', 'SUSPENDED', 'EXPIRED', 'REJECTED'].map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`${
                      statusFilter === status
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                  >
                    {status}
                    {statusCounts[status] > 0 && (
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          statusFilter === status
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {statusCounts[status]}
                      </span>
                    )}
                  </button>
                )
              )}
            </nav>
          </div>

          {/* All Agreements List */}
          {filteredAgreements.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-gray-500">
                  {statusFilter === 'ALL'
                    ? 'No agreements found'
                    : `No agreements with status "${statusFilter}"`}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredAgreements.map((agreement) => (
                <Card key={agreement.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h4 className="text-lg font-semibold text-gray-900">
                            {agreement.agreementRef}
                          </h4>
                          <Badge variant={getStatusColor(agreement.status)} size="sm">
                            {agreement.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Source:</span>
                            <span className="ml-2 font-medium text-gray-900">
                              {agreement.source?.companyName || agreement.sourceId || 'Unknown'}
                            </span>
                            {agreement.source?.email && (
                              <span className="ml-2 text-gray-500 text-xs">
                                ({agreement.source.email})
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="text-gray-500">Agreement ID:</span>
                            <span className="ml-2 font-mono text-gray-700 text-xs">
                              {agreement.id.slice(0, 16)}...
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Valid From:</span>
                            <span className="ml-2 text-gray-900">
                              {agreement.validFrom
                                ? new Date(agreement.validFrom).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })
                                : 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Valid To:</span>
                            <span className="ml-2 text-gray-900">
                              {agreement.validTo
                                ? new Date(agreement.validTo).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })
                                : 'N/A'}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 text-xs text-gray-500">
                          <span>Created: {new Date(agreement.createdAt).toLocaleString()}</span>
                          {agreement.updatedAt !== agreement.createdAt && (
                            <span className="ml-4">
                              Updated: {new Date(agreement.updatedAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      {agreement.status === 'OFFERED' && (
                        <Button
                          onClick={() => acceptAgreement(agreement.id)}
                          loading={isAccepting === agreement.id}
                          variant="primary"
                          size="md"
                        >
                          Accept
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
