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
import toast from 'react-hot-toast'

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
  const { data: locationsData, isLoading: isLoadingLocations } = useQuery({
    queryKey: ['locations', 'all'],
    queryFn: async () => {
      // Fetch all locations with a high limit
      const result = await locationsApi.listLocations({ limit: 1000 })
      return result.items || []
    },
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
      toast.success('Availability request submitted')
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.message || 'Failed to submit availability')
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
    onError: () => {
      setIsPolling(false)
      setPollStatus('ERROR')
      toast.error('Polling failed')
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
      toast.error('Please fill required fields')
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Availability Test</h1>
        <p className="mt-2 text-gray-600">
          This calls the middleware Availability endpoint and will fan out to all sources that have an active agreement for you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Search Form</CardTitle>
            </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700">Agreement</label>
                <select
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
            <div className="flex justify-end">
              <Button type="submit" loading={submit.isPending}>
                Submit
              </Button>
            </div>
          </form>
        </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Results</CardTitle>
            </CardHeader>
            <CardContent>
              {requestId ? (
                <div className="space-y-4">
                  {vehicleList.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {vehicleList.map((offer, idx) => (
                        <div key={idx} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-medium text-gray-900">{offer.vehicle_make_model}</div>
                              <div className="text-sm text-gray-600">{offer.vehicle_class} • {offer.rate_plan_code}</div>
                              <div className="text-xs text-gray-500 mt-1">{offer.pickup_location} → {offer.dropoff_location}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold text-gray-900">{offer.currency} {offer.total_price.toFixed(2)}</div>
                              <Badge variant={offer.availability_status === 'AVAILABLE' ? 'success' : 'warning'} size="sm">{offer.availability_status}</Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">No offers yet</div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">Submit a request to see results</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar with saved searches and summary */}
        <div>
          {/* Saved searches */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Saved Searches</CardTitle>
              <p className="text-xs text-gray-500 mt-1">Quick access to recent searches</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <p className="text-sm font-medium text-gray-900">Manchester → Glasgow</p>
                  <p className="text-xs text-gray-500 mt-1">7 days rental</p>
                  <p className="text-xs text-gray-400">Last run: 2h ago</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <p className="text-sm font-medium text-gray-900">London Heathrow → Edinburgh</p>
                  <p className="text-xs text-gray-500 mt-1">3 days rental</p>
                  <p className="text-xs text-gray-400">Last run: Yesterday</p>
                </div>
              </div>
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                <p className="text-xs text-blue-600">
                  💡 <strong>Coming soon:</strong> Save searches locally and re-run them
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Summary card */}
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Request Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {requestId ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge variant={pollStatus === 'COMPLETE' ? 'success' : pollStatus === 'ERROR' ? 'danger' : 'info'}>
                      {pollStatus || 'IDLE'}
                    </Badge>
                  </div>
                  {isPolling && (
                    <div className="flex items-center justify-center py-2">
                      <Loader size="sm" />
                    </div>
                  )}
                  <div className="space-y-3 pt-2 border-t border-gray-200">
                    <div>
                      <div className="text-xs text-gray-500">Responses Received</div>
                      <div className="text-2xl font-bold text-gray-900">{vehicleList.length}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Total Expected</div>
                      <div className="text-2xl font-bold text-gray-900">{totalExpected ?? '—'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Timed Out Sources</div>
                      <div className="text-2xl font-bold text-gray-900">{timedOutSources}</div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <div className="text-xs text-gray-500">Request ID</div>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded block mt-1 break-all">{requestId}</code>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">
                  Submit a request to see summary
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


