"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle, RotateCcw, Download } from "lucide-react"

export default function SuccessPage() {
  const router = useRouter()
  const [documentData, setDocumentData] = useState(null)

  useEffect(() => {
    // Get data from localStorage
    const completedDoc = localStorage.getItem("completedDocument")

    if (completedDoc) {
      setDocumentData(JSON.parse(completedDoc))
    } else {
      // If no data found, redirect to home
      router.push("/")
    }
  }, [router])

  const handleStartOver = () => {
    // Clear all stored data
    localStorage.removeItem("selectedDocumentType")
    localStorage.removeItem("documentNumber")
    localStorage.removeItem("completedDocument")
    localStorage.removeItem("formData")
    localStorage.removeItem("currentStep")
    localStorage.removeItem("completedSteps")

    // Navigate to home
    router.push("/")
  }

  const handleDownloadJson = () => {
    if (!documentData || !documentData.signedDocument) {
      alert('No document data available to download.')
      return
    }

    try {
      // Use the actual signed W3C document from the backend
      const jsonData = documentData.signedDocument

      // Generate filename based on document type and number
      const docTypeName = documentData.documentType.name.toLowerCase().replace(/\s+/g, '-')
      const fileName = `${docTypeName}-${documentData.documentNumber}.json`

      // Create and download JSON file with the actual document data
      const dataStr = JSON.stringify(jsonData, null, 2)
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

      const linkElement = document.createElement("a")
      linkElement.setAttribute("href", dataUri)
      linkElement.setAttribute("download", fileName)
      linkElement.click()
      
      
    } catch (error) {
      console.error('Error downloading JSON file:', error)
      alert('Failed to download JSON file. Please try again.')
    }
  }

  if (!documentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4 animate-fade-in">
            <CheckCircle className="w-12 h-12 text-green-600 animate-fade-in-up animation-delay-500" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 animate-fade-in-up animation-delay-1000">
            Document Created Successfully!
          </h1>
          <p className="text-gray-600 animate-fade-in-up animation-delay-1500">
            Your {documentData.documentType.name} has been successfully created and is ready for use.
          </p>
        </div>

        {/* Document Details Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8 animate-slide-up animation-delay-2000">
          <h3 className="font-semibold text-gray-900 mb-4">Document Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Document Type</span>
              <div className="flex items-center space-x-2">
                <span className="text-lg">{documentData.documentType.icon}</span>
                <span className="text-sm font-medium text-gray-900">{documentData.documentType.name}</span>
              </div>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Document Number</span>
              <span className="text-sm font-medium text-blue-600">{documentData.documentNumber}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Created Date</span>
              <span className="text-sm font-medium text-gray-900">
                {new Date(documentData.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Version</span>
              <span className="text-sm font-medium text-gray-900">{documentData.version}</span>
            </div>
            {documentData.transactionHash && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Transaction Hash</span>
                <span className="text-xs font-mono text-gray-900 truncate max-w-[200px]" title={documentData.transactionHash}>
                  {documentData.transactionHash}
                </span>
              </div>
            )}
            {documentData.tokenId && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Token ID</span>
                <span className="text-xs font-mono text-gray-900 truncate max-w-[200px]" title={documentData.tokenId}>
                  {documentData.tokenId}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Status</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                {documentData.status}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 animate-fade-in animation-delay-2500">
          <Button onClick={handleDownloadJson} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            <Download className="w-4 h-4 mr-2" />
            Download JSON Document
          </Button>

          <Button
            onClick={handleStartOver}
            variant="outline"
            className="w-full bg-transparent border-red-200 text-red-600 hover:bg-red-50"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Create Another Document
          </Button>
        </div>
      </div>
    </div>
  )
}
