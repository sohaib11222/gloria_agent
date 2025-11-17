import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Loader } from '../components/ui/Loader'
import { Button } from '../components/ui/Button'
import api from '../lib/api'

type BookingItem = {
  id?: string
  created_at?: string
  createdAt?: string
  status?: string
  source_id?: string
  vehicle_info?: { vehicle_make_model?: string }
  vehicle_make_model?: string
  error?: string
  audit?: { error?: string }
}

export default function MyBookings() {
  const [items, setItems] = useState<BookingItem[]>([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/bookings', { params: { limit: 50 } })
      const rows = (data?.data ?? data ?? []) as BookingItem[]
      setItems(rows)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const handler = () => load()
    window.addEventListener('booking:updated', handler as any)
    return () => window.removeEventListener('booking:updated', handler as any)
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
        <p className="mt-2 text-gray-600">Recent bookings created via this agent account</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Bookings</CardTitle>
              <p className="text-sm text-gray-500 mt-1">{items.length} total</p>
            </div>
            <Button variant="secondary" size="sm" onClick={load} disabled={loading}>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader />
            </div>
          ) : items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((b, idx) => {
                    const created = b.createdAt || b.created_at
                    const status = (b.status || 'PENDING').toUpperCase()
                    const variant = status === 'CONFIRMED' ? 'success' : status === 'CANCELLED' ? 'danger' : 'warning'
                    const vehicle = b.vehicle_info?.vehicle_make_model || b.vehicle_make_model || '—'
                    const err = b.error || b.audit?.error
                    return (
                      <tr key={b.id || idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <code className="text-xs text-gray-900">{b.id || '—'}</code>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{vehicle}</div>
                          {err && (
                            <div className="text-xs text-red-600 mt-1">{err}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <code className="text-xs text-gray-600">{b.source_id?.slice(0, 8) || 'unknown'}...</code>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={variant as any} size="sm">{status}</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {created ? new Date(created).toLocaleString() : '—'}
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
              <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Run availability search and create bookings from your website.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


