import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Home, ArrowLeft, Search, AlertTriangle } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'

export default function NotFound() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="min-h-[60vh] bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4 rounded-xl">
      <div className="max-w-2xl w-full">
        <Card className="transform transition-all duration-300 hover:shadow-xl border-2 border-gray-100">
          <CardContent className="pt-12 pb-12 px-8">
            <div className="text-center">
              {/* 404 Number */}
              <div className="mb-8">
                <div className="inline-flex items-center justify-center">
                  <h1 className="text-9xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    404
                  </h1>
                  <div className="ml-4 p-3 bg-red-100 rounded-full">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  Page Not Found
                </h2>
                <p className="text-lg text-gray-600 mb-2">
                  Oops! The page you're looking for doesn't exist.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg mt-4">
                  <Search className="w-4 h-4 text-gray-500" />
                  <code className="text-sm font-mono text-gray-700">
                    {location.pathname}
                  </code>
                </div>
              </div>

              {/* Suggestions */}
              <div className="mb-8 text-left max-w-md mx-auto">
                <p className="text-sm font-semibold text-gray-700 mb-3">You might want to:</p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Check if the URL is spelled correctly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Go back to the previous page</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Return to the home page</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/agent')}
                  className="w-full sm:w-auto flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow"
                >
                  <Home className="w-5 h-5" />
                  Go to Home
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate(-1)}
                  className="w-full sm:w-auto flex items-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Go Back
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Help */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Need help?{' '}
            <button
              onClick={() => navigate('/docs')}
              className="text-blue-600 hover:text-blue-700 font-medium underline"
            >
              Check our documentation
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

