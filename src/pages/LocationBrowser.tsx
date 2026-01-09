import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Loader } from '../components/ui/Loader'
import { Button } from '../components/ui/Button'
import { locationsApi, Location } from '../api/locations'
import { agreementsOffersApi } from '../api/agreementsOffers'
import { ErrorDisplay } from '../components/ui/ErrorDisplay'

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
  const { data: locationsData, isLoading, error: locationsError, refetch: refetchLocations } = useQuery({
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
    retry: 1,
  })

  const locations = locationsData?.items ?? []

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCursor('')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <MapPin className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold">Location Browser</h1>
        </div>
        <p className="text-indigo-100 text-lg">Browse and search available locations</p>
      </div>

      {/* Error Display */}
      {locationsError && (
        <ErrorDisplay
          error={locationsError}
          title="Failed to load locations"
          onDismiss={() => refetchLocations()}
        />
      )}

      {/* Search and Filter */}
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-xl">
          <CardTitle className="text-white">Search Locations</CardTitle>
          <p className="text-indigo-100 text-sm mt-1">Find locations by name, UN/LOCODE, or country</p>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="space-y-5">
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
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Filter by Agreement
                </label>
                <select
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm transition-all"
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
            <Button type="submit" variant="primary" size="md" className="h-11 font-semibold shadow-md hover:shadow-lg">
              <Search className="w-4 h-4 mr-2" />
              Search Locations
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Locations List */}
      <Card className="bg-gradient-to-br from-white to-gray-50 border-gray-200">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-xl">
          <CardTitle className="text-white">
            Locations ({locations.length}
            {locationsData?.total ? ` of ${locationsData.total}` : ''})
          </CardTitle>
          <p className="text-indigo-100 text-sm mt-1">Browse all available locations</p>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader />
            </div>
          ) : locationsError ? (
            <div className="text-center py-12">
              <ErrorDisplay
                error={locationsError}
                title="Unable to load locations"
              />
            </div>
          ) : locations.length > 0 ? (
            <>
              <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        UN/LOCODE
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Place
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Country
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        IATA Code
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Coordinates
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {locations.map((loc: Location) => (
                      <tr key={loc.unlocode} className="hover:bg-indigo-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <code className="text-sm font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg">{loc.unlocode}</code>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {loc.place}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {loc.country}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {loc.iata_code ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                              {loc.iata_code}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
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
                <div className="mt-6 flex justify-center">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => setCursor(locationsData.next_cursor || '')}
                    className="shadow-md hover:shadow-lg font-semibold"
                  >
                    Load More Locations
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-10 w-10 text-indigo-600" />
              </div>
              <h3 className="mt-2 text-lg font-bold text-gray-900">No locations found</h3>
              <p className="mt-2 text-sm text-gray-600">
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

