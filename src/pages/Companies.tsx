import React, { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Badge } from '../components/ui/Badge'
import { Loader } from '../components/ui/Loader'
import { showToast } from '../components/ui/ToastConfig'
import { companiesApi, sourceGroupsApi } from '../api/companies'

export default function Companies() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [selectedSourceId, setSelectedSourceId] = useState<string>('')
  const [newGroupName, setNewGroupName] = useState('')
  const [selectedGroupId, setSelectedGroupId] = useState('')
  const [selectedAgreementId, setSelectedAgreementId] = useState('')

  const companiesQuery = useQuery({
    queryKey: ['agent-companies', search],
    queryFn: () => companiesApi.listCompanies(search ? { search } : undefined),
  })

  const groupsQuery = useQuery({
    queryKey: ['agent-source-groups'],
    queryFn: () => sourceGroupsApi.list(),
  })

  const branchesQuery = useQuery({
    queryKey: ['source-branches', selectedSourceId],
    queryFn: () => companiesApi.listSourceBranches(selectedSourceId, { limit: 100 }),
    enabled: !!selectedSourceId,
  })

  const coverageQuery = useQuery({
    queryKey: ['source-coverage', selectedSourceId],
    queryFn: () => companiesApi.getSourceCoverage(selectedSourceId, { limit: 200 }),
    enabled: !!selectedSourceId,
  })

  const createGroup = useMutation({
    mutationFn: (name: string) => sourceGroupsApi.create(name),
    onSuccess: () => {
      setNewGroupName('')
      queryClient.invalidateQueries({ queryKey: ['agent-source-groups'] })
      showToast.success('Group created')
    },
    onError: (e: any) => showToast.error(e?.response?.data?.message || 'Failed to create group'),
  })

  const deleteGroup = useMutation({
    mutationFn: (id: string) => sourceGroupsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-source-groups'] })
      showToast.success('Group deleted')
    },
    onError: (e: any) => showToast.error(e?.response?.data?.message || 'Failed to delete group'),
  })

  const attachAgreement = useMutation({
    mutationFn: ({ groupId, agreementId }: { groupId: string; agreementId: string }) =>
      sourceGroupsApi.attachAgreement(groupId, agreementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-source-groups'] })
      setSelectedAgreementId('')
      showToast.success('Agreement added to group')
    },
    onError: (e: any) => showToast.error(e?.response?.data?.message || 'Failed to add agreement'),
  })

  const detachAgreement = useMutation({
    mutationFn: ({ groupId, agreementId }: { groupId: string; agreementId: string }) =>
      sourceGroupsApi.detachAgreement(groupId, agreementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-source-groups'] })
      showToast.success('Agreement removed from group')
    },
    onError: (e: any) => showToast.error(e?.response?.data?.message || 'Failed to remove agreement'),
  })

  const companies = companiesQuery.data?.items || []
  const selectedCompany = companies.find((c) => c.id === selectedSourceId) || null
  const groups = groupsQuery.data?.items || []

  const allAgreements = useMemo(() => {
    const rows = companies.flatMap((c) =>
      (c.agreements || []).map((ag) => ({
        id: ag.id,
        agreementRef: ag.agreementRef,
        status: ag.status,
        sourceName: c.companyName,
      }))
    )
    return rows
  }, [companies])

  return (
    <div className="space-y-6">
      <div className="bg-slate-700 rounded-md p-6 text-white">
        <h1 className="text-2xl font-semibold">Companies</h1>
        <p className="text-slate-200 text-sm mt-1">
          View registered sources, their imported branches/locations, and manage agreement groups for pricing searches.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border border-gray-200 lg:col-span-1">
          <CardHeader className="bg-slate-700 text-white">
            <CardTitle className="text-white">Sources</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <Input
              placeholder="Search source by name/code/email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {companiesQuery.isLoading ? (
              <div className="py-8 flex items-center justify-center"><Loader size="md" /></div>
            ) : companies.length === 0 ? (
              <p className="text-sm text-gray-500">No sources found.</p>
            ) : (
              <div className="space-y-2 max-h-[28rem] overflow-y-auto pr-1">
                {companies.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedSourceId(c.id)}
                    className={`w-full text-left p-3 rounded border ${
                      selectedSourceId === c.id ? 'border-slate-700 bg-slate-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-semibold text-sm text-gray-900">{c.companyName}</div>
                    <div className="text-xs text-gray-500">{c.companyCode || c.email || c.id}</div>
                    <div className="mt-2 flex gap-2">
                      <Badge size="sm" variant="info">Branches: {c.branchCount}</Badge>
                      <Badge size="sm" variant="success">Locations: {c.locationCount}</Badge>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-gray-200 lg:col-span-2">
          <CardHeader className="bg-slate-700 text-white">
            <CardTitle className="text-white">Company Details</CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-5">
            {!selectedCompany ? (
              <p className="text-sm text-gray-500">Select a source to view details.</p>
            ) : (
              <>
                <div>
                  <div className="text-lg font-semibold text-gray-900">{selectedCompany.companyName}</div>
                  <div className="text-sm text-gray-500">{selectedCompany.companyCode || selectedCompany.email || selectedCompany.id}</div>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    <Badge variant="info" size="sm">Status: {selectedCompany.status}</Badge>
                    <Badge variant="success" size="sm">Branches: {selectedCompany.branchCount}</Badge>
                    <Badge variant="success" size="sm">Locations: {selectedCompany.locationCount}</Badge>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Agreements</h3>
                  <div className="space-y-2">
                    {selectedCompany.agreements.length === 0 ? (
                      <p className="text-sm text-gray-500">No agreements for this source.</p>
                    ) : (
                      selectedCompany.agreements.map((ag) => (
                        <div key={ag.id} className="p-2.5 bg-gray-50 border border-gray-200 rounded text-sm flex items-center justify-between">
                          <span className="font-medium">{ag.agreementRef}</span>
                          <Badge size="sm" variant={ag.status === 'ACTIVE' || ag.status === 'ACCEPTED' ? 'success' : 'warning'}>
                            {ag.status}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Imported Branches</h3>
                    {branchesQuery.isLoading ? (
                      <div className="py-6 flex justify-center"><Loader size="sm" /></div>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {(branchesQuery.data?.items || []).slice(0, 50).map((b) => (
                          <div key={b.id} className="p-2.5 border border-gray-200 rounded bg-white text-xs">
                            <div className="font-semibold text-gray-900">{b.branchCode} - {b.name}</div>
                            <div className="text-gray-600 mt-1">{b.city || '-'}, {b.country || '-'}</div>
                            <div className="text-gray-500">{b.locationType || '-'} {b.natoLocode ? `• ${b.natoLocode}` : ''}</div>
                          </div>
                        ))}
                        {(branchesQuery.data?.items || []).length === 0 && (
                          <p className="text-sm text-gray-500">No branches found.</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Imported Locations</h3>
                    {coverageQuery.isLoading ? (
                      <div className="py-6 flex justify-center"><Loader size="sm" /></div>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {(coverageQuery.data?.items || []).slice(0, 100).map((loc) => (
                          <div key={loc.unlocode} className="p-2.5 border border-gray-200 rounded bg-white text-xs">
                            <div className="font-semibold text-gray-900">{loc.unlocode}</div>
                            <div className="text-gray-600">{loc.place}, {loc.country}</div>
                          </div>
                        ))}
                        {(coverageQuery.data?.items || []).length === 0 && (
                          <p className="text-sm text-gray-500">No locations found.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border border-gray-200">
        <CardHeader className="bg-slate-700 text-white">
          <CardTitle className="text-white">Agreement Groups</CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              label="New group name"
              placeholder="e.g. UAE Premium Sources"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
            />
            <div className="md:col-span-2 flex items-end">
              <Button
                onClick={() => {
                  if (!newGroupName.trim()) return
                  createGroup.mutate(newGroupName.trim())
                }}
                loading={createGroup.isPending}
                variant="primary"
              >
                Create Group
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Select
              label="Select Group"
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              options={[
                { value: '', label: 'Choose group...' },
                ...groups.map((g) => ({ value: g.id, label: g.name })),
              ]}
            />
            <Select
              label="Select Agreement"
              value={selectedAgreementId}
              onChange={(e) => setSelectedAgreementId(e.target.value)}
              options={[
                { value: '', label: 'Choose agreement...' },
                ...allAgreements.map((ag) => ({
                  value: ag.id,
                  label: `${ag.agreementRef} - ${ag.sourceName} (${ag.status})`,
                })),
              ]}
            />
            <div className="flex items-end">
              <Button
                onClick={() => {
                  if (!selectedGroupId || !selectedAgreementId) return
                  attachAgreement.mutate({ groupId: selectedGroupId, agreementId: selectedAgreementId })
                }}
                loading={attachAgreement.isPending}
                variant="primary"
              >
                Add Agreement
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {groupsQuery.isLoading ? (
              <div className="py-6 flex justify-center"><Loader size="sm" /></div>
            ) : groups.length === 0 ? (
              <p className="text-sm text-gray-500">No groups created yet.</p>
            ) : (
              groups.map((g) => (
                <div key={g.id} className="border border-gray-200 rounded p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">{g.name}</div>
                      <div className="text-xs text-gray-500">{g.agreements.length} agreement(s)</div>
                    </div>
                    <Button
                      variant="danger"
                      onClick={() => deleteGroup.mutate(g.id)}
                      loading={deleteGroup.isPending}
                    >
                      Delete
                    </Button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {g.agreements.length === 0 ? (
                      <span className="text-xs text-gray-500">No agreements attached.</span>
                    ) : (
                      g.agreements.map((ag) => (
                        <span key={ag.id} className="inline-flex items-center gap-2 px-2 py-1 rounded bg-gray-100 text-xs">
                          {ag.agreementRef} - {ag.source?.companyName || ag.sourceId}
                          <button
                            onClick={() => detachAgreement.mutate({ groupId: g.id, agreementId: ag.id })}
                            className="text-red-600 hover:text-red-700"
                            title="Remove agreement"
                          >
                            x
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

