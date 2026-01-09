import React, { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Loader } from '../components/ui/Loader'
import { Badge } from '../components/ui/Badge'
import api from '../lib/api'
import { locationsApi, Location } from '../api/locations'
import { ErrorDisplay } from '../components/ui/ErrorDisplay'
import { showToast } from '../components/ui/ToastConfig'

interface AvailabilityOffer {
  supplier_offer_ref: string
  source_id: string
  agreement_ref: string
  pickup_location: string
  dropoff_location: string
  vehicle_class: string
  vehicle_make_model: string
  rate_plan_code: string
  total_price: number
  currency: string
  availability_status: string
  supplier_name: string
}

interface SubmitResp { request_id: string; recommended_poll_ms: number; status: string }
interface PollResp { request_id: string; status: string; last_seq: number; offers: AvailabilityOffer[]; complete: boolean; error?: string }

export default function AvailabilityTest() {
  const [pickup, setPickup] = useState('')
  const [dropoff, setDropoff] = useState('')
  const [pickupDate, setPickupDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [driverAge, setDriverAge] = useState('')
  const [agreementRef, setAgreementRef] = useState('')
  const [agreements, setAgreements] = useState<Array<{ id: string; agreementRef: string; status: string }>>([])
  const [selectedAgreementId, setSelectedAgreementId] = useState('')

  const [pickupSuggestions, setPickupSuggestions] = useState<any[]>([])
  const [dropoffSuggestions, setDropoffSuggestions] = useState<any[]>([])
  const [totalExpected, setTotalExpected] = useState<number | null>(null)
  const [locationSearch, setLocationSearch] = useState({ pickup: '', dropoff: '' })

  // Fetch all UN/LOCODEs for dropdown
  const { data: locationsData, isLoading: isLoadingLocations, error: locationsError } = useQuery({
    queryKey: ['locations', 'all'],
    queryFn: async () => {
      // Fetch all locations with a high limit
      const result = await locationsApi.listLocations({ limit: 1000 })
      return result.items || []
    },
    retry: 1,
  })

  const [requestId, setRequestId] = useState<string | null>(null)
  const [offers, setOffers] = useState<AvailabilityOffer[]>([])
  const [isPolling, setIsPolling] = useState(false)
  const [pollStatus, setPollStatus] = useState('')
  const [timedOutSources, setTimedOutSources] = useState<number>(0)

  const submit = useMutation({
    mutationFn: async () => {
      const payload: any = {
        pickup_unlocode: pickup,
        dropoff_unlocode: dropoff,
        pickup_iso: new Date(pickupDate).toISOString(),
        dropoff_iso: new Date(returnDate).toISOString(),
      }
      if (driverAge) payload.driver_age = Number(driverAge)
      if (agreementRef) payload.agreement_refs = [agreementRef]
      const { data } = await api.post<SubmitResp>('/availability/submit', payload)
      return data
    },
    onSuccess: (data) => {
      setRequestId(data.request_id)
      setOffers([])
      setTimedOutSources(0)
      setTotalExpected((data as any)?.total_expected ?? null)
      setIsPolling(true)
      setPollStatus('PENDING')
      showToast.success('Availability request submitted')
    },
    onError: (e: any) => {
      const errorMessage = e?.response?.data?.message || e?.message || 'Failed to submit availability'
      showToast.error(errorMessage)
    }
  })

  const poll = useMutation({
    mutationFn: async ({ sinceSeq }: { sinceSeq: number }) => {
      const params: any = { requestId: requestId!, sinceSeq, waitMs: 1500 }
      const { data } = await api.get<PollResp>('/availability/poll', { params })
      return data
    },
    onSuccess: (data) => {
      if (Array.isArray(data.offers) && data.offers.length) {
        setOffers(prev => prev.concat(data.offers))
      }
      setPollStatus(data.status)
      if ((data as any)?.timed_out_sources != null) {
        setTimedOutSources((data as any).timed_out_sources)
      }
      if (data.complete || data.status === 'COMPLETE') {
        setIsPolling(false)
      }
    },
    onError: (error: any) => {
      setIsPolling(false)
      setPollStatus('ERROR')
      const errorMessage = error?.response?.data?.message || error?.message || 'Polling failed'
      showToast.error(errorMessage)
    }
  })

  useEffect(() => {
    if (!isPolling || !requestId) return
    const interval = setInterval(() => {
      poll.mutate({ sinceSeq: offers.length })
    }, 1800)
    return () => clearInterval(interval)
  }, [isPolling, requestId, offers.length])

  const vehicleList = useMemo(() => offers, [offers])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!pickup || !dropoff || !pickupDate || !returnDate) {
      showToast.error('Please fill all required fields (pickup, dropoff, and dates)')
      return
    }
    if (new Date(pickupDate) >= new Date(returnDate)) {
      showToast.error('Return date must be after pickup date')
      return
    }
    submit.mutate()
  }

  // If an agreement is selected, use its allowed locations
  useEffect(() => {
    const load = async () => {
      if (!selectedAgreementId) return
      try {
        const { data } = await api.get(`/agreements/${selectedAgreementId}/locations`)
        const items = (data?.items ?? []).map((i: any) => ({ unlocode: i.unlocode, place: i.place || i.name, country: i.country }))
        setPickupSuggestions(items)
        setDropoffSuggestions(items)
        const ag = agreements.find(a => a.id === selectedAgreementId)
        if (ag?.agreementRef) setAgreementRef(ag.agreementRef)
      } catch {}
    }
    load()
  }, [selectedAgreementId, agreements])

  useEffect(() => {
    // Load agent agreements (ACTIVE preferred)
    const load = async () => {
      try {
        const { data } = await api.get('/agreements', { params: { status: 'ACTIVE' } })
        const items = (data?.items ?? data ?? []).map((a: any) => ({ id: a.id, agreementRef: a.agreement_ref || a.agreementRef || '', status: a.status }))
        setAgreements(items)
      } catch {}
    }
    load()
  }, [])

  // Filter locations based on search and agreement selection
  const filteredPickupLocations = useMemo(() => {
    if (selectedAgreementId && pickupSuggestions.length > 0) {
      // If agreement is selected, use agreement locations
      if (!locationSearch.pickup) return pickupSuggestions
      const search = locationSearch.pickup.toLowerCase()
      return pickupSuggestions.filter((loc: any) => 
        loc.unlocode?.toLowerCase().includes(search) ||
        loc.place?.toLowerCase().includes(search) ||
        loc.country?.toLowerCase().includes(search)
      )
    }
    // Otherwise, use all locations from database
    if (!locationsData) return []
    if (!locationSearch.pickup) return locationsData
    const search = locationSearch.pickup.toLowerCase()
    return locationsData.filter((loc) =>
      loc.unlocode.toLowerCase().includes(search) ||
      loc.place.toLowerCase().includes(search) ||
      loc.country.toLowerCase().includes(search) ||
      (loc.iata_code && loc.iata_code.toLowerCase().includes(search))
    )
  }, [locationSearch.pickup, locationsData, selectedAgreementId, pickupSuggestions])

  const filteredDropoffLocations = useMemo(() => {
    if (selectedAgreementId && dropoffSuggestions.length > 0) {
      // If agreement is selected, use agreement locations
      if (!locationSearch.dropoff) return dropoffSuggestions
      const search = locationSearch.dropoff.toLowerCase()
      return dropoffSuggestions.filter((loc: any) => 
        loc.unlocode?.toLowerCase().includes(search) ||
        loc.place?.toLowerCase().includes(search) ||
        loc.country?.toLowerCase().includes(search)
      )
    }
    // Otherwise, use all locations from database
    if (!locationsData) return []
    if (!locationSearch.dropoff) return locationsData
    const search = locationSearch.dropoff.toLowerCase()
    return locationsData.filter((loc) =>
      loc.unlocode.toLowerCase().includes(search) ||
      loc.place.toLowerCase().includes(search) ||
      loc.country.toLowerCase().includes(search) ||
      (loc.iata_code && loc.iata_code.toLowerCase().includes(search))
    )
  }, [locationSearch.dropoff, locationsData, selectedAgreementId, dropoffSuggestions])

  // Create options for Select components
  const pickupOptions = [
    { value: '', label: '-- Select Pickup Location --' },
    ...filteredPickupLocations.map((loc: any) => ({
      value: loc.unlocode,
      label: `${loc.unlocode} - ${loc.place || loc.name || 'Unknown'}, ${loc.country}${loc.iata_code ? ` (${loc.iata_code})` : ''}`,
    })),
  ]

  const dropoffOptions = [
    { value: '', label: '-- Select Dropoff Location --' },
    ...filteredDropoffLocations.map((loc: any) => ({
      value: loc.unlocode,
      label: `${loc.unlocode} - ${loc.place || loc.name || 'Unknown'}, ${loc.country}${loc.iata_code ? ` (${loc.iata_code})` : ''}`,
    })),
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl p-8 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold">Availability Test</h1>
        </div>
        <p className="text-teal-100 text-lg">
          This calls the middleware Availability endpoint and will fan out to all sources that have an active agreement for you.
        </p>
      </div>

      {/* Error Display */}
      {locationsError && (
        <ErrorDisplay
          error={locationsError}
          title="Failed to load locations"
          variant="warning"
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200">
            <CardHeader className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-t-xl">
              <CardTitle className="text-white">Search Form</CardTitle>
              <p className="text-teal-100 text-sm mt-1">Enter your search criteria to find available vehicles</p>
            </CardHeader>
            <CardContent className="p-6">
              {submit.isError && (
                <ErrorDisplay
                  error={submit.error}
                  title="Submission failed"
                  className="mb-4"
                />
              )}
              <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Agreement</label>
                <select
                  className="mt-1 block w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm transition-all"
                  value={selectedAgreementId}
                  onChange={(e) => setSelectedAgreementId(e.target.value)}
                >
                  <option value="">No specific agreement (global)</option>
                  {agreements.map(a => (
                    <option key={a.id} value={a.id}>{a.agreementRef} ({a.status})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Pickup (UN/LOCODE)</label>
                <Input
                  placeholder="Search locations..."
                  value={locationSearch.pickup}
                  onChange={(e) => setLocationSearch({ ...locationSearch, pickup: e.target.value })}
                  className="mb-2"
                />
                <Select
                  options={pickupOptions}
                  value={pickup}
                  onChange={(e) => {
                    setPickup(e.target.value)
                    if (e.target.value) {
                      setLocationSearch({ ...locationSearch, pickup: '' })
                    }
                  }}
                  disabled={isLoadingLocations}
                />
                {isLoadingLocations && (
                  <p className="text-xs text-gray-500">Loading locations...</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Dropoff (UN/LOCODE)</label>
                <Input
                  placeholder="Search locations..."
                  value={locationSearch.dropoff}
                  onChange={(e) => setLocationSearch({ ...locationSearch, dropoff: e.target.value })}
                  className="mb-2"
                />
                <Select
                  options={dropoffOptions}
                  value={dropoff}
                  onChange={(e) => {
                    setDropoff(e.target.value)
                    if (e.target.value) {
                      setLocationSearch({ ...locationSearch, dropoff: '' })
                    }
                  }}
                  disabled={isLoadingLocations}
                />
                {isLoadingLocations && (
                  <p className="text-xs text-gray-500">Loading locations...</p>
                )}
              </div>
              <Input label="Driver Age" placeholder="30" value={driverAge} onChange={(e: any) => setDriverAge(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="Pickup Date" type="datetime-local" value={pickupDate} onChange={(e: any) => setPickupDate(e.target.value)} />
              <Input label="Return Date" type="datetime-local" value={returnDate} onChange={(e: any) => setReturnDate(e.target.value)} />
              <Input label="Agreement Ref (optional)" placeholder="AG-2025-736" value={agreementRef} onChange={(e: any) => setAgreementRef(e.target.value)} />
            </div>
            <div className="flex justify-end pt-2">
              <Button 
                type="submit" 
                loading={submit.isPending}
                className="h-12 px-8 text-base font-semibold shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-[1.02]"
              >
                {submit.isPending ? 'Searching...' : 'Search Availability'}
              </Button>
            </div>
          </form>
        </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
            <CardHeader className="bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-t-xl">
              <CardTitle className="text-white">Results</CardTitle>
              <p className="text-emerald-100 text-sm mt-1">
                {vehicleList.length > 0 ? `${vehicleList.length} offer${vehicleList.length !== 1 ? 's' : ''} found` : 'No results yet'}
              </p>
            </CardHeader>
            <CardContent className="p-6">
              {requestId ? (
                <div className="space-y-4">
                  {isPolling && (
                    <div className="flex items-center justify-center gap-3 py-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <Loader size="sm" />
                      <span className="text-sm font-medium text-blue-700">Polling for more results...</span>
                    </div>
                  )}
                  {vehicleList.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                      {vehicleList.map((offer, idx) => (
                        <Card key={idx} className="border-2 border-gray-200 hover:border-teal-300 hover:shadow-md transition-all duration-300">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="font-bold text-lg text-gray-900 mb-1">{offer.vehicle_make_model}</div>
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                  <span className="font-medium">{offer.vehicle_class}</span>
                                  <span>•</span>
                                  <span>{offer.rate_plan_code}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg inline-flex">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <span className="font-medium">{offer.pickup_location}</span>
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                  </svg>
                                  <span className="font-medium">{offer.dropoff_location}</span>
                                </div>
                                {offer.supplier_name && (
                                  <div className="mt-2 text-xs text-gray-500">
                                    Supplier: <span className="font-semibold">{offer.supplier_name}</span>
                                  </div>
                                )}
                              </div>
                              <div className="text-right ml-4">
                                <div className="text-2xl font-bold text-gray-900 mb-2">
                                  {offer.currency} {offer.total_price.toFixed(2)}
                                </div>
                                <Badge 
                                  variant={offer.availability_status === 'AVAILABLE' ? 'success' : 'warning'} 
                                  size="sm"
                                  className="font-semibold"
                                >
                                  {offer.availability_status}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-gray-500 font-medium">No offers yet</p>
                      {isPolling && (
                        <p className="text-sm text-gray-400 mt-2">Keep waiting, more results may arrive...</p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-gray-500 font-medium">Submit a request to see results</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar with saved searches and summary */}
        <div className="space-y-6">
          {/* Saved searches */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-xl">
              <CardTitle className="text-white">Saved Searches</CardTitle>
              <p className="text-blue-100 text-sm mt-1">Quick access to recent searches</p>
            </CardHeader>
            <CardContent className="p-5">
              <div className="space-y-3">
                <div className="p-4 bg-white rounded-xl border-2 border-gray-200 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold text-gray-900">Manchester → Glasgow</p>
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <p className="text-xs text-gray-600 font-medium">7 days rental</p>
                  <p className="text-xs text-gray-400 mt-1">Last run: 2h ago</p>
                </div>
                <div className="p-4 bg-white rounded-xl border-2 border-gray-200 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold text-gray-900">London Heathrow → Edinburgh</p>
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <p className="text-xs text-gray-600 font-medium">3 days rental</p>
                  <p className="text-xs text-gray-400 mt-1">Last run: Yesterday</p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-gradient-to-r from-blue-100 to-indigo-100 border-2 border-blue-300 rounded-xl text-center">
                <p className="text-xs text-blue-800 font-semibold">
                  💡 <strong>Coming soon:</strong> Save searches locally and re-run them
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Summary card */}
          <Card className="sticky top-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-xl">
              <CardTitle className="text-white">Request Summary</CardTitle>
              <p className="text-purple-100 text-sm mt-1">Real-time search statistics</p>
            </CardHeader>
            <CardContent className="p-6">
              {requestId ? (
                <div className="space-y-5">
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
                    <span className="text-sm font-semibold text-gray-700">Status:</span>
                    <Badge 
                      variant={pollStatus === 'COMPLETE' ? 'success' : pollStatus === 'ERROR' ? 'danger' : 'info'}
                      className="font-semibold"
                    >
                      {pollStatus || 'IDLE'}
                    </Badge>
                  </div>
                  {isPolling && (
                    <div className="flex items-center justify-center gap-3 py-3 bg-blue-50 border border-blue-200 rounded-xl">
                      <Loader size="sm" />
                      <span className="text-sm font-medium text-blue-700">Polling...</span>
                    </div>
                  )}
                  <div className="grid grid-cols-1 gap-4 pt-3 border-t-2 border-gray-200">
                    <div className="p-4 bg-white rounded-xl border-2 border-gray-200 shadow-sm">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Responses Received</div>
                      <div className="text-3xl font-bold text-gray-900">{vehicleList.length}</div>
                    </div>
                    <div className="p-4 bg-white rounded-xl border-2 border-gray-200 shadow-sm">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Total Expected</div>
                      <div className="text-3xl font-bold text-gray-900">{totalExpected ?? '—'}</div>
                    </div>
                    <div className="p-4 bg-white rounded-xl border-2 border-gray-200 shadow-sm">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Timed Out Sources</div>
                      <div className="text-3xl font-bold text-gray-900">{timedOutSources}</div>
                    </div>
                  </div>
                  <div className="pt-3 border-t-2 border-gray-200">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Request ID</div>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <code className="text-xs font-mono text-gray-900 break-all">{requestId}</code>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-gray-500 font-medium text-sm">Submit a request to see summary</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}



