import React, { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Eye, Edit, X, XCircle, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Loader } from '../components/ui/Loader'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { bookingsApi, Booking } from '../api/bookings'
import { agreementsOffersApi } from '../api/agreementsOffers'
import toast from 'react-hot-toast'
import { formatDate } from '../lib/utils'

// Modal component (simple version)
const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-30" onClick={onClose}></div>
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

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
  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ['bookings', statusFilter],
    queryFn: () => bookingsApi.listBookings({ limit: 100 }),
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
      toast.success('Booking cancelled successfully')
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      setIsCancelModalOpen(false)
      setSelectedBooking(null)
      setAgreementRef('')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cancel booking')
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
        <p className="mt-2 text-gray-600">Manage your bookings and view details</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
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

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bookings ({filteredBookings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader />
            </div>
          ) : filteredBookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booking ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Locations
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                      <tr key={b.id || idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <code className="text-xs text-gray-900">{b.id || '—'}</code>
                          {b.supplierBookingRef && (
                            <div className="text-xs text-gray-500 mt-1">
                              Supplier: {b.supplierBookingRef.slice(0, 12)}...
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{vehicle}</div>
                          {b.error && (
                            <div className="text-xs text-red-600 mt-1">{b.error}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div>{pickup}</div>
                          <div className="text-xs">→ {dropoff}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
                              >
                                <XCircle className="w-4 h-4 text-red-600" />
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
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings found</h3>
              <p className="mt-1 text-sm text-gray-500">
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
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to cancel booking <strong>{selectedBooking?.id}</strong>?
          </p>
          <div>
            <Select
              label="Agreement Reference *"
              value={agreementRef}
              onChange={(e) => setAgreementRef(e.target.value)}
              options={[
                { value: '', label: 'Select agreement' },
                ...activeAgreements.map((a: any) => ({
                  value: a.agreement_ref || a.agreementRef,
                  label: `${a.agreement_ref || a.agreementRef} (${a.status})`,
                })),
              ]}
            />
          </div>
          <div className="flex justify-end gap-3">
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
          </div>
        </div>
      </Modal>
    </div>
  )
}
