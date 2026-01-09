import React, { useState, useEffect, useRef } from 'react'
import { agreementsOffersApi, AgreementOffer } from '../api/agreementsOffers'
import api from '../lib/api'
import { Button } from './ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Badge } from './ui/Badge'
import { Loader } from './ui/Loader'
import toast from 'react-hot-toast'

interface AgreementOffersProps {
  user: any
}

export const AgreementOffers: React.FC<AgreementOffersProps> = ({ user }) => {
  const [agreements, setAgreements] = useState<AgreementOffer[]>([])
  const [isLoadingAgreements, setIsLoadingAgreements] = useState(false)
  const [isAcceptingAgreement, setIsAcceptingAgreement] = useState<string | null>(null)
  const [previousAgreements, setPreviousAgreements] = useState<AgreementOffer[]>([])
  const notifiedAgreementsRef = useRef<Set<string>>(new Set())

  // Load notified agreements from localStorage on component mount
  useEffect(() => {
    const storedNotified = localStorage.getItem('notifiedAgreements')
    if (storedNotified) {
      try {
        const parsed = JSON.parse(storedNotified) as string[]
        const notifiedSet = new Set(parsed)
        notifiedAgreementsRef.current = notifiedSet
      } catch (error) {
        console.error('Failed to parse notified agreements from localStorage:', error)
      }
    }
  }, [])

  useEffect(() => {
    if (user?.company.status !== 'PENDING_VERIFICATION') {
      loadAgreements()
      
      // Set up auto-refresh for agreements every 2 seconds
      const interval = setInterval(() => loadAgreements(false), 2000)
      return () => clearInterval(interval)
    }
  }, [user])

  const loadAgreements = async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoadingAgreements(true)
      }
      const response = await agreementsOffersApi.getOffers()
      
      // Check if the response is the same as before (no changes)
      const isSameResponse = JSON.stringify(response.items) === JSON.stringify(previousAgreements)
      
      if (!isSameResponse) {
        // Only check for new OFFERED agreements if the response has actually changed
        const newOfferedAgreements = response.items.filter(
          agreement => agreement.status === 'OFFERED' && 
          !notifiedAgreementsRef.current.has(agreement.id)
        )
        
        if (newOfferedAgreements.length > 0) {
          // Show notification for the first new agreement
          toast.success(`New agreement offer received: ${newOfferedAgreements[0].agreement_ref}`)
          
          // Immediately update the ref to prevent duplicate notifications
          newOfferedAgreements.forEach(agreement => {
            notifiedAgreementsRef.current.add(agreement.id)
          })
          
          // Update localStorage
          localStorage.setItem('notifiedAgreements', JSON.stringify(Array.from(notifiedAgreementsRef.current)))
        }
      }
      
      // Update both current and previous agreements
      setAgreements(response.items)
      setPreviousAgreements(response.items)
    } catch (error) {
      console.error('Failed to load agreements:', error)
    } finally {
      if (showLoading) {
        setIsLoadingAgreements(false)
      }
    }
  }

  const acceptAgreement = async (agreementId: string) => {
    setIsAcceptingAgreement(agreementId)
    try {
      // Optional duplicate check if backend supports it
      try {
        const offer = agreements.find(a => a.id === agreementId)
        if (offer) {
          const dupPayload = { agreementRef: offer.agreement_ref, agentId: offer.agent_id, sourceId: offer.source_id }
          const { data } = await api.post('/agreements/check-duplicate', dupPayload)
          if (data?.duplicate) {
            toast.error('Duplicate agreement detected for this agent/source')
          }
        }
      } catch {}

      await agreementsOffersApi.acceptAgreement(agreementId)
      toast.success('Agreement activated')
      // Reload agreements to get updated status
      await loadAgreements(false)
    } catch (error) {
      console.error('Failed to accept agreement:', error)
      toast.error('Failed to accept agreement')
    } finally {
      setIsAcceptingAgreement(null)
    }
  }

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-xl">
        <CardTitle className="text-white">Agreement Offers</CardTitle>
        <p className="text-green-100 text-sm mt-1">
          Review and accept agreement offers from sources
        </p>
      </CardHeader>
      <CardContent className="p-6">
        {user?.company.status === 'PENDING_VERIFICATION' ? (
          <div className="text-center py-12">
            <div className="p-6 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-xl shadow-lg">
              <div className="text-yellow-900">
                <div className="mb-4">
                  <svg className="w-12 h-12 text-yellow-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-bold text-xl mb-3">Account Pending Verification</h4>
                <p className="text-sm font-medium mb-2">
                  Your company account is currently pending admin approval. 
                  Once approved, you will be able to see and accept agreement offers from sources.
                </p>
                <p className="text-xs mt-3 text-yellow-700 font-semibold">
                  Please wait for admin approval to access agreement offers.
                </p>
              </div>
            </div>
          </div>
        ) : isLoadingAgreements ? (
          <div className="flex justify-center py-12">
            <Loader />
          </div>
        ) : agreements.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 font-medium">No agreement offers available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {agreements.map((agreement) => (
              <Card key={agreement.id} className={`border-2 transition-all duration-300 hover:shadow-lg ${
                agreement.status === 'OFFERED' 
                  ? 'border-orange-300 bg-gradient-to-r from-orange-50 to-amber-50' 
                  : agreement.status === 'ACCEPTED'
                  ? 'border-green-300 bg-gradient-to-r from-green-50 to-emerald-50'
                  : 'border-gray-200 bg-white'
              }`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <div>
                          <h4 className="font-bold text-lg text-gray-900">
                            Agreement {agreement.agreement_ref}
                          </h4>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm text-gray-600">
                              <span className="font-semibold">Agent ID:</span> {agreement.agent_id}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-semibold">Source ID:</span> {agreement.source_id}
                            </p>
                          </div>
                        </div>
                        <Badge 
                          variant={
                            agreement.status === 'ACCEPTED' ? 'success' : 
                            agreement.status === 'OFFERED' ? 'warning' : 'danger'
                          }
                          className="text-sm font-semibold px-3 py-1"
                        >
                          {agreement.status}
                        </Badge>
                      </div>
                      <div className="mt-3 p-3 bg-white/60 rounded-lg border border-gray-200">
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="font-semibold text-gray-600">Valid from:</span>
                            <p className="text-gray-900 font-medium mt-1">{new Date(agreement.valid_from).toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-600">Valid to:</span>
                            <p className="text-gray-900 font-medium mt-1">{new Date(agreement.valid_to).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    {agreement.status === 'OFFERED' && (
                      <div className="ml-4">
                        <Button
                          onClick={() => acceptAgreement(agreement.id)}
                          loading={isAcceptingAgreement === agreement.id}
                          variant="primary"
                          size="md"
                          className="shadow-md hover:shadow-lg"
                        >
                          Accept Agreement
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
