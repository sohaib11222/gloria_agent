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
    <Card>
      <CardHeader>
        <CardTitle>Agreement Offers</CardTitle>
        <p className="text-sm text-gray-600">
          Review and accept agreement offers from sources
        </p>
      </CardHeader>
      <CardContent>
        {user?.company.status === 'PENDING_VERIFICATION' ? (
          <div className="text-center py-8">
            <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-yellow-800">
                <h4 className="font-medium text-lg mb-2">Account Pending Verification</h4>
                <p className="text-sm">
                  Your company account is currently pending admin approval. 
                  Once approved, you will be able to see and accept agreement offers from sources.
                </p>
                <p className="text-xs mt-2 text-yellow-600">
                  Please wait for admin approval to access agreement offers.
                </p>
              </div>
            </div>
          </div>
        ) : isLoadingAgreements ? (
          <div className="flex justify-center py-8">
            <Loader />
          </div>
        ) : agreements.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No agreement offers available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {agreements.map((agreement) => (
              <div key={agreement.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Agreement {agreement.agreement_ref}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Agent ID: {agreement.agent_id}
                        </p>
                        <p className="text-sm text-gray-500">
                          Source ID: {agreement.source_id}
                        </p>
                      </div>
                      <Badge 
                        variant={
                          agreement.status === 'ACCEPTED' ? 'success' : 
                          agreement.status === 'OFFERED' ? 'warning' : 'danger'
                        }
                      >
                        {agreement.status}
                      </Badge>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      <p>Valid from: {new Date(agreement.valid_from).toLocaleString()}</p>
                      <p>Valid to: {new Date(agreement.valid_to).toLocaleString()}</p>
                    </div>
                  </div>
                  {agreement.status === 'OFFERED' && (
                    <Button
                      onClick={() => acceptAgreement(agreement.id)}
                      loading={isAcceptingAgreement === agreement.id}
                      variant="primary"
                      size="sm"
                    >
                      Accept Agreement
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
