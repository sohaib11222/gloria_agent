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
    <div className="space-y-6">
      <div className="bg-slate-700 rounded-md p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white/20 rounded-md">
            <MapPin className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-semibold">Location Browser</h1>
        </div>
        <p className="text-slate-200 text-sm">Browse and search available locations</p>
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
      <Card className="border border-gray-200">
        <CardHeader className="bg-slate-700 text-white">
          <CardTitle className="text-white">Search Locations</CardTitle>
          <p className="text-slate-200 text-sm mt-1">Find locations by name, UN/LOCODE, or country</p>
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
                  className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white"
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
            <Button type="submit" variant="primary" size="md" className="h-10 font-medium">
              <Search className="w-4 h-4 mr-2" />
              Search Locations
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Locations List */}
      <Card className="border border-gray-200">
        <CardHeader className="bg-slate-700 text-white">
          <CardTitle className="text-white">
            Locations ({locations.length}
            {locationsData?.total ? ` of ${locationsData.total}` : ''})
          </CardTitle>
          <p className="text-slate-200 text-sm mt-1">Browse all available locations</p>
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
              <div className="overflow-x-auto rounded-md border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
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
                      <tr key={loc.unlocode} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <code className="text-sm font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded-md">{loc.unlocode}</code>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {loc.place}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {loc.country}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {loc.iata_code ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
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
                    className="font-medium"
                  >
                    Load More Locations
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-gray-600" />
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

