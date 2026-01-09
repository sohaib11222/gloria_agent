import React, { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { agreementsOffersApi, AgreementOffer } from '../api/agreementsOffers'
import api from '../lib/api'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Loader } from '../components/ui/Loader'
import { ErrorDisplay } from '../components/ui/ErrorDisplay'
import { Input } from '../components/ui/Input'
import { Search as SearchIcon } from 'lucide-react'
import { showToast } from '../components/ui/ToastConfig'

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
  const [searchQuery, setSearchQuery] = useState<string>('')
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
  const { data: allAgreementsData, isLoading: isLoadingAll, error: allAgreementsError, refetch: refetchAll } = useQuery({
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
    retry: 1,
  })

  // Fetch offers (OFFERED status only)
  const { data: offersData, isLoading: isLoadingOffers, error: offersError, refetch: refetchOffers } = useQuery({
    queryKey: ['agent-offers'],
    queryFn: async () => {
      const response = await agreementsOffersApi.getOffers()
      return response
    },
    refetchInterval: 5000, // Refetch every 5 seconds for offers
    retry: 1,
  })

  const allAgreements: Agreement[] = (allAgreementsData?.items || []) as Agreement[]
  const offers: AgreementOffer[] = offersData?.items || []

  // Check for new offers and notify
  useEffect(() => {
    const newOffers = offers.filter(
      (a) => a.status === 'OFFERED' && !notifiedAgreementsRef.current.has(a.id)
    )
    if (newOffers.length > 0) {
      showToast.success(`New agreement offer: ${newOffers[0].agreement_ref}`)
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
      showToast.success('Agreement accepted successfully')
      await Promise.all([refetchOffers(), refetchAll()])
    } catch (error: any) {
      console.error('Failed to accept agreement:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to accept agreement'
      showToast.error(errorMessage)
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
  
  // Apply search filter
  const searchFilteredAgreements = searchQuery
    ? allAgreements.filter((ag) => {
        const searchLower = searchQuery.toLowerCase()
        return (
          ag.agreementRef?.toLowerCase().includes(searchLower) ||
          ag.id?.toLowerCase().includes(searchLower) ||
          ag.source?.companyName?.toLowerCase().includes(searchLower) ||
          ag.source?.email?.toLowerCase().includes(searchLower)
        )
      })
    : allAgreements
  
  // Apply status filter
  const filteredAgreements =
    statusFilter === 'ALL'
      ? searchFilteredAgreements
      : searchFilteredAgreements.filter((ag) => ag.status === statusFilter)

  const isLoading = activeTab === 'offers' ? isLoadingOffers : isLoadingAll

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-8 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold">Agreements</h1>
        </div>
        <p className="text-green-100 text-lg">
          Review and manage your agreements with sources
        </p>
      </div>

      {/* Error Displays */}
      {allAgreementsError && activeTab === 'all' && (
        <ErrorDisplay
          error={allAgreementsError}
          title="Failed to load agreements"
          onDismiss={() => refetchAll()}
        />
      )}
      {offersError && activeTab === 'offers' && (
        <ErrorDisplay
          error={offersError}
          title="Failed to load offers"
          onDismiss={() => refetchOffers()}
        />
      )}

      <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm p-2">
        <nav className="flex space-x-2">
          <button
            onClick={() => setActiveTab('offers')}
            className={`${
              activeTab === 'offers'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } whitespace-nowrap py-3 px-6 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all duration-200 transform ${
              activeTab === 'offers' ? 'scale-105' : 'hover:scale-102'
            }`}
          >
            Available to Accept
            {offeredAgreements.length > 0 && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'offers' 
                  ? 'bg-white/30 text-white' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {offeredAgreements.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } whitespace-nowrap py-3 px-6 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all duration-200 transform ${
              activeTab === 'all' ? 'scale-105' : 'hover:scale-102'
            }`}
          >
            All Agreements
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
              activeTab === 'all'
                ? 'bg-white/30 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}>
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
          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
            <CardContent className="p-16 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No pending agreement offers</h3>
              <p className="text-gray-600">All agreements have been reviewed</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {offeredAgreements.map((agreement) => (
              <Card key={agreement.id} className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 hover:shadow-lg transition-all duration-300">
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
          {/* Search and Status Filter */}
          <div className="mb-6 space-y-4">
            <div className="max-w-md">
              <Input
                label="Search Agreements"
                placeholder="Search by reference, ID, source..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Status Filter Tabs */}
            <div className="border-b border-gray-200">
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
          </div>

          {/* All Agreements List */}
          {isLoadingAll ? (
            <div className="flex justify-center py-12">
              <Loader />
            </div>
          ) : filteredAgreements.length === 0 ? (
            <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
              <CardContent className="p-16 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {searchQuery
                    ? `No agreements found matching "${searchQuery}"`
                    : statusFilter === 'ALL'
                    ? 'No agreements found'
                    : `No agreements with status "${statusFilter}"`}
                </h3>
                {(searchQuery || statusFilter !== 'ALL') && (
                  <Button
                    variant="secondary"
                    size="md"
                    className="mt-6 shadow-md hover:shadow-lg"
                    onClick={() => {
                      setSearchQuery('')
                      setStatusFilter('ALL')
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredAgreements.map((agreement) => (
                <Card key={agreement.id} className={`border-2 hover:shadow-lg transition-all duration-300 ${
                  agreement.status === 'ACTIVE' || agreement.status === 'ACCEPTED'
                    ? 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50'
                    : agreement.status === 'OFFERED'
                    ? 'border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50'
                    : 'border-gray-200 bg-white'
                }`}>
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
