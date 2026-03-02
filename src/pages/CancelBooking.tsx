import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { XCircle, AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { showToast } from '../components/ui/ToastConfig'
import api from '../lib/api'

// ── Types ─────────────────────────────────────────────────────────────────────

interface CancelResult {
  success: boolean
  message?: string
  status?: string
  resNumber?: string
  errorCode?: string
  errorShortText?: string
  httpStatus?: number
  raw?: any
}

type CancelAdapterType = 'xml' | 'json' | 'grpc'

// ── Error code reference from OTA spec ────────────────────────────────────────

const ERROR_CODES: { code: string; label: string; description: string }[] = [
  { code: '50', label: 'Already Cancelled',    description: 'This booking has already been cancelled.' },
  { code: '51', label: 'Already Collected',    description: 'This booking has already been collected and cannot be cancelled.' },
  { code: '52', label: 'No Licence',           description: 'Customer could not produce a valid driving licence.' },
  { code: '53', label: 'No Deposit',           description: 'Customer could not leave a deposit; vehicle could not be released.' },
  { code: '54', label: 'Refused Vehicle',      description: 'Customer refused to take the vehicle.' },
  { code: '55', label: 'Card Declined',        description: 'Customer credit card was declined; vehicle could not be released.' },
]

const BACKEND_ERROR_HINTS: Record<string, string> = {
  AGREEMENT_INACTIVE: 'The selected agreement is not active for this agent/source. Pick an ACTIVE agreement from the list.',
}

// ── Format tabs config ─────────────────────────────────────────────────────────

const ADAPTER_TABS: {
  type: CancelAdapterType
  label: string
  activeClass: string
  badgeClass: string
}[] = [
  {
    type: 'xml',
    label: 'OTA XML',
    activeClass: 'bg-orange-600 text-white shadow',
    badgeClass: 'bg-orange-100 text-orange-700 border border-orange-200',
  },
  {
    type: 'json',
    label: 'Gloria JSON',
    activeClass: 'bg-green-600 text-white shadow',
    badgeClass: 'bg-green-100 text-green-700 border border-green-200',
  },
  {
    type: 'grpc',
    label: 'Gloria gRPC',
    activeClass: 'bg-purple-600 text-white shadow',
    badgeClass: 'bg-purple-100 text-purple-700 border border-purple-200',
  },
]

// ── Format-specific preview builders ──────────────────────────────────────────

function buildXmlPreview(agreementRef: string, supplierRef: string, requestorType: string) {
  return `<OTA_VehCancelRQ xmlns="http://www.opentravel.org/OTA/2003/05" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <POS>
    <Source>
      <RequestorID Type="${requestorType || '5'}" ID="${agreementRef || '<agreement_ref>'}"/>
    </Source>
  </POS>
  <VehCancelRQCore>
    <ResNumber Number="${supplierRef || '<supplier_booking_ref>'}"/>
  </VehCancelRQCore>
  <VehCancelRQInfo>
  </VehCancelRQInfo>
</OTA_VehCancelRQ>`
}

function buildJsonPreview(agreementRef: string, supplierRef: string) {
  return JSON.stringify(
    {
      agreement_ref: agreementRef || '<agreement_ref>',
      supplier_booking_ref: supplierRef || '<supplier_booking_ref>',
    },
    null,
    2
  )
}

function buildGrpcPreview(agreementRef: string, supplierRef: string) {
  return `// gRPC call: SourceProviderService.CancelBooking
// Proto: source_provider.proto

BookingRef {
  agreement_ref        = "${agreementRef || '<agreement_ref>'}"
  supplier_booking_ref = "${supplierRef || '<supplier_booking_ref>'}"
}

// Expected response: BookingResponse
BookingResponse {
  supplier_booking_ref = "${supplierRef || '<supplier_booking_ref>'}"
  status               = "CANCELLED"
}`
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function CancelBooking() {
  const [supplierRef, setSupplierRef]           = useState('')
  const [agreementRef, setAgreementRef]         = useState('')
  const [requestorType, setRequestorType]       = useState('5')
  const [cancellationReason, setCancellationReason] = useState('')
  const [isCancelling, setIsCancelling]         = useState(false)
  const [result, setResult]                     = useState<CancelResult | null>(null)
  const [showGuide, setShowGuide]               = useState(true)
  const [cancelAdapterType, setCancelAdapterType] = useState<CancelAdapterType>('xml')

  // Load active agreements for the dropdown
  const { data: agreementsData, isLoading: isLoadingAgreements } = useQuery({
    queryKey: ['agreements-active-cancel'],
    queryFn: async () => {
      const response = await api.get('/agreements', { params: { limit: 100 } })
      const items: any[] = response.data?.items || []
      return items.filter((a: any) => a.status === 'ACTIVE' || a.status === 'ACCEPTED')
    },
    retry: 1,
  })

  const agreements = agreementsData ?? []

  const handleCancel = async () => {
    if (!supplierRef.trim()) {
      showToast.error('Enter the supplier booking reference (reservation number)')
      return
    }
    if (!agreementRef.trim()) {
      showToast.error('Select an agreement')
      return
    }
    setIsCancelling(true)
    setResult(null)
    try {
      const response = await api.post(
        `/bookings/${encodeURIComponent(supplierRef.trim())}/cancel`,
        {
          requestor_id: agreementRef.trim(),
          requestor_type: requestorType.trim() || '5',
          cancellation_reason: cancellationReason.trim() || undefined,
        },
        { params: { agreement_ref: agreementRef.trim() } }
      )
      const data = response.data ?? {}
      setResult({
        success: true,
        message: data.message || 'Booking cancelled successfully',
        status: data.status || 'Cancelled',
        resNumber: data.resNumber || supplierRef.trim(),
        raw: data,
      })
      showToast.success('Booking cancelled successfully')
    } catch (error: any) {
      const errData = error?.response?.data ?? {}
      const httpStatus = error?.response?.status
      const errorCode = errData.error || errData.errorCode || errData.Code || errData.code || ''
      const baseMessage = errData.message || errData.shortText || errData.ShortText || errData.error || 'Cancel request failed'
      const hint = errorCode ? BACKEND_ERROR_HINTS[errorCode] : undefined
      const errorText = hint ? `${baseMessage}. ${hint}` : baseMessage

      setResult({
        success: false,
        message: errorText,
        errorCode,
        errorShortText: errorText,
        httpStatus,
        raw: errData,
      })
      showToast.error(errorCode ? `${errorCode}: ${baseMessage}` : errorText)
    } finally {
      setIsCancelling(false)
    }
  }

  // Current tab config
  const currentTab = ADAPTER_TABS.find(t => t.type === cancelAdapterType)!

  const formatDescriptions: Record<CancelAdapterType, string> = {
    xml:  'Sends OTA_VehCancelRQ (RequestorID + ResNumber) → expects OTA_VehCancelRS',
    json: 'Sends Gloria JSON with agreement_ref + supplier_booking_ref → expects JSON status/error',
    grpc: 'Calls CancelBooking(BookingRef) with agreement_ref + supplier_booking_ref',
  }

  const previewTitles: Record<CancelAdapterType, string> = {
    xml:  'Preview OTA_VehCancelRQ (XML) that will be sent',
    json: 'Preview Gloria JSON cancel request that will be sent',
    grpc: 'Preview Gloria gRPC cancel request that will be sent',
  }

  const guideTitles: Record<CancelAdapterType, string> = {
    xml:  'OTA_VehCancelRQ/RS format reference',
    json: 'Gloria JSON cancel format reference',
    grpc: 'Gloria gRPC cancel format reference',
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="bg-slate-700 rounded-md p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-white/20 rounded-md">
            <XCircle className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Cancel Booking</h1>
            <p className="text-slate-200 text-sm mt-0.5">
              Cancel a booking via OTA XML, Gloria JSON, or Gloria gRPC — choose the format your source uses
            </p>
          </div>
        </div>
      </div>

      {/* Cancel form */}
      <Card className="border border-gray-200">
        <CardHeader className="bg-slate-700 border-b border-slate-600">
          <CardTitle className="text-white text-lg">Cancellation request</CardTitle>
          <p className="text-slate-200 text-sm mt-1">
            Select the format your source supports, fill in the details, then click Cancel Booking.
          </p>
          {/* Format selector tabs */}
          <div className="flex gap-1 mt-3 p-1 bg-slate-600 rounded-lg">
            {ADAPTER_TABS.map(tab => (
              <button
                key={tab.type}
                type="button"
                onClick={() => setCancelAdapterType(tab.type)}
                className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  cancelAdapterType === tab.type
                    ? tab.activeClass
                    : 'text-slate-300 hover:text-white hover:bg-slate-500'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-5">
          {/* Format badge */}
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${currentTab.badgeClass}`}>
              {currentTab.label}
            </span>
            <span className="text-xs text-gray-500">
              {cancelAdapterType === 'xml'  && 'OTA Travel Alliance standard XML cancellation'}
              {cancelAdapterType === 'json' && 'Gloria Connect native JSON cancel endpoint'}
              {cancelAdapterType === 'grpc' && 'Gloria Connect gRPC SourceProviderService'}
            </span>
          </div>

          {/* Agreement selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Agreement <span className="text-red-500">*</span>
            </label>
            {isLoadingAgreements ? (
              <div className="h-10 bg-gray-100 rounded-md animate-pulse" />
            ) : agreements.length === 0 ? (
              <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                No active agreements found. Accept an agreement first in the Agreements page.
              </p>
            ) : (
              <select
                value={agreementRef}
                onChange={(e) => setAgreementRef(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                <option value="">Select agreement…</option>
                {agreements.map((a: any) => (
                  <option key={a.id} value={a.agreementRef}>
                    {a.agreementRef}
                    {a.sourceName ? ` — ${a.sourceName}` : ''}
                    {` (${a.status})`}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Requestor Type (OTA RequestorID Type) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="RequestorID Type (OTA) *"
              value={requestorType}
              onChange={(e) => setRequestorType(e.target.value)}
              placeholder="5"
              helperText="Supplier sample uses Type=5."
            />
            <Input
              label="RequestorID (from agreement)"
              value={agreementRef}
              disabled
              helperText="Mapped from selected agreement_ref."
            />
          </div>

          {/* Supplier booking ref */}
          <div>
            <Input
              label="Supplier Booking Reference (Reservation Number) *"
              placeholder="e.g. RC60653555IW"
              value={supplierRef}
              onChange={(e) => setSupplierRef(e.target.value)}
              helperText={
                cancelAdapterType === 'xml'
                  ? 'The ResNumber returned when the booking was created (used in OTA_VehCancelRQ)'
                  : cancelAdapterType === 'json'
                  ? 'The supplier_booking_ref returned when the booking was created (sent in JSON body)'
                  : 'The supplier_booking_ref in the BookingRef message (sent via gRPC)'
              }
            />
          </div>

          <div>
            <Input
              label="Cancellation Reason (optional)"
              placeholder="e.g. Customer requested cancellation"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              helperText="Stored for request trace/audit when provided."
            />
          </div>

          {/* Request preview */}
          <details className="border border-gray-200 rounded-lg">
            <summary className="px-4 py-2 text-xs font-semibold text-gray-600 cursor-pointer select-none hover:bg-gray-50">
              {previewTitles[cancelAdapterType]}
            </summary>
            {cancelAdapterType === 'xml' && (
              <pre className="text-xs font-mono text-gray-700 bg-gray-50 p-4 overflow-x-auto border-t border-gray-200">
                {buildXmlPreview(agreementRef, supplierRef.trim(), requestorType)}
              </pre>
            )}
            {cancelAdapterType === 'json' && (
              <pre className="text-xs font-mono text-gray-700 bg-gray-50 p-4 overflow-x-auto border-t border-gray-200">
                {buildJsonPreview(agreementRef, supplierRef.trim())}
              </pre>
            )}
            {cancelAdapterType === 'grpc' && (
              <pre className="text-xs font-mono text-gray-700 bg-gray-50 p-4 overflow-x-auto border-t border-gray-200">
                {buildGrpcPreview(agreementRef, supplierRef.trim())}
              </pre>
            )}
          </details>

          {/* Action */}
          <div className="flex items-center gap-3 pt-1">
            <Button
              variant="primary"
              onClick={handleCancel}
              loading={isCancelling}
              disabled={!supplierRef.trim() || !agreementRef.trim()}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Cancel Booking
            </Button>
            <p className="text-xs text-gray-500">
              {formatDescriptions[cancelAdapterType]}
            </p>
          </div>

          {/* Result */}
          {result && (
            <div className={`rounded-lg border p-4 ${
              result.success
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start gap-3">
                {result.success
                  ? <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  : <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                }
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm ${result.success ? 'text-emerald-800' : 'text-red-800'}`}>
                    {result.success ? 'Cancellation successful' : 'Cancellation failed'}
                  </p>
                  <p className={`text-sm mt-0.5 ${result.success ? 'text-emerald-700' : 'text-red-700'}`}>
                    {result.message}
                  </p>
                  {result.errorCode && (
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="danger" size="sm">Error {result.errorCode}</Badge>
                      {(() => {
                        const entry = ERROR_CODES.find(e => e.code === result.errorCode)
                        return entry ? <span className="text-xs text-red-600">{entry.label}</span> : null
                      })()}
                    </div>
                  )}
                  {!result.success && result.httpStatus && (
                    <div className="mt-1">
                      <Badge variant="danger" size="sm">HTTP {result.httpStatus}</Badge>
                    </div>
                  )}
                  {result.success && result.status && (
                    <div className="mt-1">
                      <Badge variant="success" size="sm">Status: {result.status}</Badge>
                      {result.resNumber && (
                        <span className="text-xs text-emerald-600 ml-2">Ref: {result.resNumber}</span>
                      )}
                    </div>
                  )}
                  {result.raw && (
                    <details className="mt-3">
                      <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">Raw response</summary>
                      <pre className="mt-1 text-xs font-mono bg-white border border-gray-200 rounded p-2 overflow-x-auto max-h-40">
                        {JSON.stringify(result.raw, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Format reference guide */}
      <Card className="border border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <button
            type="button"
            onClick={() => setShowGuide(g => !g)}
            className="flex items-center justify-between w-full text-left"
          >
            <div>
              <CardTitle className="text-lg">{guideTitles[cancelAdapterType]}</CardTitle>
              <p className="text-sm text-gray-500 mt-0.5">
                What Gloria sends to the source and how the source must respond
              </p>
            </div>
            {showGuide ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
        </CardHeader>

        {showGuide && (
          <CardContent className="p-6 space-y-5">

            {/* ── OTA XML guide ─────────────────────────────────────────────── */}
            {cancelAdapterType === 'xml' && (
              <>
                <p className="text-sm text-gray-700">
                  Gloria sends an <strong>OTA_VehCancelRQ XML POST</strong> (<code className="bg-gray-100 px-1 rounded">Content-Type: text/xml</code>) to the source endpoint and expects an <strong>OTA_VehCancelRS XML</strong> response. The <code className="bg-gray-100 px-1 rounded">ResNumber</code> is the supplier's reservation reference returned at booking time.
                </p>

                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    Request Gloria sends (OTA_VehCancelRQ)
                  </p>
                  <pre className="text-xs font-mono text-gray-800 bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-x-auto">{`<OTA_VehCancelRQ xmlns="http://www.opentravel.org/OTA/2003/05"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <POS>
    <Source>
      <RequestorID Type="5" ID="ExpediaUSA3716"/>  <!-- agreement_ref / broker ID -->
    </Source>
  </POS>
  <VehCancelRQCore>
    <ResNumber Number="RC60653555IW"/>             <!-- supplier booking reference -->
  </VehCancelRQCore>
  <VehCancelRQInfo/>
</OTA_VehCancelRQ>`}</pre>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    Success response (OTA_VehCancelRS)
                  </p>
                  <pre className="text-xs font-mono text-gray-800 bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-x-auto">{`<?xml version="1.0" encoding="UTF-8"?>
<OTA_VehCancelRS xmlns="http://www.opentravel.org/OTA/2003/05"
    xsi:schemaLocation="http://www.opentravel.org/OTA/2003/05 OTA_VehCancelRS.xsd"
    Version="2.001">
  <Success/>
  <VehRetResRSCore>
    <VehReservation>
      <Status>Cancelled</Status>
      <Resnumber>RC60653555IW</Resnumber>
    </VehReservation>
  </VehRetResRSCore>
</OTA_VehCancelRS>`}</pre>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    Error response — when cancellation is not possible
                  </p>
                  <pre className="text-xs font-mono text-gray-800 bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-x-auto">{`<?xml version="1.0" encoding="UTF-8"?>
<OTA_VehCancelRS xmlns="http://www.opentravel.org/OTA/2003/05"
    Version="2.001">
  <Errors>
    <Error>
      <Type>...</Type>
      <ShortText>This booking has already been cancelled</ShortText>
      <Code>51</Code>              <!-- see error code table below -->
    </Error>
  </Errors>
</OTA_VehCancelRS>`}</pre>
                </div>

                {/* Error code table */}
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    Error codes (OTA_VehCancelRS Errors/Error/Code)
                  </p>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left px-3 py-2 font-semibold text-gray-600 w-16">Code</th>
                          <th className="text-left px-3 py-2 font-semibold text-gray-600 w-40">Label</th>
                          <th className="text-left px-3 py-2 font-semibold text-gray-600">Description / ShortText</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {ERROR_CODES.map(e => (
                          <tr key={e.code} className="hover:bg-gray-50">
                            <td className="px-3 py-2 font-mono font-semibold text-red-700">{e.code}</td>
                            <td className="px-3 py-2 font-medium text-gray-700">{e.label}</td>
                            <td className="px-3 py-2 text-gray-600">{e.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-xs text-orange-800 space-y-1">
                  <p className="font-semibold">What Gloria does with the OTA_VehCancelRS:</p>
                  <ul className="list-disc list-inside space-y-0.5 mt-1">
                    <li><strong>Success</strong> (<code>&lt;Success/&gt;</code> + <code>Status=Cancelled</code>) — updates booking status to CANCELLED in Gloria</li>
                    <li><strong>Error Code 50</strong> — already cancelled</li>
                    <li><strong>Error Code 51</strong> — already collected (cannot cancel)</li>
                    <li><strong>Error Codes 52–55</strong> — licence/deposit/refusal/card-declined scenarios</li>
                    <li><strong>Reservation Not Found</strong> may come with or without an explicit code, depending on supplier implementation</li>
                  </ul>
                </div>
              </>
            )}

            {/* ── Gloria JSON guide ─────────────────────────────────────────── */}
            {cancelAdapterType === 'json' && (
              <>
                <p className="text-sm text-gray-700">
                  Gloria sends a <strong>JSON POST</strong> (<code className="bg-gray-100 px-1 rounded">Content-Type: application/json</code>) to the source's HTTP cancel endpoint. The source must return a JSON response with a <code className="bg-gray-100 px-1 rounded">status</code> field.
                </p>

                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    Request Gloria sends (POST JSON body)
                  </p>
                  <pre className="text-xs font-mono text-gray-800 bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-x-auto">{`POST /cancel   (or the endpoint configured for this source)
Content-Type: application/json

{
  "agreement_ref":        "ExpediaUSA3716",   // broker / agreement identifier
  "supplier_booking_ref": "RC60653555IW"      // the booking to cancel
}`}</pre>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    Success response — booking cancelled
                  </p>
                  <pre className="text-xs font-mono text-gray-800 bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-x-auto">{`HTTP 200 OK
{
  "status":               "Cancelled",        // or "CANCELLED"
  "supplier_booking_ref": "RC60653555IW"
}`}</pre>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    Error response — when cancellation is not possible
                  </p>
                  <pre className="text-xs font-mono text-gray-800 bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-x-auto">{`HTTP 4xx / 5xx
{
  "error_code": "50",
  "message":    "This booking has already been cancelled"
}`}</pre>
                </div>

                {/* Error code table */}
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    Recommended error codes (same as OTA for compatibility)
                  </p>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left px-3 py-2 font-semibold text-gray-600 w-16">error_code</th>
                          <th className="text-left px-3 py-2 font-semibold text-gray-600 w-40">Label</th>
                          <th className="text-left px-3 py-2 font-semibold text-gray-600">Description / message</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {ERROR_CODES.map(e => (
                          <tr key={e.code} className="hover:bg-gray-50">
                            <td className="px-3 py-2 font-mono font-semibold text-red-700">{e.code}</td>
                            <td className="px-3 py-2 font-medium text-gray-700">{e.label}</td>
                            <td className="px-3 py-2 text-gray-600">{e.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-800 space-y-1">
                  <p className="font-semibold">What Gloria does with the Gloria JSON cancel response:</p>
                  <ul className="list-disc list-inside space-y-0.5 mt-1">
                    <li><strong>HTTP 200 + status "Cancelled"/"CANCELLED"</strong> — updates booking status to CANCELLED in Gloria</li>
                    <li><strong>HTTP 4xx/5xx + error_code</strong> — surfaces the error_code and message to the agent; booking stays in current state</li>
                    <li>The <code>supplier_booking_ref</code> in the response is recorded for confirmation</li>
                    <li>All fields are snake_case; camelCase variants are also accepted by Gloria</li>
                  </ul>
                </div>
              </>
            )}

            {/* ── Gloria gRPC guide ─────────────────────────────────────────── */}
            {cancelAdapterType === 'grpc' && (
              <>
                <p className="text-sm text-gray-700">
                  Gloria calls <strong>CancelBooking</strong> on the source's gRPC server using the <code className="bg-gray-100 px-1 rounded">SourceProviderService</code> defined in <code className="bg-gray-100 px-1 rounded">source_provider.proto</code>. The source must return a <code className="bg-gray-100 px-1 rounded">BookingResponse</code> with <code className="bg-gray-100 px-1 rounded">status = "CANCELLED"</code>.
                </p>

                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    Proto definition (source_provider.proto)
                  </p>
                  <pre className="text-xs font-mono text-gray-800 bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-x-auto">{`syntax = "proto3";
package source_provider;

// ── Messages ──────────────────────────────────────────────────────────────
message BookingRef {
  string agreement_ref        = 1;  // broker / agreement identifier
  string supplier_booking_ref = 2;  // booking to cancel
}

message BookingResponse {
  string supplier_booking_ref = 1;  // confirmed booking ref
  string status               = 2;  // "CANCELLED" on success
}

// ── Service ───────────────────────────────────────────────────────────────
service SourceProviderService {
  rpc CancelBooking (BookingRef) returns (BookingResponse);
  // ... other methods: GetAvailability, CreateBooking, ModifyBooking, CheckBooking
}`}</pre>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    Request Gloria sends (CancelBooking RPC)
                  </p>
                  <pre className="text-xs font-mono text-gray-800 bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-x-auto">{`// Gloria calls CancelBooking with a BookingRef message:
BookingRef {
  agreement_ref:        "ExpediaUSA3716"   // from the selected agreement
  supplier_booking_ref: "RC60653555IW"     // the booking to cancel
}

// Address format: host:port  (e.g. 127.0.0.1:50051)
// Note: 0.0.0.0 is a bind address — use localhost or actual IP for client connections`}</pre>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    Success response (BookingResponse)
                  </p>
                  <pre className="text-xs font-mono text-gray-800 bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-x-auto">{`BookingResponse {
  supplier_booking_ref: "RC60653555IW"
  status:               "CANCELLED"
}`}</pre>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    Error response — gRPC status codes
                  </p>
                  <pre className="text-xs font-mono text-gray-800 bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-x-auto">{`// Return a gRPC error status instead of BookingResponse
// e.g. status code NOT_FOUND (5) with a details message:
{
  code:    5,           // NOT_FOUND
  message: "Reservation number not found for this agreement"
}

// Common gRPC status codes for cancel:
// NOT_FOUND (5)            → booking / agreement not found
// FAILED_PRECONDITION (9)  → booking already cancelled or collected
// INVALID_ARGUMENT (3)     → missing agreement_ref or supplier_booking_ref`}</pre>
                </div>

                {/* Error code table */}
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    Recommended error mapping (OTA codes → gRPC details)
                  </p>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left px-3 py-2 font-semibold text-gray-600 w-16">OTA Code</th>
                          <th className="text-left px-3 py-2 font-semibold text-gray-600 w-40">Label</th>
                          <th className="text-left px-3 py-2 font-semibold text-gray-600">Recommended gRPC status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        <tr className="hover:bg-gray-50">
                          <td className="px-3 py-2 font-mono font-semibold text-red-700">50</td>
                          <td className="px-3 py-2 font-medium text-gray-700">Already Cancelled</td>
                          <td className="px-3 py-2 font-mono text-gray-600">FAILED_PRECONDITION (9)</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="px-3 py-2 font-mono font-semibold text-red-700">51</td>
                          <td className="px-3 py-2 font-medium text-gray-700">Already Collected</td>
                          <td className="px-3 py-2 font-mono text-gray-600">FAILED_PRECONDITION (9)</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="px-3 py-2 font-mono font-semibold text-red-700">52</td>
                          <td className="px-3 py-2 font-medium text-gray-700">No Licence</td>
                          <td className="px-3 py-2 font-mono text-gray-600">FAILED_PRECONDITION (9)</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="px-3 py-2 font-mono font-semibold text-red-700">53–55</td>
                          <td className="px-3 py-2 font-medium text-gray-700">Deposit / Refusal / Card declined</td>
                          <td className="px-3 py-2 font-mono text-gray-600">FAILED_PRECONDITION (9) + details</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-800 space-y-1">
                  <p className="font-semibold">What Gloria does with the gRPC CancelBooking response:</p>
                  <ul className="list-disc list-inside space-y-0.5 mt-1">
                    <li><strong>BookingResponse.status = "CANCELLED"</strong> — updates booking status to CANCELLED in Gloria</li>
                    <li><strong>gRPC error status</strong> — surfaces the code and message to the agent; booking stays in current state</li>
                    <li>The source gRPC address must be <code>host:port</code> — <code>0.0.0.0</code> is a bind address and is automatically converted to <code>localhost</code> for client connections</li>
                    <li>All connections use insecure credentials by default (TLS can be enabled via config)</li>
                  </ul>
                </div>
              </>
            )}

            {/* Booking lifecycle — always visible */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 space-y-1">
              <p className="font-semibold">Booking lifecycle states:</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {[
                  { label: 'PENDING',    desc: 'Booking created, awaiting source confirmation' },
                  { label: 'CONFIRMED',  desc: 'Source confirmed, can be cancelled' },
                  { label: 'COLLECTED',  desc: 'Vehicle handed over — cannot cancel' },
                  { label: 'CANCELLED',  desc: 'Successfully cancelled' },
                  { label: 'NO-SHOW',    desc: 'Supplier may map no-show related cancellation failures to codes 52–55' },
                ].map(s => (
                  <span key={s.label} className="bg-blue-100 rounded px-2 py-0.5 font-mono" title={s.desc}>
                    {s.label}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
