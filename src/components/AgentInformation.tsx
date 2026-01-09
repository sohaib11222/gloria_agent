import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Badge } from './ui/Badge'
import { Copy } from './ui/Copy'

interface AgentInformationProps {
  user: any
}

export const AgentInformation: React.FC<AgentInformationProps> = ({ user }) => {
  if (!user) return null

  return (
    <Card className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-xl">
        <CardTitle className="text-white">Agent Information</CardTitle>
        <p className="text-blue-100 text-sm mt-1">Your account details and credentials</p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Agent ID</label>
              <div className="flex items-center space-x-2 mt-2">
                <p className="text-sm text-gray-900 font-mono font-semibold">{user.id}</p>
                <Copy text={user.id} />
              </div>
            </div>
            <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</label>
              <p className="text-sm text-gray-900 font-medium mt-2">{user.email}</p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</label>
              <div className="mt-2">
                <Badge variant="info">{user.role}</Badge>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Company Name</label>
              <p className="text-sm text-gray-900 font-semibold mt-2">{user.company.companyName}</p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Company Type</label>
              <div className="mt-2">
                <Badge variant="default">{user.company.type}</Badge>
              </div>
            </div>
            <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Company Status</label>
              <div className="mt-2">
                <Badge variant={user.company.status === 'ACTIVE' ? 'success' : 'warning'}>
                  {user.company.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        
        {/* Access Token for Testing */}
        <div className="mt-6 p-5 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-xl shadow-md">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-yellow-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <h4 className="text-sm font-bold text-yellow-900">Access Token (Testing Purpose)</h4>
              </div>
              <p className="text-xs text-yellow-700 font-medium mb-3">
                This token is shown for testing purposes only
              </p>
              <div className="mt-2 p-3 bg-white rounded-lg border border-yellow-200">
                <code className="text-xs text-yellow-900 break-all block whitespace-pre-wrap font-mono">
                  {localStorage.getItem('token') || 'No token found'}
                </code>
              </div>
            </div>
            <div className="ml-4">
              <Copy text={localStorage.getItem('token') || ''} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
