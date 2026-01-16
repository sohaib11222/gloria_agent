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

interface SavedSearch {
  id: string
  pickup: string
  dropoff: string
  pickupDate: string
  returnDate: string
  driverAge: string
  agreementRef: string
  pickupLocationName?: string
  dropoffLocationName?: string
  createdAt: number
  lastRunAt: number
}

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
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])

  // Load saved searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('availability_saved_searches')
      if (saved) {
        const parsed = JSON.parse(saved)
        setSavedSearches(Array.isArray(parsed) ? parsed : [])
      }
    } catch (error) {
      console.error('Failed to load saved searches:', error)
    }
  }, [])

  // Save search to localStorage when submitted
  const saveSearchToHistory = (searchParams: {
    pickup: string
    dropoff: string
    pickupDate: string
    returnDate: string
    driverAge: string
    agreementRef: string
  }) => {
    try {
      // Get location names for display
      const pickupLoc = locationsData?.find(l => l.unlocode === searchParams.pickup)
      const dropoffLoc = locationsData?.find(l => l.unlocode === searchParams.dropoff)
      
      const newSearch: SavedSearch = {
        id: Date.now().toString(),
        ...searchParams,
        pickupLocationName: pickupLoc ? `${pickupLoc.place || pickupLoc.name || ''}, ${pickupLoc.country}` : undefined,
        dropoffLocationName: dropoffLoc ? `${dropoffLoc.place || dropoffLoc.name || ''}, ${dropoffLoc.country}` : undefined,
        createdAt: Date.now(),
        lastRunAt: Date.now(),
      }

      // Get existing searches
      const existing = savedSearches.length > 0 
        ? savedSearches 
        : (() => {
            try {
              const saved = localStorage.getItem('availability_saved_searches')
              return saved ? JSON.parse(saved) : []
            } catch {
              return []
            }
          })()

      // Check if similar search exists (same pickup, dropoff, dates)
      const similarIndex = existing.findIndex((s: SavedSearch) => 
        s.pickup === newSearch.pickup &&
        s.dropoff === newSearch.dropoff &&
        s.pickupDate === newSearch.pickupDate &&
        s.returnDate === newSearch.returnDate
      )

      if (similarIndex >= 0) {
        // Update existing search
        existing[similarIndex] = { ...existing[similarIndex], lastRunAt: Date.now() }
      } else {
        // Add new search (keep only last 10)
        existing.unshift(newSearch)
        if (existing.length > 10) {
          existing.pop()
        }
      }

      // Sort by lastRunAt (most recent first)
      existing.sort((a: SavedSearch, b: SavedSearch) => b.lastRunAt - a.lastRunAt)

      setSavedSearches(existing)
      localStorage.setItem('availability_saved_searches', JSON.stringify(existing))
    } catch (error) {
      console.error('Failed to save search:', error)
    }
  }

  // Load a saved search into the form
  const loadSavedSearch = (search: SavedSearch) => {
    setPickup(search.pickup)
    setDropoff(search.dropoff)
    setPickupDate(search.pickupDate)
    setReturnDate(search.returnDate)
    setDriverAge(search.driverAge)
    setAgreementRef(search.agreementRef)
    
    // Update location search to show the location names
    if (search.pickupLocationName) {
      setLocationSearch(prev => ({ ...prev, pickup: search.pickup }))
    }
    if (search.dropoffLocationName) {
      setLocationSearch(prev => ({ ...prev, dropoff: search.dropoff }))
    }
  }

  // Delete a saved search
  const deleteSavedSearch = (id: string) => {
    const updated = savedSearches.filter(s => s.id !== id)
    setSavedSearches(updated)
    localStorage.setItem('availability_saved_searches', JSON.stringify(updated))
  }

  // Format time ago
  const formatTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days === 1) return 'Yesterday'
    return `${days} days ago`
  }

  // Calculate rental days
  const calculateDays = (pickupDate: string, returnDate: string): number => {
    if (!pickupDate || !returnDate) return 0
    const pickup = new Date(pickupDate)
    const return_ = new Date(returnDate)
    const diffTime = Math.abs(return_.getTime() - pickup.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

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
      
      // Save search to history
      saveSearchToHistory({
        pickup,
        dropoff,
        pickupDate,
        returnDate,
        driverAge,
        agreementRef,
      })
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
    <div className="space-y-6">
      <div className="bg-slate-700 rounded-md p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white/20 rounded-md">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold">Availability</h1>
        </div>
        <p className="text-slate-200 text-sm">
          Search for available vehicles from sources with active agreements.
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
          <Card className="border border-gray-200">
            <CardHeader className="bg-slate-700 text-white">
              <CardTitle className="text-white">Search Form</CardTitle>
              <p className="text-slate-200 text-sm mt-1">Enter your search criteria to find available vehicles</p>
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
                  className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white"
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
                className="h-11 px-6 text-sm font-medium"
              >
                {submit.isPending ? 'Searching...' : 'Search Availability'}
              </Button>
            </div>
          </form>
        </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardHeader className="bg-slate-700 text-white">
              <CardTitle className="text-white">Results</CardTitle>
              <p className="text-slate-200 text-sm mt-1">
                {vehicleList.length > 0 ? `${vehicleList.length} offer${vehicleList.length !== 1 ? 's' : ''} found` : 'No results yet'}
              </p>
            </CardHeader>
            <CardContent className="p-6">
              {requestId ? (
                <div className="space-y-4">
                  {isPolling && (
                    <div className="flex items-center justify-center gap-3 py-3 bg-gray-50 border border-gray-200 rounded-md">
                      <Loader size="sm" />
                      <span className="text-sm text-gray-700">Polling for more results...</span>
                    </div>
                  )}
                  {vehicleList.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                      {vehicleList.map((offer, idx) => (
                        <Card key={idx} className="border border-gray-200">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="font-bold text-lg text-gray-900 mb-1">{offer.vehicle_make_model}</div>
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                  <span className="font-medium">{offer.vehicle_class}</span>
                                  <span>•</span>
                                  <span>{offer.rate_plan_code}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-md inline-flex">
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
          <Card className="border border-gray-200">
            <CardHeader className="bg-slate-700 text-white">
              <CardTitle className="text-white">Saved Searches</CardTitle>
              <p className="text-slate-200 text-sm mt-1">Quick access to recent searches</p>
            </CardHeader>
            <CardContent className="p-5">
              {savedSearches.length > 0 ? (
                <div className="space-y-3">
                  {savedSearches.map((search) => {
                    const pickupName = search.pickupLocationName || search.pickup
                    const dropoffName = search.dropoffLocationName || search.dropoff
                    const days = calculateDays(search.pickupDate, search.returnDate)
                    
                    return (
                      <div
                        key={search.id}
                        className="p-4 bg-white rounded-md border border-gray-200 hover:bg-gray-50 transition-colors group"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 cursor-pointer" onClick={() => {
                            loadSavedSearch(search)
                            showToast.success('Search loaded. Click "Search Availability" to run it.')
                          }}>
                            <p className="text-sm font-bold text-gray-900">
                              {pickupName} → {dropoffName}
                            </p>
                            {days > 0 && (
                              <p className="text-xs text-gray-600 font-medium mt-1">
                                {days} day{days !== 1 ? 's' : ''} rental
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              Last run: {formatTimeAgo(search.lastRunAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                loadSavedSearch(search)
                                // Trigger form submission after a brief delay to ensure form is updated
                                setTimeout(() => {
                                  submit.mutate()
                                }, 100)
                              }}
                              className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                              title="Run this search"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                              </svg>
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Delete this saved search?')) {
                                  deleteSavedSearch(search.id)
                                }
                              }}
                              className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                              title="Delete this search"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-md text-center">
                  <p className="text-xs text-gray-600">
                    No saved searches yet. Your recent searches will appear here automatically.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary card */}
          <Card className="sticky top-6 border border-gray-200">
            <CardHeader className="bg-slate-700 text-white">
              <CardTitle className="text-white">Request Summary</CardTitle>
              <p className="text-slate-200 text-sm mt-1">Real-time search statistics</p>
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
                    <div className="flex items-center justify-center gap-3 py-3 bg-gray-50 border border-gray-200 rounded-md">
                      <Loader size="sm" />
                      <span className="text-sm text-gray-700">Polling...</span>
                    </div>
                  )}
                  <div className="grid grid-cols-1 gap-4 pt-3 border-t border-gray-200">
                    <div className="p-4 bg-white rounded-md border border-gray-200">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Responses Received</div>
                      <div className="text-3xl font-bold text-gray-900">{vehicleList.length}</div>
                    </div>
                    <div className="p-4 bg-white rounded-md border border-gray-200">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Total Expected</div>
                      <div className="text-3xl font-bold text-gray-900">{totalExpected ?? '—'}</div>
                    </div>
                    <div className="p-4 bg-white rounded-md border border-gray-200">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Timed Out Sources</div>
                      <div className="text-3xl font-bold text-gray-900">{timedOutSources}</div>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
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



