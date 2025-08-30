import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, FileText, Search, AlertTriangle } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity">
            <span className="text-xl sm:text-2xl font-bold text-black">Chain</span>
            <span className="text-xl sm:text-2xl font-bold text-red-600">Do</span>
            <span className="text-xl sm:text-2xl font-bold text-black">X</span>
          </Link>
          <div className="hidden sm:block text-xs text-gray-600">
            <div>
              Your Data made <span className="text-red-600 font-semibold">Secure</span> and{" "}
              <span className="text-red-600 font-semibold">Transferable</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex items-center justify-center px-4 py-12 sm:py-20">
        <div className="text-center max-w-lg w-full">
          {/* Animated Document Icon */}
          <div className="mb-8 relative">
            <div className="flex justify-center mb-6">
              <div className="relative animate-float">
                <div className="w-20 h-16 sm:w-24 sm:h-20 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg shadow-lg"></div>
                <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-16 h-20 sm:w-20 sm:h-24 bg-white border-2 border-gray-300 rounded-sm flex items-center justify-center shadow-lg">
                  <Search className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                </div>
                <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center animate-bounce">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Error Content */}
          <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 mb-8 animate-fade-in-up">
            <h1 className="text-6xl sm:text-7xl font-bold text-gray-200 mb-4 animate-fade-in">404</h1>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 animate-fade-in-up animation-delay-500">
              Document Not Found
            </h2>
            <p className="text-gray-600 mb-6 text-sm sm:text-base animate-fade-in-up animation-delay-1000">
              The page you're looking for seems to have been moved, deleted, or doesn't exist. Let's get you back to
              verifying documents!
            </p>

            {/* Suggestions */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 animate-fade-in-up animation-delay-1500">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">What you can do:</h3>
              <ul className="text-sm text-gray-600 space-y-2 text-left">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-red-600 rounded-full mr-3"></div>
                  Check the URL for any typos
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-red-600 rounded-full mr-3"></div>
                  Go back to the homepage and start over
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-red-600 rounded-full mr-3"></div>
                  Upload a new document to verify
                </li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 animate-fade-in-up animation-delay-2000">
            <Link href="/">
              <Button className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>

            <div className="grid grid-cols-2 gap-3">
              <Link href="/">
                <Button variant="outline" className="w-full bg-transparent border-red-200 text-red-600 hover:bg-red-50">
                  <FileText className="w-4 h-4 mr-2" />
                  Verify Document
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full bg-transparent border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                <Search className="w-4 h-4 mr-2" />
                Help Center
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center animate-fade-in-up animation-delay-2500">
            <p className="text-sm text-gray-500">
              Need assistance? Contact our support team for help with document verification.
            </p>
          </div>
        </div>
      </main>

      {/* Background Decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-red-100 rounded-full opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-orange-100 rounded-full opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-red-100 rounded-full opacity-20 animate-blob animation-delay-4000"></div>
      </div>
    </div>
  )
}
