import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Loader } from '../components/ui/Loader'
import { Button } from '../components/ui/Button'
import { locationsApi, Location } from '../api/locations'
import { agreementsOffersApi } from '../api/agreementsOffers'

export default function LocationBrowser() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAgreementId, setSelectedAgreementId] = useState('')
  const [cursor, setCursor] = useState('')

  // Load agreements
  const { data: agreementsData } = useQuery({
    queryKey: ['agreements'],
    queryFn: () => agreementsOffersApi.getOffers(),
  })

  const activeAgreements = (agreementsData?.items ?? []).filter(
    (a: any) => a.status === 'ACCEPTED' || a.status === 'ACTIVE'
  )

  // Load locations
  const { data: locationsData, isLoading } = useQuery({
    queryKey: ['locations', searchQuery, cursor, selectedAgreementId],
    queryFn: () => {
      if (selectedAgreementId) {
        return locationsApi.getAgreementLocations(selectedAgreementId)
      }
      return locationsApi.listLocations({
        query: searchQuery,
        limit: 50,
        cursor: cursor || undefined,
      })
    },
  })

  const locations = locationsData?.items ?? []

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCursor('')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Location Browser</h1>
        <p className="mt-2 text-gray-600">Browse and search available locations</p>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Search Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Search"
                  placeholder="Location name, UN/LOCODE, country..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCursor('')
                  }}
                  icon={<Search className="w-4 h-4" />}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Agreement
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedAgreementId}
                  onChange={(e) => {
                    setSelectedAgreementId(e.target.value)
                    setCursor('')
                  }}
                >
                  <option value="">All locations</option>
                  {activeAgreements.map((a: any) => (
                    <option key={a.id} value={a.id}>
                      {a.agreement_ref || a.agreementRef} ({a.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Button type="submit" variant="primary" size="sm">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Locations List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Locations ({locations.length}
            {locationsData?.total ? ` of ${locationsData.total}` : ''})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader />
            </div>
          ) : locations.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        UN/LOCODE
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Place
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Country
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IATA Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Coordinates
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {locations.map((loc: Location) => (
                      <tr key={loc.unlocode} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <code className="text-sm font-medium text-gray-900">{loc.unlocode}</code>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {loc.place}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {loc.country}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {loc.iata_code || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {loc.latitude && loc.longitude
                            ? `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {locationsData?.next_cursor && (
                <div className="mt-4 flex justify-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setCursor(locationsData.next_cursor || '')}
                  >
                    Load More
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <MapPin className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No locations found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery || selectedAgreementId
                  ? 'Try adjusting your search or filter'
                  : 'Start searching for locations'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

