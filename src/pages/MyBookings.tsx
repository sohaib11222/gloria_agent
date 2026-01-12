import React, { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Eye, XCircle, Filter, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Loader } from '../components/ui/Loader'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Modal } from '../components/ui/Modal'
import { ErrorDisplay } from '../components/ui/ErrorDisplay'
import { bookingsApi, Booking } from '../api/bookings'
import { agreementsOffersApi } from '../api/agreementsOffers'
import { showToast } from '../components/ui/ToastConfig'
import { formatDate } from '../lib/utils'

export default function MyBookings() {
  const [statusFilter, setStatusFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [agreementRef, setAgreementRef] = useState('')

  const queryClient = useQueryClient()

  // Load agreements to get agreement_ref for booking operations
  const { data: agreementsData } = useQuery({
    queryKey: ['agreements'],
    queryFn: () => agreementsOffersApi.getOffers(),
  })

  const activeAgreements = (agreementsData?.items ?? []).filter((a: any) => a.status === 'ACCEPTED' || a.status === 'ACTIVE')

  // Load bookings
  const { data: bookingsData, isLoading, error: bookingsError, refetch: refetchBookings } = useQuery({
    queryKey: ['bookings', statusFilter],
    queryFn: () => bookingsApi.listBookings({ limit: 100 }),
    retry: 1,
  })

  const bookings = (bookingsData?.items ?? []) as any[]

  // Filter bookings
  const filteredBookings = bookings.filter((b: any) => {
    const matchesStatus = !statusFilter || (b.status || '').toUpperCase() === statusFilter.toUpperCase()
    const matchesSearch = !searchQuery || 
      (b.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.supplierBookingRef || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.vehicleInfo?.vehicle_make_model || '').toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  // Cancel mutation
  const cancelMutation = useMutation({
    mutationFn: ({ ref, agreementRef }: { ref: string; agreementRef: string }) =>
      bookingsApi.cancelBooking(ref, agreementRef),
    onSuccess: () => {
      showToast.success('Booking cancelled successfully')
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      setIsCancelModalOpen(false)
      setSelectedBooking(null)
      setAgreementRef('')
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to cancel booking'
      showToast.error(errorMessage)
    },
  })

  const handleCancel = () => {
    if (selectedBooking && agreementRef) {
      const ref = selectedBooking.supplierBookingRef || selectedBooking.id
      if (ref) {
        cancelMutation.mutate({ ref, agreementRef })
      }
    }
  }

  const getStatusBadge = (status: string) => {
    const s = (status || 'PENDING').toUpperCase()
    const variant = s === 'CONFIRMED' ? 'success' : s === 'CANCELLED' ? 'danger' : 'warning'
    return <Badge variant={variant as any} size="sm">{s}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-700 rounded-md p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-white/20 rounded-md">
            <Calendar className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-semibold">My Bookings</h1>
        </div>
        <p className="text-slate-200 text-sm">Manage your bookings and view details</p>
      </div>

      {/* Filters */}
      <Card className="border border-gray-200">
        <CardHeader className="bg-slate-700 border-b border-slate-600">
          <h3 className="text-lg font-semibold text-white">Filters</h3>
          <p className="text-slate-200 text-sm mt-1">Search and filter your bookings</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Search"
                placeholder="Booking ID, vehicle, supplier ref..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            <div>
              <Select
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: '', label: 'All statuses' },
                  { value: 'PENDING', label: 'Pending' },
                  { value: 'CONFIRMED', label: 'Confirmed' },
                  { value: 'CANCELLED', label: 'Cancelled' },
                ]}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {bookingsError && (
        <ErrorDisplay
          error={bookingsError}
          title="Failed to load bookings"
          onDismiss={() => refetchBookings()}
        />
      )}

      {/* Bookings Table */}
      <Card className="border border-gray-200">
        <CardHeader className="bg-slate-700 border-b border-slate-600">
          <h3 className="text-lg font-semibold text-white">Bookings ({filteredBookings.length})</h3>
          <p className="text-slate-200 text-sm mt-1">View and manage all your bookings</p>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader />
            </div>
          ) : bookingsError ? (
            <div className="text-center py-12">
              <ErrorDisplay
                error={bookingsError}
                title="Unable to load bookings"
              />
            </div>
          ) : filteredBookings.length > 0 ? (
            <div className="overflow-x-auto rounded-md border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Booking ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Locations
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBookings.map((b: any, idx: number) => {
                    const created = b.createdAt || b.created_at
                    const vehicle = b.vehicleInfo?.vehicle_make_model || b.vehicle_make_model || '—'
                    const pickup = b.pickupLocation || '—'
                    const dropoff = b.dropoffLocation || '—'
                    const status = b.status || 'PENDING'
                    const canCancel = status !== 'CANCELLED'

                    return (
                      <tr key={b.id || idx} className="hover:bg-amber-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <code className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg">{b.id || '—'}</code>
                          {b.supplierBookingRef && (
                            <div className="text-xs text-gray-500 mt-1 font-medium">
                              Supplier: {b.supplierBookingRef.slice(0, 12)}...
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-gray-900">{vehicle}</div>
                          {b.error && (
                            <div className="text-xs text-red-600 mt-1 font-medium bg-red-50 px-2 py-0.5 rounded inline-block">{b.error}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="font-semibold text-gray-900">{pickup}</div>
                          <div className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                            {dropoff}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                          {created ? formatDate(created) : '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedBooking(b as Booking)
                                setIsDetailModalOpen(true)
                              }}
                              className="hover:bg-gray-50 hover:text-gray-900"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {canCancel && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedBooking(b as Booking)
                                  setIsCancelModalOpen(true)
                                }}
                                className="hover:bg-red-50 hover:text-red-600"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-10 w-10 text-amber-600" />
              </div>
              <h3 className="mt-2 text-lg font-bold text-gray-900">No bookings found</h3>
              <p className="mt-2 text-sm text-gray-600">
                {searchQuery || statusFilter ? 'Try adjusting your filters' : 'Run availability search and create bookings from your website.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedBooking(null)
        }}
        title="Booking Details"
        size="lg"
      >
        {selectedBooking && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Booking ID</label>
                <div className="mt-1 text-sm text-gray-900 font-mono">{selectedBooking.id}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">{getStatusBadge(selectedBooking.status || 'PENDING')}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Supplier Booking Ref</label>
                <div className="mt-1 text-sm text-gray-900 font-mono">
                  {selectedBooking.supplierBookingRef || '—'}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Agreement Ref</label>
                <div className="mt-1 text-sm text-gray-900">{selectedBooking.agreementRef || '—'}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Pickup Location</label>
                <div className="mt-1 text-sm text-gray-900">{selectedBooking.pickupLocation || '—'}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Dropoff Location</label>
                <div className="mt-1 text-sm text-gray-900">{selectedBooking.dropoffLocation || '—'}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Pickup Date</label>
                <div className="mt-1 text-sm text-gray-900">
                  {selectedBooking.pickupDate ? formatDate(selectedBooking.pickupDate) : '—'}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Dropoff Date</label>
                <div className="mt-1 text-sm text-gray-900">
                  {selectedBooking.dropoffDate ? formatDate(selectedBooking.dropoffDate) : '—'}
                </div>
              </div>
            </div>
            {selectedBooking.vehicleInfo && (
              <div>
                <label className="text-sm font-medium text-gray-500">Vehicle Information</label>
                <div className="mt-1 p-3 bg-gray-50 rounded text-sm text-gray-900">
                  <pre>{JSON.stringify(selectedBooking.vehicleInfo, null, 2)}</pre>
                </div>
              </div>
            )}
            <div className="pt-4 border-t">
              <div className="text-sm text-gray-500">
                Created: {formatDate(selectedBooking.createdAt)}
              </div>
              <div className="text-sm text-gray-500">
                Updated: {formatDate(selectedBooking.updatedAt)}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false)
          setSelectedBooking(null)
          setAgreementRef('')
        }}
        title="Cancel Booking"
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsCancelModalOpen(false)
                setSelectedBooking(null)
                setAgreementRef('')
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleCancel}
              loading={cancelMutation.isPending}
              disabled={!agreementRef}
            >
              Cancel Booking
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to cancel booking <strong className="font-semibold">{selectedBooking?.id}</strong>?
          </p>
          {cancelMutation.isError && (
            <ErrorDisplay
              error={cancelMutation.error}
              title="Cancellation failed"
              variant="error"
            />
          )}
          <div>
            <Select
              label="Agreement Reference *"
              value={agreementRef}
              onChange={(e) => setAgreementRef(e.target.value)}
              error={!agreementRef && cancelMutation.isError ? 'Agreement reference is required' : undefined}
              options={[
                { value: '', label: 'Select agreement' },
                ...activeAgreements.map((a: any) => ({
                  value: a.agreement_ref || a.agreementRef,
                  label: `${a.agreement_ref || a.agreementRef} (${a.status})`,
                })),
              ]}
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
