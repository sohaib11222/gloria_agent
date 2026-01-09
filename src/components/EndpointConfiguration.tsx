import React, { useState } from 'react'
import { endpointsApi, EndpointConfig } from '../api/endpoints'
import { Button } from './ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Badge } from './ui/Badge'
import { Loader } from './ui/Loader'
import { Copy } from './ui/Copy'
import { Input } from './ui/Input'
import toast from 'react-hot-toast'

interface EndpointConfigurationProps {
  onConfigUpdated?: () => void
}

export const EndpointConfiguration: React.FC<EndpointConfigurationProps> = ({ onConfigUpdated }) => {
  const [endpointConfig, setEndpointConfig] = useState<EndpointConfig | null>(null)
  const [isLoadingEndpoints, setIsLoadingEndpoints] = useState(false)
  const [isUpdatingEndpoints, setIsUpdatingEndpoints] = useState(false)
  const [isEditingEndpoints, setIsEditingEndpoints] = useState(false)
  const [endpointForm, setEndpointForm] = useState({
    httpEndpoint: '',
    grpcEndpoint: ''
  })

  const loadEndpointConfig = async () => {
    try {
      setIsLoadingEndpoints(true)
      const config = await endpointsApi.getConfig()
      setEndpointConfig(config)
      setEndpointForm({
        httpEndpoint: config.httpEndpoint,
        grpcEndpoint: config.grpcEndpoint
      })
    } catch (error) {
      console.error('Failed to load endpoint configuration:', error)
      toast.error('Failed to load endpoint configuration')
    } finally {
      setIsLoadingEndpoints(false)
    }
  }

  const handleEditEndpoints = () => {
    setIsEditingEndpoints(true)
  }

  const handleCancelEdit = () => {
    setIsEditingEndpoints(false)
    if (endpointConfig) {
      setEndpointForm({
        httpEndpoint: endpointConfig.httpEndpoint,
        grpcEndpoint: endpointConfig.grpcEndpoint
      })
    }
  }

  const handleUpdateEndpoints = async () => {
    if (!endpointForm.httpEndpoint || !endpointForm.grpcEndpoint) {
      toast.error('Please fill in both HTTP and gRPC endpoints')
      return
    }

    setIsUpdatingEndpoints(true)
    try {
      const response = await endpointsApi.updateConfig({
        httpEndpoint: endpointForm.httpEndpoint,
        grpcEndpoint: endpointForm.grpcEndpoint
      })
      
      toast.success(response.message)
      setIsEditingEndpoints(false)
      
      // Reload endpoint configuration
      await loadEndpointConfig()
      
      // Notify parent component
      if (onConfigUpdated) {
        onConfigUpdated()
      }
    } catch (error: any) {
      console.error('Failed to update endpoints:', error)
      toast.error(error.response?.data?.message || 'Failed to update endpoints')
    } finally {
      setIsUpdatingEndpoints(false)
    }
  }

  // Load configuration on component mount
  React.useEffect(() => {
    loadEndpointConfig()
  }, [])

  return (
    <Card className="mb-8 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
      <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-xl">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">Endpoint Configuration</CardTitle>
            <p className="text-indigo-100 text-sm mt-1">
              Manage your HTTP and gRPC endpoints
            </p>
          </div>
          {!isEditingEndpoints && (
            <Button onClick={handleEditEndpoints} variant="secondary" size="sm" className="bg-white text-indigo-600 hover:bg-indigo-50">
              Edit Endpoints
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {isLoadingEndpoints ? (
          <div className="flex justify-center py-8">
            <Loader />
          </div>
        ) : endpointConfig ? (
          <div className="space-y-6">
            {isEditingEndpoints ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="HTTP Endpoint"
                    placeholder="http://localhost:9090"
                    value={endpointForm.httpEndpoint}
                    onChange={(e) => setEndpointForm(prev => ({ ...prev, httpEndpoint: e.target.value }))}
                  />
                  <Input
                    label="gRPC Endpoint"
                    placeholder="localhost:5105"
                    value={endpointForm.grpcEndpoint}
                    onChange={(e) => setEndpointForm(prev => ({ ...prev, grpcEndpoint: e.target.value }))}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={handleUpdateEndpoints}
                    loading={isUpdatingEndpoints}
                    variant="primary"
                    size="sm"
                  >
                    Save Changes
                  </Button>
                  <Button
                    onClick={handleCancelEdit}
                    variant="secondary"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">HTTP Endpoint</label>
                    <div className="flex items-center space-x-2 mt-2">
                      <p className="text-sm text-gray-900 font-mono font-semibold flex-1">{endpointConfig.httpEndpoint}</p>
                      <Copy text={endpointConfig.httpEndpoint} />
                    </div>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">gRPC Endpoint</label>
                    <div className="flex items-center space-x-2 mt-2">
                      <p className="text-sm text-gray-900 font-mono font-semibold flex-1">{endpointConfig.grpcEndpoint}</p>
                      <Copy text={endpointConfig.grpcEndpoint} />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Adapter Type</label>
                    <div className="mt-2">
                      <Badge variant="info" className="font-semibold">{endpointConfig.adapterType}</Badge>
                    </div>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</label>
                    <div className="mt-2">
                      <Badge variant={endpointConfig.status === 'ACTIVE' ? 'success' : 'warning'} className="font-semibold">
                        {endpointConfig.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Last Updated</label>
                    <p className="text-sm text-gray-900 font-medium mt-2">
                      {new Date(endpointConfig.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Failed to load endpoint configuration</p>
            <Button onClick={loadEndpointConfig} variant="secondary" size="sm" className="mt-2">
              Retry
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
