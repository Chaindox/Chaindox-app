"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FileText, Upload } from "lucide-react"
import { useRouter } from "next/navigation"

export function DocumentUpload({ onFileUpload, isLoading }) {
  const router = useRouter()

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      onFileUpload(file)
    }
  }

  const handleDragOver = (event) => {
    event.preventDefault()
  }

  const handleDrop = (event) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file) {
      onFileUpload(file)
    }
  }

  const handleCreateDocument = () => {
    router.push("/create")
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8 sm:mb-12 text-center sm:text-left">
        Verify Documents
      </h1>

      <Card
        className="p-6 sm:p-12 text-center border-2 border-dashed border-gray-300 hover:border-red-400 bg-white transition-colors"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {isLoading ? (
          <div className="space-y-4 sm:space-y-6 py-8">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600"></div>
            </div>
            <p className="text-lg text-gray-700 font-medium">Verifying Document...</p>
            <p className="text-sm text-gray-500">Please wait while we verify your document</p>
          </div>
        ) : (
        <div className="space-y-4 sm:space-y-6">
          {/* Document Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-16 h-12 sm:w-20 sm:h-16 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg"></div>
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-10 h-12 sm:w-12 sm:h-16 bg-white border-2 border-gray-300 rounded-sm flex items-center justify-center">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
              </div>
            </div>
          </div>

          {/* Drop Text */}
          <p className="text-base sm:text-lg text-gray-700 font-medium px-4">
            Drop your ChainDoX Document to view its contents
          </p>

          {/* Or Divider */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-gray-500 text-sm">Or</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Select Document Button */}
          <div>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.json,.tt"
            />
            <Button
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base w-full sm:w-auto"
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Select Document
            </Button>
          </div>

          {/* No Document Text */}
          <p className="text-gray-600 text-sm sm:text-base mt-6 sm:mt-8">No ChainDoX Document?</p>

          {/* Action Links */}
          <div className="flex justify-center">
            <button onClick={handleCreateDocument} className="text-red-600 hover:text-red-800 underline text-sm">
              Create ChainDoX Document
            </button>
          </div>
        </div>
        )}
      </Card>
    </main>
  )
}
